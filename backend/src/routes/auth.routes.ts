import { Router } from 'express';
import { register, login, refresh, logout, forgotPassword } from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', registerLimiter, registerValidator, validate, register);
router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);

export default router;
