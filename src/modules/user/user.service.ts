import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UserEntity } from '../../models/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MinioService } from '../../common/bases/minio.service';
import { ImageEntity } from '../../models/image.entity';
import { ICreateResponse } from './dto/response/create-response';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { IFilterUsersResponse, IGetUserResponse } from './dto/response/get-user-response';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    private readonly minioService: MinioService,
  ) {}

  async findUserByUsername(username: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ username: username });
  }

  async create(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<ICreateResponse> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
        { phone: createUserDto.phone },
      ],
    });
    if (existingUser && existingUser !== null) {
      if (existingUser.username === createUserDto.username) {
        throw new BadRequestException('Username already exists!');
      }
      if (existingUser.email === createUserDto.email) {
        throw new BadRequestException('Email already exists!');
      }
      if (existingUser.phone === createUserDto.phone) {
        throw new BadRequestException('Phone already exists!');
      }
    }

    const resultMinio = await this.minioService.uploadFile(
      file,
      process.env.BUCKET_NAME,
      file.originalname,
    );

    const bucketName = process.env.BUCKET_NAME;
    const objectKey = file.originalname;

    const avatarUrl = await this.minioService.getPresignedUrl(
      bucketName,
      objectKey,
    );
    const user = await this.userRepository.save(createUserDto);

    await this.imageRepository.save({
      url: resultMinio.url,
      filename: file.originalname,
      imageable_type: 'user',
      imageable_id: user.id,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      gender: user.gender ? user.gender : '',
      email: user.email,
      phone: user.phone,
      password: user.password,
      birthDate: user.birthDate ? user.birthDate : '',
      height: user.height ? user.height : null,
      weight: user.weight ? user.weight : null,
      eyeColor: user.eyeColor ? user.eyeColor : '',
      hairColor: user.hairColor ? user.hairColor : '',
      hairType: user.hairType ? user.hairType : '',
      address_address: user.address_address ? user.address_address : '',
      address_city: user.address_city ? user.address_city : '',
      address_state: user.address_state ? user.address_state : '',
      address_stateCode: user.address_stateCode ? user.address_stateCode : '',
      address_lat: user.address_lat ? user.address_lat : null,
      address_lng: user.address_lng ? user.address_lng : null,
      address_country: user.address_country ? user.address_country : '',
      image: avatarUrl ? avatarUrl : '',
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existing = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existing) throw new BadRequestException('Username already exists');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) throw new BadRequestException('Email already exists');
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existing = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      if (existing) throw new BadRequestException('Phone already exists');
    }

    if (file) {
      const resultMinio = await this.minioService.uploadFile(
        file,
        process.env.BUCKET_NAME,
        file.originalname,
      );

      // Kiểm tra có ảnh cũ chưa (nếu chưa có thì thêm mới)
      const existingImage = await this.imageRepository.findOne({
        where: {
          imageable_type: 'user',
          imageable_id: user.id,
        },
      });

      if (existingImage) {
        // Nếu đã có thì update
        await this.imageRepository.update(
          { imageable_type: 'user', imageable_id: user.id },
          {
            url: resultMinio.url,
            filename: file.originalname,
          },
        );
      } else {
        // Nếu chưa có thì tạo mới
        await this.imageRepository.save({
          url: resultMinio.url,
          filename: file.originalname,
          imageable_type: 'user',
          imageable_id: user.id,
        });
      }
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async delete(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userRepository.remove(user);
  }

  async getUsers(skip = 0, limit = 10): Promise<any> {
    const [listUsers, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });
    const bucketName = process.env.BUCKET_NAME;

    const usersWithImages = await Promise.all(
      listUsers.map(async (user) => {
        const image = await this.imageRepository.findOneBy({
          imageable_id: user.id,
          imageable_type: 'user',
        });

        let imageUrl = null;
        if (image) {
          imageUrl = await this.minioService.getPresignedUrl(
            bucketName,
            image.filename,
          );
        }

        return {
          ...user,
          image: null,
        };
      }),
    );

    return {
      total,
      skip,
      limit,
      users: usersWithImages,
    };
  }

  async getDetail(userId: number): Promise<any> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found!');
    }
    const bucketName = process.env.BUCKET_NAME;
    const image = await this.imageRepository.findOneBy({
      imageable_id: userId,
      imageable_type: 'user',
    });
    if (image) {
      const objectKey = image.filename;
      const keyUrl = await this.minioService.getPresignedUrl(
        bucketName,
        objectKey,
      );
      return {
        ...user,
        image: keyUrl,
      };
    }
    return {
      ...user,
      image: '',
    };
  }

  async getUsersFilter(
    keyFilter: string,
    valueFilter: string,
    skip = 0,
    limit = 10,
  ): Promise<IFilterUsersResponse> {
    if (keyFilter.includes('.')) {
      keyFilter = keyFilter.replace('.', '_');
    }
    try {
      const [users, total] = await this.userRepository
        .createQueryBuilder('user')
        .where(`user.${keyFilter} = :searchValue`, { searchValue: valueFilter })
        .skip(skip)
        .limit(limit)
        .getManyAndCount();

      const bucketName = process.env.BUCKET_NAME;

      const usersWithImages = await Promise.all(
        users.map(async (user) => {
          const image = await this.imageRepository.findOneBy({
            imageable_id: user.id,
            imageable_type: 'user',
          });

          let imageUrl: string | null = null;
          if (image) {
            try {
              imageUrl = await this.minioService.getPresignedUrl(
                bucketName,
                image.filename,
              );
            } catch (imageError) {
              console.error(`Failed to get presigned URL for user ID ${user.id}:`, imageError.message);
            }
          } 
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            gender: user.gender,
            email: user.email,
            phone: user.phone,
            password: user.password,
            birthDate: user.birthDate.toString(), 
            height: user.height,
            weight: user.weight,
            eyeColor: user.eyeColor,
            hairColor: user.hairColor,
            hairType: user.hairType,
            address_address: user.address_address,
            address_city: user.address_city,
            address_state: user.address_state,
            address_stateCode: user.address_stateCode,
            address_lat: user.address_lat,
            address_lng: user.address_lng,
            address_country: user.address_country,
            image: imageUrl,
          };
        }),
      );

      return {
        total,
        skip,
        limit,
        users: usersWithImages,
      };

     
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('An unknown error occurred!');
    }
  }
}
