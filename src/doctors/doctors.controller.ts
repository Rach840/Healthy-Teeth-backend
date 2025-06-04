import { Controller, Get, Param, Patch, Request, Res, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Response } from 'express';
import { GetDoctorDoctorsDto } from './dto/getDoctor-doctors.dto';
import { Roles } from '../roles/roles.decorator';
import { Roles as Role } from '../../prisma/generated/client';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '../auth/auth.guard';
@Roles(Role.DOCTOR)
@UseGuards(AuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async findAll(
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto[]>> {
    return this.doctorsService.findAll(res);
  }

  @Get('profile')
  async getProfile(
    @Request() req: Request,
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    return await this.doctorsService.findOne(req.user, res);
  }
  @Patch('orders/:id')
  async changeStatus(@Param('id') id: string, @Res() res: Response) {
    return await this.doctorsService.changeStatus(id, res);
  }
  @Get('orders/:id')
  async getOrder(@Param('id') id: string, @Res() res: Response) {
    return await this.doctorsService.getOrder(id, res);
  }
  @Get('orders')
  async getOrders(
    @Request() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return await this.doctorsService.getOrders(req.user, res);
  }

}
