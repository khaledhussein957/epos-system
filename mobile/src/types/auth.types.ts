import { IUser } from ".";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: IUser;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: IUser;
}

export interface recoveryPasswordPayload {
  email: string;
}

export interface recoveryPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
