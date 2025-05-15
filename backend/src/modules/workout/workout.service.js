import { connect } from 'http2';
import prisma from '../../config/db.js';
import AppError from '../../utils/appError.js';
import handleAsync from '../../utils/handleAsync.js';

export const createWorkout = async ({
  userID,
  title,
  workout_description,
  workout_level,
  workout_aim,
  workout_duration,
  workout_routine,
  isPublic,
  workout_img,
}) => {
  try {
    const newWorkout = await prisma.workout.create({
      data: {
        title,
        workout_description,
        workout_level,
        workout_aim,
        workout_duration,
        workout_routine,
        isPublic,
        workout_img,

        creator: {
          connect: { id: userID },
        },

        participants: {
          connect: [{ id: userID }],
        },
      },

      include: {
        creator: true,
        participants: true,
      },
    });

    return newWorkout;
  } catch (e) {
    throw new AppError('Internal Server Error.', 500);
  }
};

export const getWorkout = async (workoutID, userID) => {
  const workoutRecord = await prisma.workout.findUnique({
    where: { id: workoutID },
    include: {
      creator: {
        select: {
          id: true,
          name_surname: true,
          username: true,
        },
      },
      participants: {
        select: {
          id: true,
          name_surname: true,
          username: true,
        },
      },
    },
  });

  if (!workoutRecord) {
    throw new AppError('This workout does not exists.', 404);
  }

  if (!workoutRecord.isPublic && workoutRecord.creatorId !== userID) {
    throw new AppError('Workout not found.', 404);
  }

  return workoutRecord;
};

export const getAllWorkouts = async () => {
  try {
    const workoutRecords = await prisma.workout.findMany({
      where: { isPublic: true },
      include: {
        creator: {
          select: {
            id: true,
            name_surname: true,
            username: true,
          },
        },
        participants: {
          select: {
            id: true,
            name_surname: true,
            username: true,
          },
        },
      },
    });

    if (!workoutRecords) {
      throw new AppError('No workouts found.', 404);
    }

    return workoutRecords;
  } catch (e) {
    throw new AppError('Internal Server Error.', 500);
  }
};

export const joinToWorkout = async (userID, workoutID) => {
  try {
    const workoutRecord = await prisma.workout.findUnique({
      where: { id: workoutID },
    });

    if (!workoutRecord || !workoutRecord.isPublic) {
      throw new AppError('No workout found.', 404);
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutID },
      data: {
        participants: {
          connect: { id: userID },
        },
      },
    });

    return updatedWorkout;
  } catch (e) {
    throw new AppError('Internal server error.', 500);
  }
};

export const getAllWorkoutsCreatedByUser = async (userID) => {
  try {
    const createdWorkoutRecords = await prisma.workout.findMany({
      where: { creatorId: userID },
    });

    if (createdWorkoutRecords.length === 0) {
      throw new AppError('No workout found.', 404);
    }

    return createdWorkoutRecords;
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError('Internal Server Error.', 500);
  }
};

export const getAllWorkoutsParticipate = async (userID) => {
  try {
    const workoutRecords = await prisma.workout.findMany({
      where: {
        participants: {
          every: { id: userID },
        },
      },
    });

    if (!workoutRecords || workoutRecords.length === 0) {
      throw new AppError('You dont have any workout you participate.', 404);
    }

    return workoutRecords;
  } catch (e) {
    console.log(e);
    if (e instanceof AppError) throw e;
    throw new AppError('Internal server error.', 500);
  }
};

export const updateWorkout = async (userID, workoutID, data) => {
  const workoutRecord = await prisma.workout.findFirst({
    where: {
      id: workoutID,
      creatorId: userID,
    },
  });

  if (!workoutRecord) {
    throw new AppError('No workout found.', 404);
  }

  try {
    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutID },
      data,
    });

    return updatedWorkout;
  } catch (e) {
    console.log(e);
    throw new AppError('Internal server error.', 500);
  }
};

export const deleteWorkout = async (userID, workoutID) => {
  const workoutRecord = await prisma.workout.findFirst({
    where: {
      id: workoutID,
      creatorId: userID,
    },
  });

  if (!workoutRecord) {
    throw new AppError('No workout found.', 404);
  }

  try {
    await prisma.workout.delete({
      where: {
        id: workoutID,
        creatorId: userID,
      },
    });
  } catch (e) {
    throw new AppError('Internal Server Error.', 500);
  }
};

export default {
  createWorkout,
  getWorkout,
  getAllWorkouts,
  joinToWorkout,
  updateWorkout,
  deleteWorkout,
  getAllWorkoutsCreatedByUser,
  getAllWorkoutsParticipate,
};
