import { IProduct } from ".";

export interface CreateProductPayload {
  name: string;
  description: string;
  category_id: string;
  price: number;
  stock: number;
  is_active: boolean;
  imageUri: string;
}

export interface CreateProductResponse {
  product: IProduct;
}

export interface UpdateProductPayload {
  id: string;
  name?: string;
  description?: string;
  category_id?: string;
  price?: number;
  stock?: number;
  is_active?: boolean;
  imageUri?: string;
}

export interface UpdateProductResponse {
  product: IProduct;
}

export interface UploadProductImagePayload {
  productId: string;
  imageUri: string;
}

export interface UploadProductImageResponse {
  message: string;
  data: IProduct;
}

export interface DeleteProductPayload {
  id: string;
  password: string;
}

export interface DeleteProductResponse {
  message: string;
}
