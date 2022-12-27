import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserArgs = createParamDecorator((ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().currentUser;
});

export interface CurrentUserArgs
{
    userId: string;
    email: string;
}