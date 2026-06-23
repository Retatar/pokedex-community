import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file JPEG, PNG, atau WEBP yang diperbolehkan'));
    }
  }
});

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateProfile);

export default router;
