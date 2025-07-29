import { ReviewService } from './../review/review.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../models/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from '../../models/review.entity';
import { ImageEntity } from '../../models/image.entity';
import { CreateProductDto } from './dto/request/create-product-dto';
import {
  ProductListResponse,
  ProductResponse,
} from './dto/response/get-product-dto';
import CommonMethods from '../../common/bases/common-method';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { Review } from '../review/dto/response/review-response.dto';
import { ImageService } from '../image/image.service';
import { UploadRequestDto } from '../image/dto/upload-request.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @Inject(forwardRef(()=> ReviewService))
    private readonly reviewService: ReviewService,

    private readonly imageService: ImageService,

    private readonly categoryService: CategoryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      const isExistingProduct = await this.productRepository.findOne({
        where: {
          sku: createProductDto.sku,
        },
      });

      if (isExistingProduct) {
        throw new BadRequestException('Product with sku already exists');
      }

      const { category: categoryName, ...productData } = createProductDto;

      const category =
        await this.categoryService.findCategoryByName(categoryName);

      const product = await this.productRepository.save({
        ...productData,
        category,
      });

      const filesReceived = Array.isArray(files) ? files : [files];

      filesReceived.map(async (file: any) => {
        const uploadRequestDto: UploadRequestDto =
          CommonMethods.mapToImageRequest(product.id, 'product');
        await this.imageService.uploadImage(uploadRequestDto, file);
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllProducts(skip = 0, limit = 10): Promise<ProductListResponse> {
    const [listProducts, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      relations: ['category', 'reviews'],
    });

    const productsWithImages = await this.mapProductsToResponse(
      listProducts,
      true,
    );

    return {
      total,
      skip,
      limit,
      products: productsWithImages,
    };
  }

  async searchProducts(
    q: string,
    skip = 0,
    limit = 10,
  ): Promise<ProductListResponse> {
    const [listProducts, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.title LIKE :q', { q: `%${q}%` })
      .orWhere('product.description LIKE :q', { q: `%${q}%` })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const productsWithImages = await this.mapProductsToResponse(
      listProducts,
      true,
    );

    return {
      total,
      skip,
      limit,
      products: productsWithImages,
    };
  }

  async getDetailProduct(id: number): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['category'],
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    const mappedProducts = await this.mapProductsToResponse([product], true);
    return mappedProducts[0];
  }

  async getAllCategories() {
    const categories = await this.categoryService.getAllCategories();
    return categories;
  }

  async getListCategories(): Promise<string[]> {
    const categories = await this.categoryService.getListCategories();
    return categories;
  }

  async getProductsByCategory(
    slug: string,
    limit: number,
    skip: number,
  ): Promise<ProductListResponse> {
    const [products, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('category.slug = :slug', { slug })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const productsWithImages = await this.mapProductsToResponse(products, true);

    return {
      total,
      skip,
      limit,
      products: productsWithImages,
    };
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: id },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    await this.imageService.deleteImage(id, 'product');

    await this.reviewService.deleteReviewByProduct(product);

    await this.productRepository.delete(id);
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const { category: categoryName, ...productData } = updateProductDto;

    const category =
      await this.categoryService.findCategoryByName(categoryName);

    if (files && files.length > 0) {
      await this.imageService.updateImagesForEntity(id, 'product', files);
    }

    await this.productRepository.update(id, {
      ...productData,
      category,
    });
  }

  async sortProducts(
    limit: number,
    skip: number,
    sortBy: string,
    order: string,
  ): Promise<ProductListResponse> {
    const [listProducts, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy(`product.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .limit(limit)
      .getManyAndCount();

    const productsWithImages = await this.mapProductsToResponse(
      listProducts,
      true,
    );

    return {
      total,
      skip,
      limit,
      products: productsWithImages,
    };
  }

  async findProductById(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async mapProductsToResponse(
    listProducts: ProductEntity[],
    includeReviews: boolean = true,
  ): Promise<ProductResponse[]> {
    if (listProducts.length === 0) {
      return [];
    }

    const productIds = listProducts.map((p) => p.id);

    const allImages = await this.imageService.findAllImagesByIds(
      productIds,
      'product',
    );

    const imagesByProduct = allImages.reduce(
      (acc, image) => {
        if (!acc[image.imageable_id]) {
          acc[image.imageable_id] = [];
        }
        acc[image.imageable_id].push(image);
        return acc;
      },
      {} as Record<number, ImageEntity[]>,
    );

    const productsWithMappedData = await Promise.all(
      listProducts.map(async (product) => {
        const productImages = imagesByProduct[product.id] || [];

        const imageUrls = await Promise.all(
          productImages.map((image) => image.url),
        );

        let mappedReviews: Review[] = [];
        if (includeReviews && product.reviews) {
          mappedReviews = product.reviews.map((r) => ({
            id: r.id,
            comment: r.comment,
            rating: r.rating,
            date: r.date,
            reviewer_name: r.reviewer_name,
            reviewer_email: r.reviewer_email,
          }));
        }

        return {
          ...product,
          category: product?.category?.name,
          image: imageUrls,
          reviews: mappedReviews,
        } as ProductResponse;
      }),
    );

    return productsWithMappedData;
  }
}
