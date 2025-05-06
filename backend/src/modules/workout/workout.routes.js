import { Router } from 'express';
import workoutController from './workout.controller.js';
import authMiddleware from '../auth/auth.middleware.js';

const router = Router();

router.route('/').post(authMiddleware.protect, workoutController.createWorkout);

router.route('/:id').get(authMiddleware.protect, workoutController.getWorkout);

export default router;
