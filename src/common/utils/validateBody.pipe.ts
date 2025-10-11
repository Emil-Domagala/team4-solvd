import { PipeTransform, Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

import { MethodArgumentNotValidError } from '../errors/methodArgumentNotValid.error';
import { ErrorsArr } from '../errors/cutom.error';

/**
 * Pipe for validating request bodies against a Zod schema.
 * Throws MethodArgumentNotValidError if validation fails.
 */
@Injectable()
export class ValidateBodyPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors: ErrorsArr = result.error.issues.map((err) => ({
        message: err.message,
        field: err.path.join('.'),
      }));

      throw new MethodArgumentNotValidError('Invalid request body', errors);
    }

    return result.data;
  }
}
