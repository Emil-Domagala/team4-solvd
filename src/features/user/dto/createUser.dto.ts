import { z } from 'zod';

/**
 * Zod schema for creating a user.
 */
export const CreateUserSchema = z.object({
  name: z
    .string('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters'),
  email: z
    .string('Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be at most 255 characters'),
  password: z
    .string('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password must be at most 255 characters'),
});

/**
 * TypeScript type inferred from the schema.
 */
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
