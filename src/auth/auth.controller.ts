import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Post('login')
  singIn(@Res() responce: Response, @Body() signInDto: Record<string, string>) {
    return this.authService.signIn(
      responce,
      signInDto.email,
      signInDto.password,
    );
  }
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Post('refresh')
  async refreshAccessToken(@Request() req, @Res() res: Response) {
    return this.authService.refreshAccessToken(req, res);
  }
  @Post('logout')
  logout(@Request() req, @Res() res: Response) {
    return this.authService.logout(req, res);
  }
}
