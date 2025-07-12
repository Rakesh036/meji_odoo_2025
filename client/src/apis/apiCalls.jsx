import axiosInstance from "./axios";

export const fetchData = async () => { }

export const createSwapRequest = async (swapRequestData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/api/swapRequest/create', swapRequestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
