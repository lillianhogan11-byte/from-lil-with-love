import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { Application, Request, Response, NextFunction } from 'express';
import http from 'http';

// Extend Express Request to carry authenticated user
export interface AuthRequest extends Request {
  user?: {
    id?: number;
    email: string;
    name?: string;
    picture?: string;
    sub?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'flwl-portal-secret-2026';
const JWT_EXPIRES = '30d';

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default function registerPortalRoutes(app: Application, db: any): void {

  // ── Google OAuth ───────────────────────────────────────
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  app.get('/auth/google', (req: Request, res: Response) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
      prompt: 'select_account',
    });
    res.redirect(url);
  });

  app.get('/auth/google/callback', async (req: Request, res: Response) => {
    try {
      const { code } = req.query as { code: string };
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      const email = data.email;

      const allowed = db.prepare('SELECT * FROM allowed_users WHERE email = ?').get(email);
      if (!allowed) {
        return res.redirect('https://portal.biscuitbar.cafe/login?error=unauthorized');
      }

      const token = jwt.sign(
        { email, name: data.name, picture: data.picture, sub: (data as any).sub },
        process.env.JWT_SECRET || 'changeme',
        { expiresIn: '30d' }
      );

      res.redirect(`https://portal.biscuitbar.cafe/auth/callback#token=${token}`);
    } catch (err) {
      console.error('OAuth error:', err);
      res.redirect('https://portal.biscuitbar.cafe/login?error=oauth_failed');
    }
  });

  // ── Auth ──────────────────────────────────────────────
  app.post('/portal/api/auth/register', async (req: Request, res: Response) => {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) { res.status(400).json({ error: 'All fields required' }); return; }
    const existing = db.prepare('SELECT id FROM portal_users WHERE email = ?').get(email);
    if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO portal_users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
    const user = db.prepare('SELECT id, name, email FROM portal_users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ token, user });
  });

  app.post('/portal/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }
    const user = db.prepare('SELECT * FROM portal_users WHERE email = ?').get(email);
    if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });

  app.get('/portal/api/auth/me', authMiddleware as any, (req: Request, res: Response) => {
    const user = db.prepare('SELECT id, name, email FROM portal_users WHERE id = ?').get((req as AuthRequest).user?.id);
    res.json(user);
  });

  // ── Dashboard ─────────────────────────────────────────
  app.get('/portal/api/dashboard', authMiddleware as any, (req: Request, res: Response) => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const yearStart = `${now.getFullYear()}-01-01`;

    const monthIncome = db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM bakery_income WHERE date >= ?').get(monthStart).total;
    const monthExpenses = db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM bakery_expenses WHERE date >= ?').get(monthStart).total;
    const yearIncome = db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM bakery_income WHERE date >= ?').get(yearStart).total;
    const yearExpenses = db.prepare('SELECT COALESCE(SUM(amount),0) as total FROM bakery_expenses WHERE date >= ?').get(yearStart).total;
    const pendingOrders = db.prepare("SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending'").get().cnt;
    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
    const lowInventory = db.prepare('SELECT * FROM inventory_items WHERE quantity <= reorder_level AND reorder_level > 0').all();
    const pendingCustom = db.prepare("SELECT COUNT(*) as cnt FROM custom_orders WHERE status = 'pending'").get().cnt;
    const totalMiles = db.prepare('SELECT COALESCE(SUM(miles),0) as total FROM mileage_log WHERE date >= ?').get(yearStart).total;

    res.json({
      month: { income: monthIncome, expenses: monthExpenses, profit: monthIncome - monthExpenses },
      year: { income: yearIncome, expenses: yearExpenses, profit: yearIncome - yearExpenses },
      pendingOrders,
      pendingCustomOrders: pendingCustom,
      recentOrders,
      lowInventory,
      totalMilesYTD: totalMiles,
    });
  });

  // ── Orders ────────────────────────────────────────────
  app.get('/portal/api/orders', authMiddleware as any, (req: Request, res: Response) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  });
  app.patch('/portal/api/orders/:id', authMiddleware as any, (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
  });

  // ── Custom Orders ─────────────────────────────────────
  app.get('/portal/api/custom-orders', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM custom_orders ORDER BY created_at DESC').all());
  });
  app.post('/portal/api/custom-orders', authMiddleware as any, (req: Request, res: Response) => {
    const { customer_name, customer_phone, customer_email, description, total, deposit, due_date, notes } = req.body as Record<string, any>;
    if (!customer_name || !description) { res.status(400).json({ error: 'Name and description required' }); return; }
    const r = db.prepare('INSERT INTO custom_orders (customer_name,customer_phone,customer_email,description,total,deposit,due_date,notes) VALUES (?,?,?,?,?,?,?,?)').run(customer_name, customer_phone || '', customer_email || '', description, total || 0, deposit || 0, due_date || '', notes || '');
    res.status(201).json(db.prepare('SELECT * FROM custom_orders WHERE id=?').get(r.lastInsertRowid));
  });
  app.patch('/portal/api/custom-orders/:id', authMiddleware as any, (req: Request, res: Response) => {
    const { status, notes, total, deposit, due_date } = req.body as Record<string, any>;
    db.prepare('UPDATE custom_orders SET status=COALESCE(?,status), notes=COALESCE(?,notes), total=COALESCE(?,total), deposit=COALESCE(?,deposit), due_date=COALESCE(?,due_date) WHERE id=?').run(status || null, notes || null, total || null, deposit || null, due_date || null, req.params.id);
    res.json(db.prepare('SELECT * FROM custom_orders WHERE id=?').get(req.params.id));
  });

  // ── Income ────────────────────────────────────────────
  app.get('/portal/api/income', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM bakery_income ORDER BY date DESC').all());
  });
  app.post('/portal/api/income', authMiddleware as any, (req: Request, res: Response) => {
    const { date, description, amount, source, notes } = req.body as Record<string, any>;
    if (!date || !amount) { res.status(400).json({ error: 'Date and amount required' }); return; }
    const r = db.prepare('INSERT INTO bakery_income (date,description,amount,source,notes) VALUES (?,?,?,?,?)').run(date, description || '', amount, source || '', notes || '');
    res.status(201).json(db.prepare('SELECT * FROM bakery_income WHERE id=?').get(r.lastInsertRowid));
  });
  app.delete('/portal/api/income/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM bakery_income WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Expenses ──────────────────────────────────────────
  app.get('/portal/api/expenses', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM bakery_expenses ORDER BY date DESC').all());
  });
  app.post('/portal/api/expenses', authMiddleware as any, (req: Request, res: Response) => {
    const { date, description, amount, category, receipt_ref, deductible, notes } = req.body as Record<string, any>;
    if (!date || !description || !amount) { res.status(400).json({ error: 'Date, description, amount required' }); return; }
    const r = db.prepare('INSERT INTO bakery_expenses (date,description,amount,category,receipt_ref,deductible,notes) VALUES (?,?,?,?,?,?,?)').run(date, description, amount, category || 'other', receipt_ref || '', deductible !== false ? 1 : 0, notes || '');
    res.status(201).json(db.prepare('SELECT * FROM bakery_expenses WHERE id=?').get(r.lastInsertRowid));
  });
  app.delete('/portal/api/expenses/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM bakery_expenses WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Inventory ─────────────────────────────────────────
  app.get('/portal/api/inventory', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT i.*, s.name as supplier_name FROM inventory_items i LEFT JOIN suppliers s ON i.supplier_id=s.id ORDER BY i.category, i.name').all());
  });
  app.post('/portal/api/inventory', authMiddleware as any, (req: Request, res: Response) => {
    const { name, category, unit, quantity, reorder_level, cost_per_unit, supplier_id, notes } = req.body as Record<string, any>;
    if (!name) { res.status(400).json({ error: 'Name required' }); return; }
    const r = db.prepare('INSERT INTO inventory_items (name,category,unit,quantity,reorder_level,cost_per_unit,supplier_id,notes) VALUES (?,?,?,?,?,?,?,?)').run(name, category || '', unit || '', quantity || 0, reorder_level || 0, cost_per_unit || 0, supplier_id || null, notes || '');
    res.status(201).json(db.prepare('SELECT * FROM inventory_items WHERE id=?').get(r.lastInsertRowid));
  });
  app.patch('/portal/api/inventory/:id', authMiddleware as any, (req: Request, res: Response) => {
    const { quantity, cost_per_unit, reorder_level, notes } = req.body as Record<string, any>;
    db.prepare("UPDATE inventory_items SET quantity=COALESCE(?,quantity), cost_per_unit=COALESCE(?,cost_per_unit), reorder_level=COALESCE(?,reorder_level), notes=COALESCE(?,notes), updated_at=datetime('now') WHERE id=?").run(quantity ?? null, cost_per_unit ?? null, reorder_level ?? null, notes || null, req.params.id);
    res.json(db.prepare('SELECT * FROM inventory_items WHERE id=?').get(req.params.id));
  });
  app.delete('/portal/api/inventory/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM inventory_items WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Recipes ───────────────────────────────────────────
  app.get('/portal/api/recipes', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM bakery_recipes ORDER BY name').all());
  });
  app.post('/portal/api/recipes', authMiddleware as any, (req: Request, res: Response) => {
    const { name, ingredient_cost, selling_price, batch_yield, notes } = req.body as Record<string, any>;
    if (!name) { res.status(400).json({ error: 'Name required' }); return; }
    const cpu = batch_yield && ingredient_cost ? ingredient_cost / batch_yield : null;
    const margin = selling_price && cpu ? ((selling_price - cpu) / selling_price * 100) : null;
    const r = db.prepare('INSERT INTO bakery_recipes (name,ingredient_cost,selling_price,batch_yield,cost_per_unit,margin_percent,notes) VALUES (?,?,?,?,?,?,?)').run(name, ingredient_cost || 0, selling_price || 0, batch_yield || 0, cpu || 0, margin || 0, notes || '');
    res.status(201).json(db.prepare('SELECT * FROM bakery_recipes WHERE id=?').get(r.lastInsertRowid));
  });
  app.delete('/portal/api/recipes/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM bakery_recipes WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Suppliers ─────────────────────────────────────────
  app.get('/portal/api/suppliers', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM suppliers ORDER BY name').all());
  });
  app.post('/portal/api/suppliers', authMiddleware as any, (req: Request, res: Response) => {
    const { name, contact_name, phone, email, address, notes } = req.body as Record<string, any>;
    if (!name) { res.status(400).json({ error: 'Name required' }); return; }
    const r = db.prepare('INSERT INTO suppliers (name,contact_name,phone,email,address,notes) VALUES (?,?,?,?,?,?)').run(name, contact_name || '', phone || '', email || '', address || '', notes || '');
    res.status(201).json(db.prepare('SELECT * FROM suppliers WHERE id=?').get(r.lastInsertRowid));
  });
  app.delete('/portal/api/suppliers/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM suppliers WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Events ────────────────────────────────────────────
  app.get('/portal/api/events', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM events ORDER BY date DESC').all());
  });
  app.post('/portal/api/events', authMiddleware as any, (req: Request, res: Response) => {
    const { name, date, location, revenue, expenses, notes } = req.body as Record<string, any>;
    if (!name || !date) { res.status(400).json({ error: 'Name and date required' }); return; }
    const r = db.prepare('INSERT INTO events (name,date,location,revenue,expenses,notes) VALUES (?,?,?,?,?,?)').run(name, date, location || '', revenue || 0, expenses || 0, notes || '');
    res.status(201).json(db.prepare('SELECT * FROM events WHERE id=?').get(r.lastInsertRowid));
  });
  app.delete('/portal/api/events/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Mileage ───────────────────────────────────────────
  app.get('/portal/api/mileage', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM mileage_log ORDER BY date DESC').all());
  });
  app.post('/portal/api/mileage', authMiddleware as any, (req: Request, res: Response) => {
    const { date, origin, destination, miles, purpose } = req.body as Record<string, any>;
    if (!date || !miles) { res.status(400).json({ error: 'Date and miles required' }); return; }
    const r = db.prepare('INSERT INTO mileage_log (date,origin,destination,miles,purpose) VALUES (?,?,?,?,?)').run(date, origin || '', destination || '', miles, purpose || '');
    res.status(201).json(db.prepare('SELECT * FROM mileage_log WHERE id=?').get(r.lastInsertRowid));
  });
  app.delete('/portal/api/mileage/:id', authMiddleware as any, (req: Request, res: Response) => {
    db.prepare('DELETE FROM mileage_log WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });

  // ── Tax Export ────────────────────────────────────────
  app.get('/portal/api/taxes/export', authMiddleware as any, (req: Request, res: Response) => {
    const year = (req.query.year as string) || String(new Date().getFullYear());
    const income: any[] = db.prepare('SELECT * FROM bakery_income WHERE date LIKE ? ORDER BY date').all(`${year}%`);
    const expenses: any[] = db.prepare('SELECT * FROM bakery_expenses WHERE date LIKE ? ORDER BY date').all(`${year}%`);
    const miles: any[] = db.prepare('SELECT * FROM mileage_log WHERE date LIKE ? ORDER BY date').all(`${year}%`);
    const totalIncome = income.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
    const totalDeductible = expenses.filter(r => r.deductible).reduce((s, r) => s + r.amount, 0);
    const totalMiles = miles.reduce((s, r) => s + r.miles, 0);

    let csv = `FROM LIL WITH LOVE - TAX SUMMARY ${year}\n\n`;
    csv += `INCOME\n`;
    csv += `Date,Description,Amount,Source\n`;
    income.forEach(r => { csv += `${r.date},"${r.description}",${r.amount},${r.source}\n`; });
    csv += `\nTOTAL INCOME,$${totalIncome.toFixed(2)}\n\n`;
    csv += `EXPENSES\n`;
    csv += `Date,Description,Amount,Category,Deductible\n`;
    expenses.forEach(r => { csv += `${r.date},"${r.description}",${r.amount},${r.category},${r.deductible ? 'Yes' : 'No'}\n`; });
    csv += `\nTOTAL EXPENSES,$${totalExpenses.toFixed(2)}\n`;
    csv += `TOTAL DEDUCTIBLE,$${totalDeductible.toFixed(2)}\n\n`;
    csv += `MILEAGE\n`;
    csv += `Date,From,To,Miles,Purpose\n`;
    miles.forEach(r => { csv += `${r.date},"${r.origin}","${r.destination}",${r.miles},"${r.purpose}"\n`; });
    csv += `\nTOTAL MILES,${totalMiles}\n`;
    csv += `MILEAGE DEDUCTION (67¢/mi),$${(totalMiles * 0.67).toFixed(2)}\n\n`;
    csv += `NET PROFIT,$${(totalIncome - totalExpenses).toFixed(2)}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="flwl-taxes-${year}.csv"`);
    res.send(csv);
  });

  // ── Menu Management ───────────────────────────────────
  app.get('/portal/api/menu-items', authMiddleware as any, (req: Request, res: Response) => {
    res.json(db.prepare('SELECT * FROM menu_items ORDER BY category, name').all());
  });
  app.patch('/portal/api/menu-items/:id', authMiddleware as any, (req: Request, res: Response) => {
    const { name, description, price, image_url, available } = req.body as Record<string, any>;
    db.prepare('UPDATE menu_items SET name=COALESCE(?,name), description=COALESCE(?,description), price=COALESCE(?,price), image_url=COALESCE(?,image_url), available=COALESCE(?,available) WHERE id=?').run(name || null, description || null, price || null, image_url || null, available ?? null, req.params.id);
    res.json(db.prepare('SELECT * FROM menu_items WHERE id=?').get(req.params.id));
  });
  app.post('/portal/api/menu-items', authMiddleware as any, (req: Request, res: Response) => {
    const { name, category, description, price, image_url } = req.body as Record<string, any>;
    if (!name || !category || !price) { res.status(400).json({ error: 'Name, category, price required' }); return; }
    const r = db.prepare('INSERT INTO menu_items (name,category,description,price,image_url) VALUES (?,?,?,?,?)').run(name, category, description || '', price, image_url || '');
    res.status(201).json(db.prepare('SELECT * FROM menu_items WHERE id=?').get(r.lastInsertRowid));
  });

  // ── POS Orders ────────────────────────────────────────
  app.post('/api/pos/orders', authMiddleware as any, (req: Request, res: Response) => {
    const { items, total, payment_type, customer_name } = req.body as Record<string, any>;
    if (!items || total == null) {
      res.status(400).json({ error: 'items and total are required' });
      return;
    }
    const name = customer_name || 'Walk-in';
    const notes = payment_type ? `POS - ${payment_type}` : 'POS';
    const stmt = db.prepare('INSERT INTO orders (customer_name, customer_phone, pickup_time, items, total, notes) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(name, 'Walk-in', 'Now', JSON.stringify(items), total, notes);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    order.items = JSON.parse(order.items);

    // Notify via OpenClaw (fire-and-forget)
    try {
      const item_count = Array.isArray(items) ? items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0;
      const body = JSON.stringify({
        agentId: 'main',
        text: `🏪 POS order placed! ${item_count} item(s), $${Number(total).toFixed(2)}. Payment: ${payment_type || 'Unknown'}.`,
        mode: 'now',
      });
      const req2 = http.request({
        hostname: 'localhost',
        port: 18789,
        path: '/api/notify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      });
      req2.on('error', () => {});
      req2.write(body);
      req2.end();
    } catch {}

    res.status(201).json(order);
  });
}
