import { Body, Controller, Delete, Get, Param, Patch, Req } from '@nestjs/common';
import { UserService } from './user.service.js';
import { PasswordDto } from '../../common/DTO/user.dto.js';
import type { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get()
  getAllUser(){
    return this.userService.getAllUser()
  }

  @Get(":id")
  getOneUser(@Param("id") userId : string){
    return this.userService.getOneUser(userId)
  }

  @Patch("change-password")
  updateUserPassword( @Req() req : Request  ,@Body() passwordDto : PasswordDto ){
    const userId = req.user.sub as string
    return this.userService.updateUserPassword(userId,passwordDto)
  }

  @Delete(":id")
  deleteUser(@Param("id") userId :string){
    return this.userService.deleteUser(userId)
  }


}
