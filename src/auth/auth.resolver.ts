import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccessToken, Tokens } from 'lib/entities/';
import { AuthInput } from './dto';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/customer/decorator';
import { RefreshTokenGuard } from './guard';
import { GetRefreshToken } from './decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Tokens)
  async signUp(@Args('data') { email, password }: AuthInput) {
    return this.authService.signUp({ email, password });
  }

  @Mutation(() => Tokens)
  async signIn(@Args('data') { email, password }: AuthInput) {
    return this.authService.signIn({ email, password });
  }

  @Mutation(() => String)
  async verify(@Args('code') verifCode: string) {
    // return this.authService.sendTokens();
    return verifCode;
  }

  @Mutation(() => AccessToken)
  @UseGuards(RefreshTokenGuard)
  async getRefreshedToken(
    @CurrentUser('sub') sub: string,
    @CurrentUser('email') email: string,
    @GetRefreshToken() refresh_token: string,
  ) {
    return this.authService.getUpdatedToken(refresh_token, { sub, email });
  }
}
