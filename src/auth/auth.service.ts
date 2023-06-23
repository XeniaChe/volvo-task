import {
  UnauthorizedException,
  HttpStatus,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
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

  async signUp(dto: AuthDto): Promise<{ access_token: string }> {
    try {
      const { email, password } = dto;

      const passHash = await argon.hash(password);

      // Create new customer in DB
      // Save user to DB
      const savedCustomer = await this.prisma.customer.create({
        data: {
          email,
          passHash,
        },
      });

      delete savedCustomer.passHash;

      // Genereta JWT
      const { access_token } = await this.signToken(
        savedCustomer.email,
        savedCustomer.id,
      );
      // Return JWT

      return { access_token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async signIn(dto: AuthDto) {
    try {
      // Get pass from dto
      // Get user email from dto
      const { password, email } = dto;

      // Obtain user from DB by email from dto
      const customer = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (!customer) throw new UnauthorizedException('Wrong credentials');
      // Compare passHash from DB and the one generated from pass
      const paswordMatch = await argon.verify(customer.passHash, password);

      if (!paswordMatch) throw new UnauthorizedException('Wrong credentials');

      //Grand token
      const { id } = customer;

      // Genereta JWT
      const { access_token } = await this.signToken(email, id);
      // Return JWT

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
      expiresIn: '15m',
    });

    return { access_token };
  }
}
