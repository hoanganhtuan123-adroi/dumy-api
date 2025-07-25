import { skip } from 'rxjs';
export interface CartProductResponse {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
}

export interface CartResponse {
  id: number;
  userId: number;
  products: CartProductResponse[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface PaginatedCartResponse {
  data: CartResponse[];
  total: number;
  skip: number;
  limit: number;
}
