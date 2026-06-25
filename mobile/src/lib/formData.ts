import { Platform } from "react-native";

export type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export const getFileMeta = (uri: string, fallbackPrefix = "upload"): RNFile => {
  const segments = uri.split("/");
  const name = segments[segments.length - 1] || `${fallbackPrefix}-${Date.now()}.jpg`;
  const ext = name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
  return { uri, name, type };
};

export const appendFile = (
  formData: FormData,
  field: string,
  file: RNFile,
) => {
  const uri =
    Platform.OS === "android" ? file.uri : file.uri.replace("file://", "");
  // React Native's FormData accepts { uri, name, type } as a Blob-like value.
  formData.append(field, { ...file, uri } as unknown as Blob);
};
