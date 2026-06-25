import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../lib/axios";
import { notify } from "../lib/notify";
import { appendFile, type RNFile } from "../lib/formData";

import { IUser } from "@/types";
import {
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  DeleteUserResponse,
  ToggleBlockUserResponse,
  UpdateUserProfilePayload,
  UpdateUserProfileResponse,
  UploadProfileImageResponse,
  ChangePasswordResponse,
  ToggleBlockUserPayload,
  DeleteUserPayload,
  DeleteAccountPayload,
  DeleteAccountResponse,
} from "@/types/user.types";

const errorMessage = (
  error: AxiosError<{ message?: string }>,
  fallback: string,
) => error.response?.data?.message ?? fallback;

export const useGetUsers = () =>
  useMutation({
    mutationKey: ["user", "get"],
    mutationFn: async () => {
      const { data } = await api.get<IUser[]>("/users");
      return data;
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to load users", errorMessage(error, "Try again."));
    },
  });

export const useUpdateProfile = () =>
  useMutation({
    mutationKey: ["user", "update-profile"],
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.put<UpdateProfileResponse>(
        "/users/update-profile",
        payload,
      );
      return data;
    },
    onSuccess: () => notify.success("Profile updated"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to update profile", errorMessage(error, "Try again."));
    },
  });

export const useUploadProfileImage = () =>
  useMutation({
    mutationKey: ["user", "upload-image"],
    mutationFn: async (file: RNFile) => {
      const formData = new FormData();
      appendFile(formData, "profileImage", file);

      const { data } = await api.put<UploadProfileImageResponse>(
        "/users/profile-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return data;
    },
    onSuccess: () => notify.success("Profile image updated"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to upload image", errorMessage(error, "Try again."));
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationKey: ["user", "change-password"],
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await api.put<ChangePasswordResponse>(
        "/users/change-password",
        payload,
      );
      return data;
    },
    onSuccess: () => notify.success("Password changed"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to change password", errorMessage(error, "Try again."));
    },
  });

export const useUpdateUserProfile = () =>
  useMutation({
    mutationKey: ["user", "update", "admin"],
    mutationFn: async (payload: UpdateUserProfilePayload) => {
      const { data } = await api.put<UpdateUserProfileResponse>(
        `/users/update-user-profile/${payload.targetUserId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => notify.success("User updated"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to update user", errorMessage(error, "Try again."));
    },
  });

export const useToggleBlockUser = () =>
  useMutation({
    mutationKey: ["user", "toggle-block"],
    mutationFn: async (payload: ToggleBlockUserPayload) => {
      const { data } = await api.put<ToggleBlockUserResponse>(
        `/users/toggle-block-user/${payload.targetUserId}`,
        {},
      );
      return data;
    },
    onSuccess: () => notify.success("User status updated"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to update status", errorMessage(error, "Try again."));
    },
  });

export const useDeleteUser = () =>
  useMutation({
    mutationKey: ["user", "delete"],
    mutationFn: async (payload: DeleteUserPayload) => {
      const { data } = await api.delete<DeleteUserResponse>(
        `/users/delete-user/${payload.targetUserId}`,
      );
      return data;
    },
    onSuccess: () => notify.success("User deleted"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to delete user", errorMessage(error, "Try again."));
    },
  });

export const useDeleteAccount = () =>
  useMutation({
    mutationKey: ["user", "delete-account"],
    mutationFn: async (payload: DeleteAccountPayload) => {
      const { data } = await api.put<DeleteAccountResponse>(
        "/users/delete-account",
        payload,
      );
      return data;
    },
    onSuccess: () => notify.success("Account deleted"),
    onError: (error: AxiosError<{ message?: string }>) => {
      notify.error("Failed to delete account", errorMessage(error, "Try again."));
    },
  });
