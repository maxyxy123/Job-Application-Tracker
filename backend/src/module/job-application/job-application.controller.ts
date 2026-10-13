import { Controller, Get ,Post ,Patch ,Delete, Req, Param, Body } from '@nestjs/common';
import { JobApplicationService } from './job-application.service.js';
import type {  Request } from 'express';
import { ApplicationDto, ApplicationUpdateInputDto } from '../../common/DTO/application.dto.js';

@Controller('job-application')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Get()
  getAllApplications(@Req() req : Request){
    const userId = req.user.sub as string
    return this.jobApplicationService.getAllApplications(userId)
  }

  @Get(':id')
  getOneApplication(@Param('id') applicationId : string , @Req() req : Request){
    const userId = req.user.sub as string
    return this.jobApplicationService.getOneApplication(applicationId,userId)
  }


  @Post()
  createApplication(@Body() applicationInput : ApplicationDto , @Req() req : Request){
    const userId = req.user.sub as string
    return this.jobApplicationService.createApplication(applicationInput , userId)
  }

  @Patch(":id")
  updateApplication( @Param('id') applicationId :string  ,@Body() applicationUpdateInput : ApplicationUpdateInputDto , @Req() req : Request){
    const userId = req.user.sub as string
    return this.jobApplicationService.updateApplication(applicationId ,applicationUpdateInput , userId)
  }

  @Delete(":id")
  deleteApplication(@Param("id") applicationId : string , @Req() req:Request){
    const userId = req.user.sub as string
    return this.jobApplicationService.deleteApplication(applicationId , userId)
  }


}
