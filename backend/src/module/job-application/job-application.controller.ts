import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { JobApplicationService } from './job-application.service.js';
import type { Request } from 'express';
import {
  ApplicationDto,
  ApplicationUpdateInputDto,
} from '../../common/DTO/application.dto.js';
import { Roles } from '../auth/decorators/role-decorator.js';
import { Role } from '../auth/types/role-type.js';


@Roles([Role.USER])
@Controller('job-application')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}
  //User xem danh sách application của mình
  @Get()
  getAllApplications(@Req() req: Request) {
    const userId = req.user.sub as string;
    return this.jobApplicationService.getAllApplications(userId);
  }

  //User xem chi tiết một application
  @Get(':id')
  getOneApplication(@Param('id') applicationId: string, @Req() req: Request) {
    const userId = req.user.sub as string;
    return this.jobApplicationService.getOneApplication(applicationId, userId);
  }

  @Post()
  createApplication(
    @Body() applicationInput: ApplicationDto,
    @Req() req: Request,
  ) {
    const userId = req.user.sub as string;
    return this.jobApplicationService.createApplication(
      applicationInput,
      userId,
    );
  }

  @Patch(':id')
  updateApplication(
    @Param('id') applicationId: string,
    @Body() applicationUpdateInput: ApplicationUpdateInputDto,
    @Req() req: Request,
  ) {
    const userId = req.user.sub as string;
    return this.jobApplicationService.updateApplication(
      applicationId,
      applicationUpdateInput,
      userId,
    );
  }

  @Delete(':id')
  deleteApplication(@Param('id') applicationId: string, @Req() req: Request) {
    const userId = req.user.sub as string;
    return this.jobApplicationService.deleteApplication(applicationId, userId);
  }
}
