import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Alert } from "react-native";

import { api } from "../lib/axios";
import { useAuthStore } from "../store/auth.store";

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

export const useGetUsers = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "get"],
    mutationFn: async () => {
      const { data } = await api.get<IUser[]>("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useUpdateProfile = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "update-profile"],
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.put<UpdateProfileResponse>(
        "/users/update-profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useUploadProfileImage = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "upload-image"],
    mutationFn: async (file: { uri: string; name: string; type: string }) => {
      const formData = new FormData();

      formData.append("profileImage", file as any);

      const { data } = await api.put<UploadProfileImageResponse>(
        "/users/profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Profile image updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useChangePassword = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "change-password"],
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await api.put<ChangePasswordResponse>(
        "/users/change-password",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Password changed successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useUpdateUserProfile = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "update", "admin"],
    mutationFn: async (payload: UpdateUserProfilePayload) => {
      const { data } = await api.put<UpdateUserProfileResponse>(
        `/users/update-user-profile/${payload.targetUserId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "User updated successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useToggleBlockUser = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "toggle-block"],
    mutationFn: async (payload: ToggleBlockUserPayload) => {
      const { data } = await api.put<ToggleBlockUserResponse>(
        `/users/toggle-block-user/${payload.targetUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "User status updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useDeleteUser = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "delete"],
    mutationFn: async (payload: DeleteUserPayload) => {
      const { data } = await api.delete<DeleteUserResponse>(
        `/users/delete-user/${payload.targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "User deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};

export const useDeleteAccount = () => {
  const { token } = useAuthStore();

  return useMutation({
    mutationKey: ["user", "delete-account"],
    mutationFn: async (payload: DeleteAccountPayload) => {
      const { data } = await api.put<DeleteAccountResponse>(
        "/users/delete-account",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Account deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      Alert.alert("Error", error.response?.data.message);
    },
  });
};
