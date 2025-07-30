import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from '../../models/image.entity';
import { In, Repository } from 'typeorm';
import { UploadRequestDto } from './dto/upload-request.dto';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    private readonly minioService: MinioService,
  ) {}

  async uploadImage(
    uploadRequest: UploadRequestDto,
    file: Express.Multer.File,
  ) {
    const minio = await this.minioService.uploadFile(
      file,
      process.env.BUCKET_NAME,
      file.originalname,
    );
    await this.imageRepository.save({
      ...uploadRequest,
      url: minio.url,
      filename: file.originalname,
    });
  }

  async updateImagesForEntity(
    imageableId: number,
    imageableType: string,
    newFiles: Express.Multer.File[],
  ): Promise<void> {
    const bucketName = process.env.BUCKET_NAME;

    const existingImages = await this.imageRepository.findBy({
      imageable_id: imageableId,
      imageable_type: imageableType,
    });

    if (existingImages.length > 0) {
      const deletePromises = existingImages.map(async (image) => {
        await Promise.all([
          this.minioService.deleteFile(bucketName, image.filename),
          this.imageRepository.delete(image.id),
        ]);
      });
      await Promise.all(deletePromises);
    }

    if (newFiles && newFiles.length > 0) {
      const uploadPromises = newFiles.map(async (file) => {
        const uploadResult = await this.minioService.uploadFile(
          file,
          bucketName,
          file.originalname,
        );

        const imageData: UploadRequestDto = {
          url: uploadResult.url,
          filename: file.originalname,
          imageable_id: imageableId,
          imageable_type: imageableType,
        };
        return this.imageRepository.save(imageData);
      });
      await Promise.all(uploadPromises);
    }
  }

  async findAllImagesByIds(ids: Number[], type: string) {
    const images = await this.imageRepository.findBy({
      imageable_id: In(ids),
      imageable_type: type,
    });
    return images;
  }

  async getAllImages(
    ids: number[],
    type: string
  ): Promise<Record<number, string[]>> {
    if (type.length === 0) return {};

    const allImages = await this.imageRepository.findBy({
      imageable_id: In(ids),
      imageable_type: type,
    });

    const images = allImages.reduce(
      (acc, image) => {
        if (!acc[image.imageable_id]) {
          acc[image.imageable_id] = [];
        }
        acc[image.imageable_id].push(image.url);
        return acc;
      },
      {} as Record<number, string[]>,
    );

    return images;
  }

  async findImageById(id: number, type: string) {
    const images = await this.imageRepository.findBy({
      imageable_id: id,
      imageable_type: type,
    });
    return images;
  }

  async deleteImage(id: number, type: string) {
    const images = await this.imageRepository.findBy({
      imageable_id: id,
      imageable_type: type,
    });

    for (const image of images) {
      await this.minioService.deleteFile(
        process.env.BUCKET_NAME,
        image.filename,
      );
    }

    await this.imageRepository.delete({
      imageable_id: id,
      imageable_type: type,
    });
  }
}
