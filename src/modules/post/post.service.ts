import { UserService } from './../user/user.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../../models/post.entity';
import { Like, Repository } from 'typeorm';
import { CreateRequestDto } from './dto/request/create-request.dto';
import { ICreateResponseDto } from './dto/response/create-response.dto';
import { UpdateRequestDto } from './dto/request/update-request.dto';
import {
  IGetPostResponse,
  IPostResponse,
} from './dto/response/get-post-response.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,

    private readonly userService: UserService,
  ) {}

  async createPost(
    createPostDto: CreateRequestDto,
    userId: number,
  ): Promise<void> {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    const post = this.postRepository.create({
      ...createPostDto,
      reactionsDislikes: 0,
      reactionsLikes: 0,
      view: 0,
      user: user,
    });
    await this.postRepository.save(post);
  }

  async updatePost(
    postId: number,
    userId: number,
    updateRequest: UpdateRequestDto,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, user: { id: userId } },
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepository.update(postId, updateRequest);
  }

  async deletePost(postId: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, user: { id: userId } },
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepository.delete(postId);
  }
  
  async getAllPosts(limit: number, skip: number): Promise<IGetPostResponse> {
    const [posts, total] = await this.postRepository.findAndCount({
      relations: ['user'],
      skip,
      take: limit,
    });
    const mappedData = this.mapToPostResponse(posts);
    const data = { posts: mappedData, total, limit, skip };
    return data;
  }

  async getSinglePost(postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');
    const mappedPost = this.mapToPostResponse([post]);
    return mappedPost;
  }

  async searchPosts(q: string): Promise<IGetPostResponse> {
    const [posts, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.title LIKE :q', { q: `%${q}%` })
      .orWhere('post.body LIKE :q', { q: `%${q}%` })
      .getManyAndCount();

    const mappedData = this.mapToPostResponse(posts);
    return {
      posts: mappedData,
      total,
      limit: total,
      skip: 0,
    };
  }

  private mapToPostResponse(posts: PostEntity[]): IPostResponse[] {
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      userId: Number(post.user.id),
      tags: post.tags?.split(','),
      views: Number(post.view),
      reactions: {
        likes: Number(post.reactionsLikes),
        dislikes: Number(post.reactionsDislikes),
      },
    }));
  }
}
