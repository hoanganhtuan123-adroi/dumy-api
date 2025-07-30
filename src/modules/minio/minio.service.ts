import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import * as fs from 'fs/promises';

@Injectable()
export class MinioService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT,
      region: process.env.MINIO_REGION,
      credentials: {
        accessKeyId: process.env.MINIO_AccessKeyId,
        secretAccessKey: process.env.MINIO_SecretAccessKey,
      },
      forcePathStyle: true, 
    });
  }

  async uploadFile(file: Express.Multer.File, bucketName: string, key: string) {
    try {
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      } catch {
        await this.s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      }
      const fileBuffer = file.buffer;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);

      await fs.unlink(file.path).catch(() => {});
    
      return {url: `http://localhost:9000/${process.env.BUCKET_NAME}/${file.originalname}`};
    } catch (error) {
      console.error('Error uploading file to MinIO:', error);
      throw error;
    }
  }

  async getPresignedUrl(bucket: string, key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: Number(process.env.MINIO_EXP_URL),
    });
    return url;
  }

  async deleteFile(bucketName: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await this.s3.send(command);
  }
}
