import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tweet } from './tweet.model';
import { User } from 'src/user/user.model';
import { SavedTweet } from './savedTweet.model';
import { LikedTweet } from './likedTweet.model';
import { MediaModule } from '../media/media.module';

@Module({
  providers: [TweetService],
  controllers: [TweetController],
  imports:[
    MediaModule,
    SequelizeModule.forFeature([Tweet, User, SavedTweet,LikedTweet]),
  ],
  exports:[
    TweetService
  ]
})
export class TweetModule {}
