import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewRequestDto } from './dto/request/review-request.dto';
import { ApiResponse } from '../../common/bases/api.response';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async addReview(@Body() reviewData: ReviewRequestDto) : Promise<ApiResponse> {
    await this.reviewService.addReview(reviewData);
    return ApiResponse.message('Review added successfully', HttpStatus.CREATED);
  }
}
