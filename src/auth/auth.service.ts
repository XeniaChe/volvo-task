import {
  UnauthorizedException,
  HttpStatus,
  HttpException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthInput } from './dto';
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

      const userExist = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (userExist)
        throw new BadRequestException(
          'This email was already taken by other user',
        );

      const passHash = await argon.hash(password);

      const newCustomer = await this.prisma.customer.create({
        data: {
          email,
          passHash,
        },
      });

      delete newCustomer.passHash;

      return await this.signToken(newCustomer.email, newCustomer.id);
    } catch (error) {
      throw new HttpException(
        error.response?.message || 'Some error occured',
        error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  async signIn(dto: AuthInput): Promise<{ access_token: string }> {
    try {
      const { password, email } = dto;

      const customer = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (!customer) throw new UnauthorizedException('Wrong credentials');

      // const paswordMatch = await argon.verify(customer.passHash, password);
      // if (!paswordMatch) throw new UnauthorizedException('Wrong credentials');

      const { id } = customer;

      return await this.signToken(email, id);
    } catch (error) {
      console.log({ error });
      throw new HttpException(
        error.response?.message || 'Some error occured',
        error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  async signToken(
    email: string,
    userId: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = { username: email, sub: userId };

      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.config.get('SECRET'),
        expiresIn: '15m',
      });

      return { access_token };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
