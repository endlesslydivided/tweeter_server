import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { Tweet } from '../tweet/tweet.model';
import { SavedTweet } from '../tweet/savedTweet.model';
import { LikedTweet } from '../tweet/likedTweet.model';
import { Subscription } from '../subscription/subscription.model';
import { Media } from '../media/media.model';
import { Message } from 'src/message/message.model';
import { Dialog } from 'src/dialog/dialog.model';

@Module({
  
  providers: [UserService],
  controllers: [UserController],
  imports:[
    SequelizeModule.forFeature([Tweet, User, SavedTweet,LikedTweet,Subscription,Media, Message,Dialog]),
  ],
  exports:[
    UserService
  ]
})
export class UserModule {}
