import z from 'zod';

export const httpValidationErrorSchema = {
  400: z.object({
    error: z.string().default('Bad Request'),
    statusCode: z.number().default(400),
  }),
  401: z.object({
    error: z.string().default('Unauthorized'),
    statusCode: z.number().default(401),
  }),
} as const;
