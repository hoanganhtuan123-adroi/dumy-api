import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from '../../models/image.entity';
import { MinioService } from './minio.service';
import { In, Repository } from 'typeorm';

export default class CommonMethods {
  static async generateKeyImage(
    image: ImageEntity,
    minioService: MinioService,
  ): Promise<string> {
    const bucketName = process.env.BUCKET_NAME;
    const url = await minioService.getPresignedUrl(bucketName, image.filename);
    return url;
  }

  static async getProductImages(
    productIds: number[],
    imageRepository: Repository<ImageEntity>,
    minioService: MinioService,
  ): Promise<Record<number, string>> {
    if (productIds.length === 0) return {};

    const allImages = await imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });

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

    const imageUrlPromises = Object.entries(imagesByProduct).map(
      async ([productId, images]) => {
        const urls = await Promise.all(
          images.map((image: ImageEntity) =>
            CommonMethods.generateKeyImage(image, minioService),
          ),
        );
        return [parseInt(productId), urls || ''] as [number, string];
      },
    );

    const imageUrlResults = await Promise.all(imageUrlPromises);

    // Convert về object để lookup nhanh
    return imageUrlResults.reduce(
      (acc, [productId, thumbnail]) => {
        acc[productId] = thumbnail;
        return acc;
      },
      {} as Record<number, string>,
    );
  }

  static async getProductThumbnails(
    productIds: number[],
    imageRepository: Repository<ImageEntity>,
  ): Promise<Record<number, string>> {
    if (productIds.length === 0) return {};

    const allImages = await imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });

    const firstImageByProduct = allImages.reduce(
      (acc, image) => {
        if (!acc[image.imageable_id]) {
          acc[image.imageable_id] = image.url; // chỉ lấy ảnh đầu
        }
        return acc;
      },
      {} as Record<number, string>,
    );


    return firstImageByProduct;
  }

  static async getAllProductImages(
    productIds: number[],
    imageRepository: Repository<ImageEntity>,
  ): Promise<Record<number, string[]>> {
    if (productIds.length === 0) return {};

    const allImages = await imageRepository.findBy({
      imageable_id: In(productIds),
      imageable_type: 'product',
    });

    const imagesByProduct = allImages.reduce(
      (acc, image) => {
        if (!acc[image.imageable_id]) {
          acc[image.imageable_id] = [];
        }
        acc[image.imageable_id].push(image.url);
        return acc;
      },
      {} as Record<number, string[]>,
    );

    return imagesByProduct;
  }
}
