import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for webhook processing
  headers: {
    "Content-Type": "application/json",
  },
});
