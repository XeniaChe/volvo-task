import {
  UnauthorizedException,
  HttpStatus,
  HttpException,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthInput } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Customer } from '@prisma/client';
import { MailerService } from '../mailer/mailer.service';

//TODO: add status codes in response if OK
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailerSerice: MailerService,
  ) {}

  async signUp(
    dto: AuthInput,
  ): Promise<{ access_token: string; refresh_token: string }> {
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
      // TODO:
      // add HASHED verifCode to a user
      const verifCode = this.#codeGenerator();
      console.log({ verifCode });
      const codeHash = await argon.hash(verifCode);

      const newCustomer = await this.prisma.customer.create({
        data: {
          email,
          passHash,
          // codeHash,
        },
      });

      delete newCustomer.passHash;
      // delete newCustomer.codeHash;

      //Send email

      /* await this.mailerSerice.sendEmail(
        'xeniacserkun@gmail.com',
        'TEST EMAIL',
        url,
      ); */

      const { access_token, refresh_token } = await this.#getSignedTokens(
        newCustomer.email,
        newCustomer.id,
      );

      await this.#updateRefreshToken(refresh_token, newCustomer.id);

      return { access_token, refresh_token };
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

  async sendTokens() {
    //TODO:
  }

  async signIn(
    dto: AuthInput,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const { password, email } = dto;

      const customer = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (!customer) throw new UnauthorizedException('Wrong credentials');

      const paswordMatch = await argon.verify(customer.passHash, password);
      if (!paswordMatch) throw new UnauthorizedException('Wrong credentials');

      const { access_token, refresh_token } = await this.#getSignedTokens(
        email,
        customer.id,
      );

      await this.#updateRefreshToken(refresh_token, customer.id);

      return { access_token, refresh_token };
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

  async getUpdatedToken(
    refresh_token: string,
    payload: { sub: string; email: string },
  ): Promise<{ access_token: string }> {
    try {
      const user: Customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.refreshToken)
        throw new ForbiddenException('Forbidden');

      const hashFromDB = user.refreshToken;
      const refreshTokenMatch = await argon.verify(hashFromDB, refresh_token);
      if (!refreshTokenMatch) throw new ForbiddenException('Forbidden');

      //Send email

      const verifCode = this.#codeGenerator();
      console.log({ verifCode });
      const codeHash = await argon.hash(verifCode);
      await this.mailerSerice.sendEmail('xeniacserkun@gmail.com', verifCode);

      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.config.get('SECRET'),
        expiresIn: '15m',
      });

      return { access_token };
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

  async #getSignedTokens(
    email: string,
    userId: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = { username: email, sub: userId };

      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.config.get('SECRET'),
          expiresIn: '15m',
        }),
        this.jwtService.signAsync(payload, {
          secret: this.config.get('REFRESH_SECRET'),
          expiresIn: '30d',
        }),
      ]);

      return { access_token, refresh_token };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async #updateRefreshToken(refresh_value: string, userId: string) {
    const refreshToken = await argon.hash(refresh_value);

    console.log('TOKEN REFRESHED');
    await this.prisma.customer.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  #codeGenerator() {
    let validCode = '';
    const validChars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i <= 5; i++) {
      validCode += validChars.charAt(
        Math.floor(Math.random() * validChars.length),
      );
    }

    return validCode;
  }
}
