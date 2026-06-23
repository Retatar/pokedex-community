import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  try {
    const [rows]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;
    const userRole = 'user';

    const accessToken = generateAccessToken({ id: userId, role: userRole });
    const refreshToken = generateRefreshToken({ id: userId });

    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: { id: userId, name, email, role: userRole },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Register Error Detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server',
      errorDetail: error.message || 'Unknown error'
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Kredensial salah' });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Kredensial salah' });
      return;
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await pool.execute('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Login Error Detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server',
      errorDetail: error.message || 'Unknown error'
    });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token wajib diisi' });
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const [rows]: any = await pool.execute('SELECT id, role, refresh_token FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token tidak valid' });
      return;
    }

    const newAccessToken = generateAccessToken({ id: rows[0].id, role: rows[0].role });
    res.status(200).json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Refresh token kadaluarsa atau tidak valid' });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    await pool.execute('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);
    res.status(200).json({ success: true, message: 'Logout berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  // Mock forgot password for MVP. Log email only.
  const { email } = req.body;
  console.log(`Forgot password requested for ${email}`);
  res.status(200).json({ success: true, message: 'Instruksi reset password telah dikirim ke email' });
}
