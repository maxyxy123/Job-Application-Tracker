import { Body, Controller,Get,Post,Put,Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from '../../common/DTO/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
   
    @Post('register')
    register(@Body() registerInput : RegisterDto ){
      return this.authService.register(registerInput)
    }




  
}
