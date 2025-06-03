import { Controller, Get, Param, Res } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Response } from 'express';
import { GetDoctorDoctorsDto } from './dto/getDoctor-doctors.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async findAll(
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto[]>> {
    return this.doctorsService.findAll(res);
  }

  @Get(':id')
  async findOne(
    @Param('id')
    id: number,
    @Res() res: Response,
  ): Promise<Response<GetDoctorDoctorsDto>> {
    return this.doctorsService.findOne(id, res);
  }
  // @Get('/orders')
  // async getOrders(
  //   @Res() res: Response,
  // ): Promise<Response<GetDoctorDoctorsDto>> {
  //   return this.doctorsService.getOrders( res);
  // }
}
