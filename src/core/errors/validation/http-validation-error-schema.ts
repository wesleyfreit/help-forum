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
  403: z.object({
    message: z.string().default('Not Allowed'),
    error: z.string().default('Forbidden'),
    statusCode: z.number().default(403),
  }),
  404: z.object({
    error: z.string().default('Resource Not Found'),
    statusCode: z.number().default(404),
  }),
  409: (name: string = 'Resource') =>
    z.object({
      message: z.string().default(`${name} already exists`),
      error: z.string().default('Conflict'),
      statusCode: z.number().default(409),
    }),
  415: z.object({
    error: z.string().default('Unsupported Media Type'),
    message: z.string().default('File type "{type}" is not valid'),
    statusCode: z.number().default(415),
  }),
} as const;
