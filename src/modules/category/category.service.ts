import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../../models/category.entity';
import { Repository } from 'typeorm';
import { ICategoryResponse } from './dto/response/get-categories.response';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findCategoryByName(categoryName: string) : Promise<ICategoryResponse> {
    let category = await this.categoryRepository.findOne({
      where: { name: categoryName },
    });

     if (!category) {
      const slug = categoryName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      category = this.categoryRepository.create({
        name: categoryName,
        slug,
        url: `/products/category/${slug}`,
      });
      await this.categoryRepository.save(category);
    }
    return category;
  }

  async getAllCategories(): Promise<ICategoryResponse[]> {
    const categories = await this.categoryRepository.find();
 
    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
      url: category.url,
    }));
  }

  async getListCategories(): Promise<string[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .select(['category.slug'])
      .getMany();
    return categories.map((category) => category.slug);
  }

  
}
