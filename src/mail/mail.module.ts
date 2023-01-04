import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: 'tweetersocialweb@gmail.com',
          pass: 'vsconjsjdbrqheld',
        },
      },
      defaults: {
        from: '"No Reply" tweetersocialweb@gmail.com',
      },
    
    }),
  ],
  providers: [MailService],
  exports: [MailService]})
export class MailModule {}
