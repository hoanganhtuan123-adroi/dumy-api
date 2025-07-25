import { BadRequestException, Injectable } from '@nestjs/common';
import { addProductRequestDto } from './dto/request/add-product-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '../../models/cart.entity';
import { In, Repository } from 'typeorm';
import { CartItemEntity } from '../../models/cart-item.entity';
import { ProductEntity } from '../../models/product.entity';
import { PaginatedCartResponse } from './dto/response/cart-response.dto';
import { ImageEntity } from '../../models/image.entity';
import CommonMethods from '../../common/bases/common-method';
import { MinioService } from '../../common/bases/minio.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,

    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,

    private readonly minioService: MinioService,
  ) {}

  async addProductToCart(
    userId: number,
    addProductRequest: addProductRequestDto,
  ) {
    const { productId, quantity } = addProductRequest;

    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new BadRequestException('Product not found');
      }

      let cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!cart) {
        cart = this.cartRepository.create({ user: { id: userId } });
        await this.cartRepository.save(cart);
      }

      let cartItem = await this.cartItemRepository.findOne({
        where: { carts: { id: cart.id }, products: { id: product.id } },
      });

      if (cartItem) {
        cartItem.quantity += quantity;
      } else {
        cartItem = this.cartItemRepository.create({
          carts: cart,
          products: product,
          quantity,
        });
      }

      await this.cartItemRepository.save(cartItem);
    } catch (error) {
      throw error;
    }
  }

  async getAllCarts(skip = 0, limit = 10): Promise<PaginatedCartResponse> {
    const [cartItems, total] = await this.cartItemRepository
      .createQueryBuilder('cart_item')
      .leftJoinAndSelect('cart_item.carts', 'cart')
      .leftJoinAndSelect('cart_item.products', 'product')
      .leftJoinAndSelect('cart.user', 'user')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const productIds = cartItems
      .filter((item) => item.products)
      .map((item) => item.products.id);

    const productImages = await CommonMethods.getProductImages(
      productIds,
      this.imageRepository,
      this.minioService,
    );

    const grouped = new Map();
    
    for (const item of cartItems) {
      if (!item.carts || !item.products) {
        continue;
      }

      const cartId = item.carts.id;
      const product = item.products;

      const price = product.price || 0;
      const quantity = item.quantity || 0;
      const discountPercent = product.discount_percentage || 0;
      const total = price * quantity;
      const discountedTotal = total - (total * discountPercent) / 100;

      const thumbnail =  productImages[`${product.id}`][0];

      if (!grouped.has(cartId)) {
        grouped.set(cartId, {
          id: cartId,
          userId: item.carts.user?.id || null,
          products: [],
          total: 0,
          discountedTotal: 0,
          totalProducts: 0,
          totalQuantity: 0,
        });
      }

      const cart = grouped.get(cartId);

      cart.products.push({
        id: product.id,
        title: product.title || '',
        price,
        quantity,
        total,
        discountPercentage: discountPercent,
        discountedTotal,
        thumbnail,
      });

      cart.total += total;
      cart.discountedTotal += discountedTotal;
      cart.totalQuantity += quantity;
      cart.totalProducts = cart.products.length;
    }

    return {
      data: Array.from(grouped.values()),
      total: total,
      limit: limit,
      skip: skip,
    }; 
  }
}
