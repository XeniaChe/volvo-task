import {
  UnauthorizedException,
  HttpStatus,
  HttpException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// TODO: verify what to use dto vs AuthInput
import { AuthDto, AuthInput } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

//TODO: add status codes in response if OK
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthInput): Promise<{ access_token: string }> {
    try {
      const { email, password } = dto;

      const passHash = await argon.hash(password);

      const savedCustomer = await this.prisma.customer.create({
        data: {
          email,
          passHash,
        },
      });

      delete savedCustomer.passHash;

      const { access_token } = await this.signToken(
        savedCustomer.email,
        savedCustomer.id,
      );

      return { access_token };
    } catch (error) {
      throw new HttpException(
        'Some error occured',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  async signIn(dto: AuthDto): Promise<{ access_token: string }> {
    try {
      const { password, email } = dto;

      const customer = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (!customer) throw new UnauthorizedException('Wrong credentials');

      const paswordMatch = await argon.verify(customer.passHash, password);
      if (!paswordMatch) throw new UnauthorizedException('Wrong credentials');

      const { id } = customer;
      const { access_token } = await this.signToken(email, id);

      return { access_token };
    } catch (error) {
      throw new HttpException(error.message, error.status, {
        cause: error,
      });
    }
  }

  async signToken(
    email: string,
    userId: string,
  ): Promise<{ access_token: string }> {
    const payload = { username: email, sub: userId };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get('SECRET'),
      expiresIn: '1m',
    });

    return { access_token };
  }
}
