import { Router } from 'express';
import {
  getTeams,
  getTeamDetail,
  createTeam,
  updateTeam,
  deleteTeam,
  addPokemonToTeam,
  removePokemonFromTeam
} from '../controllers/teams.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getTeams);
router.get('/:id', authenticate, getTeamDetail);
router.post('/', authenticate, createTeam);
router.put('/:id', authenticate, updateTeam);
router.delete('/:id', authenticate, deleteTeam);

router.post('/:id/pokemon', authenticate, addPokemonToTeam);
router.delete('/:id/pokemon/:pokemonId', authenticate, removePokemonFromTeam);

export default router;
