import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { Prisma } from '../../prisma/generated/client';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import UsersCreateInput = Prisma.UsersCreateInput;
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('create')
  async createUser(
    @Body() createUserDto: UsersCreateInput,
    @Res() res: Response,
  ) {
    return this.usersService.createUser(createUserDto, res);
  }
  @UseGuards(AuthGuard)
  @Patch('updatePassword')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: Request,
    @Res() res: Response,
  ) {
    await this.usersService.updatePassword(updatePasswordDto, req.user, res);
  }
  @UseGuards(AuthGuard)
  @Patch('updateUser')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: Request,
    @Res() res: Response,
  ) {
    await this.usersService.updateUser(updateUserDto, req.user, res);
  }

  @UseGuards(AuthGuard)
  @Get('orders')
   getOrders(@Request() req: Request, @Res() res: Response) {
    return  this.usersService.getOrders(req.user, res);
  }
  @UseGuards(AuthGuard)
  @Post('setOrder')
  async setOrder(
    @Request() req,
    @Body() order: { time: Date; productId: number; doctorId: number },
    @Res() res: Response,
  ) {
    return this.usersService.setOrder(req.user, order, res);
  }
}
