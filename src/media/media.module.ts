import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { MediaService } from './media.service';

@Module({
  imports:[FilesModule],
  providers: [MediaService],
  exports:[MediaService]
})
export class MediaModule {}
