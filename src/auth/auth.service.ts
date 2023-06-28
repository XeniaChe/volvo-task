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
      const verifCode = this.#codeGenerator();
      const codeHash = await argon.hash(verifCode);

      const newCustomer = await this.prisma.customer.create({
        data: {
          email,
          passHash,
          codeHash,
        },
      });

      delete newCustomer.passHash;
      delete newCustomer.codeHash;

      //Send email
      await this.mailerSerice.sendEmail(newCustomer.email, verifCode);

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

  async activateCustomer(code: string, email: string): Promise<boolean> {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { email },
      });

      if (!customer || !customer.codeHash)
        throw new UnauthorizedException(
          'User not authenticated. Please sign up',
        );

      // Verify code with customer.codeHash
      const codeCheck = await argon.verify(customer.codeHash, code);
      if (!codeCheck) throw new UnauthorizedException('Wrong activation code');

      // If OK update customer.isActivated = true
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { isActivated: true },
      });

      return true;
    } catch (error) {
      console.error(error);

      throw new HttpException(
        error.response?.message || 'Some error occured',
        error.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
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
      console.error(error);

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
        throw new UnauthorizedException('User not found. Please sign up');

      const hashFromDB = user.refreshToken;
      const refreshTokenMatch = await argon.verify(hashFromDB, refresh_token);
      if (!refreshTokenMatch) throw new ForbiddenException('Forbidden');

      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.config.get('SECRET'),
        expiresIn: '15m',
      });

      return { access_token };
    } catch (error) {
      console.error(error);

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
    const refreshTokenHash = await argon.hash(refresh_value);

    return await this.prisma.customer.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });
  }

  #codeGenerator() {
    let validCode = '';
    const validChars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i <= 10; i++) {
      validCode += validChars.charAt(
        Math.floor(Math.random() * validChars.length),
      );
    }

    return validCode;
  }
}
