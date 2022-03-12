import { SignupInput } from './dto/signup.input';
import config from 'src/config';

import { AuthenticationError } from 'apollo-server-errors';
import { LoginInput } from './dto/login.input';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { JwtPayload, Tokens } from './types';
import { Auth, AuthDocument } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import LoginPayload from './entities/loginPayload.entity';
import TokensEntity from './entities/tokens.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    private authModel: Model<AuthDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Auth> {
    const user = await this.authModel.findOne({ email });

    const passwordMatches = await argon.verify(user.hashedPassword, pass);

    if (passwordMatches) {
      return user;
    }

    return null;
  }

  async signup(signupInput: SignupInput): Promise<LoginPayload> {
    const hashedPassword = await argon.hash(signupInput.password);

    const user = await this.authModel.create({
      ...signupInput,
      hashedPassword,
    });

    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      ...tokens,
      profile: user,
    };
  }

  async login(loginInput: LoginInput): Promise<LoginPayload> {
    const { email, password } = loginInput;
    const user = await this.authModel.findOne({ email });

    if (!user) throw new AuthenticationError('Invalid Credentials');

    const passwordMatches = await argon.verify(user.hashedPassword, password);

    if (!passwordMatches) throw new AuthenticationError('Invalid Credentials');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      ...tokens,
      profile: user,
    };
  }

  async refreshTokens(userId: string, rt: string): Promise<TokensEntity> {
    const user = await this.authModel.findById(userId);

    // Checks if user exists or if he has a hashed Refresh Token.
    // Having no refresh token means user has logged out.
    if (!user || !user.hashedRefreshToken) {
      throw new AuthenticationError('Access Denied');
    }

    // Checks if rt param matches refresh token in database
    const rtMatches = await argon.verify(user.hashedRefreshToken, rt);
    if (!rtMatches) throw new AuthenticationError('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      ...tokens,
    };
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: config.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: config.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await argon.hash(rt);
    await this.authModel.findByIdAndUpdate(userId, {
      hashedRefreshToken: hash,
    });
  }

  async whoAmI(email: string): Promise<Auth> {
    return await this.authModel.findOne({ email });
  }
}
