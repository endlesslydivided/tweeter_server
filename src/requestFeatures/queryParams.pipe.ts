import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import DBQueryParameters from './dbquery.params';
import QueryParameters from './query.params';

@Injectable()
export class QueryParamsPipe implements PipeTransform<QueryParameters, DBQueryParameters> {
  transform(value: QueryParameters, metadata: ArgumentMetadata): DBQueryParameters {
    let queryObject:DBQueryParameters = {};

    if(value.limit)
    {
      Object.defineProperty(queryObject,"limit",{value: value.limit,enumerable:true});
    }

    if(value.page)
    {
      Object.defineProperty(queryObject,"offset", {value: value.page *  value.limit -  value.limit,enumerable:true});
    }

    if(value.createdAt)
    {
      Object.defineProperty(queryObject,"createdAt", {value: value.createdAt,enumerable:true});
    }

    if(value.orderBy)
    {
      if(value.orderDirection)
        Object.defineProperty(queryObject,"order",{value:[[value.orderBy,value.orderDirection]],enumerable:true});
      else
        Object.defineProperty(queryObject,"order",{value:[[value.orderBy,'desc']],enumerable:true});
    }
    else
    {
      Object.defineProperty(queryObject,"order",{value:[['createdAt','desc']],enumerable:true});
    }
    
    return queryObject;
    
  }
}