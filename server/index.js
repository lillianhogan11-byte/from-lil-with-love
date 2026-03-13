const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const registerPortalRoutes = require('./portal');
const http = require('http');

const app = express();
const PORT = 3001;
const DB_PATH = '/home/lils-agent/.openclaw/workspace/luv.db';

app.use(cors());
app.use(express.json());

// Serve built client in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// --- Database setup (Node.js built-in SQLite) ---
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    pickup_time TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    available INTEGER DEFAULT 1
  )
`);

// Seed if empty
const count = db.prepare('SELECT COUNT(*) as cnt FROM menu_items').get();
if (count.cnt === 0) {
  const insert = db.prepare(
    'INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)'
  );

  // Breads
  insert.run('Sourdough Loaf', 'Breads', 'Classic long-fermented sourdough with a crackling crust and chewy crumb. Made with locally milled flour.', 9.00, 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80');
  insert.run('Honey Wheat Loaf', 'Breads', 'Soft, lightly sweet wheat bread made with raw local honey and stone-ground whole wheat flour.', 8.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80');
  insert.run('Rosemary Focaccia', 'Breads', 'Pillowy Italian-style flatbread with fresh rosemary, flaky sea salt, and a drizzle of extra virgin olive oil.', 7.50, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80');
  insert.run('Seeded Rye', 'Breads', 'Dense, hearty rye loaf studded with caraway, sunflower, and pumpkin seeds. Perfect with cheese or smoked salmon.', 9.50, 'https://images.unsplash.com/photo-1534620808146-d33bb39128b2?w=600&q=80');

  // Pastries
  insert.run('Butter Croissant', 'Pastries', 'Laminated with European-style butter, these croissants shatter at first touch and melt in your mouth.', 4.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80');
  insert.run('Almond Danish', 'Pastries', 'Flaky pastry filled with house-made almond cream, topped with toasted sliced almonds and a light glaze.', 5.00, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&q=80');
  insert.run('Morning Bun', 'Pastries', 'A swirl of buttery croissant dough with orange zest, cinnamon sugar, and a hint of cardamom. Rolled in sugar.', 4.75, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80');
  insert.run('Blueberry Scone', 'Pastries', 'Tender, not-too-sweet scone bursting with fresh local blueberries, finished with a vanilla glaze.', 4.25, 'https://images.unsplash.com/photo-1598908314732-07113901949e?w=600&q=80');

  // Cookies
  insert.run('Brown Butter Chocolate Chip', 'Cookies', 'Thick, chewy cookies with nutty brown butter, two kinds of chocolate, and a sprinkle of fleur de sel.', 3.50, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80');
  insert.run('Lavender Shortbread', 'Cookies', 'Delicate, crumbly shortbread infused with culinary lavender from a local farm. Simple and sublime.', 3.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80');
  insert.run('Oat & Honey Granola Bar', 'Cookies', 'Hearty bars with rolled oats, wildflower honey, dried cranberries, and toasted pecans. Naturally sweetened.', 3.25, 'https://images.unsplash.com/photo-1490567674331-8a36fd29f188?w=600&q=80');
  insert.run('Snickerdoodle', 'Cookies', 'Soft-baked pillows of cinnamon-sugar perfection. A beloved classic done with care and quality ingredients.', 2.75, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&q=80');

  // Seasonal Specials
  insert.run('Maple Pecan Tart', 'Seasonal Specials', 'Buttery tart shell filled with Indiana maple syrup custard and topped with candied local pecans.', 6.50, 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&q=80');
  insert.run('Strawberry Basil Galette', 'Seasonal Specials', 'Rustic free-form tart with summer strawberries, fresh basil, and a honey-kissed ricotta layer.', 6.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80');
  insert.run('Apple Cider Donut', 'Seasonal Specials', 'Cake donuts made with fresh-pressed local apple cider, rolled in cinnamon sugar while still warm.', 3.75, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80');
  insert.run('Pumpkin Spice Loaf', 'Seasonal Specials', 'Moist quick bread made with roasted local pumpkin, warm spices, and a cream cheese swirl.', 5.50, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80');

  // Coffee & Drinks
  insert.run('House Drip Coffee', 'Coffee & Drinks', 'Ethically sourced single-origin beans, roasted locally and brewed fresh all day. Ask about today\'s origin.', 3.00, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80');
  insert.run('Lavender Latte', 'Coffee & Drinks', 'Espresso with house-made lavender syrup and steamed oat milk. Our most beloved signature drink.', 5.50, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80');
  insert.run('Honey Cardamom Cortado', 'Coffee & Drinks', 'Bold espresso balanced with steamed whole milk, raw local honey, and a whisper of cardamom.', 5.00, 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&q=80');
  insert.run('Chamomile Oat Latte', 'Coffee & Drinks', 'Caffeine-free and deeply soothing. Chamomile tea concentrate, steamed oat milk, and a touch of vanilla honey.', 4.75, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80');

  console.log('Database seeded with menu items.');
}

// Fix image URLs — runs every startup to ensure accuracy
const imageUpdates = [
  // Breads
  ['Sourdough Loaf',             'https://images.unsplash.com/photo-1585478259715-4d3f6b638c18?w=600&q=80'],
  ['Honey Wheat Loaf',           'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80'],
  ['Rosemary Focaccia',          'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&q=80'],
  ['Seeded Rye',                 'https://images.unsplash.com/photo-1534620808146-d33bb39128b2?w=600&q=80'],
  // Pastries
  ['Butter Croissant',           'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'],
  ['Almond Danish',              'https://images.unsplash.com/photo-1619975208991-b4eb580cffdd?w=600&q=80'],
  ['Morning Bun',                'https://images.unsplash.com/photo-1586325194227-7625ed4d7a31?w=600&q=80'],
  ['Blueberry Scone',            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80'],
  // Cookies
  ['Brown Butter Chocolate Chip','https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80'],
  ['Lavender Shortbread',        'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600&q=80'],
  ['Oat & Honey Granola Bar',    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=600&q=80'],
  ['Snickerdoodle',              'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?w=600&q=80'],
  // Seasonal Specials
  ['Maple Pecan Tart',           'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&q=80'],
  ['Strawberry Basil Galette',   'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80'],
  ['Apple Cider Donut',          'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80'],
  ['Pumpkin Spice Loaf',         'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80'],
  // Coffee & Drinks
  ['House Drip Coffee',          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'],
  ['Lavender Latte',             'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80'],
  ['Honey Cardamom Cortado',     'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&q=80'],
  ['Chamomile Oat Latte',        'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80'],
];
const updateStmt = db.prepare('UPDATE menu_items SET image_url = ? WHERE name = ?');
for (const [name, url] of imageUpdates) {
  updateStmt.run(url, name);
}

// --- Routes ---

// GET /api/menu — all items grouped by category
app.get('/api/menu', (req, res) => {
  const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, id').all();
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
  res.json(grouped);
});

// GET /api/menu/:category — items by category
app.get('/api/menu/:category', (req, res) => {
  const category = decodeURIComponent(req.params.category);
  const items = db.prepare(
    'SELECT * FROM menu_items WHERE category = ? AND available = 1 ORDER BY id'
  ).all(category);
  res.json(items);
});

// POST /api/menu — add item (admin)
app.post('/api/menu', (req, res) => {
  const { name, category, description, price, image_url } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'name, category, and price are required' });
  }
  const stmt = db.prepare(
    'INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(name, category, description || '', price, image_url || '');
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

// POST /api/orders — create order
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, pickup_time, items, total, notes } = req.body;
  if (!customer_name || !customer_phone || !pickup_time || !items || total == null) {
    return res.status(400).json({ error: 'customer_name, customer_phone, pickup_time, items, and total are required' });
  }
  const itemsJson = JSON.stringify(items);
  const stmt = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, pickup_time, items, total, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(customer_name, customer_phone, pickup_time, itemsJson, total, notes || null);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  order.items = JSON.parse(order.items);

  // Notify webhook (fire and forget)
  try {
    const item_count = Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
    const body = JSON.stringify({
      agentId: 'main',
      text: `🥐 New pickup order from ${customer_name}! ${item_count} items, $${Number(total).toFixed(2)}. Pickup at ${pickup_time}. Phone: ${customer_phone}`,
      mode: 'now'
    });
    const options = {
      hostname: 'localhost',
      port: 18789,
      path: '/api/notify',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req2 = http.request(options);
    req2.on('error', () => {});
    req2.write(body);
    req2.end();
  } catch (e) {}

  res.status(201).json(order);
});

// GET /api/orders — all orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  orders.forEach(o => { o.items = JSON.parse(o.items); });
  res.json(orders);
});

// POST /api/orders — place a pickup order
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, pickup_time, items, total, notes } = req.body;
  if (!customer_name || !customer_phone || !pickup_time || !items || total == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const stmt = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, pickup_time, items, total, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(customer_name, customer_phone, pickup_time, JSON.stringify(items), total, notes || '');
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);

  // Notify via OpenClaw (fire-and-forget)
  try {
    const http = require('http');
    const body = JSON.stringify({
      agentId: 'main',
      text: `🥐 New order from ${customer_name}! ${items.length} item(s), $${parseFloat(total).toFixed(2)}. Pickup: ${pickup_time}. 📞 ${customer_phone}`,
      mode: 'now'
    });
    const req2 = http.request({ hostname: 'localhost', port: 18789, path: '/api/notify', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } });
    req2.on('error', () => {});
    req2.write(body);
    req2.end();
  } catch {}

  res.status(201).json(order);
});

// GET /api/orders — all orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

// Catch-all: serve React app
app.get('*', (req, res) => {
  const distIndex = path.join(__dirname, '../client/dist/index.html');
  res.sendFile(distIndex, (err) => {
    if (err) res.status(404).send('Not found');
  });
});

// Register portal routes
registerPortalRoutes(app, db);

app.listen(PORT, () => {
  console.log(`From Lil With Love server running on http://localhost:${PORT}`);
});
