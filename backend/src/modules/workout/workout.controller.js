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
  const workouts = await workoutService.getAllWorkouts();

  res.status(201).json({
    status: 'success',
    results: workouts.length,
    data: workouts,
  });
});

export const getAllWorkoutsCreatedByUser = handleAsync(
  async (req, res, next) => {
    // Get all workouts created by user
    const userID = req.user.id;

    const createdWorkouts = await workoutService.getAllWorkoutsCreatedByUser(
      userID,
    );

    res.status(200).json({
      status: 'success',
      data: createdWorkouts,
    });
  },
);

export const getAllWorkoutsParticipate = handleAsync(async (req, res, next) => {
  // Get all workouts user participated
  const userID = req.user.id;

  const workouts = await workoutService.getAllWorkoutsParticipate(userID);

  res.status(200).json({
    status: 'success',
    results: workouts.length,
    data: workouts,
  });
});

export const updateWorkout = handleAsync(async (req, res, next) => {
  // Update Workout
  const userID = req.user.id;
  const workoutID = Number(req.params.id);

  const workoutData = req.body;

  const updatedWorkout = await workoutService.updateWorkout(
    userID,
    workoutID,
    workoutData,
  );

  res.status(200).json({
    status: 'success',
    data: updatedWorkout,
  });
});

export const deleteWorkout = handleAsync(async (req, res, next) => {
  // Delete Workout
});

export const joinToWorkout = handleAsync(async (req, res, next) => {
  const userID = req.user.id;
  const workoutID = Number(req.params.id);

  const joinedWorkout = await workoutService.joinToWorkout(userID, workoutID);

  res.status(200).json({
    status: 'success',
    data: joinedWorkout,
  });
});

export default {
  createWorkout,
  getWorkout,
  getAllWorkouts,
  getAllWorkoutsCreatedByUser,
  getAllWorkoutsParticipate,
  updateWorkout,
  deleteWorkout,
  joinToWorkout,
};
