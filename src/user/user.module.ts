import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { Tweet } from 'src/tweet/tweet.model';
import { SavedTweet } from 'src/tweet/savedTweet.model';
import { LikedTweet } from 'src/tweet/likedTweet.model';

@Module({
  
  providers: [UserService],
  controllers: [UserController],
  imports:[
    SequelizeModule.forFeature([Tweet, User, SavedTweet,LikedTweet]),
  ],
  exports:[
    UserService
  ]
})
export class UserModule {}
