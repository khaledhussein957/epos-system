import axios from "axios";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});
