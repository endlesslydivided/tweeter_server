import { Inject, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from "@nestjs/serve-static";
import {join} from "path";
import { User } from './user/user.model';
import { TweetModule } from './tweet/tweet.module';
import { MediaModule } from './media/media.module';
import { Media } from './media/media.model';
import { Tweet } from './tweet/tweet.model';
import { LikedTweet } from './tweet/likedTweet.model';
import { SavedTweet } from './tweet/savedTweet.model';
import { SubscriptionModule } from './subscription/subscription.module';
import { Subscription } from './subscription/subscription.model';
import { FilesModule } from './files/files.module';
import { redisModule } from './module.config';
import { MailModule } from './mail/mail.module';
import { AuthMiddleware } from './auth/middlewares/auth.middleware';
import { RefreshMiddleware } from './auth/middlewares/refresh.middleware';


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
      models: [User, Media,Tweet,LikedTweet,SavedTweet,Subscription],
      autoLoadModels: true,
      synchronize: true
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
    
    ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware,RefreshMiddleware)
      .forRoutes('auth');
  }
}
