//ts-nocheck
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DbQuery = createParamDecorator((data: unknown, ctx: ExecutionContext) => 
{
    const query = ctx.switchToHttp().getRequest().query;
    let { orderBy, sort, limit, page, fields, search,...other } = query;
    let paramQuery = 
    {
        limit: 10,
        offset: 0
    };
    // if (typeof sort !== 'undefined') 
    // {
    //     if(typeof sort === 'object')
    //     {

    //     }
    // }

    if (limit != '' && typeof limit !== 'undefined' && limit > 0) 
    {
        paramQuery.limit = parseInt(limit);
    }

    if (page != '' && typeof page !== 'undefined' && page > 0) 
    {
        paramQuery.offset = page * paramQuery.limit  - paramQuery.limit;
    }


    if (search != '' && typeof search !== 'undefined') 
    {
        Object.defineProperty(paramQuery,'search',{value:search});
    }
    
    return paramQuery;

});

export interface AuthUser 
{
    id: number;
    email: string;
}