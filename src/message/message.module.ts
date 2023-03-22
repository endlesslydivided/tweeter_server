import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MediaModule } from 'src/media/media.module';
import { Message } from './message.model';
import { MessageService } from './message.service';

@Module({
  providers: [MessageService],
  imports:[MediaModule,SequelizeModule.forFeature([Message])],
  exports:[MessageService]
})
export class MessageModule {}
