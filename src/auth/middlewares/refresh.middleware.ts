import { forwardRef, HttpException, Inject, Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RefreshMiddleware implements NestMiddleware {

    constructor(@Inject(forwardRef(() => JwtService)) private jwtService: JwtService) 
    {

    }

    async use(req: Request, res: Response, next: NextFunction) 
    {
        try 
        {
            const cookie =req.header('cookie');
            req['refreshSessionId'] = null;
            if(cookie)
            {
                const refreshTokenString = cookie.split("; ").filter(x => x.startsWith('refreshToken='))[0];
                if(refreshTokenString)
                {
                    const refreshToken = refreshTokenString.split('refreshToken=')[1];
                    if(refreshToken)         
                    { 
                        req['refreshSessionId'] = refreshToken;
                    }
                }     
            }
            next();       
        } 
        catch (e) 
        {
            if (e instanceof HttpException) 
            {
                throw e;
            } 
            throw new InternalServerErrorException("Internal server error");
        }
    } 
}