import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15min' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
