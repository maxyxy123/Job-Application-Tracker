import { Module } from '@nestjs/common';
import { JobApplicationService } from './job-application.service.js';
import { JobApplicationController } from './job-application.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [JobApplicationController],
  providers: [JobApplicationService,PrismaService],
})
export class JobApplicationModule {}
