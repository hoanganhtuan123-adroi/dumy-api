import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../models/product.entity';
import { ImageModule } from '../image/image.module';
import { CategoryModule } from '../category/category.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), ImageModule, CategoryModule, forwardRef(() => ReviewModule),],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
