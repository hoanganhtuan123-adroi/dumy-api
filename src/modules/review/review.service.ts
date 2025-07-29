import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from '../../models/review.entity';
import { Repository } from 'typeorm';
import { ReviewRequestDto } from './dto/request/review-request.dto';
import { ProductEntity } from '../../models/product.entity';
import { ProductService } from '../product/product.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,

    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async addReview(reviewDto: ReviewRequestDto) {
    const product = await this.productService.findProductById(
      reviewDto.productID,
    );

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

  async deleteReviewByProduct(product: ProductEntity) {
    await this.reviewRepository.delete({ product: product });
  }
}
