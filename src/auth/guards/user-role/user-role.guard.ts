import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

// Definimos una interfaz que extiende la Request de Express
interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true; // Si no se especifican roles, permitimos el acceso
    if (validRoles.length === 0) return true; // Si el array de roles está vacío, permitimos el acceso

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: User = request.user;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `User ${user.fullName} does not have the required roles:[ ${validRoles} ]`,
    );
  }
}
