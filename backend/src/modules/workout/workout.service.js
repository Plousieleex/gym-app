import prisma from '../../config/db.js';
import AppError from '../../utils/appError.js';

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
    console.log(e);
    throw new AppError(
      'Error occured while trying to create workout. Try again later.',
      500,
    );
  }
};

export const getWorkout = async (workoutID, userID) => {
  const workoutRecord = await prisma.workout.findUnique({
    where: { id: workoutID },
  });

  if (!workoutRecord) {
    throw new AppError('This workout does not exists.', 404);
  }

  if (!workoutRecord.isPublic && workoutRecord.creatorId !== userID) {
    throw new AppError('Workout not found.', 404);
  }

  return workoutRecord;
};

export default {
  createWorkout,
  getWorkout,
};
