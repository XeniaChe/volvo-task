import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Token } from 'lib/entities/';
import { AuthInput } from './dto';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';

import { validate } from 'class-validator';

//TODO: check where  AuthInput comes from
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Token)
  async signUp(@Args('data') input: AuthInput) {
    // TODO: VALIDATE USER INPUT
    const errors = await validate(input);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return this.authService.signUp(input);
  }

  @Mutation(() => Token)
  async signIn(@Args('data') { email, password }: AuthInput) {
    return this.authService.signIn({ email, password });
  }
}
