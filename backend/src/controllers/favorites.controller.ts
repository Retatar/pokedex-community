import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getFavorites(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data favorites' });
  }
}

export async function addFavorite(req: AuthRequest, res: Response): Promise<void> {
  const { pokemon_id, pokemon_name, pokemon_sprite } = req.body;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemon_id]
    );

    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'Pokémon sudah ada di favorites' });
      return;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO favorites (user_id, pokemon_id, pokemon_name, pokemon_sprite) VALUES (?, ?, ?, ?)',
      [userId, pokemon_id, pokemon_name, pokemon_sprite]
    );

    const [newFavorite]: any = await pool.execute(
      'SELECT * FROM favorites WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Berhasil menambahkan ke favorites', data: newFavorite[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan favorite' });
  }
}

export async function removeFavorite(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute(
      'SELECT user_id FROM favorites WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Favorite tidak ditemukan' });
      return;
    }

    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses untuk menghapus favorite ini' });
      return;
    }

    await pool.execute('DELETE FROM favorites WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Berhasil menghapus favorite' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus favorite' });
  }
}
