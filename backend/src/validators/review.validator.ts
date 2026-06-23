import { body } from 'express-validator';

export const reviewValidator = [
  body('pokemon_id').isInt({ min: 1 }).withMessage('ID Pokémon tidak valid'),
  body('pokemon_name').isString().notEmpty().withMessage('Nama Pokémon wajib diisi'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1 sampai 5'),
  body('comment').isString().isLength({ min: 10, max: 1000 }).withMessage('Komentar harus antara 10 hingga 1000 karakter')
];

export const reviewUpdateValidator = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating harus antara 1 sampai 5'),
  body('comment').optional().isString().isLength({ min: 10, max: 1000 }).withMessage('Komentar harus antara 10 hingga 1000 karakter')
];
