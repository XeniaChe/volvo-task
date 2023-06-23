import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';

@Module({
  controllers: [],
  providers: [AuthService, JwtService, AuthResolver],
})
export class AuthModule {}
