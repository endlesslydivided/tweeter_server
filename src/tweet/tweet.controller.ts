import { Body, Controller, Delete, Get, Param, Post,Query,UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
import QueryParameters from 'src/requestFeatures/query.params';
import { QueryParamsPipe } from 'src/requestFeatures/queryParams.pipe';
import { TransactionInterceptor } from 'src/transactions/transaction.interceptor';
import { TransactionParam } from 'src/transactions/transactionParam.decorator';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { Tweet } from './tweet.model';
import { TweetService } from './tweet.service';

@ApiTags("Tweets")
@Controller("tweets")
@UseGuards(AuthJWTGuard)
export class TweetController {

    constructor(private tweetService: TweetService) {
    }

    @ApiOperation({ summary: "Create tweet" })
    @ApiCreatedResponse({ type: Tweet })
    @UseInterceptors(TransactionInterceptor,FilesInterceptor('files'))
    @Post('')
    createTweet(@UploadedFiles()files: Array<Express.Multer.File>,
                @Body() dto: CreateTweetDTO,
                @TransactionParam() transaction: Transaction
    ) 
    {
        return this.tweetService.createTweet(files,dto,transaction);
    }  
    
    @ApiOperation({ summary: "Get comments for tweet" })
    @ApiOkResponse({ type: "{rows:Tweet[],count:number}" })
    @Get("/:id/comments")
    getComments(@Param("id") id: string,@Query(new QueryParamsPipe()) filters: QueryParameters): any 
    {
      return this.tweetService.getComments(id,filters);
    }
    
    @ApiOperation({ summary: "Delete tweet" })
    @Delete(':id')
    deleteTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteTweetById(id);
    } 

   
}
