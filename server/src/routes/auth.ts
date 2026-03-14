import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { Application, Request, Response, NextFunction } from 'express';

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

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default function register(app: Application, db: any): void {
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
}
