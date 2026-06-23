import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getTeams(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  try {
    // Ambil data teams
    const [teams]: any = await pool.execute(
      'SELECT * FROM teams WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Ambil anggota pokemon tiap team
    if (teams.length > 0) {
      const teamIds = teams.map((t: any) => t.id);
      const placeholders = teamIds.map(() => '?').join(', ');

      const [pokemon]: any = await pool.execute(
        `SELECT * FROM team_pokemon WHERE team_id IN (${placeholders}) ORDER BY slot ASC`,
        teamIds
      );

      // Kelompokkan pokemon ke masing-masing team
      teams.forEach((team: any) => {
        team.pokemon = pokemon.filter((p: any) => p.team_id === team.id);
      });
    }

    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data teams' });
  }
}

export async function getTeamDetail(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const [teams]: any = await pool.execute(
      'SELECT * FROM teams WHERE id = ?',
      [id]
    );

    if (teams.length === 0) {
      res.status(404).json({ success: false, message: 'Team tidak ditemukan' });
      return;
    }

    if (teams[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak' });
      return;
    }

    const team = teams[0];
    const [pokemon]: any = await pool.execute(
      'SELECT * FROM team_pokemon WHERE team_id = ? ORDER BY slot ASC',
      [id]
    );

    team.pokemon = pokemon;

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail team' });
  }
}

export async function createTeam(req: AuthRequest, res: Response): Promise<void> {
  const { name, description } = req.body;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute(
      'SELECT id FROM teams WHERE user_id = ? AND name = ?',
      [userId, name]
    );

    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'Anda sudah memiliki team dengan nama ini' });
      return;
    }

    const [result]: any = await pool.execute(
      'INSERT INTO teams (user_id, name, description) VALUES (?, ?, ?)',
      [userId, name, description || null]
    );

    const [newTeam]: any = await pool.execute(
      'SELECT * FROM teams WHERE id = ?',
      [result.insertId]
    );

    newTeam[0].pokemon = [];

    res.status(201).json({ success: true, message: 'Team berhasil dibuat', data: newTeam[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat team' });
  }
}

export async function updateTeam(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute('SELECT user_id FROM teams WHERE id = ?', [id]);

    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Team tidak ditemukan' });
      return;
    }

    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak' });
      return;
    }

    // Check nama duplicate
    if (name) {
      const [duplicate]: any = await pool.execute(
        'SELECT id FROM teams WHERE user_id = ? AND name = ? AND id != ?',
        [userId, name, id]
      );
      if (duplicate.length > 0) {
        res.status(409).json({ success: false, message: 'Nama team sudah digunakan' });
        return;
      }
    }

    await pool.execute(
      'UPDATE teams SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
      [name, description, id]
    );

    const [updated]: any = await pool.execute('SELECT * FROM teams WHERE id = ?', [id]);
    const [pokemon]: any = await pool.execute('SELECT * FROM team_pokemon WHERE team_id = ? ORDER BY slot ASC', [id]);
    updated[0].pokemon = pokemon;

    res.status(200).json({ success: true, message: 'Team berhasil diupdate', data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal update team' });
  }
}

export async function deleteTeam(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute('SELECT user_id FROM teams WHERE id = ?', [id]);
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Team tidak ditemukan' });
      return;
    }
    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak' });
      return;
    }

    await pool.execute('DELETE FROM teams WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Team berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus team' });
  }
}

export async function addPokemonToTeam(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { pokemon_id, pokemon_name, pokemon_sprite, slot } = req.body;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute('SELECT user_id FROM teams WHERE id = ?', [id]);
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Team tidak ditemukan' });
      return;
    }
    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak' });
      return;
    }

    // Cek limit pokemon
    const [currentPokemon]: any = await pool.execute('SELECT id, pokemon_id, slot FROM team_pokemon WHERE team_id = ?', [id]);

    if (currentPokemon.length >= 6 && !currentPokemon.some((p: any) => p.slot === slot)) {
      res.status(400).json({ success: false, message: 'Team sudah penuh (maksimal 6 Pokémon)' });
      return;
    }

    // Cek duplicate pokemon di tim
    if (currentPokemon.some((p: any) => p.pokemon_id === pokemon_id)) {
      res.status(409).json({ success: false, message: 'Pokémon ini sudah ada di dalam team' });
      return;
    }

    // Insert or Replace berdasarkan slot (Jika slot sudah terisi, update)
    const existingSlot = currentPokemon.find((p: any) => p.slot === slot);

    if (existingSlot) {
      await pool.execute(
        'UPDATE team_pokemon SET pokemon_id = ?, pokemon_name = ?, pokemon_sprite = ? WHERE team_id = ? AND slot = ?',
        [pokemon_id, pokemon_name, pokemon_sprite, id, slot]
      );
    } else {
      await pool.execute(
        'INSERT INTO team_pokemon (team_id, pokemon_id, pokemon_name, pokemon_sprite, slot) VALUES (?, ?, ?, ?, ?)',
        [id, pokemon_id, pokemon_name, pokemon_sprite, slot]
      );
    }

    const [updated]: any = await pool.execute(
      'SELECT * FROM team_pokemon WHERE team_id = ? AND slot = ?',
      [id, slot]
    );

    res.status(200).json({ success: true, message: 'Pokémon berhasil ditambahkan ke team', data: updated[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pokemon ke team' });
  }
}

export async function removePokemonFromTeam(req: AuthRequest, res: Response): Promise<void> {
  const { id, pokemonId } = req.params;
  const userId = req.user!.id;

  try {
    const [existing]: any = await pool.execute('SELECT user_id FROM teams WHERE id = ?', [id]);
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Team tidak ditemukan' });
      return;
    }
    if (existing[0].user_id !== userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak' });
      return;
    }

    await pool.execute('DELETE FROM team_pokemon WHERE team_id = ? AND pokemon_id = ?', [id, pokemonId]);

    res.status(200).json({ success: true, message: 'Pokémon berhasil dihapus dari team' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pokemon dari team' });
  }
}
