import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from './dto/request/auth.request';
import { ApiResponse } from '../../common/bases/api.response';
import { RegisterAccountRequest } from './dto/request/register.request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authRequest: AuthRequest): Promise<ApiResponse> {
    const user = await this.authService.login(authRequest);
    return ApiResponse.success(user, 'Login successfully', HttpStatus.CREATED);
  }

  @Post('refresh-token')
  async refreshToken(
    @Headers('x-refresh-token') refreshToken: string,
  ): Promise<ApiResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const accessToken = await this.authService.checkRefreshToken(refreshToken);
    return ApiResponse.success(
      accessToken,
      'Access token refreshed',
      HttpStatus.OK,
    );
  }

  @Post('register')
  async register(
    @Body() registerAccount: RegisterAccountRequest,
  ): Promise<ApiResponse> {
    await this.authService.register(registerAccount);
    return ApiResponse.message('Register successfully', HttpStatus.CREATED);
  }
}
