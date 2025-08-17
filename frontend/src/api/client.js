
import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const http = axios.create({ baseURL: API, timeout: 15000 });
http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = 'Bearer ' + t;
  return cfg;
});
export default http;
