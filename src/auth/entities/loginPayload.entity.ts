import { Field, ObjectType } from '@nestjs/graphql';
import { Auth } from './auth.entity';

@ObjectType()
export default class LoginPayload {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field(() => Auth)
  profile: Auth;
}
