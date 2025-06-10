import { Controller, Get, HttpStatus, Param, ParseIntPipe, Patch, Request, Res, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Response } from 'express';
import { GetDoctorDoctorsDto } from './dto/getDoctor-doctors.dto';
import { Roles } from '../roles/roles.decorator';
import { Roles as Role } from '../../prisma/generated/client';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '../auth/auth.guard';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async findAll(
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto[]>> {
    return this.doctorsService.findAll(res);
  }
  @Roles(Role.DOCTOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('profile')
  async getProfile(
    @Request() req: Request,
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    return await this.doctorsService.findOne(req.user, res);
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    return this.doctorsService.getDoctor(id, res);
  }
  @Roles(Role.DOCTOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('orders/:id')
  async changeStatus(@Param('id') id: string, @Res() res: Response) {
    return await this.doctorsService.changeStatus(id, res);
  }
  @Roles(Role.DOCTOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('orders/:id')
  async getOrder(@Param('id') id: string, @Res() res: Response) {
    return await this.doctorsService.getOrder(id, res);
  }
  @Roles(Role.DOCTOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('orders')
  async getOrders(
    @Request() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return await this.doctorsService.getOrders(req.user, res);
  }

}
