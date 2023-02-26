import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import DBQueryParameters from './dbquery.params';
import QueryParameters from './query.params';

@Injectable()
export class QueryParamsPipe implements PipeTransform<QueryParameters, DBQueryParameters> {
  transform(value: QueryParameters, metadata: ArgumentMetadata): DBQueryParameters {
    let queryObject:DBQueryParameters = {};
    if(value.limit && value.page)
    {
      Object.defineProperty(queryObject,"limit",{value: value.limit,enumerable:true});
      Object.defineProperty(queryObject,"offset", {value: value.page *  value.limit -  value.limit,enumerable:true});
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