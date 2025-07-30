import {
  Controller,
  Post,
  Body,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from './dto/request/auth.request';
import { ApiResponse } from '../../common/bases/api.response';
import { RegisterAccountRequest } from './dto/request/register.request';
import { AuthException } from '../../exception/custom-exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authRequest: AuthRequest): Promise<ApiResponse> {
    const user = await this.authService.login(authRequest);
    return ApiResponse.success(user, 'Login successfully', 1000);
  }

  @Post('refresh-token')
  async refreshToken(
    @Headers('x-refresh-token') refreshToken: string,
  ): Promise<ApiResponse> {
    if (!refreshToken) {
      throw new AuthException();
    }
    const accessToken = await this.authService.checkRefreshToken(refreshToken);
    return ApiResponse.success(
      accessToken,
      'Access token refreshed',
      1000,
    );
  }

  @Post('register')
  async register(
    @Body() registerAccount: RegisterAccountRequest,
  ): Promise<ApiResponse> {
    await this.authService.register(registerAccount);
    return ApiResponse.message('Register successfully', 1000);
  }
}
