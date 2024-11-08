import axios from "axios";
import { ACCESS_TOKEN } from "./constants";
import { intl } from "@/i18n";

// Determine the base URL based on the current language
// const baseApiUrl = "https://patrimonya-6c503671ad25.herokuapp.com";  // Your local backend URL

// const baseApiUrl = "http://127.0.0.1:8000";
// const baseApiUrl = "patrimonya.trycloudflare.com"
const baseApiUrl = window.location.origin;

const apiUrl = intl.locale === "fr" 
  ? `${baseApiUrl}/fr/`
  : `${baseApiUrl}/en/`;

// Create the axios instance
const api = axios.create({
  baseURL: apiUrl,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
