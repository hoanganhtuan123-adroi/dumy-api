import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  HttpStatus,
  Patch,
  Param,
  BadRequestException,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { PostService } from './post.service';
import { CreateRequestDto } from './dto/request/create-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../common/bases/api.response';
import { UpdateRequestDto } from './dto/request/update-request.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post()
  async createPost(
    @Body() createPostDto: CreateRequestDto,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    console.log(createPostDto);
    const userID = req.user['userId'];
    await this.postService.createPost(createPostDto, userID);
    return ApiResponse.message('Create post successfully', 1000);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Patch(':id')
  async updatePost(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateRequest: UpdateRequestDto,
  ): Promise<ApiResponse> {
    const postId = Number(id);
    if (isNaN(postId))
      throw new BadRequestException('Post id must be a number');
    const userId = req.user['userId'];
    await this.postService.updatePost(postId, userId, updateRequest);
    return ApiResponse.message('Update post successfully',1000);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':id')
  async deletePost(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const postId = Number(id);
    const userId = req.user['userID'];
    if (isNaN(postId))
      throw new BadRequestException('Post id must be a number');
    await this.postService.deletePost(postId, userId);
    return ApiResponse.message('Delete post successfully!', 1000);
  }

  @Get()
  async getAllPosts(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ): Promise<ApiResponse> {
    const limitNum = Number(limit) || 10;
    const skipNum = Number(skip) || 0;
    if (isNaN(limitNum) || isNaN(skipNum) || limitNum < 0 || skipNum < 0) {
      throw new BadRequestException(
        'limit and skip must be non-negative numbers',
      );
    }

    const data = await this.postService.getAllPosts(limitNum, skipNum);
    return ApiResponse.success(data, 'Get all post successfully', 1000);
  }

  @Get('search')
  async getPostsBySearch(@Query('q') q: string): Promise<ApiResponse> {
    const data = await this.postService.searchPosts(q);
    return ApiResponse.success(data, 'Get posts successfully', 1000);
  }

  @Get(':id')
  async getSinglePost(@Param('id') id: string): Promise<ApiResponse> {
    const postId = Number(id);
    if (isNaN(postId) || postId < 0)
      throw new BadRequestException('Post id is not valid');
    const data = await this.postService.getSinglePost(postId);
    return ApiResponse.success(data, 'Get single post successfully', 1000);
  }
}
