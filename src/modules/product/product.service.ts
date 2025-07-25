import { MinioService } from './../../common/bases/minio.service';
import { BadRequestException, Injectable, UploadedFiles } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
import { CategoryEntity } from '../../models/category.entity';
import { ICategoryResponse } from './dto/response/get-categories.response';
import { UpdateProductDto } from './dto/request/update-product.dto';
import { Review } from '../review/dto/response/review-response.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,

    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    private readonly minioService: MinioService,
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

      let category = await this.categoryRepository.findOne({
        where: { name: categoryName },
      });

      if (!category) {
        category = this.categoryRepository.create({
          name: categoryName,
          slug: categoryName.replace(' ', '-').toLocaleLowerCase(),
          url: `/products/category/${categoryName.replace(' ', '-').toLocaleLowerCase()},`,
        });
        await this.categoryRepository.save(category);
      }

      const product = await this.productRepository.save({
        ...productData,
        category,
      });

      const filesReceived = Array.isArray(files) ? files : [files];

      filesReceived.map(async (file: any) => {
        const resultMinio = await this.minioService.uploadFile(
          file,
          process.env.BUCKET_NAME,
          file.originalname,
        );

        const image = new ImageEntity();
        image.url = resultMinio.url;
        image.filename = file.originalname;
        image.imageable_id = product.id;
        image.imageable_type = 'product';

        await this.imageRepository.save(image);
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

    const productIds = listProducts.map((p) => p.id);
    const allImages = await this.imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });

    const imagesByProduct = allImages.reduce((acc, image) => {
      if (!acc[image.imageable_id]) {
        acc[image.imageable_id] = [];
      }
      acc[image.imageable_id].push(image);
      return acc;
    }, {});

    const productsWithImages = await Promise.all(
      listProducts.map(async (product) => {
        const productImages = imagesByProduct[product.id] || [];
        const imageUrl = await Promise.all(
          productImages.map((image: any) =>
            CommonMethods.generateKeyImage(image, this.minioService),
          ),
        );

        const reviews: Review[] = (product.reviews || []).map((r) => ({
          id: r.id,
          comment: r.comment,
          rating: r.rating,
          date: r.date,
          reviewer_name: r.reviewer_name,
          reviewer_email: r.reviewer_email,
        }));

        return {
          ...product,
          category: product?.category?.name,
          image: imageUrl,
          reviews: reviews,
        };
      }),
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

    const productIds = listProducts.map((p) => p.id);
    const allImages = await this.imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });

    const imagesByProduct = allImages.reduce((acc, image) => {
      if (!acc[image.imageable_id]) {
        acc[image.imageable_id] = [];
      }
      acc[image.imageable_id].push(image);
      return acc;
    }, {});

    const productsWithImages = await Promise.all(
      listProducts.map(async (product) => {
        const productImages = imagesByProduct[product.id] || [];
        const imageUrl = await Promise.all(
          productImages.map((image) =>
            CommonMethods.generateKeyImage(image, this.minioService),
          ),
        );

        return {
          ...product,
          category: product?.category?.name,
          image: imageUrl,
          reviews: [],
        };
      }),
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

    const images = await this.imageRepository.findBy({
      imageable_id: product.id,
      imageable_type: 'product',
    });

    const listImages = await Promise.all(
      images.map((image) => {
        const urlImage = CommonMethods.generateKeyImage(
          image,
          this.minioService,
        );
        return urlImage;
      }),
    );
    const reviews = [];

    return {
      ...product,
      category: product?.category?.name,
      image: listImages,
      reviews: reviews,
    };
  }

  async getAllCategories(): Promise<ICategoryResponse[]> {
    const categories = await this.categoryRepository.find();
    console.log(categories);
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
    const productIds = products.map((p) => p.id);
    const allImages = await this.imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });
    const imagesByProduct = allImages.reduce((acc, image) => {
      if (!acc[image.imageable_id]) {
        acc[image.imageable_id] = [];
      }
      acc[image.imageable_id].push(image);
      return acc;
    }, {});
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const productImages = imagesByProduct[product.id] || [];
        const imageUrl = await Promise.all(
          productImages.map((image) =>
            CommonMethods.generateKeyImage(image, this.minioService),
          ),
        );

        return {
          ...product,
          category: product?.category?.name,
          image: imageUrl,
          reviews: [],
        };
      }),
    );

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

    const images = await this.imageRepository.findBy({
      imageable_id: id,
      imageable_type: 'product',
    });

    for (const image of images) {
      await this.minioService.deleteFile(
        process.env.BUCKET_NAME,
        image.filename,
      );
    }

    await this.imageRepository.delete({
      imageable_id: id,
      imageable_type: 'product',
    });
    await this.reviewRepository.delete({ product: product });

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

    if (files?.length > 0) {
      const filesArray = Array.isArray(files) ? files : [files];
      const existingImages = await this.imageRepository.findBy({
        imageable_id: id,
        imageable_type: 'product',
      });

      if (filesArray.length === 1) {
        const file = filesArray[0];
        const uploadResult = await this.minioService.uploadFile(
          file,
          process.env.BUCKET_NAME,
          file.originalname,
        );

        const imageData = {
          url: uploadResult.url,
          filename: file.originalname,
          imageable_id: id,
          imageable_type: 'product',
        };

        if (existingImages.length > 0) {
          await this.imageRepository.update(existingImages[0].id, imageData);

          if (existingImages.length > 1) {
            const deletePromises = existingImages
              .slice(1)
              .map(async (image) => {
                await Promise.all([
                  this.minioService.deleteFile(
                    process.env.BUCKET_NAME,
                    image.filename,
                  ),
                  this.imageRepository.delete(image.id),
                ]);
              });
            await Promise.all(deletePromises);
          }
        } else {
          await this.imageRepository.save(imageData);
        }
      } else {
        if (existingImages.length > 0) {
          const deletePromises = existingImages.map(async (image) => {
            await Promise.all([
              this.minioService.deleteFile(
                process.env.BUCKET_NAME,
                image.filename,
              ),
              this.imageRepository.delete(image.id),
            ]);
          });
          await Promise.all(deletePromises);
        }

        const uploadPromises = filesArray.map(async (file) => {
          const uploadResult = await this.minioService.uploadFile(
            file,
            process.env.BUCKET_NAME,
            file.originalname,
          );

          return this.imageRepository.save({
            url: uploadResult.url,
            filename: file.originalname,
            imageable_id: id,
            imageable_type: 'product',
          });
        });

        await Promise.all(uploadPromises);
      }
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

    const productIds = listProducts.map((p) => p.id);
    const allImages = await this.imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });

    const imagesByProduct = allImages.reduce((acc, image) => {
      if (!acc[image.imageable_id]) {
        acc[image.imageable_id] = [];
      }
      acc[image.imageable_id].push(image);
      return acc;
    }, {});

    const productsWithImages = await Promise.all(
      listProducts.map(async (product) => {
        const productImages = imagesByProduct[product.id] || [];
        const imageUrl = await Promise.all(
          productImages.map((image: ImageEntity) =>
            CommonMethods.generateKeyImage(image, this.minioService),
          ),
        );

        return {
          ...product,
          category: product?.category?.name,
          image: imageUrl,
          reviews: [],
        };
      }),
    );

    return {
      total,
      skip,
      limit,
      products: productsWithImages,
    };
  }
}
