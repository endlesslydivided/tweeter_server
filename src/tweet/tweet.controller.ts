import { Body, Controller, Delete, HttpStatus, Param, ParseFilePipeBuilder, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { TransactionInterceptor } from 'src/transactions/transaction.interceptor';
import { TransactionParam } from 'src/transactions/transactionParam.decorator';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { LikeTweetDTO } from './dto/likeTweet.dto';
import { SaveTweetDTO } from './dto/saveTweet.dto';
import { LikedTweet } from './likedTweet.model';
import { SavedTweet } from './savedTweet.model';
import { Tweet } from './tweet.model';
import { TweetService } from './tweet.service';

@Controller('tweet')
export class TweetController {

    constructor(private tweetService: TweetService) {
    }

    @ApiOperation({ summary: "Create tweet" })
    @ApiCreatedResponse({ type: Tweet })
    @UseInterceptors(TransactionInterceptor,FilesInterceptor('files'))
    @Post()
    createTweet(@UploadedFiles(new ParseFilePipeBuilder().addMaxSizeValidator({maxSize: 1000})
    .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY}),)files: Array<Express.Multer.File>,
                @Body() dto: CreateTweetDTO,
                @TransactionParam() transaction: Transaction
    ) {
    return this.tweetService.createTweet(files,dto,transaction);
    }  

    @ApiOperation({ summary: "Delete tweet" })
    @Delete(':id')
    deleteTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteTweetById(id);
    } 

    @ApiOperation({ summary: "Like tweet" })
    @ApiCreatedResponse({ type: LikedTweet })
    @Post('../likedTweet')
    likeTweet(@Body() dto: LikeTweetDTO) 
    {
        return this.tweetService.createLikedTweet(dto);
    }  

    @ApiOperation({ summary: "Save tweet" })
    @ApiCreatedResponse({ type: SavedTweet })
    @Post('../savedTweet')
    saveTweet(@Body() dto: SaveTweetDTO) 
    {
        return this.tweetService.createSavedTweet(dto);
    }  

    @ApiOperation({ summary: "Delete liked tweet" })
    @Delete('../likedTweet/:id')
    deleteLikedTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteSavedTweetById(id);
    }  

    @ApiOperation({ summary: "Delete saved tweet" })
    @Delete('../savedTweet/:id')
    deleteSavedTweet(@Param('id') id: string) 
    {
        return this.tweetService.deleteLikedTweetById(id);
    }  

}
