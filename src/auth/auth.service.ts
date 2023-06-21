import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(dto: AuthDto) {
    console.log({ dto });

    const { email, password } = dto;

    const passHash = argon.hash(password);

    // Create new customer in DB
    // Genereta JWT
    // Return JWT

    return dto;
  }
}
