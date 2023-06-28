import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('SECRET'),
    });
  }

  async validate(payload: any) {
    const currUser = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });

    if (!currUser.isActivated)
      throw new ForbiddenException('Please verify your account');

    delete currUser?.passHash; // No sensitive info to the client
    delete currUser?.codeHash;

    return currUser;
  }
}
