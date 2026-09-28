import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from '../../DTO/auth.dto.js';
import bcrypt from 'bcrypt'
@Injectable()
export class AuthService {
    constructor(private readonly prisma :PrismaService){}

      async  register(registerInput : RegisterDto){
            const existUser = await this.prisma.user.findUnique({
                where : {email : registerInput.email}
            })

            if(existUser){
                throw new ConflictException("Email already exist")
            }

            const hashPassword = await bcrypt.hash(registerInput.email,12)

            const createdUser = await this.prisma.user.create({
                data : {
                    email : registerInput.email,
                    passwordHash : hashPassword
                }
            })

        }





    
}
