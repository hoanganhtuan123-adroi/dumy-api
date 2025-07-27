import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoEntity } from '../../models/todo.entity';
import { Not, Repository } from 'typeorm';
import { AddTodoRequestDto } from './dto/request/add-todo-request.dto';
import { UserEntity } from '../../models/user.entity';
import { UpdateTodoRequestDto } from './dto/request/update-todo-request.dto';
import {
  GetAllTodoResponseDto,
  TodoResponseDto,
} from './dto/response/get-todo-response.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async addNewTodo(
    addTodoRequest: AddTodoRequestDto,
    userId: number,
  ): Promise<void> {
    const isUserExists = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!isUserExists) {
      throw new NotFoundException('User not found!');
    }
    const todo = this.todoRepository.create({
      name: addTodoRequest.name,
      completed: addTodoRequest.completed ?? false,
      user: isUserExists,
    });
    await this.todoRepository.save(todo);
  }

  async updateTodo(
    todoId: number,
    updateTodoRequest: UpdateTodoRequestDto,
    userId: number,
  ): Promise<void> {
    const isTodoExists = await this.todoRepository.findOne({
      relations: ['user'],
      where: {
        id: todoId,
      },
    });
    if (userId !== isTodoExists.user.id)
      throw new UnauthorizedException('This todo is not yours');
    if (!isTodoExists) throw new NotFoundException('Todo does not exist!');
    const isUserExists = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!isUserExists) throw new NotFoundException('User not found!');
    isTodoExists.name = updateTodoRequest.name;
    isTodoExists.completed = updateTodoRequest.completed ?? false;
    await this.todoRepository.save(isTodoExists);
  }

  async deleteTodo(todoId: number, userId: number): Promise<void> {
    const todo = await this.todoRepository.findOne({
      relations: ['user'],
      where: { id: todoId },
    });

    if (todo.user.id !== userId)
      throw new UnauthorizedException('This todo is not yours');

    if (!todo) throw new NotFoundException("Todo doesn't exist!");
    await this.todoRepository.delete({ id: todoId });
  }

  async getAllTodos(
    limit: number,
    skip: number,
  ): Promise<GetAllTodoResponseDto> {
    const [todos, total] = await this.todoRepository
      .createQueryBuilder('todo')
      .leftJoin('todo.user', 'user')
      .select(['todo.id', 'todo.name', 'todo.completed', 'user.id'])
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const newTodos = todos.map((todo) => {
      return {
        id: todo.id,
        name: todo.name,
        completed: todo.completed,
        userId: todo.user.id,
      };
    });

    return { todos: newTodos, total, limit, skip };
  }

  async getTodoByUser(
    userId: number,
    limit: number,
    skip: number,
  ): Promise<GetAllTodoResponseDto> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const [todos, total] = await this.todoRepository.findAndCount({
      relations: ['user'],
      skip: skip,
      take: limit,
      where: { user: { id: userId } },
      select: {
        id: true,
        name: true,
        completed: true,
        user: {
          id: true,
        },
      },
    });

    const newTodos = todos.map((todo) => ({
      id: todo.id,
      name: todo.name,
      completed: todo.completed,
      userId: todo.user.id,
    }));

    return { todos: newTodos, total, limit, skip };
  }

  async getSingleTodo(todoId: number): Promise<TodoResponseDto> {
    const todo = await this.todoRepository.findOne({
      where: { id: todoId },
      relations: ['user'],
      select: {
        id: true,
        name: true,
        completed: true,
        user: {
          id: true,
        },
      },
    });

    if (!todo) throw new NotFoundException('Todo not found!');

    return {
      id: todo.id,
      name: todo.name,
      completed: todo.completed,
      userId: todo.user.id,
    };
  }

  async getRandomTodo(
    limit?: number,
  ): Promise<TodoResponseDto | TodoResponseDto[]> {
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.user', 'user');
    queryBuilder.orderBy('RAND()');

    if (limit != undefined && limit > 0) {
      queryBuilder.take(limit);
      const todos = await queryBuilder.getMany();
      return this.mapTodoResponse(todos);
    }
    else {
      queryBuilder.take(1);
      const todo = await queryBuilder.getOne();
      if(!todo) throw new NotFoundException("No data about todo")
      return this.mapSingleTodoResponse(todo);
    }
   
  }

  private mapTodoResponse(todos: TodoEntity[]) : TodoResponseDto[] {
    return todos.map((todo: any) => ({
      id: todo.id,
      name: todo.name,
      completed: todo.completed,
      userId: todo.user.id,
    }));
  }

  private mapSingleTodoResponse(todo: TodoEntity): TodoResponseDto {
    return {
      id: todo.id,
      name: todo.name,
      completed: todo.completed,
      userId: todo.user.id, 
    };
  }
}
