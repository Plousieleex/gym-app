import { z } from 'zod';

export const updateWorkoutSchema = z.object({
  title: z.string().optional(),
  workout_description: z
    .string({
      invalid_type_error: 'Need a String.',
    })
    .optional(),
  workout_aim: z.string().optional(),
  workout_duration: z.number().optional(),
  workout_routine: z.number().optional(),
  isPublic: z.boolean().optional(),
  workout_img: z.string().optional(),
});

export default {
  updateWorkoutSchema,
};
