import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [],
  providers: [AuthService, JwtService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
