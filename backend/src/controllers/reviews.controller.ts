import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getReviews(req: Request, res: Response): Promise<void> {
  const pokemonId = req.query.pokemon_id;
  
  try {
    let query = 'SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id';
    const params: any[] = [];
    
    if (pokemonId) {
      query += ' WHERE r.pokemon_id = ?';
      params.push(pokemonId);
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const [rows]: any = await pool.execute(query, params);
    
    // Calculate average
    let averageRating = 0;
    if (rows.length > 0) {
      const sum = rows.reduce((acc: number, curr: any) => acc + curr.rating, 0);
      averageRating = sum / rows.length;
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        reviews: rows,
        averageRating,
        totalReviews: rows.length
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data review' });
  }
}

export async function getReviewById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.execute(
      'SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?', 
      [id]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
      return;
    }
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail review' });
  }
}

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  const { pokemon_id, pokemon_name, rating, comment } = req.body;
  const userId = req.user!.id;

  try {
    // Cek apakah user sudah mereview pokemon ini
    const [existing]: any = await pool.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND pokemon_id = ?',
      [userId, pokemon_id]
    );

    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'Anda sudah mereview Pokémon ini' });
      return;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO reviews (user_id, pokemon_id, pokemon_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, pokemon_id, pokemon_name, rating, comment]
    );

    const [newReview]: any = await pool.execute(
      'SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [result.insertId]
    );

    // Create notifications for users who favorited this pokemon
    try {
      const [favoriteUsers]: any = await pool.execute(
        'SELECT user_id FROM favorites WHERE pokemon_id = ? AND user_id != ?',
        [pokemon_id, userId]
      );

      if (favoriteUsers.length > 0) {
        const title = `Review Baru untuk ${pokemon_name}`;
        const message = `Seseorang telah menulis review baru tentang Pokémon favoritmu, ${pokemon_name}!`;
        
        // Prepare bulk insert
        const values = favoriteUsers.map((fav: any) => [fav.user_id, 'review', title, message, result.insertId]);
        const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await pool.execute(
          `INSERT INTO notifications (user_id, type, title, message, reference_id) VALUES ${placeholders}`,
          flatValues
        );
      }
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
      // We don't fail the review creation if notification fails
    }

    res.status(201).json({ success: true, message: 'Review berhasil dibuat', data: newReview[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat review' });
  }
}

export async function updateReview(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute('SELECT user_id FROM reviews WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
      return;
    }

    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses untuk mengubah review ini' });
      return;
    }

    await pool.execute(
      'UPDATE reviews SET rating = COALESCE(?, rating), comment = COALESCE(?, comment) WHERE id = ?',
      [rating, comment, id]
    );

    const [updatedReview]: any = await pool.execute(
      'SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?',
      [id]
    );

    res.status(200).json({ success: true, message: 'Review berhasil diupdate', data: updatedReview[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal update review' });
  }
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute('SELECT user_id FROM reviews WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
      return;
    }

    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki akses untuk menghapus review ini' });
      return;
    }

    await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Review berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus review' });
  }
}
