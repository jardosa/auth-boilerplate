/* eslint-disable prettier/prettier */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayloadWithRt } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRt, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
