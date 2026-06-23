import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unread_only === 'true';

  try {
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ' AND is_read = 0';
    }

    // Get total count
    const [countRows]: any = await pool.execute(
      query.replace('*', 'COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unreadCount'), 
      params
    );

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    // Di MySQL2 limit dan offset disarankan sebagai angka murni jika tidak menggunakan toString() tapi saya pakai konversi string. Lebih aman dikirimkan sebagai tipe numerik di prepared statements
    const numericParams = params.map(p => typeof p === 'string' && !isNaN(Number(p)) && p !== '' ? Number(p) : p);

    const [rows]: any = await pool.execute(query, numericParams);

    res.status(200).json({
      success: true,
      data: {
        notifications: rows,
        unreadCount: parseInt(countRows[0].unreadCount || 0),
        total: parseInt(countRows[0].total || 0),
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi' });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const [result]: any = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
      return;
    }

    res.status(200).json({ success: true, message: 'Notifikasi ditandai sebagai dibaca' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menandai notifikasi' });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  try {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.status(200).json({ success: true, message: 'Semua notifikasi ditandai sebagai dibaca' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menandai semua notifikasi' });
  }
}
