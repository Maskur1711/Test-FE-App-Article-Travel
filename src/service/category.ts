import axios from "axios";

const API_BASE_URL = "https://extra-brooke-yeremiadio-46b2183e.koyeb.app";

export const getAllCategories = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/api/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/api/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
export const createCategory = async (categoryData: {
  name: string;
  description?: string;
}) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/api/categories`,
    categoryData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
export const updateCategory = async (
  id: string,
  categoryData: { name: string; description?: string }
) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_BASE_URL}/api/categories/${id}`,
    { data: categoryData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_BASE_URL}/api/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
