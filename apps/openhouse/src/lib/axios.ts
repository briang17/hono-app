import axios from "axios";

export const apiClient = axios.create({
  baseURL: "https://api.rs.hauntednuke.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.defaults.withCredentials = true;

export default apiClient;
