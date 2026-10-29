import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from '../../common/DTO/auth.dto.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { mock } from 'node:test';
import { ConflictException, NotFoundException } from '@nestjs/common';
import e from 'express';

//dang ky bcrypt de mock dc
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique : vi.fn(),
      update : vi.fn(),
    },
  };

  const mockJwt = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  const ACCESS_SECRET = 'access_token_secret';
  const REFRESH_SECRET = 'refresh_token_secret';
  const ACCESS_TTL = '15m';
  const REFRESH_TTL = '7d';

  const mockConfig = {
    get: vi.fn((key: string) => {
      switch (key) {
        case 'ACCESS_TOKEN_SECRET':
          return ACCESS_SECRET;

        case 'ACCESS_TOKEN_TTL':
          return ACCESS_TTL;

        case 'REFRESH_TOKEN_SECRET':
          return REFRESH_SECRET;

        case 'REFRESH_TOKEN_TTL':
          return REFRESH_TTL;

        default:
          return undefined;
      }
    }),
  };

  //BCRYPT SIMULATOR
  const mockHash = vi.mocked(
    bcrypt.hash as (password: string, salts: number) => Promise<string>,
  );

  const mockCompare = vi.mocked(
    bcrypt.compare as (
      plainPassword: string,
      hashedPassword: string,
    ) => Promise<boolean>,
  );

  const createdUser = {
    id: 1,
    name: 'test1',
    email: 'test1@gmail.com',
    passwordHash: 'hash_password',
    role: 'USER',
  };

  const registerDto: RegisterDto = {
    name: 'test1',
    email: 'test1@gmail.com',
    password: 'not_hash_password',
  };

  const loginDto: LoginDto = {
    email: 'test1@gmail.com',
    password: 'password',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwt,
        },
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('REGISTER', () => {
    it('SHOULD REGISTER SUCCESSFULLY AND RETURN CREATED USER', async () => {
      //USER NOT EXIST IN DB
      mockPrisma.user.findUnique.mockResolvedValue(null);

      mockHash.mockResolvedValue('hash_password');

      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        name: 'test1',
        email: 'test1@gmail.com',
        role: 'USER',
      });

      const result = await service.register(registerDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'test1',
          email: 'test1@gmail.com',
          role: 'USER',
        }),
      );

      //prisma findUnique checl
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });

      //bcrypt check
      expect(mockHash).toHaveBeenCalledTimes(1);
      expect(mockHash).toHaveBeenCalledWith(registerDto.password, 12);

      //prisma create check
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          passwordHash: 'hash_password',
        },
        omit: {
          passwordHash: true,
        },
      });

      //omit password check
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('SHOULD THROW WHEN USER REGISTER WITH EXISTING EMAIL', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        name: 'test1',
        email: 'test1@gmail.com',
        passwordHash: 'not_hash_password',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Email already exist'),
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();

      expect(mockHash).not.toHaveBeenCalled();
    });
  });

  describe('LOGIN', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('SHOULD LOGIN SUCCESSFULLY AND RETURN 2 TOKEN AND USER DATA', async () => {
      //Mock time + TTL for testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-20T12:00:00.000Z'));

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'test1',
        email: 'test1@gmail.com',
        passwordHash: 'hash_password',
        role: 'USER',
      });

      mockCompare.mockResolvedValue(true);

      mockJwt.signAsync.mockResolvedValueOnce('access_token');
      mockJwt.signAsync.mockResolvedValueOnce('refresh_token');

      mockHash.mockResolvedValue('hash_refresh_token');

      const refreshTokenTtl = 7 * 24 * 60 * 60 * 1000;

      mockPrisma.session.create.mockResolvedValue({
        id: 'mock-session-id',
        refreshTokenHash: 'hash_refresh_token',
        expiresAt: new Date(Date.now() + refreshTokenTtl),
        usesrId: 1,
      });

      const result = await service.login(loginDto);

      const sessionId = mockPrisma.session.create.mock.calls[0][0].data.id;

      expect(mockPrisma.session.create).toHaveBeenCalledTimes(1);

      console.log(mockPrisma.session.create.mock.calls);

      expect(result).toEqual(
        expect.objectContaining({
          access_token: 'access_token',
          refresh_token: 'refresh_token',
          user: {
            id: 1,
            name: 'test1',
            email: 'test1@gmail.com',
            role: 'USER',
          },
        }),
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });

      expect(mockCompare).toHaveBeenCalledTimes(1);
      expect(mockCompare).toHaveBeenCalledWith(
        loginDto.password,
        'hash_password',
      );

      expect(mockJwt.signAsync).toHaveBeenCalledTimes(2);

      expect(mockJwt.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: 1,
          role: ['USER'],
        },
        {
          secret: ACCESS_SECRET,
          expiresIn: ACCESS_TTL,
        },
      );
      expect(mockJwt.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: 1,
          sessionId: sessionId,
        },
        {
          secret: REFRESH_SECRET,
          expiresIn: REFRESH_TTL,
        },
      );

      expect(mockPrisma.session.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          id: sessionId,
          refreshTokenHash: 'hash_refresh_token',
          expiresAt: new Date(Date.now() + refreshTokenTtl),
          userId: 1,
        },
      });
    });

    it('SHOULD THROW WHEN USER NOT EXIST', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      expect(service.login(loginDto)).rejects.toThrow(
        new NotFoundException('Invalid credentials'),
      );
      expect(mockCompare).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockJwt.signAsync).not.toHaveBeenCalled();
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('SHOULD THROW WHEN PASSWORD IS NOT CORRECT', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      mockCompare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new ConflictException('Invalid credentials'),
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockCompare).toHaveBeenCalledWith(
        loginDto.password,
        'hash_password',
      );
      expect(mockJwt.signAsync).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockPrisma.session.create).not.toHaveBeenCalled();

      expect(mockHash).not.toHaveBeenCalled();
    });

    it('SHOULD THROW WHEN ACCESS TOKEN FAIL TO CREATE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      mockCompare.mockResolvedValue(true);
      mockJwt.signAsync.mockRejectedValueOnce(new Error('JWT SIGNING FAIL'));

      await expect(service.login(loginDto)).rejects.toThrow('JWT SIGNING FAIL');

      expect(mockJwt.signAsync).toHaveBeenCalledTimes(1);
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('SHOULD THROW WHEN REFRESH TOKEN FAIL TO CREATE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      mockCompare.mockResolvedValue(true);

      mockJwt.signAsync.mockResolvedValueOnce('access_token');
      mockJwt.signAsync.mockRejectedValueOnce(
        new Error('REFRESH TOKEN FAIL TO CREATE'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        'REFRESH TOKEN FAIL TO CREATE',
      );

      (expect(mockJwt.signAsync).toHaveBeenCalledTimes(2),
        expect(mockHash).not.toHaveBeenCalled());
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('SHOULD THROW WHEN FAIL TO HASH REFRESH TOKEN', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      mockCompare.mockResolvedValue(true);
      (mockJwt.signAsync.mockResolvedValueOnce('access_token'),
        mockJwt.signAsync.mockResolvedValueOnce('refresh_token'));

      mockHash.mockRejectedValue(new Error('FAIL TO HASH REFRESH TOKEN'));

      await expect(service.login(loginDto)).rejects.toThrow(
        'FAIL TO HASH REFRESH TOKEN',
      );

      expect(mockJwt.signAsync).toHaveBeenCalledTimes(2);
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('SHOULD THROW WHEN SESSION FAIL TO CREATE', async () => {

        //Mock time + TTL for testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-20T12:00:00.000Z'));

      const refreshTokenTtl = 7 * 24 * 60 * 60 * 1000; 

      
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      mockCompare.mockResolvedValue(true);
      (mockJwt.signAsync.mockResolvedValueOnce('access_token'),
        mockJwt.signAsync.mockResolvedValueOnce('refresh_token'));

      mockHash.mockResolvedValue('hash_refresh_token');

      mockPrisma.session.create.mockRejectedValue(
        new Error('FAIL TO CREATE SESSION'),
      );

      
      await expect(service.login(loginDto)).rejects.toThrow(
        'FAIL TO CREATE SESSION',
      );
      
      const sessionId = mockPrisma.session.create.mock.calls[0][0].data.id;
      expect(mockJwt.signAsync).toHaveBeenCalledTimes(2);
      expect(mockHash).toHaveBeenCalledTimes(1);
      expect(mockPrisma.session.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data : {
          id : sessionId,
          refreshTokenHash : "hash_refresh_token",
          expiresAt : new Date(Date.now() + refreshTokenTtl) ,
          userId : 1
        },
      })

    });
  });

  describe("LOGOUT", () =>{
    it("SHOULD LOGOUT SUCCESSFULLY AND SESSION IS REVOKED" ,async () => {
      const refresh_token = "refresh_token"
      mockJwt.verifyAsync.mockResolvedValue({sessionId : "sessionId"})
      mockPrisma.session.findUnique.mockResolvedValue({id : "sessionId" , revokedAt : "Not null"})

      await service.logout(refresh_token)

      expect(mockJwt.verifyAsync).toHaveBeenCalledWith(refresh_token,{
        secret : REFRESH_SECRET
      })
      expect(mockJwt.verifyAsync).toHaveBeenCalledTimes(1)
      
      expect(mockPrisma.session.findUnique).toHaveBeenCalledTimes(1)
      expect(mockPrisma.session.findUnique).toHaveBeenCalled()
      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where : {id : "sessionId"}
      })

      expect(mockPrisma.session.update).not.toHaveBeenCalled()

       
    }  )
  })
});
                            