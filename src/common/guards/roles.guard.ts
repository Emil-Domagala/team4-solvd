import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRequest } from './auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minRolePriority = this.reflector.get<number>(
      'minRolePriority',
      context.getHandler(),
    );

    if (minRolePriority === undefined) return true;

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const user = req.user;

    if (!user) throw new UnauthorizedException('No user found in request');
    if (!user.role) throw new ForbiddenException('User has no role assigned');
    if (user.role.priority > minRolePriority)
      throw new ForbiddenException('Insufficient role privileges');

    return true;
  }
}
