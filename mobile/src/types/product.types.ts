import { IProduct } from ".";

export interface CreateProductPayload {
  name: string;
  description: string;
  category_id: number;
  price: number;
  stock: number;
  is_active: boolean;
  image: string;
}

export interface CreateProductResponse {
  product: IProduct;
}

export interface UpdateProductPayload {
  id: number;
  name?: string;
  description?: string;
  category_id?: number;
  price?: number;
  stock?: number;
  is_active?: boolean;
}

export interface UpdateProductResponse {
  product: IProduct;
}

export interface UploadProductImagePayload {
  product_id: number;
  image: string;
}

export interface UploadProductImageResponse {
  data: IProduct;
}

export interface DeleteProductPayload {
  id: number;
  password: string;
}

export interface DeleteProductResponse {
  message: string;
}
