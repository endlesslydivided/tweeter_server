import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RefreshTokenArg = createParamDecorator((ctx: ExecutionContext) => {
    const sessionId = ctx.switchToHttp().getRequest().refreshSessionId;
    return sessionId;
});
