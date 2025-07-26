import {
  Controller,
  Post,
  UseGuards,
  Req,
  HttpStatus,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartRequestDto } from './dto/request/add-cart-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiResponse } from '../../common/bases/api.response';
import { UpdateCartRequestDto } from './dto/request/update-cart-request.dto';
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard('jwt-access'))
  @Post()
  async addProductToCart(
    @Req() req: Request,
    @Body() addProductRequest: AddCartRequestDto,
  ): Promise<ApiResponse> {
    const userId = req.user['userId'];
    await this.cartService.addProductToCart(userId, addProductRequest);
    return ApiResponse.message(
      'Add product to cart successfully!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
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

  @UseGuards(AuthGuard('jwt-access'))
  @Get('my-cart')
  async getMyCart(@Req() req: Request): Promise<ApiResponse> {
    const userId = req.user['userId'];
    const cartUser = await this.cartService.getCartByUserId(userId);
    if (cartUser.length === 0) {
      return ApiResponse.message('Cart is empty!', HttpStatus.OK);
    }
    return ApiResponse.success(
      cartUser,
      'Get cart successfully!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get('user/:userId')
  async getCartByUser(@Param('userId') userId: string): Promise<ApiResponse> {
    const cartUser = await this.cartService.getCartByUserId(parseInt(userId));
    if (cartUser.length === 0) {
      return ApiResponse.message('Cart is empty!', HttpStatus.OK);
    }
    return ApiResponse.success(
      cartUser,
      'Get cart user success!',
      HttpStatus.OK,
    );
  }

  @UseGuards(AuthGuard('jwt-admin'))
  @Get(':id')
  async getSingleCart(@Param('id') id: string): Promise<ApiResponse> {
    const cartId = parseInt(id);
    const data = await this.cartService.getSingleCart(cartId);
    if (data.length === 0) {
      return ApiResponse.message('Cart empty!', HttpStatus.OK);
    }
    return ApiResponse.success(
      data,
      'Get single cart successfully!',
      HttpStatus.OK,
    );
  }
  @UseGuards(AuthGuard('jwt-access'))
  @Patch()
  async updateCart(
    @Req() req: Request,
    @Body() updateCartRequest: UpdateCartRequestDto,
  ): Promise<ApiResponse> {
    const userId = req.user['userId'];
    await this.cartService.updateCart(userId, updateCartRequest);
    return ApiResponse.message('Cập nhật giỏ hàng thành công!', HttpStatus.OK);
  }

  @Delete(":id")
  async deleteCart(@Param("id") id: string){
    await this.cartService.deleteCart(Number(id));
    return ApiResponse.message("Delete cart successfully!", HttpStatus.OK)
  }
}
