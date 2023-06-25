import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { AccessJwtStrategy, RefreshJwtStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [],
  providers: [
    AuthService,
    JwtService,
    AuthResolver,
    AccessJwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
