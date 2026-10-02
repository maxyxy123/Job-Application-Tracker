import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto, RegisterDto } from '../../common/DTO/auth.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(registerInput: RegisterDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: registerInput.email },
    });

    if (existUser) {
      throw new ConflictException('Email already exist');
    }

    const hashPassword = await bcrypt.hash(registerInput.password, 12);

    const createdUser = await this.prisma.user.create({
      data: {
        name: registerInput.name,
        email: registerInput.email,
        passwordHash: hashPassword,
      },
      omit: {
        passwordHash: true,
      },
    });

    return createdUser;
  }

  async login(loginInput: LoginDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: loginInput.email },
    });

    if (!existUser) throw new NotFoundException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      loginInput.password,
      existUser.passwordHash,
    );

    if (!isPasswordValid) throw new ConflictException('Invalid credentials');

    //Create 2 token:

    const access_token = await this.jwt.signAsync(
      { sub: existUser.id, role: [existUser.role] },
      {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.config.get<string>("ACCESS_TOKEN_TTL"),
      },
    );

    //tao ssId
    const sessionId = crypto.randomUUID();

    const refresh_token = await this.jwt.signAsync(
      { sub: existUser.id, sessionId: sessionId },
      {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get<string>("REFRESH_TOKEN_TTL"),
      },
    );

    const hash_refresh_token = await bcrypt.hash(refresh_token, 12);

    //tao session

    const refreshTokenTtl = 7 * 24 * 60 * 60 * 1000;
    await this.prisma.session.create({
      data: {
        id: sessionId,
        refreshTokenHash: hash_refresh_token,
        expiresAt: new Date(Date.now() + refreshTokenTtl),
        userId: existUser.id,
      },
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: existUser.id,
        name: existUser.name,
        email: existUser.email,
        role: existUser.role,
      },
    };
  }

  async logout(refresh_token: string) {
    let payload: { sessionId: string };
    try {
      payload = await this.jwt.verifyAsync(refresh_token, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('REFRESH TOKEN IS INVALID OR EXPIRED');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('SESSION IS NOT VALID');
    }

    if (session.revokedAt === null) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    return;
  }

  async refreshToken(refresh_token: string) {
    let payload: { sub: string; sessionId: string };
    try {
      payload = await this.jwt.verifyAsync(refresh_token, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('REFRESH TOKEN IS INVALID OR EXPIRED');
    }
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session)
      throw new UnauthorizedException('SESSION IS INVALID OR EXPIRED');
   
    if(payload.sub !== session.userId) throw new UnauthorizedException("SESSION IS INVALID")

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('USER IS NOT VALID');

    if (session.revokedAt !== null)
      throw new UnauthorizedException('SESSION IS REVOKED');

    if (session.expiresAt <= new Date())
      throw new UnauthorizedException('SESSION IS EXPIRED');

    const isRefreshTokenValid = await bcrypt.compare(
      refresh_token,
      session.refreshTokenHash,
    );

    if (!isRefreshTokenValid)
      throw new UnauthorizedException('REFRESH TOKEN IS INVALID OR EXPIRED');

    const new_refresh_token = await this.jwt.signAsync(
      { sub: payload.sub, sessionId: payload.sessionId },
      {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get<string>("REFRESH_TOKEN_TTL"),
      },
    );

    const new_access_token = await this.jwt.signAsync(
      { sub: payload.sub, role: [user.role] },
      {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.config.get<string>("ACCESS_TOKEN_TTL"),
      },
    );

    const new_hash_refresh_token = await bcrypt.hash(new_refresh_token, 12);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: new_hash_refresh_token,
      },
    });

    return {
      new_access_token,
      new_refresh_token,
    };
  }
}
