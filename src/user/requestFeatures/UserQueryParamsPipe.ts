import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import UsersParams from './UsersParams';
import UsersQueryParams from './UsersQueryParams';


@Injectable()
export class UserQueryParamsPipe implements PipeTransform<UsersQueryParams, UsersParams> {
  transform(value: UsersQueryParams, metadata: ArgumentMetadata): UsersParams {
    let queryObject:UsersParams = new UsersParams();

    if(value.sex)
    {
      queryObject.sex = value.sex;
    }

    if(value.country)
    {
      queryObject.country = value.country;
    }

    if(value.havePhoto)
    {
      queryObject.havePhoto = value.havePhoto;
    }

    if(value.search)
    {
      queryObject.search = value.search;
    }

    if(value.limit)
    {
      Object.defineProperty(queryObject,"limit",{value: value.limit,enumerable:true});
    }

    if(value.page)
    {
      Object.defineProperty(queryObject,"offset", {value: value.page *  value.limit -  value.limit,enumerable:true});
    }

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