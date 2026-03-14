"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_sqlite_1 = require("node:sqlite");
const menu_1 = __importDefault(require("./routes/menu"));
const orders_1 = __importDefault(require("./routes/orders"));
const auth_1 = __importDefault(require("./routes/auth"));
const portal_1 = __importDefault(require("./routes/portal"));
const app = (0, express_1.default)();
const PORT = 3001;
const DB_PATH = '/home/lils-agent/.openclaw/workspace/luv.db';
app.use((0, cors_1.default)({
    origin: [
        'https://biscuitbar.cafe',
        'https://www.biscuitbar.cafe',
        'https://portal.biscuitbar.cafe',
        'https://api.biscuitbar.cafe',
        'https://kiosk.biscuitbar.cafe',
    ],
    credentials: true,
}));
app.use(express_1.default.json());
// Static files now served by nginx — not needed here
// --- Database setup (Node.js built-in SQLite) ---
const db = new node_sqlite_1.DatabaseSync(DB_PATH);
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
db.exec(`
  CREATE TABLE IF NOT EXISTS allowed_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TEXT
  )
`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_allowed_users_email ON allowed_users(email)`);
// Seed Lily as allowed user
const userCount = db.prepare('SELECT COUNT(*) as cnt FROM allowed_users').get();
if (userCount.cnt === 0) {
    db.prepare('INSERT OR IGNORE INTO allowed_users (email, name) VALUES (?, ?)').run('lily@biscuitbar.cafe', 'Lily');
}
// Seed if empty
const count = db.prepare('SELECT COUNT(*) as cnt FROM menu_items').get();
if (count.cnt === 0) {
    const insert = db.prepare('INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)');
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
    insert.run('House Drip Coffee', 'Coffee & Drinks', "Ethically sourced single-origin beans, roasted locally and brewed fresh all day. Ask about today's origin.", 3.00, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80');
    insert.run('Lavender Latte', 'Coffee & Drinks', 'Espresso with house-made lavender syrup and steamed oat milk. Our most beloved signature drink.', 5.50, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80');
    insert.run('Honey Cardamom Cortado', 'Coffee & Drinks', 'Bold espresso balanced with steamed whole milk, raw local honey, and a whisper of cardamom.', 5.00, 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&q=80');
    insert.run('Chamomile Oat Latte', 'Coffee & Drinks', 'Caffeine-free and deeply soothing. Chamomile tea concentrate, steamed oat milk, and a touch of vanilla honey.', 4.75, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80');
    console.log('Database seeded with menu items.');
}
// Fix image URLs — runs every startup to ensure accuracy
const imageUpdates = [
    // Breads
    ['Sourdough Loaf', 'https://images.unsplash.com/photo-1585478259715-4d3f6b638c18?w=600&q=80'],
    ['Honey Wheat Loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80'],
    ['Rosemary Focaccia', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&q=80'],
    ['Seeded Rye', 'https://images.unsplash.com/photo-1534620808146-d33bb39128b2?w=600&q=80'],
    // Pastries
    ['Butter Croissant', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80'],
    ['Almond Danish', 'https://images.unsplash.com/photo-1619975208991-b4eb580cffdd?w=600&q=80'],
    ['Morning Bun', 'https://images.unsplash.com/photo-1586325194227-7625ed4d7a31?w=600&q=80'],
    ['Blueberry Scone', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80'],
    // Cookies
    ['Brown Butter Chocolate Chip', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80'],
    ['Lavender Shortbread', 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600&q=80'],
    ['Oat & Honey Granola Bar', 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=600&q=80'],
    ['Snickerdoodle', 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?w=600&q=80'],
    // Seasonal Specials
    ['Maple Pecan Tart', 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&q=80'],
    ['Strawberry Basil Galette', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80'],
    ['Apple Cider Donut', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80'],
    ['Pumpkin Spice Loaf', 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&q=80'],
    // Coffee & Drinks
    ['House Drip Coffee', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'],
    ['Lavender Latte', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80'],
    ['Honey Cardamom Cortado', 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=600&q=80'],
    ['Chamomile Oat Latte', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80'],
];
const updateStmt = db.prepare('UPDATE menu_items SET image_url = ? WHERE name = ?');
for (const [name, url] of imageUpdates) {
    updateStmt.run(url, name);
}
// --- Routes ---
(0, menu_1.default)(app, db);
(0, orders_1.default)(app, db);
(0, auth_1.default)(app, db);
(0, portal_1.default)(app, db);
app.listen(PORT, '127.0.0.1', () => {
    console.log(`From Lil With Love server running on http://localhost:${PORT}`);
});
