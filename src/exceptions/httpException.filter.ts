//@ts-nocheck
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { ValidationException } from './types/validation.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter  
{
  catch(exception: HttpException, host: ArgumentsHost)
  {
    const ctx = host.switchToHttp();
    const request:Request = ctx.getRequest<Request>();
    const response:Response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;    
    const message  = exception?.message;
    if(exception instanceof ValidationException)
    {
      response.status(status)
      .json({
        message,
        entityErrors:exception.entityErrors,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    else
    {
      response.status(status)
      .json({
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
   
  }
}