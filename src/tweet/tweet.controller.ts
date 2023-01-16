import { Body, Controller, Delete, Param, Post,UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
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

    @ApiOperation({ summary: "Delete tweet" })
    @Delete(':id')
    deleteTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteTweetById(id);
    } 

   
}
