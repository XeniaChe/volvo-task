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
    // You can add more business logic here
    // i.e quering DB for more user's detail for a given userId: payload.sub
    // and passing that info along the basic user's credentials

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });

    delete customer?.passHash; // No sensitive info to the client

    return customer;

    // DEFAULT behaviour
    /*  return { userId: payload.sub, username: payload.username }; 
    // those are the ceradentials of the user who made request with given token
    // after the token has been validated this obj{} with credentials will be assigned to the
    // Request (express native) obj and can be accessed in routes see. user.controller.ts */
  }
}
