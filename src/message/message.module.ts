import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './message.model';
import { MessageService } from './message.service';

@Module({
  providers: [MessageService],
  imports:[SequelizeModule.forFeature([Message])],
  exports:[MessageService]
})
export class MessageModule {}
