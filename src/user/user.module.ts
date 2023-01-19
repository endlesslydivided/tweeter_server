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
import { Message } from '../message/message.model';
import { Dialog } from '../dialog/dialog.model';
import { MediaModule } from '../media/media.module';

@Module({
  
  providers: [UserService],
  controllers: [UserController],
  imports:[
    MediaModule,
    SequelizeModule.forFeature([Tweet, User, SavedTweet,LikedTweet,Subscription,Media, Message,Dialog]),
  ],
  exports:[
    UserService
  ]
})
export class UserModule {}
