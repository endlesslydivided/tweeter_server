import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  Delete,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common/decorators';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthJWTGuard } from '../auth/guards/auth.guard';
import { QueryParamsPipe } from '../requestFeatures/queryParams.pipe';
import { LikedTweet } from '../tweet/likedTweet.model';
import { SavedTweet } from '../tweet/savedTweet.model';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { User } from './user.model';
import { UserService } from './user.service';
import { TransactionInterceptor } from '../transactions/transaction.interceptor';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Transaction } from 'sequelize';
import { TransactionParam } from '../transactions/transactionParam.decorator';
import QueryParameters from '../requestFeatures/query.params';
import { CurrentUserArgs } from 'src/auth/decorators/currentUserArgs.decorator';
import UsersQueryParams from './requestFeatures/UsersQueryParams';
import { UserQueryParamsPipe } from './requestFeatures/UserQueryParamsPipe';
import UsersParams from './requestFeatures/UsersParams';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthJWTGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'My profile update' })
  @ApiOkResponse({ type: User })
  @UseInterceptors(TransactionInterceptor)
  @Put('/me')
  updateMe(
    @Body() dto: UpdateUserDTO,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
    @TransactionParam() transaction: Transaction,
  ) {
    return this.userService.updateUserById(
      currentUser.userId,
      dto,
      transaction,
    );
  }

  @ApiOperation({ summary: 'My profile update main photo' })
  @ApiOkResponse({ type: User })
  @UseInterceptors(TransactionInterceptor, FileInterceptor('mainPhoto'))
  @Put('/me/main-photo')
  updateMainPhoto(
    @UploadedFile() mainPhoto: Express.Multer.File,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
    @TransactionParam() transaction: Transaction,
  ) {
    return this.userService.updateMainPhoto(
      mainPhoto,
      currentUser.userId,
      transaction,
    );
  }

  @ApiOperation({ summary: 'My profile update profile photo' })
  @ApiOkResponse({ type: User })
  @UseInterceptors(TransactionInterceptor, FileInterceptor('profilePhoto'))
  @Put('/me/profile-photo')
  updateProfilePhoto(
    @UploadedFile() profilePhoto: Express.Multer.File,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
    @TransactionParam() transaction: Transaction,
  ) {
    return this.userService.updateProfilePhoto(
      profilePhoto,
      currentUser.userId,
      transaction,
    );
  }

  @ApiOperation({ summary: 'Get paged users' })
  @ApiOkResponse({ type: '{rows:User[],count:number}' })
  @Get()
  getUsers(
    @Query(new UserQueryParamsPipe()) filters: UsersQueryParams,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUsers(filters, currentUser.userId);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: User })
  @Get('/:id')
  getUser(
    @Param('id') id: string,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUserById(id, currentUser.userId);
  }

  @ApiOperation({ summary: "Get paged user's subscriptions" })
  @ApiOkResponse({ type: '{rows:Subscription[],count:number}' })
  @Get('/:id/subscriptions')
  getSubscriptionsByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUserSubscriptions(
      id,
      filters,
      currentUser.userId,
    );
  }

  @ApiOperation({ summary: "Get paged user's followers" })
  @ApiOkResponse({ type: '{rows:Subscription[],count:number}' })
  @Get('/:id/followers')
  getFollowersByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUserFollowers(id, filters, currentUser.userId);
  }

  @ApiOperation({ summary: "Get paged user's liked tweets" })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/likedTweets')
  getLikedTweetByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getUserLikedTweets(id, filters);
  }

  @ApiOperation({ summary: "Get paged user's saved tweets" })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/savedTweets')
  getSavedTweetByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getUserSavedTweets(id, filters);
  }

  @ApiOperation({ summary: "Get paged user's tweets" })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/tweets')
  getTweetsByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUserTweets(id, filters, currentUser.userId);
  }

  @ApiOperation({ summary: "Get paged user's tweets" })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/tweets-replies')
  getTweetsAndRepliesByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUserTweetsAndReplies(
      id,
      filters,
      currentUser.userId,
    );
  }

  @ApiOperation({ summary: "Get paged user's feed" })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/feed')
  getFeedByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getUserFeed(id, filters);
  }

  @ApiOperation({ summary: "Get paged user's media" })
  @ApiOkResponse({ type: '{rows:Media[],count:number}' })
  @Get('/:id/media')
  getMediaByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
    @CurrentUserArgs() currentUser: CurrentUserArgs,
  ) {
    return this.userService.getUserMedia(id, filters,currentUser.userId);
  }

  @ApiOperation({ summary: "Get paged user's subscription requests" })
  @ApiOkResponse({ type: '{rows:Subscription[],count:number}' })
  @Get('/:id/followingRequests')
  getFollowingRequestsByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getFollowingRequests(id, filters);
  }

  @ApiOperation({
    summary: 'Get paged requests to subscribe a partircular user',
  })
  @ApiOkResponse({ type: '{rows:Subscription[],count:number}' })
  @Get('/:id/followersRequests')
  getFollowersRequestsByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getFollowersRequests(id, filters);
  }

  @ApiOperation({ summary: 'Get paged user dialogs' })
  @ApiOkResponse({ type: '{rows:Dialog[],count:number}' })
  @Get('/:id/dialogs')
  getDialogsByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getDialogsByUser(id, filters);
  }

  @ApiOperation({ summary: 'Like tweet' })
  @ApiCreatedResponse({ type: LikedTweet })
  @Post('/:userId/likedTweets/:tweetId')
  likeTweet(
    @Param('userId') userId: string,
    @Param('tweetId') tweetId: string,
  ) {
    return this.userService.createLikedTweet(userId, tweetId);
  }

  @ApiOperation({ summary: 'Save tweet' })
  @ApiCreatedResponse({ type: SavedTweet })
  @Post('/:userId/savedTweets/:tweetId')
  saveTweet(
    @Param('userId') userId: string,
    @Param('tweetId') tweetId: string,
  ) {
    return this.userService.createSavedTweet(userId, tweetId);
  }

  @ApiOperation({ summary: 'Delete liked tweet' })
  @Delete('/:userId/likedTweets/:tweetId')
  deleteLikedTweet(
    @Param('userId') userId: string,
    @Param('tweetId') tweetId: string,
  ) {
    return this.userService.deleteLikedTweetById(userId, tweetId);
  }

  @ApiOperation({ summary: 'Delete saved tweet' })
  @Delete('/:userId/savedTweets/:tweetId')
  deleteSavedTweet(
    @Param('userId') userId: string,
    @Param('tweetId') tweetId: string,
  ) {
    return this.userService.deleteSavedTweetById(userId, tweetId);
  }

  @ApiOperation({ summary: 'Mark favorite message' })
  @ApiCreatedResponse({ type: SavedTweet })
  @Post('/:userId/favorite-messages/:messageId')
  markFavoriteMessage(
    @Param('userId') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.userService.createFavoriteMessage(userId, messageId);
  }

  @ApiOperation({ summary: 'Delete favorite message' })
  @Delete('/:userId/favorite-messages/:messageId')
  deleteFavoriteMessage(
    @Param('userId') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.userService.deleteFavoriteMessage(userId, messageId);
  }

  @ApiOperation({ summary: "Get paged user's saved tweets" })
  @ApiOkResponse({ type: '{rows:Tweet[],count:number}' })
  @Get('/:id/favorite-messages')
  getFavoriteMessagesByUser(
    @Param('id') id: string,
    @Query(new QueryParamsPipe()) filters: QueryParameters,
  ) {
    return this.userService.getUserFavoriteMessages(id, filters);
  }
  
}
