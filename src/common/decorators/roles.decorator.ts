import { SetMetadata } from '@nestjs/common';

export const Roles = (priority: number) => SetMetadata('minRolePriority', priority);
