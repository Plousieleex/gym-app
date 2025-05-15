import { Router } from 'express';
import workoutController from './workout.controller.js';
import authMiddleware from '../auth/auth.middleware.js';
import workoutMiddleware from './workout.middleware.js';
import workoutValidationSchemas from './workout.validation.js';

const router = Router();

router
  .route('/')
  .post(authMiddleware.protect, workoutController.createWorkout)
  .get(authMiddleware.protect, workoutController.getAllWorkouts);

router
  .route('/workouts?creator=true')
  .get(authMiddleware.protect, workoutController.getAllWorkoutsCreatedByUser);

router
  .route('/workouts?participating=true')
  .get(authMiddleware.protect, workoutController.getAllWorkoutsParticipate);

router
  .route('/:id')
  .get(authMiddleware.protect, workoutController.getWorkout)
  .patch(
    authMiddleware.protect,
    workoutMiddleware.validateUpdateSchema(
      workoutValidationSchemas.updateWorkoutSchema,
    ),
    workoutController.updateWorkout,
  )
  .delete(authMiddleware.protect, workoutController.deleteWorkout);

router
  .route('/:id/join')
  .post(authMiddleware.protect, workoutController.joinToWorkout);

export default router;
