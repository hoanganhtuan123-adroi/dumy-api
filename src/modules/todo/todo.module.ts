import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from '../../models/todo.entity';
import { UserEntity } from '../../models/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity]), UserModule],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
