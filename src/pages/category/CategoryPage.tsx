import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getCategoryById,
  getAllCategories,
  deleteCategory,
  updateCategory,
} from "@/service/category";
import { getAllArticles } from "@/service/articleAPI";
import type { Category } from "@/types/category";
import type { Article, Pagination } from "@/types/article";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { categorySchema } from "@/lib/schemaFormCategory";
import type { CategoryFormValues } from "@/lib/schemaFormCategory";

export default function CategoryPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
  const [loadingCategoryArticles, setLoadingCategoryArticles] = useState(true);
  const [articlesMeta, setArticlesMeta] = useState<Pagination | null>(null);
  const [articlePage, setArticlePage] = useState(1);
  const articlePageSize = 6;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedCategoryToEdit, setSelectedCategoryToEdit] =
    useState<Category | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [isSubmittingEditCategory, setIsSubmittingEditCategory] =
    useState(false);

  const {
    register: registerEditCategory,
    handleSubmit: handleSubmitEditCategory,
    reset: resetEditCategoryForm,
    formState: { errors: editCategoryErrors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const getDataCategory = useCallback(async () => {
    setLoading(true);
    try {
      if (documentId) {
        const res = await getCategoryById(documentId);
        setCategory(res.data);
        if (res.data) {
          resetEditCategoryForm({
            name: res.data.name,
            description: res.data.description,
          });
        }
      } else {
        const res = await getAllCategories();
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Fetch category data error:", err);
      toast.error("Gagal memuat data kategori.");
    } finally {
      setLoading(false);
    }
  }, [documentId, resetEditCategoryForm]);

  const fetchArticlesByCategory = useCallback(async () => {
    setLoadingCategoryArticles(true);
    try {
      if (documentId && category?.name) {
        const params = {
          "pagination[page]": articlePage,
          "pagination[pageSize]": articlePageSize,
          populate: "*",
          "filters[category][name][$eqi]": category.name,
        };
        const res = await getAllArticles(params);
        setCategoryArticles(res.data);
        setArticlesMeta(res.meta.pagination);
      }
    } catch (err) {
      console.error("Fetch articles by category error:", err);
      toast.error("Gagal memuat artikel terkait kategori.");
    } finally {
      setLoadingCategoryArticles(false);
    }
  }, [documentId, category?.name, articlePage, articlePageSize]);

  useEffect(() => {
    getDataCategory();
  }, [getDataCategory]);

  useEffect(() => {
    if (documentId && category) {
      fetchArticlesByCategory();
    }
  }, [documentId, category, articlePage, fetchArticlesByCategory]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDeleteCategory = async () => {
    if (!documentId) return;

    try {
      await deleteCategory(documentId);
      toast.success("Kategori berhasil dihapus!");
      navigate("/categories");
    } catch (error) {
      toast.error("Gagal menghapus kategori.");
      console.error("Gagal menghapus kategori:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleOpenEditCategoryDialog = () => {
    if (category) {
      setSelectedCategoryToEdit(category);
      setIsEditCategoryDialogOpen(true);
    }
  };

  const handleEditCategorySubmit = async (data: CategoryFormValues) => {
    if (!selectedCategoryToEdit) return;

    setIsSubmittingEditCategory(true);
    try {
      await updateCategory(selectedCategoryToEdit.documentId, {
        name: data.name,
        description: data.description || "",
      });
      toast.success("Kategori berhasil diperbarui!");
      await getDataCategory();
    } catch (error) {
      toast.error("Gagal memperbarui kategori.");
      console.error("Gagal memperbarui kategori:", error);
    } finally {
      setIsSubmittingEditCategory(false);
      setIsEditCategoryDialogOpen(false);
      setSelectedCategoryToEdit(null);
      resetEditCategoryForm();
    }
  };

  if (loading || (documentId && loadingCategoryArticles)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-10 mb-4" />
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-full h-24 mb-4" />
        {documentId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4">
                <Skeleton className="w-full h-40 rounded-md mb-4" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-full h-4" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={handleGoBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Kembali
          </Button>
          {documentId && category && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer"
                onClick={handleOpenEditCategoryDialog}
              >
                Edit Kategori
              </Button>
              <Button
                variant="destructive"
                className="bg-[#b53636] hover:bg-[#8f2c2c] text-white cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Hapus Kategori
              </Button>
            </div>
          )}
        </div>

        {documentId && category ? (
          <Card className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
            <p className="text-gray-700 leading-relaxed mb-6">
              {category.description}
            </p>
            <p className="text-gray-500 text-sm">
              Created At:{" "}
              {new Date(category.createdAt).toLocaleDateString("id-ID")}{" "}
              {new Date(category.createdAt).toLocaleTimeString("id-ID")}
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              Articles in "{category.name}"
            </h2>
            {loadingCategoryArticles ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4">
                    <Skeleton className="w-full h-40 rounded-md mb-4" />
                    <Skeleton className="w-3/4 h-6 mb-2" />
                    <Skeleton className="w-full h-4" />
                  </div>
                ))}
              </div>
            ) : categoryArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryArticles.map((article) => (
                  <Link
                    key={article.documentId}
                    to={`/articles/${article.documentId}`}
                    className="block"
                  >
                    <Card className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col hover:shadow-lg transition-shadow">
                      <img
                        src={
                          article.cover_image_url ||
                          "https://via.placeholder.com/400x200?text=No+Image"
                        }
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-2">
                        {article.description}
                      </p>
                      {article.category && (
                        <p className="text-gray-500 text-xs mt-auto">
                          Kategori:{" "}
                          <span className="font-semibold">
                            {article.category.name}
                          </span>
                        </p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                Tidak ada artikel dalam kategori ini.
              </p>
            )}

            {articlesMeta && articlesMeta.pageCount > 1 && (
              <div className="flex flex-col items-center mt-8">
                <div className="mt-6 text-gray-600">
                  Total Articles in Category: {articlesMeta.total}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    disabled={articlesMeta.page <= 1}
                    onClick={() => setArticlePage((p) => p - 1)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <span>
                    Page {articlesMeta.page} of {articlesMeta.pageCount}
                  </span>
                  <Button
                    disabled={articlesMeta.page >= articlesMeta.pageCount}
                    onClick={() => setArticlePage((p) => p + 1)}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : documentId === undefined && categories.length > 0 ? (
          <Card className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">All Categories</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.documentId}
                  to={`/categories/${cat.documentId}`}
                  className="block"
                >
                  <div className="border p-4 rounded-lg hover:bg-gray-50">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ) : (
          <div className="text-center text-gray-600">
            {documentId ? "Kategori tidak ditemukan." : "Tidak ada kategori."}
          </div>
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Kategori</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus kategori{" "}
                <span className="font-semibold">{category?.name}</span>?
                Menghapus kategori ini mungkin juga memengaruhi artikel yang
                terkait dengannya.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                className="bg-white text-black hover:bg-gray-200 border cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="bg-[#b53636] hover:bg-[#8f2c2c] text-white cursor-pointer"
                onClick={handleDeleteCategory}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditCategoryDialogOpen}
          onOpenChange={setIsEditCategoryDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>Edit Kategori</DialogTitle>
              <DialogDescription>Ubah detail kategori ini.</DialogDescription>
            </DialogHeader>
            {/* Form edit kategori */}
            <div className="space-y-4 py-4">
              <Input
                {...registerEditCategory("name")}
                placeholder="Nama Kategori"
              />
              {editCategoryErrors.name && (
                <p className="text-red-500 text-sm">
                  {editCategoryErrors.name.message}
                </p>
              )}
              <Textarea
                {...registerEditCategory("description")}
                placeholder="Deskripsi Kategori"
              />
              {editCategoryErrors.description && (
                <p className="text-red-500 text-sm">
                  {editCategoryErrors.description.message}
                </p>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button
                className="bg-[#3674B5] hover:bg-[#2c5a8f] text-white cursor-pointer"
                onClick={handleSubmitEditCategory(handleEditCategorySubmit)}
                disabled={isSubmittingEditCategory}
              >
                {isSubmittingEditCategory
                  ? "Memperbarui..."
                  : "Perbarui Kategori"}
              </Button>
              <Button
                variant="outline"
                className="bg-white cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  resetEditCategoryForm();
                  setIsEditCategoryDialogOpen(false);
                }}
              >
                Batal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
