import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthJWTGuard } from 'src/auth/guards/auth.guard';
import { FilterUserParams } from 'src/requestFeatures/filterUser.params';
import RequestParameters from 'src/requestFeatures/request.params';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { User } from './user.model';
import { UserService } from './user.service';

@Controller('users')
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
    getUsers(@Query() filters: FilterUserParams) 
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
    @ApiOkResponse({ type: "{rows:Subscribtion[],count:number}" })
    @Get("/:id/subscriptions")
    getSubscribtionsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getUserSubscribtions(id,filters);
    }

    @ApiOperation({ summary: "Get paged user's followers" })
    @ApiOkResponse({ type: "{rows:Subscribtion[],count:number}" })
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
    @ApiOkResponse({ type: "{rows:Subscribtion[],count:number}" })
    @Get("/:id/followingRequests")
    getFollowingRequestsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getFollowingRequests(id,filters);
    }

    @ApiOperation({ summary: "Get paged requests to subscribe a partircular" })
    @ApiOkResponse({ type: "{rows:Subscribtion[],count:number}" })
    @Get("/:id/followersRequests")
    getFollowersRequestsByUser(@Param("id") id: string,@Query() filters: RequestParameters) 
    {
      return this.userService.getFollowersRequests(id,filters);
    }

    

}
