import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationService } from './job-application.service.js';

describe('JobApplicationService', () => {
  let service: JobApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobApplicationService],
    }).compile();

    service = module.get<JobApplicationService>(JobApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
