import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})], // JWT built-in functionality
  controllers: [],
  providers: [AuthService, JwtService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
