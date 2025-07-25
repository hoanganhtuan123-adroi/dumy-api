import { AuthRequest } from './dto/request/auth.request';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../../models/user.entity';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginResponse } from './dto/response/login.response';
import { JwtService } from '@nestjs/jwt';
import { TokenEntity } from '../../models/token.entity';
import { RegisterAccountRequest } from './dto/request/register.request';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,

    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(requestLogin: AuthRequest): Promise<LoginResponse> {
    const { username, password } = requestLogin;

    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Username or password is not correct!');
    }

    const access_token = (await this.generateAccessToken(user)).accessToken;
    const refresh_token = (await this.generateRefreshToken(user)).refreshToken;
    await this.saveRefreshToken(refresh_token, user);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      image: user.image,
      accessToken: access_token,
      refreshToken: refresh_token,
    } satisfies LoginResponse;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateAccessToken(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXP,
    });
    return { accessToken: access_token };
  }

  async generateRefreshToken(user: any) {
    const payload = { username: user.username, sub: user.id };
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXP,
    });
    return { refreshToken: refresh_token };
  }

  async saveRefreshToken(refresh_token: string, user: UserEntity) {
    const existingToken = await this.tokenRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (existingToken) {
      await this.tokenRepository.update(
        { user: { id: user.id } },
        { refreshToken: refresh_token },
      );
    } else {
      const token = new TokenEntity();
      token.refreshToken = refresh_token;
      token.user = user;
      await this.tokenRepository.save(token);
    }
  }

  async checkRefreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const userId = payload.sub;

      const tokenInDb = await this.tokenRepository.findOne({
        where: {
          user: { id: userId },
          refreshToken: refreshToken,
        },
        relations: ['user'],
      });

      if (!tokenInDb) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }
      const newAccessToken = this.jwtService.sign(
        {
          sub: tokenInDb.user.id,
          email: tokenInDb.user.email,
          role: tokenInDb.user.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      );
      return newAccessToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerRequest: RegisterAccountRequest) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: registerRequest.username },
        { email: registerRequest.email },
        { phone: registerRequest.phone },
      ],
    });

    if (existingUser) {
      if (existingUser.username === registerRequest.username) {
        throw new BadRequestException('Username already exists!');
      }
      if (existingUser.email === registerRequest.email) {
        throw new BadRequestException('Email already exists!');
      }
      if (existingUser.phone === registerRequest.phone) {
        throw new BadRequestException('Phone already exists!');
      }
    }

    const hashedPassword = bcrypt.hashSync(registerRequest.password, 10);
    registerRequest.password = hashedPassword;

    await this.userRepository.save(registerRequest);
  }
}
