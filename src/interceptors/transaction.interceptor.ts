import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Transaction } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { InjectConnection } from "@nestjs/sequelize";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {

  constructor(@InjectConnection() private readonly sequelizeInstance: Sequelize) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();

    const transaction: Transaction = await this.sequelizeInstance.transaction();
    req.transaction = transaction;
    return next.handle().pipe(
      tap(() => {
        transaction.commit();
      }),
      catchError(err => {
        transaction.rollback();
        return throwError(err);
      })
    );
  }
}
