import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  HttpStatus,
  UseGuards,
  Request as ReqDecorator,
  Patch,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '../../common/bases/api.response';
import { storage } from '../../common/bases/oss';
import * as path from 'path';
import { ParseFormDataJsonPipe } from '../../common/pipes/parse.data.pipe';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/request/update-user.dto';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt-admin'))
  @Get()
  async getAllUser(
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ): Promise<ApiResponse> {
    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;
    const listUsers = await this.userService.getUsers(skipNum, limitNum);
    return ApiResponse.success(
      listUsers,
      'Get users successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get('filter')
  async getUsersByFilter(
    @Query('key') key: string,
    @Query('value') value: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ): Promise<ApiResponse> {
    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;
    const listUsers = await this.userService.getUsersFilter(
      key,
      value,
      skipNum,
      limitNum,
    );
    if (listUsers?.total === 0) {
      return ApiResponse.message('No data', HttpStatus.OK);
    }
    return ApiResponse.success(listUsers, 'Get users successfully!');
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('me')
  async getProfile(@ReqDecorator() req: Request): Promise<ApiResponse> {
    const userId = req.user['userId'];
    const user = await this.userService.getDetail(userId);

    return ApiResponse.success(user, 'Get user successfully!', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get(':userId')
  async getDetailUser(@Param('userId') userId: number): Promise<ApiResponse> {
    const user = await this.userService.getDetail(userId);

    return ApiResponse.success(user, 'Get user successfully!', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('avt', {
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3, // 3MB
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(null, false); // Reject file
        }
      },
    }),
  )
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body(ParseFormDataJsonPipe) createUserDto: CreateUserDto,
  ): Promise<ApiResponse> {
    if (!file) {
      throw new BadRequestException(
        'File không hợp lệ! Chỉ chấp nhận: jpg, jpeg, png, gif',
      );
    }
    const user = await this.userService.create(createUserDto, file);

    return ApiResponse.success(
      user,
      'Create user successfully',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Patch('update-profile')
  @UseInterceptors(
    FileInterceptor('avt', {
      storage,
      limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  async updateProfile(
    @ReqDecorator() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const userId = req.user['userId'];
    const updatedUser = await this.userService.update(
      userId,
      updateUserDto,
      file,
    );
    return ApiResponse.success(
      updatedUser,
      'Update successfully!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('avt', {
      storage,
      limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(extname)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse> {
    const updatedUser = await this.userService.update(id, updateUserDto, file);
    return ApiResponse.success(
      updatedUser,
      'Update successfully!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<ApiResponse> {
    await this.userService.delete(id);
    return ApiResponse.message('Delete user successfully', HttpStatus.OK);
  }
}
