import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilesModule } from '../files/files.module';
import { Media } from './media.model';
import { MediaService } from './media.service';

@Module({
  imports:[FilesModule,
    SequelizeModule.forFeature([Media]),
  ],
  providers: [MediaService],
  exports:[MediaService]
})
export class MediaModule {}
