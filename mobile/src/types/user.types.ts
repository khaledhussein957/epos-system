import { IUser } from ".";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  user: IUser;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface UpdateUserProfilePayload {
  targetUserId: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  isBlock?: boolean;
}

export interface UpdateUserProfileResponse {
  user: IUser;
}

export interface ToggleBlockUserPayload {
  targetUserId: number;
}

export interface ToggleBlockUserResponse {
  newBlockStatus: boolean;
}

export interface DeleteUserPayload {
  targetUserId: number;
  password: string;
}

export interface DeleteUserResponse {
  message: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface DeleteAccountResponse {
  message: string;
}

export interface UploadProfileImageResponse {
  user: IUser;
}
