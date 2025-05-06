import handleAsync from '../../utils/handleAsync.js';
import workoutService from './workout.service.js';

export const createWorkout = handleAsync(async (req, res, next) => {
  // Create workout
  const userID = req.user.id;

  const newWorkout = await workoutService.createWorkout({
    userID,
    title: req.body.title,
    workout_description: req.body.workout_description,
    workout_level: req.body.workout_level,
    workout_aim: req.body.workout_aim,
    workout_duration: req.body.workout_duration,
    workout_routine: req.body.workout_routine,
    isPublic: req.body.isPublic,
    workout_img: req.body.workout_img,
  });

  res.status(200).json({
    status: 'success',
    message: 'Workout created.',
    data: {
      newWorkout,
    },
  });
});

export const getWorkout = handleAsync(async (req, res, next) => {
  // Get workout (Only one)
  const userID = req.user.id;
  const workoutID = Number(req.params.id);

  const workout = await workoutService.getWorkout(workoutID, userID);

  res.status(201).json({
    status: 'success',
    data: workout,
  });
});

export const getAllWorkouts = handleAsync(async (req, res, next) => {
  // Get all workouts created or participated
});

export const getAllWorkoutsCreatedByUser = handleAsync(
  async (req, res, next) => {
    // Get all workouts created by user
  },
);

export const getAllWorkoutsParticipate = handleAsync(async (req, res, next) => {
  // Get all workouts user participated
});

export const updateWorkout = handleAsync(async (req, res, next) => {
  // Update Workout
});

export const deleteWorkout = handleAsync(async (req, res, next) => {
  // Delete Workout
});

export default {
  createWorkout,
  getWorkout,
  getAllWorkouts,
  getAllWorkoutsCreatedByUser,
  getAllWorkoutsParticipate,
  updateWorkout,
  deleteWorkout,
};
