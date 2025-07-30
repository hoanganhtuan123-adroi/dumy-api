import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../models/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto, CreateUserDto } from './dto/user-request.dto';

import {
  IDeleteUserResponse,
  IUserSingleResponse,
  IGetUsersResponse,
  IUserResponse,
} from './dto/user-response.dto';
import { ImageService } from '../image/image.service';
import { ENTITY_TYPE } from '../../common/constants/entity-types';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly imageService: ImageService,
  ) {}

  async findUserByUsername(username: string): Promise<IUserResponse> {
    return await this.userRepository.findOneBy({ username: username });
  }

  async createUser(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<IUserSingleResponse> {
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
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(createUserDto.password, salt);
    createUserDto.password = hashPassword;
    const user = await this.userRepository.save(createUserDto);

    await this.imageService.uploadImage(
      {
        imageable_id: user.id,
        imageable_type: 'user',
        filename: file.originalname,
      },
      file,
    );

    const image = await this.imageService.findImageById(
      user.id,
      ENTITY_TYPE.USER,
    );

    const avatar = image[0].url;

    const data = {
      user: { ...user, image: avatar },
    };

    return data;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<IUserSingleResponse> {
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
      await this.imageService.updateImagesForEntity(user.id, ENTITY_TYPE.USER, [
        file,
      ]);
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    await this.userRepository.save(updatedUser);
    const data = { user: updatedUser };
    return data;
  }

  async deleteUser(id: number): Promise<IDeleteUserResponse> {
    const user = await this.userRepository.findOneBy({ id });
    console.log(user);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.userRepository.remove(user);
    const data = { idDeleted: id, deletedAt: new Date() };
    return data;
  }

  async getAllUsers(skip = 0, limit = 10): Promise<IGetUsersResponse> {
    const [listUsers, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });
    const userIds = listUsers.map((user) => user.id);

    const usersWithImages = await this.imageService.getAllImages(
      userIds,
      ENTITY_TYPE.USER,
    );

    const userWithFullData = listUsers.map((user) => {
      const images = usersWithImages[user.id.toString()] || [];
      return {
        ...user,
        image: images[0] || '',
      };
    });

    const data = { users: userWithFullData, total, limit, skip };
    return data;
  }

  async getDetail(userId: number): Promise<IUserSingleResponse> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const images = await this.imageService.findImageById(
      user.id,
      ENTITY_TYPE.USER,
    );

    const url = images.length > 0 ? images[0].url : '';
    const data = { user: { ...user, image: url } };
    return data;
  }

  async getUsersFilter(
    keyFilter: string,
    valueFilter: string,
    skip = 0,
    limit = 10,
  ): Promise<IGetUsersResponse> {
    if (keyFilter.includes('.')) {
      keyFilter = keyFilter.replace('.', '_');
    }
    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .where(`user.${keyFilter} = :searchValue`, { searchValue: valueFilter })
      .skip(skip)
      .limit(limit)
      .getManyAndCount();

    const userIds = users.map((user) => user.id);
    const userImage = await this.imageService.findAllImagesByIds(
      userIds,
      ENTITY_TYPE.USER,
    );
    const userWithFullData = users.map((user) => {
      const images = userImage[user.id.toString()] || [];
      return {
        ...user,
        image: images[0] || '',
      };
    });

    const data = { users: userWithFullData, total, limit, skip };
    return data;
  }

  async findUserById(userId: number): Promise<IUserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found!');
    return { ...user, birthDate: user.birthDate };
  }
}
