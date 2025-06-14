export type Article = {
  documentId: string;
  title: string;
  description: string;
  cover_image_url: string;
  category: {
    id: number;
    name: string;
    documentId: string;
  };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
};

export interface Comment {
  documentId: string;
  content: string;
  createdAt: string;
  article: {
    id: number;
    documentId: string;
    title: string;
    description?: string;
  } | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface Meta {
  pagination: Pagination;
}

export interface ArticleApiResponse {
  data: Article[];
  meta: Meta;
}
