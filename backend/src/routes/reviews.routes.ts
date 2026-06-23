import { Router } from 'express';
import { getReviews, getReviewById, createReview, updateReview, deleteReview } from '../controllers/reviews.controller';
import { reviewValidator, reviewUpdateValidator } from '../validators/review.validator';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public route to get reviews
router.get('/', getReviews);
router.get('/:id', getReviewById);

// Protected routes
router.use(authenticate);
router.post('/', reviewValidator, validate, createReview);
router.put('/:id', reviewUpdateValidator, validate, updateReview);
router.delete('/:id', deleteReview);

export default router;
