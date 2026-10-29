import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { PasswordDto } from '../../common/DTO/user.dto.js';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/role-decorator.js';
import { Role } from '../auth/types/role-type.js';
import { PaginationDto } from '../../common/DTO/pagination.dto.js';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles([Role.ADMIN])
  @Get()
  getAllUser(@Query() query : PaginationDto) {
    return this.userService.getAllUser(query);
  }

  @Roles([Role.ADMIN, Role.USER])
  @Get(':id')
  getOneUser(@Param('id') userId: string) {
    return this.userService.getOneUser(userId);
  }

  @Roles([Role.ADMIN])
  @Get(':userId/job-applications')
  getUserApplications(@Param('userId') userId: string , @Query() query : PaginationDto) {
    return this.userService.getUserApplications(userId,query);
  }

  @Roles([Role.USER])
  @Patch('change-password')
  updateUserPassword(@Req() req: Request, @Body() passwordDto: PasswordDto) {
    const userId = req.user.sub as string;
    return this.userService.updateUserPassword(userId, passwordDto);
  }
  @Roles([Role.ADMIN])
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
