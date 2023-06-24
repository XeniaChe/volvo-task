import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // 'jwt' to identify what strategy you want to use
  // Later when you use Guards (in src/user/user.controlle.ts  @UseGuards(AuthGuard('jwt'))) you also provide 'jwt' to to link that Guard with the strategy, that you defined here
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

    delete currUser?.passHash; // No sensitive info to the client

    return currUser;
  }
}
