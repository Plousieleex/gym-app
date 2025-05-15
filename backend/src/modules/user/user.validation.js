import { z } from 'zod';

export const userProfileSchema = z.object({
  height: z.number(),
  weight: z.number(),
  age: z.number(),
});

export default {
  userProfileSchema,
};
