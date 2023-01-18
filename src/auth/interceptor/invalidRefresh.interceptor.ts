import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { InjectConnection } from "@nestjs/sequelize";
import { InvalidRefreshTokenException } from "src/exceptions/types/invalidRefreshToken.exception";
import { Response } from "express";

@Injectable()
export class InvalidRefreshInterceptor implements NestInterceptor {


  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const response:Response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      tap(() => {

        }),
      catchError(error => {
        if(error instanceof InvalidRefreshTokenException )
        {
            response.clearCookie("accessToken");
            response.clearCookie("refreshToken");
        }
        return error;
      })
    );
  }
}
