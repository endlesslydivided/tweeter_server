import { forwardRef, HttpException, Inject, Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(@Inject(forwardRef(() => JwtService)) private jwtService: JwtService) 
    {

    }

    async use(req: Request, res: Response, next: NextFunction) 
    {
        try 
        {
            const cookie =req.header('cookie');
            req['currentUser'] = null;
            if(cookie)
            {
                const accessTokenString = cookie.split("; ").filter(x => x.startsWith('accessToken='))[0];
                if(accessTokenString)
                {
                    const accessToken = accessTokenString.split('accessToken=')[1];
                    if(accessToken)         
                    { 
                        const decoded = await this.jwtService.verifyAsync(accessToken,{algorithms:['RS256'] ,publicKey: process.env.ACCESS_TOKEN_PUBLIC});
                        if(decoded)
                        {
                            req['currentUser'] = decoded;
                        }   
                    }
                }     
            }    
            next();
        } 
        catch (e) 
        {
            next();
        }
    } 
}