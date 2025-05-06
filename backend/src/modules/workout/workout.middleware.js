import Joi from 'joi';

export const workoutSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  workout_description: Joi.string(),
  workout_level: Joi.number(),
  workout_aim: Joi.string(),
  workout_duration: Joi.number(),
  workout_routine: Joi.number(),
  isPublic: Joi.bool(),
  workout_img: Joi.string(),
});
