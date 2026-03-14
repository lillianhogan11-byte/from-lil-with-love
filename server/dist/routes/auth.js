"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.default = register;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const googleapis_1 = require("googleapis");
const JWT_SECRET = process.env.JWT_SECRET || 'flwl-portal-secret-2026';
const JWT_EXPIRES = '30d';
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
function register(app, db) {
    // ── Google OAuth ───────────────────────────────────────
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    app.get('/auth/google', (req, res) => {
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
            prompt: 'select_account',
        });
        res.redirect(url);
    });
    app.get('/auth/google/callback', async (req, res) => {
        try {
            const { code } = req.query;
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
            const { data } = await oauth2.userinfo.get();
            const email = data.email;
            const allowed = db.prepare('SELECT * FROM allowed_users WHERE email = ?').get(email);
            if (!allowed) {
                return res.redirect('https://portal.biscuitbar.cafe/login?error=unauthorized');
            }
            const token = jsonwebtoken_1.default.sign({ email, name: data.name, picture: data.picture, sub: data.sub }, process.env.JWT_SECRET || 'changeme', { expiresIn: '30d' });
            res.redirect(`https://portal.biscuitbar.cafe/auth/callback#token=${token}`);
        }
        catch (err) {
            console.error('OAuth error:', err);
            res.redirect('https://portal.biscuitbar.cafe/login?error=oauth_failed');
        }
    });
    // ── Auth ──────────────────────────────────────────────
    app.post('/portal/api/auth/register', async (req, res) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'All fields required' });
            return;
        }
        const existing = db.prepare('SELECT id FROM portal_users WHERE email = ?').get(email);
        if (existing) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const result = db.prepare('INSERT INTO portal_users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
        const user = db.prepare('SELECT id, name, email FROM portal_users WHERE id = ?').get(result.lastInsertRowid);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.status(201).json({ token, user });
    });
    app.post('/portal/api/auth/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password required' });
            return;
        }
        const user = db.prepare('SELECT * FROM portal_users WHERE email = ?').get(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
    app.get('/portal/api/auth/me', authMiddleware, (req, res) => {
        const user = db.prepare('SELECT id, name, email FROM portal_users WHERE id = ?').get(req.user?.id);
        res.json(user);
    });
}
