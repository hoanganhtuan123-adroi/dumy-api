import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../../models/review.entity';
import { ProductEntity } from '../../models/product.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports:  [TypeOrmModule.forFeature([ReviewEntity, ProductEntity]), forwardRef(()=>ProductModule)],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
