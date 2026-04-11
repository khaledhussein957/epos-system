import { ICategory } from ".";

export interface CreateCategoryPayload {
  name: string;
}
export interface CreateCategoryResponse {
  category: ICategory;
}

export interface UpdateCategoryPayload {
  id: string;
  name: string;
}

export interface UpdateCategoryResponse {
  category: ICategory;
}

export interface DeleteCategoryPayload {
  id: string;
  password: string;
}

export interface DeleteCategoryResponse {
  message: string;
}
