//@ts-nocheck
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements BaseExceptionFilter 
{
  catch(exception: HttpException, host: ArgumentsHost)
  {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    
    const message  = exception?.message;

    response
      .status(status)
      .json({
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}