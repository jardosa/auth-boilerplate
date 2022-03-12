import Node from 'src/base/entities/Node';
import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;
@ObjectType({ implements: Node, isAbstract: true })
@Schema({ timestamps: true })
export class Auth {
  @Prop()
  @Field()
  firstName: string;

  @Prop()
  @Field()
  lastName: string;

  @Prop({ unique: true })
  @Field()
  email: string;

  @Prop()
  hashedPassword: string;

  @Prop()
  hashedRefreshToken: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);

export const AuthFactory = () => {
  const schema = AuthSchema;

  schema.post('save', (error, doc, next) => {
    console.log(error && Object.entries(error));
    if (error.code === 11000) {
      next(new Error('Email must be unique'));
    } else {
      next(error);
    }
  });
  return schema;
};
