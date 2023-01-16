import { Body, Controller, Delete, HttpStatus, Param, ParseFilePipeBuilder, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
import { TransactionInterceptor } from 'src/transactions/transaction.interceptor';
import { TransactionParam } from 'src/transactions/transactionParam.decorator';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { LikeTweetDTO } from './dto/likeTweet.dto';
import { SaveTweetDTO } from './dto/saveTweet.dto';
import { LikedTweet } from './likedTweet.model';
import { SavedTweet } from './savedTweet.model';
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
    @Post()
    createTweet(@UploadedFiles()files: Array<Express.Multer.File>,
                @Body() dto: CreateTweetDTO,
                @TransactionParam() transaction: Transaction
    ) 
    {
        return this.tweetService.createTweet(files,dto,transaction);
    }  

    @ApiOperation({ summary: "Delete tweet" })
    @Delete('/:id')
    deleteTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteTweetById(id);
    } 

    @ApiOperation({ summary: "Like tweet" })
    @ApiCreatedResponse({ type: LikedTweet })
    @Post('likedTweets')
    likeTweet(@Body() dto: LikeTweetDTO) 
    {
        return this.tweetService.createLikedTweet(dto);
    }  

    @ApiOperation({ summary: "Save tweet" })
    @ApiCreatedResponse({ type: SavedTweet })
    @Post('savedTweets')
    saveTweet(@Body() dto: SaveTweetDTO) 
    {
        return this.tweetService.createSavedTweet(dto);
    }  

    @ApiOperation({ summary: "Delete liked tweet" })
    @Delete('likedTweets/:id')
    deleteLikedTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteSavedTweetById(id);
    }  

    @ApiOperation({ summary: "Delete saved tweet" })
    @Delete('savedTweets/:id')
    deleteSavedTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteLikedTweetById(id);
    }  

}
