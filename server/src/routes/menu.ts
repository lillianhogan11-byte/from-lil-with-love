import { Application, Request, Response } from 'express';

export default function register(app: Application, db: any): void {
  // GET /api/menu — all items grouped by category
  app.get('/api/menu', (req: Request, res: Response) => {
    const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, sort_order, id').all() as any[];
    const grouped = items.reduce((acc: Record<string, any[]>, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json(grouped);
  });

  // GET /api/menu/:category — items by category
  app.get('/api/menu/:category', (req: Request, res: Response) => {
    const category = decodeURIComponent(req.params['category'] as string);
    const items = db.prepare(
      'SELECT * FROM menu_items WHERE category = ? AND available = 1 ORDER BY id'
    ).all(category);
    res.json(items);
  });

  // POST /api/menu — add item (admin)
  app.post('/api/menu', (req: Request, res: Response) => {
    const { name, category, description, price, image_url } = req.body as Record<string, any>;
    if (!name || !category || !price) {
      res.status(400).json({ error: 'name, category, and price are required' });
      return;
    }
    const stmt = db.prepare(
      'INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, category, description || '', price, image_url || '') as { lastInsertRowid: number };
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(item);
  });
}
