import { Router } from 'express';
import workoutController from './workout.controller.js';
import authMiddleware from '../auth/auth.middleware.js';
import workoutMiddleware from './workout.middleware.js';
import workoutValidationSchemas from './workout.validation.js';

const router = Router();

router.route('/').post(authMiddleware.protect, workoutController.createWorkout);

router
  .route('/workouts')
  .get(authMiddleware.protect, workoutController.getAllWorkouts);

router
  .route('/workouts/creator')
  .get(authMiddleware.protect, workoutController.getAllWorkoutsCreatedByUser);

router
  .route('/workouts/participate')
  .get(authMiddleware.protect, workoutController.getAllWorkoutsParticipate);

router.route('/:id').get(authMiddleware.protect, workoutController.getWorkout);

router
  .route('/:id/join')
  .post(authMiddleware.protect, workoutController.joinToWorkout);

router
  .route('/:id/update')
  .patch(
    authMiddleware.protect,
    workoutMiddleware.validateUpdateSchema(
      workoutValidationSchemas.updateWorkoutSchema,
    ),
    workoutController.updateWorkout,
  );

export default router;
