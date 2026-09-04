import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://737502214068b6a7-103-103-57-125.serveousercontent.com/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;