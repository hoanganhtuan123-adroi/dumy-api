import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/request/create-product-dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storage } from '../../common/bases/oss';
import path = require('path');
import { ApiResponse } from '../../common/bases/api.response';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProductDto } from './dto/request/update-product.dto';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @UseGuards(AuthGuard('jwt-admin'))
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage,
      limits: {
        fileSize: 1024 * 1024 * 4, // 4MB
        files: 10, // Giới hạn số lượng file
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
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiResponse> {
    await this.productService.create(createProductDto, files);
    return ApiResponse.message(
      'Product created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async getAllProducts(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ): Promise<ApiResponse> {
    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;
    const products = await this.productService.getAllProducts(
      skipNum,
      limitNum,
    );
    return ApiResponse.success(
      products,
      'Get all products successfully',
      HttpStatus.OK,
    );
  }

  @Get()
  async sortProducts(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: string,
  ): Promise<ApiResponse> {
    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;
    const products = await this.productService.sortProducts(
      limitNum,
      skipNum,
      sortBy,
      order,
    );
    if (products.total === 0) {
      return ApiResponse.message(
        'No products found for the given search term',
        HttpStatus.NOT_FOUND,
      );
    }
    return ApiResponse.success(
      products,
      'Search products successfully',
      HttpStatus.OK,
    );
  }

  @Get('search')
  async searchProducts(
    @Query('q') q: string,
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ): Promise<ApiResponse> {
    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;
    if (!q) {
      return ApiResponse.message(
        'Missing search parameter!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const products = await this.productService.searchProducts(
      q,
      skipNum,
      limitNum,
    );
    if (products.total === 0) {
      return ApiResponse.message(
        'No products found for the given search term',
        HttpStatus.NOT_FOUND,
      );
    }
    return ApiResponse.success(
      products,
      'Search products successfully',
      HttpStatus.OK,
    );
  }

  @Get('categories')
  async getAllCategories(): Promise<ApiResponse> {
    const categories = await this.productService.getAllCategories();
    return ApiResponse.success(
      categories,
      'Get all categories successfully',
      HttpStatus.OK,
    );
  }

  @Get('categories-list')
  async getListCategories(): Promise<ApiResponse> {
    const categories = await this.productService.getListCategories();
    return ApiResponse.success(
      categories,
      'Get all categories successfully',
      HttpStatus.OK,
    );
  }

  @Get('category/:slug')
  async getProductsByCategory(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
    @Param('slug') slug: string,
  ): Promise<ApiResponse> {
    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;
    const products = await this.productService.getProductsByCategory(
      slug,
      limitNum,
      skipNum,
    );
    return ApiResponse.success(
      products,
      'Get products by category successfully',
      HttpStatus.OK,
    );
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<ApiResponse> {
    const product = await this.productService.getDetailProduct(parseInt(id));
    return ApiResponse.success(
      product,
      'Get product detail successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<ApiResponse> {
    await this.productService.deleteProduct(parseInt(id));
    return ApiResponse.message('Product deleted successfully', HttpStatus.OK);
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage,
      limits: {
        fileSize: 1024 * 1024 * 4, // 4MB
        files: 10, // Giới hạn số lượng file
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
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponse> {
    await this.productService.updateProduct(
      parseInt(id),
      updateProductDto,
      files,
    );
    return ApiResponse.message('Product updated successfully', HttpStatus.OK);
  }
}
