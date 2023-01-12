import { Module } from '@nestjs/common';
import { DialogModule } from '../dialog/dialog.module';
import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
    controllers: [],
    imports: [MessageModule,UserModule,DialogModule],
    providers: [ChatGateway],
  })
export class ChatModule {}
