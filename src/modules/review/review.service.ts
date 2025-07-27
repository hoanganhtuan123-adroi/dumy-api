import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from '../../models/review.entity';
import { Repository } from 'typeorm';
import { ReviewRequestDto } from './dto/request/review-request.dto';
import { ProductEntity } from '../../models/product.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async addReview(reviewDto: ReviewRequestDto) {
    const product = await this.productRepository.findOne({
      where: { id: reviewDto.productID },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewRepository.create({
      comment: reviewDto.comment,
      date: new Date(),
      reviewer_name: reviewDto.reviewer_name,
      reviewer_email: reviewDto.reviewer_email,
      rating: reviewDto.rating,
      product: product,
    });

    return this.reviewRepository.save(review);
  }
}
