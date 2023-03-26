import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { CurrentUserArgs } from 'src/auth/decorators/currentUserArgs.decorator';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
import QueryParameters from 'src/requestFeatures/query.params';
import { QueryParamsPipe } from 'src/requestFeatures/queryParams.pipe';
import { TransactionInterceptor } from 'src/transactions/transaction.interceptor';
import { TransactionParam } from 'src/transactions/transactionParam.decorator';
import { CreateTweetDTO } from './dto/createTweet.dto';
import { Tweet } from './tweet.model';
import { TweetService } from './tweet.service';

@ApiTags('Tweets')
@Controller('tweets')
@UseGuards(AuthJWTGuard)
export class TweetController {
  constructor(private tweetService: TweetService) {}

  @ApiOperation({ summary: 'Create tweet' })
  @ApiCreatedResponse({ type: Tweet })
  @UseInterceptors(TransactionInterceptor, FilesInterceptor('files'))
  @Post('')
  createTweet(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: CreateTweetDTO,
    @TransactionParam() transaction: Transaction,
  ) {
    return this.tweetService.createTweet(files, dto, transaction);
  }

  @ApiOperation({ summary: 'Get comments for tweet' })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/comments')
  getComments(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs
  ): any {
    return this.tweetService.getComments(id, filters,currentUser.userId);
  }

  @ApiOperation({ summary: 'Get replies for comment' })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/replies')
  getReplies(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs
  ): any {
    return this.tweetService.getReplies(id, filters,currentUser.userId);
  }

  @ApiOperation({ summary: 'Get comments for tweet' })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/top')
  getTopTweets(
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs
  ): any {
    return this.tweetService.getTopTweets(filters,currentUser.userId);
  }

  @ApiOperation({ summary: 'Get tweets with media' })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/media-tweets')
  getMediatTweets(
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs
  ): any {
    return this.tweetService.getMediaTweets(filters,currentUser.userId);
  }

  @ApiOperation({ summary: 'Get tweet' })
  @ApiOkResponse({ type: Tweet })
  @Get('/:id')
  getTweet(
    @Param('id') id: string,
    @CurrentUserArgs() currentUser: CurrentUserArgs
  ): any {
    return this.tweetService.getTweetById(id,currentUser.userId);
  }

  @ApiOperation({ summary: 'Get tweet' })
  @ApiOkResponse({ type: Tweet })
  @Get('')
  getTweets(
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs
  ): any {
    return this.tweetService.getTweets(filters,currentUser.userId);
  }
  @ApiOperation({ summary: 'Delete tweet' })
  @Delete(':id')
  deleteTweet(@Param('id') id: string) {
    return this.tweetService.deleteTweetById(id);
  }

  @ApiOperation({ summary: 'Delete tweet' })
  @Post('/:id/restored')
  restoreTweet(@Param('id') id: string) {
    return this.tweetService.restoreTweetById(id);
  }
}
