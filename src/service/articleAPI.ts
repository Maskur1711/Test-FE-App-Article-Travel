import axios from "axios";
import type { ArticleApiResponse, Article } from "@/types/article";

const API_BASE_URL = "https://extra-brooke-yeremiadio-46b2183e.koyeb.app";

type QueryParams = Record<string, string | number | boolean>;

export const getAllArticles = async (params: QueryParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== "") {
      query.append(key, String(val));
    }
  });

  const res = await axios.get(
    `${API_BASE_URL}/api/articles?${query.toString()}`
  );
  return res.data as ArticleApiResponse;
};

export const getArticleById = async (id: string) => {
  const token = localStorage.getItem("token");
  const resDataArticle = await axios.get(
    `${API_BASE_URL}/api/articles/${id}?populate=comments&populate=category`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return resDataArticle.data.data as Article;
};

export const createArticle = async (articleData: {
  title: string;
  description: string;
  cover_image_url: string;
  category: number;
}) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_BASE_URL}/api/articles`,
    { data: articleData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const deleteArticle = async (id: string) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`${API_BASE_URL}/api/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const updateArticle = async (
  id: string,
  editData: {
    title: string;
    description: string;
    cover_image_url: string;
    category: number;
  }
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_BASE_URL}/api/articles/${id}`,
    { data: editData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
