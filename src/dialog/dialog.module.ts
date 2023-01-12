import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogController } from './dialog.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from 'src/message/message.model';
import { Dialog } from './dialog.model';
import { UserDialog } from './userDialog.model';

@Module({
  providers: [DialogService],
  imports:[SequelizeModule.forFeature([Message,Dialog,UserDialog])],
  controllers: [DialogController],
  exports:[DialogService]
})
export class DialogModule {}
