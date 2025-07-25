import { Review } from "../../../review/dto/response/review-response.dto";

export interface ProductResponse {
  id: number;
  title: string;
  category: string;
  description: string;
  tags: string;
  price: number;
  discount_percentage: number;
  rating: number;
  stock: number;
  brand: string;
  sku: string;
  weight: number;
  dimensions_width: number;
  dimensions_height: number;
  dimensions_depth: number;
  warranty_information: string;
  shipping_information: string;
  availability_status: string;
  return_policy: string;
  minimumOrderQuantity: number;
  meta_barcode: string;
  meta_qrcode: string;
  image?: string[];
  reviews?: Review[];
}
export interface ProductListResponse {
  total: number;
  skip: number;
  limit: number;
  products: ProductResponse[];
}
