import {
  HttpStatus,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma.service';
import { UnknownElementException } from '@nestjs/core/errors/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(response: Response, email: string, password: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new NotAcceptableException();
    }
    console.log(user);
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      firstName: user.firstName,
      surName: user.surName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      birth: user.birth,
      gender: user.gender,
      snils: user.snils,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '14d' },
    );
    await this.prisma.tokens.create({
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 60000 * 60 * 24 * 14,
    });
    response.cookie('accessToken', accessToken, {
      maxAge: 120000,
    });
    return response.status(HttpStatus.OK).json({
      accessToken: accessToken,
    });
  }
  async refreshAccessToken(req: Request, response: Response) {
    const { refreshToken } = req.cookies;
    console.log('refreshToken', refreshToken);
    if (!refreshToken) {
      return response.status(HttpStatus.UNAUTHORIZED).json({});
    }
    const refreshTokenExist = await this.prisma.tokens.findFirst({
      where: { refreshToken: refreshToken },
    });
    // console.log('refreshTokenExist', refreshTokenExist);
    if (!refreshTokenExist) {
      throw new UnauthorizedException();
    }
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: jwtConstants.secret,
    });
    // console.log('payload', payload);
    const newUser = await this.prisma.users.findFirst({
      where: { id: Number(payload.sub) },
    });

    if (!newUser) {
      throw new UnknownElementException();
    }
    const accessToken = await this.jwtService.signAsync({
      sub: newUser.id,
      firstName: newUser.firstName,
      surName: newUser.surName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      birth: newUser.birth,
      gender: newUser.gender,
      snils: newUser.snils,
      role: newUser.role,
    });
    await this.prisma.tokens.update({
      where: {
        id: refreshTokenExist.id,
      },
      data: {
        accessToken: accessToken,
      },
    });
    response.cookie('accessToken', accessToken, {
      maxAge: 1000 * 60 * 15,
    });
    return response.status(HttpStatus.OK).json({
      accessToken: accessToken,
    });
  }
  async logout(req: Request, res: Response) {
    const { refreshToken }: { refreshToken: string } = req.cookies;
    const tokenExist = await this.prisma.tokens.findFirst({
      where: { refreshToken: refreshToken },
    });
    await this.prisma.tokens.delete({
      where: {
        id: tokenExist?.id,
      },
    });
    res.cookie('refreshToken', '');
    res.cookie('accessToken', '');
    return res.status(HttpStatus.OK).json({});
  }
}
