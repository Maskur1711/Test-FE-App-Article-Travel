import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1, "Judul tidak boleh kosong"),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  category: z.string().min(1, "Kategori tidak boleh kosong"),
  cover_image_url: z
    .string()
    .url("URL gambar tidak valid")
    .min(1, "URL gambar tidak boleh kosong"),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
