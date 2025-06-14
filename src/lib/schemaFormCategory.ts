import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori tidak boleh kosong"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
