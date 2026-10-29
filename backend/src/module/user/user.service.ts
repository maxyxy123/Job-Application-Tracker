import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PasswordDto } from '../../common/DTO/user.dto.js';
import bcrypt from 'bcrypt';
import { PaginationDto } from '../../common/DTO/pagination.dto.js';
import { calculateSkip } from '../../common/utils/calculateSkip.js';
import { sk } from 'zod/locales';
@Injectable()
export class UserService {
  private readonly saltRounds = 12;

  constructor(private readonly prisma: PrismaService) {}

  async getAllUser(query : PaginationDto) {
      const {skip, limit} = calculateSkip(query.page,query.limit)

    const users = await this.prisma.user.findMany({
      omit: {
        passwordHash: true,
      },
      include: {
        applications: true,
      },

      skip : skip,
      take : limit,
      orderBy : {
        createdAt : "asc"
      }
    });

    return users;
  }

  async getOneUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit : {
        passwordHash : true
      }
    });

    if (!user) throw new NotFoundException('USER NOT FOUND');

    return user;
  }

  async getUserApplications(userId: string , query : PaginationDto) {
    const {skip , limit} = calculateSkip(query.page,query.limit)

    
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existUser) throw new NotFoundException('USER NOT FOUND');

    const applications = await this.prisma.jobApplication.findMany({
      where: { userId: existUser.id },

      skip : skip,
      take : limit,
      orderBy : {
        createdAt : "asc"
      }
    });

    return applications;
  }

  async updateUserPassword(userId: string, passwordDto: PasswordDto) {
    console.log(passwordDto);

    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existUser) throw new NotFoundException('USER NOT FOUND');

    const isOldPasswordValid = await bcrypt.compare(
      passwordDto.currentPassword,
      existUser.passwordHash,
    );
    // console.log(isOldPasswordValid);

    if (!isOldPasswordValid)
      throw new BadRequestException('OLD PASSWORD IS INVALID');

    const new_hash_passWord = await bcrypt.hash(
      passwordDto.newPassword,
      this.saltRounds,
    );

    await this.prisma.user.update({
      where: { id: existUser.id },
      data: {
        passwordHash: new_hash_passWord,
      },
    });

    return 'SUCESSFULLY CHANGED NEW PASSWORD';
  }

  async deleteUser(userId: string) {
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existUser) throw new NotFoundException('USER IS NOT EXIST');

    await this.prisma.user.delete({
      where: { id: existUser.id },
    });

    return 'SUCCESSFULLY DELETED USER';
  }
}
