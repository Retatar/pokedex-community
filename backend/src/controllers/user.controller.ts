import { Request, Response } from 'express';
import pool from '../config/database';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middlewares/auth.middleware';
import fs from 'fs';

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, bio, avatar_url, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      return;
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil profil' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { name, bio, avatar_url } = req.body;
  let avatarUrl = avatar_url;

  try {
    // Save file locally for development without Cloudinary
    if (req.file) {
      avatarUrl = `http://localhost:3000/uploads/${req.file.filename}`;
      // In production you would use cloudinary here:
      // const result = await cloudinary.uploader.upload(req.file.path, {
      //   folder: 'pokedex-community/avatars',
      //   transformation: [{ width: 250, height: 250, crop: 'fill' }]
      // });
      // avatarUrl = result.secure_url;
      // fs.unlinkSync(req.file.path);
    }

    let updateQuery = 'UPDATE users SET ';
    const params: any[] = [];
    const fields: string[] = [];

    if (name) {
      fields.push('name = ?');
      params.push(name);
    }
    
    // Allow emptying bio if bio === ''
    if (bio !== undefined) {
      fields.push('bio = ?');
      params.push(bio);
    }
    
    if (avatarUrl) {
      fields.push('avatar_url = ?');
      params.push(avatarUrl);
    }

    if (fields.length > 0) {
      updateQuery += fields.join(', ') + ' WHERE id = ?';
      params.push(userId);
      await pool.execute(updateQuery, params);
    }

    // Fetch updated profile
    const [updated]: any = await pool.execute(
      'SELECT id, name, email, bio, avatar_url, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({ success: true, message: 'Profil berhasil diupdate', data: updated[0] });
  } catch (error) {
    console.error(error);
    // Cleanup temp file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Gagal mengupdate profil' });
  }
}
