import { Application, Request, Response } from 'express';
import http from 'http';
import { authMiddleware } from './auth';

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
