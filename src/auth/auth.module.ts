import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { AccessJwtStrategy, RefreshJwtStrategy } from './strategy';
import { MailerService } from '../mailer/mailer.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [JwtModule.register({}), MailerModule],
  controllers: [],
  providers: [
    AuthService,
    JwtService,
    AuthResolver,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    MailerService,
  ],
})
export class AuthModule {}
