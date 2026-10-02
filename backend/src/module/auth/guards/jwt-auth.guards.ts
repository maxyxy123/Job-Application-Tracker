import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public-decorator.js';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector :Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const isPublic =  this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[context.getHandler(),context.getClass()])
    

    if(isPublic){
        return true
    }
    
    const request:Request = context.switchToHttp().getRequest();
    const access_token = request.cookies.access_token as string;
    if (!access_token)
      throw new UnauthorizedException('ACCESS TOKEN IS INVALID OR EXPIRED');

    try {
      const payload: { sub: string; role: string[] } =
        await this.jwt.verifyAsync(access_token, {
          secret: this.config.getOrThrow('ACCESS_TOKEN_SECRET'),
        });
      request.user = { sub: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('TOKEN IS INVALID');
    }
  }
}
