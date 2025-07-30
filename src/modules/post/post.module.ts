import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../../models/post.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), UserModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
