import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './module/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './module/prisma/prisma.module.js';
import { EnvSchema } from './config/schema.env.js';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal : true,
    validate : (config) => {
      return EnvSchema.parse(config)
    }
  }),AuthModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
