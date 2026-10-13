import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './module/auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './module/prisma/prisma.module.js';
import { EnvSchema } from './config/schema.env.js';
import { JobApplicationModule } from './module/job-application/job-application.module.js';
import { UserModule } from './module/user/user.module.js';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal : true,
    validate : (config) => {
      return EnvSchema.parse(config)
    }
  }),AuthModule, PrismaModule, JobApplicationModule,UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
