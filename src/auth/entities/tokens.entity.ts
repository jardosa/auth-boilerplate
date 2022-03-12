import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export default class TokensEntity {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}
