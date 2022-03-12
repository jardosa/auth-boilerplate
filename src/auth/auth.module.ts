import { RtStrategy } from './strategies/rt.strategy';
import { AtStrategy } from './strategies/at.strategy';
import { Auth, AuthFactory } from './entities/auth.entity';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { AuthResolver } from './auth.resolver';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeatureAsync([
      {
        name: Auth.name,
        useFactory: AuthFactory,
        inject: [getConnectionToken()],
      },
    ]),
  ],
  providers: [AuthService, AuthResolver, AtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
