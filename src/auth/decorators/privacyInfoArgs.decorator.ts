import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PrivacyInfoArgs = createParamDecorator((ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const ip = request.ip;
    const userAgent = request.get('user-agent');
    return {ip,userAgent}
});

export interface PrivacyInfoArgs 
{
    ip: string;
    userAgent: string;
}