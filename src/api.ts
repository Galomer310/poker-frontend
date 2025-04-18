// src/api.ts
/**
 * Tiny Axios wrapper that always points to the Express API (port 4000).
 * Because vite.config.ts proxies /api → 4000, you can keep relative paths.
 * If you remove the proxy, keep the full baseURL.
 */
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // REST origin
  withCredentials: false,           // CORS already allows *
});

export default api;
