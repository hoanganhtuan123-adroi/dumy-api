import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RecipeEntity } from '../../models/recipe.entity';
import { In, Like, Repository } from 'typeorm';
import { CreateRecipeRequestDto } from './dto/request/create-recipe-request.dto';
import { UserService } from '../user/user.service';
import {
  IGetRecipesResponseDto,
  IRecipeAddResponseDto,
  IRecipeResponseDto,
} from './dto/response/recipe-response.dto';
import { ImageService } from '../image/image.service';
import { UploadRequestDto } from '../image/dto/upload-request.dto';
import { UpdateRecipeRequestDto } from './dto/request/update-recipe-request.dto';
import { ImageEntity } from '../../models/image.entity';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,

    private readonly userService: UserService,
    private readonly imageService: ImageService,
  ) {}

  async addRecipe(
    addRequest: CreateRecipeRequestDto,
    userId: number,
    file: Express.Multer.File,
  ): Promise<IRecipeAddResponseDto> {
    const user = await this.userService.findUserById(userId);
    const recipe = this.recipeRepository.create({ ...addRequest, user: user });
    const savedRecipe = await this.recipeRepository.save(recipe);
    const uploadRequestDto: UploadRequestDto = {
      imageable_id: savedRecipe.id,
      imageable_type: 'recipe',
      url: '',
      filename: '',
    };
    await this.imageService.uploadImage(uploadRequestDto, file);

    return savedRecipe;
  }

  async updateRecipe(
    updateRequestDto: UpdateRecipeRequestDto,
    file: Express.Multer.File,
    userId: number,
    recipeId: number,
  ): Promise<void> {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId, user: { id: userId } },
    });
    if (recipe === null) throw new NotFoundException('Recipe not found');
    const hasDataUpdate = Object.keys(updateRequestDto).length > 0;
    if (hasDataUpdate) {
      await this.recipeRepository
        .createQueryBuilder()
        .update('recipes')
        .set({
          ...updateRequestDto,
        })
        .where('id = :id', { id: recipeId })
        .execute();
    } else if (!file)
      throw new BadRequestException('No data or file provided for update');

    if (file)
      await this.imageService.updateImagesForEntity(recipeId, 'recipe', [file]);
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId, user: { id: userId } },
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    await this.imageService.deleteImage(recipeId, 'recipe');
    await this.recipeRepository.delete(recipeId);
  }

  async getAllRecipes(
    limit: number,
    skip: number,
    sortBy?: string,
    orderBy?: string,
  ): Promise<IGetRecipesResponseDto> {
    const findOptions: any = {
      relations: ['user'],
      skip,
      take: limit,
    };

    if (sortBy && orderBy) {
      const column = this.recipeRepository.metadata.columns.map(
        (col) => col.propertyName,
      );
      if (column.includes(sortBy)) {
        findOptions.order = { [sortBy]: orderBy };
      } else {
        throw new BadRequestException(`Can not sort by column ${sortBy}`);
      }
    }

    const [recipes, total] =
      await this.recipeRepository.findAndCount(findOptions);

    const recipeIds = recipes.map((recipe) => recipe.id);
    const images = await this.imageService.findAllImagesByIds(
      recipeIds,
      'recipe',
    );

    let mappedImages: Record<string, string> = images.reduce((acc, image) => {
      if (!acc[image.id]) {
        acc[image.id] = image.url;
      }
      return acc;
    }, {});

    const mappedData = this.mapToRecipeResponse(recipes, mappedImages);

    return {
      total,
      limit,
      skip,
      data: mappedData,
    };
  }

  async searchRecipes(q: string): Promise<IGetRecipesResponseDto> {
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { name: Like(`%${q.trim()}%`) },
      relations: ['user'],
    });
    const limit = total;
    const skip = 0;
    if (recipes.length === 0) throw new NotFoundException('Not found recipe');
    const recipeIds = recipes.map((recipe) => recipe.id);
    const images = await this.imageService.findAllImagesByIds(
      recipeIds,
      'recipe',
    );

    let mappedImages: Record<string, string> = images.reduce((acc, image) => {
      if (!acc[image.id]) {
        acc[image.id] = image.url;
      }
      return acc;
    }, {});

    const mappedData = this.mapToRecipeResponse(recipes, mappedImages);

    return {
      total,
      limit,
      skip,
      data: mappedData,
    };
  }

  async getSingleRecipe(recipeId: number): Promise<IRecipeResponseDto> {
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
      relations: ['user'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found!');
    const image = await this.imageService.findImageById(recipeId, 'recipe');
    let imageUrl = '';
    if (image.length > 0) {
      imageUrl = image[0].url;
    }

    const data: IRecipeResponseDto = {
      id: recipe.id,
      name: recipe.name,
      userId: recipe.user.id,
      ingredients: this.normalizeStringArray(recipe.ingredients),
      instructions: this.normalizeStringArray(recipe.instructions),
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      serving: recipe.serving,
      difficult: recipe.difficult,
      cuisine: recipe.cuisine,
      caloriesPerServing: recipe.caloriesPerServing,
      tags: this.normalizeStringArray(recipe.tags),
      rating: recipe.rating,
      reviewCount: recipe.reviewCount,
      mealType: this.normalizeStringArray(recipe.mealType),
      image: imageUrl,
    };
    return data;
  }

  async getAllRecipesTags(): Promise<string[]> {
    const recipes = await this.recipeRepository.find();
    const allTags = recipes
      .flatMap((recipe) => recipe.tags.split(','))
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags;
  }

  async getRecipesByTag(tag: string): Promise<IGetRecipesResponseDto> {
    const tagValue = tag.toLowerCase();
    const qb = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('LOWER(recipe.tags) LIKE :tag', { tag: `%${tagValue}%` });

    const [recipes, total] = await qb.getManyAndCount();

    const recipeIds = recipes.map((recipe) => recipe.id);
    const images = await this.imageService.findAllImagesByIds(
      recipeIds,
      'recipe',
    );
    let mappedImages: Record<string, string> = images.reduce((acc, image) => {
      if (!acc[image.id]) acc[image.id] = image.url;
      return acc;
    }, {});

    const mappedData = this.mapToRecipeResponse(recipes, mappedImages);

    return {
      total,
      limit: total,
      skip: 0,
      data: mappedData,
    };
  }

  async getReicpesByMealType(key: string): Promise<IGetRecipesResponseDto> {
    const [recipes, total] = await this.recipeRepository.findAndCount({
      relations: ['user'],
      where: { mealType: Like(`%${key}%`) },
    });

    const recipeIds = recipes.map((recipe) => recipe.id);
    const images = await this.imageService.findAllImagesByIds(
      recipeIds,
      'recipe',
    );

    let mappedImages: Record<string, string> = images.reduce((acc, image) => {
      if (!acc[image.id]) {
        acc[image.id] = image.url;
      }
      return acc;
    }, {});

    const mappedData = this.mapToRecipeResponse(recipes, mappedImages);

    return {
      total,
      limit: total,
      skip: 0,
      data: mappedData,
    };
  }

  private mapToRecipeResponse(
    recipes: RecipeEntity[],
    images: Record<string, string>,
  ): IRecipeResponseDto[] {
    const data = recipes.map((recipe) => {
      const imageUrl = images[recipe.id.toString()];
      return {
        id: recipe.id,
        name: recipe.name,
        userId: recipe.user.id,
        ingredients: this.normalizeStringArray(recipe.ingredients),
        instructions: this.normalizeStringArray(recipe.instructions),
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        serving: recipe.serving,
        difficult: recipe.difficult,
        cuisine: recipe.cuisine,
        caloriesPerServing: recipe.caloriesPerServing,
        tags: this.normalizeStringArray(recipe.tags),
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        mealType: this.normalizeStringArray(recipe.mealType),
        image: imageUrl || '',
      };
    });

    return data;
  }

  private normalizeStringArray = (items: string): string[] => {
    return items
      .split(/[,;.]/)
      .map((item) => item.trim())
      .filter((item) => item !== '');
  };
}
