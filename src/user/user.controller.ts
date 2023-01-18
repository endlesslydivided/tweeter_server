import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { Delete, Post } from '@nestjs/common/decorators';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
import RequestParameters from 'src/requestFeatures/request.params';
import { LikedTweet } from 'src/tweet/likedTweet.model';
import { SavedTweet } from 'src/tweet/savedTweet.model';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { User } from './user.model';
import { UserService } from './user.service';

@ApiTags("Users")
@Controller("users")
@UseGuards(AuthJWTGuard)
export class UserController {

    constructor(private userService: UserService) {}
  
    @ApiOperation({ summary: "User update" })
    @ApiOkResponse({ type: User })
    @Put("/:id")
    updateUser(@Body() dto: UpdateUserDTO,@Param("id") id: string) 
    {
      return this.userService.updateUserById(id,dto);
    }
  
    @ApiOperation({ summary: "Get paged users" })
    @ApiOkResponse({ type: "{rows:User[],count:number}" })
    @Get()
    getUsers(@Query() filters: RequestParameters) 
    {
      return this.userService.getUsers(filters);
    }
  
    @ApiOperation({ summary: "Get user by id" })
    @ApiOkResponse({ type: User })
    @Get("/:id")
    getUser(@Param("id") id: string) 
    {
      return this.userService.getUserById(id);
    }
  
    @ApiOperation({ summary: "Get paged user's subscriptions" })
    @ApiOkResponse({ type: "{rows:Subscription[],count:number}" })
    @Get("/:id/subscriptions")
    getSubscriptionsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserSubscriptions(id,filters);
    }

    @ApiOperation({ summary: "Get paged user's followers" })
    @ApiOkResponse({ type: "{rows:Subscription[],count:number}" })
    @Get("/:id/followers")
    getFollowersByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserFollowers(id,filters);
    }
  
    @ApiOperation({ summary: "Get paged user's liked tweets" })
    @ApiOkResponse({ type: "{rows:Tweet[],count:number}" })
    @Get("/:id/likedTweets")
    getLikedTweetByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserLikedTweets(id,filters);
    }
  
    @ApiOperation({ summary: "Get paged user's saved tweets" })
    @ApiOkResponse({ type: "{rows:Tweet[],count:number}" })
    @Get("/:id/savedTweets")
    getSavedTweetByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserSavedTweets(id,filters);
    }

    @ApiOperation({ summary: "Get paged user's tweets" })
    @ApiOkResponse({ type: "{rows:Tweet[],count:number}" })
    @Get("/:id/tweets")
    getTweetsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserTweets(id,filters);
    }

    @ApiOperation({ summary: "Get paged user's feed" })
    @ApiOkResponse({ type: "{rows:Tweet[],count:number}" })
    @Get("/:id/feed")
    getFeedByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserFeed(id,filters);
    }

    @ApiOperation({ summary: "Get paged user's media" })
    @ApiOkResponse({ type: "{rows:Media[],count:number}" })
    @Get("/:id/media")
    getMediaByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserMedia(id,filters);
    }
    
    @ApiOperation({ summary: "Get paged user's subscription requests" })
    @ApiOkResponse({ type: "{rows:Subscription[],count:number}" })
    @Get("/:id/followingRequests")
    getFollowingRequestsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getFollowingRequests(id,filters);
    }

    @ApiOperation({ summary: "Get paged requests to subscribe a partircular user" })
    @ApiOkResponse({ type: "{rows:Subscription[],count:number}" })
    @Get("/:id/followersRequests")
    getFollowersRequestsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getFollowersRequests(id,filters);
    }

    @ApiOperation({ summary: "Get paged user dialogs" })
    @ApiOkResponse({ type: "{rows:Dialog[],count:number}" })
    @Get("/:id/dialogs")
    getDialogsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getDialogsByUser(id,filters);
    }
    

    @ApiOperation({ summary: "Like tweet" })
    @ApiCreatedResponse({ type: LikedTweet })
    @Post('/:id/likedTweets/:tweetId')
    likeTweet(@Param('userId') userId: string,@Param('tweetId') tweetId: string) 
    {
        return this.userService.createLikedTweet(userId,tweetId);
    }  

    @ApiOperation({ summary: "Save tweet" })
    @ApiCreatedResponse({ type: SavedTweet })
    @Post('/:id/savedTweets/:tweetId')
    saveTweet(@Param('userId') userId: string,@Param('tweetId') tweetId: string) 
    {
        return this.userService.createSavedTweet(userId,tweetId);
    }  

    @ApiOperation({ summary: "Delete liked tweet" })
    @Delete('/:userId/likedTweets/:tweetId')
    deleteLikedTweet(@Param('userId') userId: string,@Param('tweetId') tweetId: string) 
    {
        return this.userService.deleteSavedTweetById(userId,tweetId);
    }  

    @ApiOperation({ summary: "Delete saved tweet" })
    @Delete('/:userId/savedTweets/:tweetId')
    deleteSavedTweet(@Param('userId') userId: string,@Param('tweetId') tweetId: string) 
    {
        return this.userService.deleteLikedTweetById(userId,tweetId);
    }  


}
