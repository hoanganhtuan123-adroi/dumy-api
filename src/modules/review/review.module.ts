import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../../models/review.entity';
import { ProductEntity } from '../../models/product.entity';

@Module({
  imports:  [TypeOrmModule.forFeature([ReviewEntity, ProductEntity])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
