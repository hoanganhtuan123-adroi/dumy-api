import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  HttpStatus,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  Patch,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { RecipeService } from './recipe.service';
import { CreateRecipeRequestDto } from './dto/request/create-recipe-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../common/bases/api.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from '../../common/bases/oss';
import * as path from 'path';
import { UpdateRecipeRequestDto } from './dto/request/update-recipe-request.dto';
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      limits: {
        fileSize: 1024 * 1024 * 3, // 3MB
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (allowedExtensions.includes(extname)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(`Invalid file type: ${extname}`),
            false,
          );
        }
      },
    }),
  )
  @Post()
  async addRecipe(
    @UploadedFile() file: Express.Multer.File,
    @Body() addRecipeRequest: CreateRecipeRequestDto,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    const userId = req.user['userId'];
    const data = await this.recipeService.addRecipe(
      addRecipeRequest,
      userId,
      file,
    );
    if (!data) throw new Error();
    return ApiResponse.message(
      'Create recipe successfully!',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      limits: {
        fileSize: 1024 * 1024 * 3, // 3MB
      },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (allowedExtensions.includes(extname)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(`Invalid file type: ${extname}`),
            false,
          );
        }
      },
    }),
  )
  @Patch(':id')
  async updateRecipe(
    @Body() updateRequestDto: UpdateRecipeRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const recipeId = Number(id);
    if (isNaN(recipeId))
      throw new BadRequestException('Recipe id must be a number!');
    const userId = req.user['userId'];
    await this.recipeService.updateRecipe(
      updateRequestDto,
      file,
      userId,
      recipeId,
    );
    return ApiResponse.message('Update successfully!', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Delete(':id')
  async deleteRecipe(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ApiResponse> {
    const userId = req.user['userId'];
    const recipeId = Number(id);
    if (isNaN(recipeId)) throw new BadRequestException('Invalid recipe id');
    await this.recipeService.deleteRecipe(recipeId, userId);
    return ApiResponse.message('Delete recipe successfully!', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get()
  async getAllRecipes(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ): Promise<ApiResponse> {
    const limitNum = Number(limit) || 10;
    const skipNum = Number(skip) || 0;
    const data = await this.recipeService.getAllRecipes(
      limitNum,
      skipNum,
      sortBy,
      order,
    );
    return ApiResponse.success(data, 'Get all recipes  successfully!');
  }

  @Get('meal-type/:key')
  async getReicpesByMealType(@Param('key') key: string) : Promise<ApiResponse> {
    const data = await this.recipeService.getReicpesByMealType(key);
    return ApiResponse.success(data, 'Get recipes by meal type successfully!');
  }

  @Get('search')
  async searchRecipes(@Query('q') q: string): Promise<ApiResponse> {
    const data = await this.recipeService.searchRecipes(q);
    return ApiResponse.success(data, 'Get recipe successfully');
  }

  @Get('tags')
  async getAllRecipesTags(): Promise<ApiResponse> {
    const data = await this.recipeService.getAllRecipesTags();
    return ApiResponse.success(data, 'Get all recipe tags successfully');
  }

  @Get('tags/:tag')
  async getRecipesByTags(@Param('tag') tag: string): Promise<ApiResponse> {
    const data = await this.recipeService.getRecipesByTag(tag);
    return ApiResponse.success(data, 'Get recipes by tag successfully');
  }

  @Get(':id')
  async getSingleRecipe(@Param('id') id: string): Promise<ApiResponse> {
    const recipeId = Number(id);
    if (isNaN(recipeId))
      throw new BadRequestException('Recipe id is not valid');
    const data = await this.recipeService.getSingleRecipe(recipeId);
    return ApiResponse.success(data, 'Get single recipe successfully!');
  }
}
