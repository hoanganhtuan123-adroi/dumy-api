import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AddCartRequestDto,
  ProductItemDto,
} from './dto/request/add-cart-request.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '../../models/cart.entity';
import { In, Repository, DataSource } from 'typeorm';
import { CartItemEntity } from '../../models/cart-item.entity';
import { ProductEntity } from '../../models/product.entity';
import {
  CartResponse,
  PaginatedCartResponse,
} from './dto/response/cart-response.dto';
import { ImageEntity } from '../../models/image.entity';
import CommonMethods from '../../utils/common-method';
import { UserEntity } from '../../models/user.entity';
import { UpdateCartRequestDto } from './dto/request/update-cart-request.dto';

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

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectDataSource()
    private readonly datasource: DataSource,
  ) {}

  async addProductToCart(userId: number, addProductRequest: AddCartRequestDto) {
    const { products } = addProductRequest;

    await this.checkOrderQuantityAgainstStock(products);

    await this.cartRepository.manager.transaction(async (manager) => {
      let cart = await manager.findOne(this.cartRepository.target, {
        where: { user: { id: userId } },
      });
      if (!cart) {
        cart = await manager.save(this.cartRepository.target, {
          user: { id: userId },
        });
      }

      const productIds = products.map((p) => p.id);
      const foundProducts = await manager.find(this.productRepository.target, {
        where: { id: In(productIds) },
      });
      const productMap = new Map(foundProducts.map((p) => [p.id, p]));

      for (const { id } of products) {
        if (!productMap.has(id)) {
          throw new BadRequestException(`Product is not exists`);
        }
      }

      const cartItems = await manager.find(this.cartItemRepository.target, {
        where: { carts: { id: cart.id }, products: { id: In(productIds) } },
      });
      const cartItemMap = new Map(cartItems.map((ci) => [ci.id, ci]));

      const itemsToSave = products.map(({ id, quantity }) => {
        const product = productMap.get(id);
        const item =
          cartItemMap.get(id) ||
          this.cartItemRepository.create({
            carts: cart,
            products: product,
            quantity: 0,
          });
        item.quantity += quantity;
        return item;
      });

      // Lưu tất cả cartItem
      await manager.save(this.cartItemRepository.target, itemsToSave);
    });
  }

  async updateCart(userId: number, updateCartRequest: UpdateCartRequestDto) {
    const { products } = updateCartRequest;

    await this.checkOrderQuantityAgainstStock(products);

    await this.cartRepository.manager.transaction(async (manager) => {
      const cart = await manager.findOne(this.cartRepository.target, {
        where: { user: { id: userId } },
      });
      if (!cart) {
        throw new BadRequestException('Giỏ hàng không tồn tại');
      }

      const productIds = products.map((p) => p.id);
      const cartItems = await manager.find(this.cartItemRepository.target, {
        where: { carts: { id: cart.id }, products: { id: In(productIds) } },
      });
      const cartItemMap = new Map(cartItems.map((ci) => [ci.id, ci]));

      const itemsToSave = [];
      for (const { id, quantity } of products) {
        const cartItem = cartItemMap.get(id);
        if (!cartItem) {
          throw new BadRequestException(`Product is not in the cart`);
        }
        cartItem.quantity = quantity;
        itemsToSave.push(cartItem);
      }

      await manager.save(this.cartItemRepository.target, itemsToSave);
    });
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

    const productImages = await CommonMethods.getProductThumbnails(
      productIds,
      this.imageRepository,
    );

    const groupedCarts = this.groupCartItems(cartItems, productImages);

    return {
      data: groupedCarts,
      total: total,
      limit: limit,
      skip: skip,
    };
  }

  async getSingleCart(cartId: number): Promise<CartResponse[]> {
    const cartItems = await this.cartItemRepository
      .createQueryBuilder('cart_item')
      .leftJoinAndSelect('cart_item.carts', 'cart')
      .leftJoinAndSelect('cart_item.products', 'product')
      .leftJoinAndSelect('cart.user', 'user')
      .where('cart.id = :cartId', { cartId })
      .getMany();

    if (cartItems.length === 0) {
      throw new NotFoundException('Cart not exists');
    }
    const productIds = cartItems
      .filter((item) => item.products)
      .map((item) => item.products.id);

    const productImages = await CommonMethods.getProductThumbnails(
      productIds,
      this.imageRepository,
    );

    const groupedCarts = this.groupCartItems(cartItems, productImages);

    return groupedCarts;
  }

  async getCartByUserId(userId: number): Promise<CartResponse[]> {
    const isUserExists = await this.userRepository.findOneBy({ id: userId });
    if (!isUserExists) {
      throw new NotFoundException("User doesn't exist!");
    }

    const cartItems = await this.cartItemRepository
      .createQueryBuilder('cart_item')
      .leftJoinAndSelect('cart_item.carts', 'cart')
      .leftJoinAndSelect('cart_item.products', 'product')
      .where('cart.user_id = :userId', { userId })
      .getMany();
    cartItems['userId'] = userId;

    if (cartItems.length === 0) {
      return [];
    }
    const productIds = cartItems
      .filter((item) => item.products)
      .map((item) => item.products.id);

    const productImages = await CommonMethods.getProductThumbnails(
      productIds,
      this.imageRepository,
    );

    console.log('product image >>> ', productImages);

    const groupedCarts = this.groupCartItems(cartItems, productImages);

    return groupedCarts;
  }

  async deleteCart(id: number): Promise<void> {
    const cart = await this.cartRepository.findOneBy({id})
    if(!cart) {
      throw new NotFoundException("Cart does not exist");
    }
    
    await this.datasource.transaction(async (manager)=>{
      await manager.delete(CartItemEntity, {carts: {id: cart['id']}});
      await manager.delete(CartEntity, {id: cart['id']})
    })

   
  }

  private calculateCartItemValues(
    product: any,
    quantity: number,
  ): {
    price: number;
    total: number;
    discountedTotal: number;
    discountPercent: number;
  } {
    const price = product.price || 0;
    const discountPercent = product.discount_percentage || 0;
    const total = price * quantity;
    const discountedTotal = total - (total * discountPercent) / 100;

    return {
      price,
      total,
      discountedTotal,
      discountPercent,
    };
  }

  private groupCartItems(
    cartItems: any[],
    productThumbnails: Record<number, string | string[]>,
  ): CartResponse[] {
    const grouped = new Map();
    const userID = cartItems['userId'];
    for (const item of cartItems) {
      if (!item.carts || !item.products) {
        continue;
      }

      const cartId = item.carts.id;
      const product = item.products;
      const quantity = item.quantity || 0;
      const { price, discountPercent, total, discountedTotal } =
        this.calculateCartItemValues(product, quantity);
      const thumbnail = Array.isArray(productThumbnails)
        ? productThumbnails[`${product.id}`]
          ? productThumbnails[`${product.id}`][0]
          : ''
        : productThumbnails[`${product.id}`];

      if (!grouped.has(cartId)) {
        grouped.set(cartId, {
          id: cartId,
          userId: userID || null,
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
    return Array.from(grouped.values());
  }

  private async checkOrderQuantityAgainstStock(products: ProductItemDto[]) {
    const productIds = products.map((item) => item.id);
    const product = await this.productRepository.find({
      where: {
        id: In(productIds),
      },
    });
    product.map((item, index) => {
      if (products[index].quantity > item.stock) {
        throw new UnprocessableEntityException(
          'Quantity in stock is not enough',
        );
      }
    });
  }
}
