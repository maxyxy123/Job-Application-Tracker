import { Body, Controller, Get, Post, Put, Delete, Res, Req, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from '../../common/DTO/auth.dto.js';
import type { Request, Response } from 'express';
import { log } from 'node:console';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerInput: RegisterDto) {
    return this.authService.register(registerInput);
  }

  @Post('login')
  async login(
    @Body() loginInput: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(loginInput);

    res.cookie('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: false, // chinh lai khi deploy
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path : '/'
    });
    res.cookie('access_token', data.access_token, {
      httpOnly: true,
      secure: false, // chinh lai khi deploy
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path : "/"
    });

    return {
      user : data.user
    }
  }

  @Post('logout')
  async logout(@Res({passthrough : true}) res :Response,@Req() req : Request){
    const refresh_token = req.cookies.refresh_token as string
    if(refresh_token){
     await this.authService.logout(refresh_token)
    }  
    
    res.clearCookie("access_token",{
      httpOnly : true,
      sameSite :"lax",
      path : '/',
      secure : false
    })

    res.clearCookie("refresh_token",{
      httpOnly : true,
      sameSite :"lax",
      path : '/',
      secure : false
    })

    return {
      message : "Successfully Logout"
    }


  }


  @Post('refresh')
 async refreshToken(@Req() req : Request,@Res({passthrough : true}) res : Response){
    const refresh_token = req.cookies.refresh_token as string
    if(!refresh_token) throw new UnauthorizedException("REFRESH TOKEN IS INVALID OR EXPIRED")
  const data =   await this.authService.refreshToken(refresh_token)

     
    res.cookie("access_token",data.new_access_token,{
      httpOnly : true,
      sameSite :"lax",
      path : '/',
      secure : false
    })

    res.cookie("refresh_token",data.new_refresh_token,{
      httpOnly : true,
      sameSite :"lax",
      path : '/',
      secure : false
    })


    return {
      message : "SUCCESSFULLY REFRESH TOKEN"
    }


  }







}
