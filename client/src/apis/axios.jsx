
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', 
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
