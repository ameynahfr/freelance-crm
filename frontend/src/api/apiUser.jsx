import axios from "axios";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const apiUser = axios.create({
  baseURL: "http://localhost:5000/api",
});

apiUser.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default apiUser;
