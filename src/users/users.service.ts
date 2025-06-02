import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Users } from '../../prisma/generated/client';
import { PrismaService } from '../prisma.service';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { UpdatePasswordDto } from './dto/update-user.dto';
import UsersCreateInput = Prisma.UsersCreateInput;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  findOne(email: string): Promise<Users | null> {
    return this.prisma.users.findFirst({
      where: {
        email: email,
      },
    });
  }
  async createUser({ user }: { user: UsersCreateInput }, res: Response) {
    const userExist = await this.prisma.users.findFirst({
      where: {
        email: user.email,
      },
    });
    if (userExist) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({});
    }
    const password = await bcrypt.hash(user.password, 10);
    try {
      await this.prisma.users.create({
        data: {
          ...user,
          password: password,
        },
      });
      return res.status(HttpStatus.CREATED).json({});
    } catch {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({});
    }
  }
  async updatePassword(
    passwords: UpdatePasswordDto,
    user: Users,
    res: Response,
  ) {
    const passwordCompare = await bcrypt.compare(
      passwords.currentPassword,
      user?.password,
    );

    if (!passwordCompare) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: 'Пароль не верный',
      });
    }

    const newPasswordHash = await bcrypt.hash(passwords.newPassword, 10);
    try {
      await this.prisma.users.update({
        data: {
          password: newPasswordHash,
        },
        where: {
          id: user.id,
        },
      });

      return res.status(HttpStatus.OK).json({});
    } catch {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({});
    }
  }
  async updateUser(
    updateUserDto: UpdatePasswordDto,
    user: Users,
    res: Response,
  ) {
    try {
      await this.prisma.users.update({
        data: {
          ...updateUserDto,
        },
        where: {
          id: user.id,
        },
      });
      return res.status(HttpStatus.OK).json({});
    } catch {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json({});
    }
  }
  async setOrder(
    user: Users,
    order: { time: Date; productId: number; doctorId: number },
    res: Response,
  ) {
    console.log('sdfsad', user);
    const { time, productId, doctorId } = order;
    const service = await this.prisma.services.findFirst({
      where: {
        id: productId,
      },
    });

    await this.prisma.orders.create({
      data: {
        serviceId: productId,
        userId: user.sub as number,
        date: time,
        doctorId: doctorId,
        price: service.price,
      },
    });
    res.status(HttpStatus.CREATED).send({ succes: true });
  }
}
