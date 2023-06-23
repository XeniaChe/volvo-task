import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Token } from 'lib/entities/';
import { AuthInput } from './dto';
import { AuthService } from './auth.service';

//TODO: check where  AuthInput comes from
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Token)
  async signUp(@Args('data') { email, password }: AuthInput) {
    return this.authService.signUp({ email, password });
  }
}
