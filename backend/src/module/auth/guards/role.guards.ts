import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/role-decorator.js';
import { Request } from 'express';
import { AuthUserType } from '../types/auth-user.types.js';

//Dung quen thang nay , khi muon inject thg nao vao phai co!!!!!!
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    console.log("GO IN ROLES_GUARDS");
    
    const roles = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest() as Request;
    const user = request.user;

    //logic check roles
    return this.matchingRole(user, roles);
  }
  //user.role = ['ADMIN'];
  private matchingRole(user: AuthUserType, role: string[]) {
    console.log(
      'MATCHING ROLES :',
      role.some((r) => user.role.includes(r)),
    );
    return role.some((r) => user.role.includes(r));
  }
}
