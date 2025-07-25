import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../models/product.entity';
import { ReviewEntity } from '../../models/review.entity';
import { ImageEntity } from '../../models/image.entity';
import { MinioService } from '../../common/bases/minio.service';
import { CategoryEntity } from '../../models/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ReviewEntity, ImageEntity, CategoryEntity])],
  controllers: [ProductController],
  providers: [ProductService, MinioService],
})
export class ProductModule {}
