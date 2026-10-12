import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { JobType, ApplicationStatus } from '../../generated/prisma/enums.js';

export class ApplicationDto {
  @IsString()
  @Length(3, 20)
  company: string;

  @IsString()
  @MinLength(3)
  position: string;

  @IsOptional()
  @IsString()
  location: string;
  @IsString()
  @IsOptional()
  jobUrl: string;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  salaryMin: number;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  salaryMax: number;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  notes: string;

  // @IsEnum(ApplicationStatus)
  // status :  ApplicationStatus

  @IsOptional()
  @IsEnum(JobType)
  jobType: JobType;

  @IsDateString({ strict: true, strictSeparator: true })
  appliedAt: string;

  @IsDateString({ strict: true, strictSeparator: true })
  interviewAt: string;
}

export class ApplicationUpdateInputDto {
  @IsOptional()
  @IsString()
  @Length(3, 20)
  company: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  position: string;

  @IsOptional()
  @IsString()
  location: string;
  @IsString()
  @IsOptional()
  jobUrl: string;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  salaryMin: number;

  @IsOptional()
  @IsNumber({ allowNaN: false })
  salaryMax: number;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsEnum(JobType)
  jobType: JobType;

  @IsOptional()
  @IsDateString({ strict: true, strictSeparator: true })
  appliedAt: string;

  @IsOptional()
  @IsDateString({ strict: true, strictSeparator: true })
  interviewAt: string;
}
