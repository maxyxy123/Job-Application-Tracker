import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ApplicationDto,
  ApplicationUpdateInputDto,
} from '../../common/DTO/application.dto.js';

@Injectable()
export class JobApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllApplications(userId: string) {
    const jobApplications = await this.prisma.jobApplication.findMany({
      where: { userId: userId },
      include: {
        user: {
          omit: {
            passwordHash: true,
          },
        },
      },
    });

    return jobApplications;
  }

  async getOneApplication(applicationId: string, userId: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId, userId: userId },
    });

    if (!application) throw new NotFoundException('APPLICATION NOT FOUND');

    return application;
  }

  async createApplication(applicationInput: ApplicationDto, userId: string) {
    const createdApplication = await this.prisma.jobApplication.create({
      data: {
        company: applicationInput.company,
        position: applicationInput.position,

        location: applicationInput.location,
        jobUrl: applicationInput.jobUrl,
        salaryMin: applicationInput.salaryMin,
        salaryMax: applicationInput.salaryMax,
        currency: applicationInput.currency,
        notes: applicationInput.notes,

        // status : applicationInput.status,
        jobType: applicationInput.jobType,

        appliedAt: applicationInput.appliedAt,
        interviewAt: applicationInput.interviewAt,
        //c1
        user: {
          connect: {
            id: userId,
          },
        },

        //c2

        // userId : userId
      },
      omit : {
        userId : true
      }
    });

    return createdApplication;
  }

  async updateApplication(
    applicationId: string,
    applicationUpdateInput: ApplicationUpdateInputDto,
    userId: string,
  ) {

    const {company , position , location, jobUrl, salaryMin,salaryMax ,currency,notes,status,jobType , appliedAt , interviewAt} = applicationUpdateInput
  const existApplication = await this.prisma.jobApplication.findUnique({
    where : {id : applicationId}
  })

  if(!existApplication) throw new NotFoundException("APPLICATION NOT EXIST")
  
    const updatedApplication = await this.prisma.jobApplication.update({
      where: { userId: userId, id: existApplication.id },
      data: {
        company,
        position,
        location,
        jobUrl,
        salaryMin,
        salaryMax,
        currency,
        notes,
        status,
        jobType,
        appliedAt,
        interviewAt
      },
      omit : {
        userId : true
      }
    });

    

    return updatedApplication
  }

  async deleteApplication(applicationId : string , userId : string){
    const existApplication = await this.prisma.jobApplication.findUnique({
      where : {id : applicationId,userId : userId}
    })
    if(!existApplication) throw new NotFoundException("APPLICATION NOT FOUND")

      await this.prisma.jobApplication.delete({
        where: {id : existApplication.id}
      })

      return "APPLICTION SUCCESSFULLY DELETED"
  }

}
