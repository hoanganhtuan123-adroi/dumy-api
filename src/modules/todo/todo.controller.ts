import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Delete,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { TodoService } from './todo.service';
import { AddTodoRequestDto } from './dto/request/add-todo-request.dto';
import { ApiResponse } from '../../common/bases/api.response';
import { UpdateTodoRequestDto } from './dto/request/update-todo-request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post()
  async addNewTodo(
    @Req() res: Request,
    @Body() addTodoRequest: AddTodoRequestDto,
  ): Promise<ApiResponse> {
    const userId = Number(res.user['userId']);
    await this.todoService.addNewTodo(addTodoRequest, userId);
    return ApiResponse.message(
      'Add new todo successfully!',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Patch(':id')
  async updateTodo(
    @Req() res: Request,
    @Body() updateTodoRequest: UpdateTodoRequestDto,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const todoId = Number(id);
    const userId = Number(res.user['userId']);
    if (isNaN(todoId)) throw new BadRequestException('Todo must be a number!');
    await this.todoService.updateTodo(todoId, updateTodoRequest, userId);
    return;
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':id')
  async deleteTodo(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const todoId = Number(id);
    const userId = Number(req.user['userId']);
    if (isNaN(todoId)) throw new BadRequestException('Todo must be a number!');

    await this.todoService.deleteTodo(todoId, userId);
    return ApiResponse.message('Delete todo successfully!', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get()
  async getAllTodos(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ): Promise<ApiResponse> {
    const limitNum = parseInt(limit) || 10;
    const skipNum = parseInt(skip) || 0;
    const data = await this.todoService.getAllTodos(limitNum, skipNum);
    return ApiResponse.success(
      data,
      'Get all todos successfully!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get('random/:limit')
  async getRandomTodoWithLimit(
    @Param('limit') limit: string,
  ): Promise<ApiResponse> {
    const MAX_LIMIT = 10;
    const limitNumber = parseInt(limit, 10);
    if (isNaN(limitNumber) || limitNumber < 0)
      throw new BadRequestException('Limit must be a positive number!');
    if (limitNumber > MAX_LIMIT)
      return ApiResponse.message('Max limit is 10', HttpStatus.BAD_REQUEST);
    const data = await this.todoService.getRandomTodo(limitNumber);
    return ApiResponse.success(
      data,
      'Get random todo successfully!',
      HttpStatus.OK,
    );
  }

  @Get('random')
  async getRandomTodo(): Promise<ApiResponse> {
    const data = await this.todoService.getRandomTodo();
    return ApiResponse.success(
      data,
      'Get random todo successfully!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get('user/:id')
  async getTodoByUser(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const limitNum = parseInt(limit) || 10;
    const skipNum = parseInt(skip) || 0;
    if (isNaN(limitNum) || isNaN(skipNum) || limitNum < 0 || skipNum < 0)
      throw new BadRequestException('Please give a positive number');
    const userId = parseInt(id);
    const data = await this.todoService.getTodoByUser(
      userId,
      limitNum,
      skipNum,
    );
    return ApiResponse.success(data, 'Get todo successfully!', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get(':id')
  async getSingleTodo(@Param('id') id: string): Promise<ApiResponse> {
    const todoId = parseInt(id);
    if (isNaN(todoId) || todoId <= 0)
      throw new BadRequestException('Please give a positive number id');
    const data = await this.todoService.getSingleTodo(todoId);
    return ApiResponse.success(
      data,
      'Get single todo successfully!',
      HttpStatus.OK,
    );
  }
}
