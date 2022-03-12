import { JwtPayloadWithRt } from './types/jwtPayloadWithRt.type';
import { GqlAuthRtGuard } from './guards/gqlAuthRt.guard';
import { SignupInput } from './dto/signup.input';
import { GqlAuthGuard } from './guards/gqlAuth.guard';

import { LoginInput } from './dto/login.input';
import { AuthService } from './auth.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from './decorators/currentUser.decorator';
import { UseGuards } from '@nestjs/common';
import { Auth } from './entities/auth.entity';

import LoginPayload from './entities/loginPayload.entity';
import TokensEntity from './entities/tokens.entity';

@Resolver(() => Auth)
export class AuthResolver {
  // eslint-disable-next-line prettier/prettier
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginPayload)
  async signup(
    @Args('signupInput')
    signupInput: SignupInput,
  ): Promise<LoginPayload> {
    return this.authService.signup(signupInput);
  }

  @Mutation(() => LoginPayload)
  // eslint-disable-next-line prettier/prettier
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginPayload> {
    return this.authService.login(loginInput);
  }

  @Query(() => Auth)
  @UseGuards(GqlAuthGuard)
  async whoAmI(@CurrentUser() user: Auth) {
    return this.authService.whoAmI(user.email);
  }

  @Mutation(() => TokensEntity)
  @UseGuards(GqlAuthRtGuard)
  async refreshTokens(@CurrentUser('refreshToken') user: JwtPayloadWithRt): Promise<TokensEntity> {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
