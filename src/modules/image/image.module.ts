import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioService } from '../minio/minio.service';
import { ImageEntity } from '../../models/image.entity';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity])],
  controllers: [ImageController],
  providers: [ImageService, MinioService],
  exports: [ImageService]
})
export class ImageModule {}
