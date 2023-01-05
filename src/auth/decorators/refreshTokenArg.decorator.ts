import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshTokenArg = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const sessionId = ctx.switchToHttp().getRequest().refreshSessionId;
    return sessionId;
});
