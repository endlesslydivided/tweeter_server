import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth/middlewares/auth.middleware';
import { RefreshMiddleware } from './auth/middlewares/refresh.middleware';
import { ChatModule } from './chat/chat.module';
import { Dialog } from './dialog/dialog.model';
import { DialogModule } from './dialog/dialog.module';
import { UserDialog } from './dialog/userDialog.model';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';
import { Media } from './media/media.model';
import { MediaModule } from './media/media.module';
import { Message } from './message/message.model';
import { MessageModule } from './message/message.module';
import { redisModule } from './module.config';
import { Subscription } from './subscription/subscription.model';
import { SubscriptionModule } from './subscription/subscription.module';
import { LikedTweet } from './tweet/likedTweet.model';
import { SavedTweet } from './tweet/savedTweet.model';
import { Tweet } from './tweet/tweet.model';
import { TweetModule } from './tweet/tweet.module';
import { TweetCounts } from './tweet/tweetcounts.model';
import { User } from './user/user.model';
import { UserModule } from './user/user.module';
import { UserCounts } from './user/userCounts.model';


@Module({
  
  imports: [
    ConfigModule.forRoot({
      envFilePath:'.env'
    }),
    SequelizeModule.forRoot({
      logging: true,
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Media,Tweet,LikedTweet,SavedTweet,Subscription,Dialog,Message,UserDialog,TweetCounts,UserCounts],
      autoLoadModels: true,
      synchronize: false,
      
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '.', 'static'),
    }),
    AuthModule, 
    UserModule,  
    TweetModule,
    MediaModule,
    SubscriptionModule,
    FilesModule,
    redisModule,
    MailModule,
    DialogModule,
    MessageModule,
    ChatModule,
    
    ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('/tweets','/savedTweets','/likedTweets','/users','/subscriptions','/dialogs',
      '/auth/sessions','/auth/me','/auth/password')
    consumer
    .apply(RefreshMiddleware)
    .forRoutes('/auth/refreshTokens','/auth/signOut');
  }
}
