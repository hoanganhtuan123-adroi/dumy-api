import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpStatus,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { addProductRequestDto } from './dto/request/add-product-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiResponse } from '../../common/bases/api.response';
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post()
  async addProductToCart(
    @Req() req: Request,
    @Body() addProductRequest: addProductRequestDto,
  ): Promise<ApiResponse> {
    const userId = req.user['userId'];
    await this.cartService.addProductToCart(userId, addProductRequest);
    return ApiResponse.message(
      'Add product to cart successfully!',
      HttpStatus.OK,
    );
  }

  @Get()
  async getAllCarts(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ): Promise<ApiResponse> { 
    const limitNum = parseInt(limit) || 10;
    const skipNum = parseInt(skip) || 0;
    const carts = await this.cartService.getAllCarts(skipNum, limitNum);
    return ApiResponse.success(
      carts,
      'Get all carts successfully!',
      HttpStatus.OK,
    );
  }
}
