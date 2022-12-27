import { ExecutionContext, ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class AuthJWTGuard extends AuthGuard('jwt') 
{
  async canActivate(context: ExecutionContext): Promise<boolean>  
  {
    try 
    {
      const request: Request = context.switchToHttp().getRequest();
      const currentUser =request['currentUser'];
      if(!currentUser)
      {
        throw new ForbiddenException("User access forbidden");
      }
      return true
     
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