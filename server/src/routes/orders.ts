import { Application, Request, Response } from 'express';
import http from 'http';
import nodemailer from 'nodemailer';
import { authMiddleware } from './auth';

function createMailer() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

async function sendPreOrderEmail(name: string, email: string | null, phone: string | null, market_date: string, items: any[]): Promise<void> {
  const mailer = createMailer();
  if (!mailer) return;
  const itemLines = items.map((i: any) => `• ${i.quantity}x ${i.name}`).join('\n');
  const contact = [email, phone].filter(Boolean).join(' / ') || 'No contact provided';
  await mailer.sendMail({
    from: `"Biscuit Bar" <${process.env.GMAIL_USER}>`,
    to: 'lillianhogan11@gmail.com',
    subject: `New Pre-Order — ${name} for ${market_date}`,
    text: `New pre-order received!\n\nName: ${name}\nContact: ${contact}\nMarket Date: ${market_date}\n\nItems:\n${itemLines}\n\nLog in to the portal to confirm: https://portal.biscuitbar.cafe`,
  }).catch(() => {});
}

function notify(text: string): void {
  try {
    const body = JSON.stringify({ agentId: 'main', text, mode: 'now' });
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 18789,
      path: '/api/notify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(options);
    req.on('error', () => {});
    req.write(body);
    req.end();
  } catch {}
}

export default function register(app: Application, db: any): void {
  // POST /api/orders — create order
  app.post('/api/orders', (req: Request, res: Response) => {
    const { customer_name, customer_phone, pickup_time, items, total, notes } = req.body as Record<string, any>;
    if (!customer_name || !customer_phone || !pickup_time || !items || total == null) {
      res.status(400).json({ error: 'customer_name, customer_phone, pickup_time, items, and total are required' });
      return;
    }
    const itemsJson = JSON.stringify(items);
    const stmt = db.prepare(
      'INSERT INTO orders (customer_name, customer_phone, pickup_time, items, total, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(customer_name, customer_phone, pickup_time, itemsJson, total, notes || null) as { lastInsertRowid: number };
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid) as any;
    order.items = JSON.parse(order.items);

    const item_count = Array.isArray(items) ? items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0;
    notify(`🥐 New pickup order from ${customer_name}! ${item_count} items, $${Number(total).toFixed(2)}. Pickup at ${pickup_time}. Phone: ${customer_phone}`);

    res.status(201).json(order);
  });

  // POST /api/kiosk/orders — create kiosk order (no auth required)
  app.post('/api/kiosk/orders', (req: Request, res: Response) => {
    const { customer_name, payment_type, items, subtotal, tax, total } = req.body as Record<string, any>;
    if (!customer_name || !payment_type || !items || total == null) {
      res.status(400).json({ error: 'customer_name, payment_type, items, and total are required' });
      return;
    }
    const itemsJson = JSON.stringify(items);
    const notes = `Kiosk order — payment: ${payment_type}`;
    const stmt = db.prepare(
      'INSERT INTO orders (customer_name, customer_phone, pickup_time, items, total, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(customer_name, 'kiosk', 'Now', itemsJson, total, notes) as { lastInsertRowid: number };
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid) as any;
    order.items = JSON.parse(order.items);

    const item_count = Array.isArray(items) ? items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0;
    const payLabel = payment_type === 'card' ? 'card (see cashier)' : 'cash';
    notify(`🥐 Kiosk order from ${customer_name}! ${item_count} item${item_count !== 1 ? 's' : ''}, $${Number(total).toFixed(2)} — paying ${payLabel}.`);

    res.status(201).json({ id: order.id, total: order.total, customer_name: order.customer_name });
  });

  // GET /api/orders — all orders (admin)
  app.get('/api/orders', (req: Request, res: Response) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
    orders.forEach(o => { o.items = JSON.parse(o.items); });
    res.json(orders);
  });

  // GET /portal/api/orders — all orders (portal, authenticated)
  app.get('/portal/api/orders', authMiddleware as any, (req: Request, res: Response) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  });

  // PATCH /portal/api/orders/:id — update order status
  app.patch('/portal/api/orders/:id', authMiddleware as any, (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id));
  });

  // POST /api/preorders — public pre-order submission
  app.post('/api/preorders', (req: Request, res: Response) => {
    const { name, email, phone, market_date, items, notes } = req.body as Record<string, any>;
    if (!name || !market_date || !items) {
      res.status(400).json({ error: 'name, market_date, and items are required' });
      return;
    }
    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);
    const stmt = db.prepare(
      'INSERT INTO preorders (name, email, phone, market_date, items, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, email || null, phone || null, market_date, itemsJson, notes || null) as { lastInsertRowid: number };
    const preorder = db.prepare('SELECT * FROM preorders WHERE id = ?').get(result.lastInsertRowid) as any;
    preorder.items = JSON.parse(preorder.items);
    notify(`📋 New pre-order from ${name} for market on ${market_date}!`);
    sendPreOrderEmail(name, email || null, phone || null, market_date, preorder.items);
    res.status(201).json(preorder);
  });

  // GET /portal/api/preorders — all pre-orders (portal, authenticated)
  app.get('/portal/api/preorders', authMiddleware as any, (req: Request, res: Response) => {
    const preorders = db.prepare('SELECT * FROM preorders ORDER BY market_date ASC, created_at DESC').all() as any[];
    preorders.forEach(p => { try { p.items = JSON.parse(p.items); } catch {} });
    res.json(preorders);
  });

  // PATCH /portal/api/preorders/:id — update status
  app.patch('/portal/api/preorders/:id', authMiddleware as any, (req: Request, res: Response) => {
    const { status } = req.body as { status: string };
    const valid = ['pending', 'confirmed', 'ready', 'cancelled'];
    if (!valid.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    db.prepare('UPDATE preorders SET status = ? WHERE id = ?').run(status, req.params.id);
    const preorder = db.prepare('SELECT * FROM preorders WHERE id = ?').get(req.params.id) as any;
    try { preorder.items = JSON.parse(preorder.items); } catch {}
    res.json(preorder);
  });

  // POST /api/pos/orders — POS order (authenticated)
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
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid) as any;
    order.items = JSON.parse(order.items);

    const item_count = Array.isArray(items) ? items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0;
    notify(`🏪 POS order placed! ${item_count} item(s), $${Number(total).toFixed(2)}. Payment: ${payment_type || 'Unknown'}.`);

    res.status(201).json(order);
  });
}
