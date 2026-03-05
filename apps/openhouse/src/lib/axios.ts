import axios from "axios";
import { env } from "../config/env";
export const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.defaults.withCredentials = true;

export default apiClient;
