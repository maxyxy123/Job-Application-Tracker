import { Module, } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guards.js';
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('ACCESS_TOKEN_SECRET'),
          signOptions: {
            expiresIn: '15m',
          },
        };
      },
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [{
    provide : APP_GUARD,
    useClass : JwtAuthGuard
  },AuthService, PrismaService],
})
export class AuthModule {}
