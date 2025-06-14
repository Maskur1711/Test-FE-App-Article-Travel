import axios from "axios";

const API_BASE_URL = "https://extra-brooke-yeremiadio-46b2183e.koyeb.app";

export const getAllComments = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/api/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const getCommentsByArticleId = async (articleDocumentId: string) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_BASE_URL}/api/comments?filters[article][documentId][$eq]=${articleDocumentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const createComment = async (commentData: {
  content: string;
  article: string;
}) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_BASE_URL}/api/comments`,
    { data: commentData },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const deleteComment = async (documentId: string) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `${API_BASE_URL}/api/comments/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const updateComment = async (documentId: string, content: string) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_BASE_URL}/api/comments/${documentId}`,
    { data: { content: content } },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
