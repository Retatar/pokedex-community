import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .isString().withMessage('Nama harus berupa teks')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2-100 karakter')
    .escape(),
  body('email')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password harus berupa string')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  body('password_confirmation')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Konfirmasi password tidak cocok');
      }
      return true;
    }),
];

export const loginValidator = [
  body('email')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password wajib diisi'),
];

export const resetPasswordValidator = [
  body('token').isString().withMessage('Token reset wajib diisi'),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Konfirmasi password tidak cocok');
    }
    return true;
  }),
];

export const changePasswordValidator = [
  body('current_password').isString().withMessage('Password lama wajib diisi'),
  body('new_password').isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter'),
  body('new_password_confirmation').custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error('Konfirmasi password baru tidak cocok');
    }
    return true;
  }),
];
