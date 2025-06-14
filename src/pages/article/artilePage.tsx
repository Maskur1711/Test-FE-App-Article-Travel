import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

// Schema Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { articleSchema } from "@/lib/schemaFormArticle";
import type { ArticleFormValues } from "@/lib/schemaFormArticle";
import { categorySchema } from "@/lib/schemaFormCategory";
import type { CategoryFormValues } from "@/lib/schemaFormCategory";

// API Services
import {
  getAllArticles,
  createArticle,
  deleteArticle,
  updateArticle,
} from "@/service/articleAPI";
import { getAllComments } from "@/service/commentAPI";
import { getAllCategories, createCategory } from "@/service/category";

// Icons
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";

// Components
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Types
import type { Article, Pagination, Comment } from "@/types/article";
import type { Category } from "@/types/category";

export default function ArticlePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");
  const [selectedToDelete, setSelectedToDelete] = useState<Article | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedToEdit, setSelectedToEdit] = useState<Article | null>(null);
  const [editData, setEditData] = useState<ArticleFormValues | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // State untuk komentar
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // State untuk kategori
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false); 

  const articlesToRender = articles.slice(0, 5); 

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue, 
    watch, 
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
  });

  const categoryValue = watch("category");

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategoryForm,
    formState: { errors: categoryErrors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        populate: "*",
        "filters[title][$eqi]": debouncedTitle,
        "filters[category][name][$eqi]": debouncedCategory,
      };
      const res = await getAllArticles(params);
      setArticles(res.data);
      setMeta(res.meta.pagination);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedTitle, debouncedCategory]);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await getAllComments();
      const sortedComments = res.data.sort(
        (a: Comment, b: Comment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch (err) {
      console.error("Fetch categories error:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    fetchComments();
    fetchCategories();
  }, [fetchArticles, fetchComments, fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(filterTitle);
      setDebouncedCategory(filterCategory);
    }, 500);

    return () => clearTimeout(timer);
  }, [filterTitle, filterCategory]);

  const onSubmit = async (data: ArticleFormValues) => {

    const selectedCategory = categories.find(
      (cat) => cat.documentId === data.category
    );
    if (!selectedCategory) {
      toast.error("Kategori tidak valid. Pilih kategori yang ada.");
      return;
    }

    try {
      await createArticle({
        ...data,
        category: selectedCategory.id,
      });
      await fetchArticles();
      reset();
      setModalOpen(false);
      toast.success("Artikel berhasil ditambahkan");
    } catch (error) {
      console.error("Gagal menambahkan artikel:", error);
      toast.error("Gagal menambahkan artikel");
    }
  };

  const onSubmitCategory = async (data: CategoryFormValues) => {
    try {
      await createCategory({
        name: data.name,
        description: data.description || "",
      });
      await fetchCategories();
      resetCategoryForm();
      setCategoryModalOpen(false);
      toast.success("Kategori berhasil ditambahkan");
    } catch (error) {
      console.error("Gagal menambahkan kategori:", error);
      toast.error("Gagal menambahkan kategori");
    }
  };

  const handleDeleteArticle = async () => {
    if (!selectedToDelete) return;
    try {
      await deleteArticle(selectedToDelete.documentId);
      await fetchArticles();
      toast.success("Artikel berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus artikel");
      console.error("Gagal menghapus artikel:", error);
    } finally {
      setSelectedToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateArticle = async () => {
    if (!selectedToEdit || !editData) return;

    const selectedCategory = categories.find(
      (cat) => cat.documentId === editData.category
    );
    if (!selectedCategory) {
      toast.error("Kategori tidak valid. Pilih kategori yang ada.");
      return;
    }

    try {
      await updateArticle(selectedToEdit.documentId, {
        ...editData,
        category: selectedCategory.id,
      });
      await fetchArticles();
      setIsEditDialogOpen(false);
      toast.success("Artikel berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal mengupdate artikel");
      console.error("Gagal mengupdate artikel:", error);
    }
  };

  if (loading || loadingComments || loadingCategories) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <Skeleton className="w-full h-48 rounded-md mb-4" />
              <Skeleton className="w-3/4 h-6 mb-2" />
              <Skeleton className="w-full h-4 mb-4" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Card className="container mx-auto px-4 py-8">
        <Card className="bg-white shadow-md mb-6 p-4">
          {/* Header : Title, Filters, and Add Button */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <Label className="text-2xl font-bold">List Articles</Label>
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-end">
              <Input
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                placeholder="Filter by title..."
                className="bg-white w-full sm:w-auto"
              />
              <Input
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                placeholder="Filter by category..."
                className="bg-white w-full sm:w-auto"
              />
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#3674B5] cursor-pointer hover:bg-[#2c5a8f] text-white w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" /> Add Artikel
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Artikel</DialogTitle>
                    <DialogDescription>
                      Isi data artikel yang ingin ditambahkan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 border-gray-500">
                    <Input {...register("title")} placeholder="Judul Artikel" />
                    {errors.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                    )}
                    <Textarea
                      {...register("description")}
                      placeholder="Deskripsi Artikel"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">
                        {errors.description.message}
                      </p>
                    )}
                    {/* --- Ganti Input Kategori dengan Select --- */}
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="category-select">Kategori</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("category", value, { shouldValidate: true })
                        }
                        value={categoryValue || ""} 
                      >
                        <SelectTrigger
                          className={errors.category ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat.documentId}
                              value={cat.documentId}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-red-500 text-sm">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                    {/* --- End Ganti Input Kategori --- */}
                    <Input
                      {...register("cover_image_url")}
                      placeholder="URL Gambar Cover"
                    />
                    {errors.cover_image_url && (
                      <p className="text-red-500 text-sm">
                        {errors.cover_image_url.message}
                      </p>
                    )}
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      className="bg-[#3674B5] hover:bg-[#2c5a8f] text-white cursor-pointer"
                      onClick={handleSubmit(onSubmit)}
                    >
                      Simpan
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-[#3674B5] hover:bg-[#2c5a8f] hover:text-white text-white cursor-pointer"
                      onClick={() => setModalOpen(false)}
                    >
                      Batal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* --- Tombol Tambah Kategori Baru --- */}
              <Dialog
                open={categoryModalOpen}
                onOpenChange={setCategoryModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-500 cursor-pointer hover:bg-green-600 text-white w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" /> Add Kategori
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Kategori Baru</DialogTitle>
                    <DialogDescription>
                      Isi detail kategori yang ingin ditambahkan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      {...registerCategory("name")}
                      placeholder="Nama Kategori"
                    />
                    {categoryErrors.name && (
                      <p className="text-red-500 text-sm">
                        {categoryErrors.name.message}
                      </p>
                    )}
                    <Textarea
                      {...registerCategory("description")}
                      placeholder="Deskripsi Kategori (Opsional)"
                    />
                    {categoryErrors.description && (
                      <p className="text-red-500 text-sm">
                        {categoryErrors.description.message}
                      </p>
                    )}
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white  cursor-pointer"
                      onClick={handleSubmitCategory(onSubmitCategory)}
                    >
                      Simpan Kategori
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        resetCategoryForm();
                        setCategoryModalOpen(false);
                      }}
                    >
                      Batal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
          {/* Left Column: Articles */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            {articlesToRender.map((article) => {
              return (
                <Card
                  key={article.documentId}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4"
                >
                  {/* Image Section */}
                  <img
                    src={
                      article.cover_image_url ||
                      "https://via.placeholder.com/400x200?text=No+Image"
                    }
                    alt={article.title}
                    className="w-full h-40 md:w-1/3 md:h-auto object-cover rounded-md flex-shrink-0"
                  />

                  {/* Content Section */}
                  <div className="flex flex-col flex-grow">
                    <h2 className="text-xl font-semibold mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 flex-grow line-clamp-3">
                      {article.description}
                    </p>
                    {/* --- TAMPILKAN KATEGORI DI SINI --- */}
                    {article.category && (
                      <p className="text-gray-500 text-sm mt-2">
                        Kategori:{" "}
                        <span className="font-semibold">
                          {article.category.name}
                        </span>
                      </p>
                    )}

                    {/* Actions/Details Section */}
                    <div className="flex justify-between items-center mt-auto">
                      <Link
                        to={`/articles/${article.documentId}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Detail
                      </Link>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => {
                            setSelectedToEdit(article);
                            setEditData({
                              title: article.title,
                              description: article.description,
                              cover_image_url: article.cover_image_url,
                              category:
                                typeof article.category === "object"
                                  ? article.category.documentId
                                  : String(article.category),
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#b53636] hover:bg-[#8f2c2c] text-white cursor-pointer"
                          onClick={() => {
                            setSelectedToDelete(article);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Right Column: Categories dan Comments Section */}
          <div className="lg:col-span-1 space-y-4 hidden lg:flex lg:flex-col">
            {/* Card untuk Kategori */}
            <Card className="bg-white rounded-lg shadow-md p-6 border-2  flex-shrink-0 flex flex-col">
              <h2 className="text-2xl font-semibold mb-4">Categories</h2>
              {loadingCategories ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-2">
                    <Skeleton className="w-full h-4" />
                  </div>
                ))
              ) : categories.length > 0 ? (
                <div
                  className="space-y-2 overflow-y-auto pr-2 flex-grow"
                  style={{ maxHeight: "25vh" }}
                >
                  {categories.slice(0, 10).map((category) => (
                    <Link
                      key={category.documentId}
                      to={`/categories/${category.documentId}`}
                      className="block hover:bg-gray-50 p-2 -mx-2 rounded-md"
                    >
                      <div className="border-b pb-2 last:border-b-0">
                        <p className="text-gray-800 font-medium text-sm">
                          {category.name}
                        </p>
                        <p className="text-gray-500 text-xs line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No categories found.</p>
              )}
            </Card>

            {/* Card untuk Komentar */}
            <div className="lg:col-span-1 space-y-4 hidden lg:block">
              <Card className="bg-white rounded-lg shadow-md p-6 h-[46rem] border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                {loadingComments ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="mb-4">
                      <Skeleton className="w-full h-4 mb-1" />
                      <Skeleton className="w-3/4 h-3" />
                    </div>
                  ))
                ) : comments.length > 0 ? (
                  <div className="space-y-2 h-[70rem] overflow-y-auto pr-2">
                    {comments.map((comment) => (
                      <div
                        key={comment.documentId}
                        className="border-b pb-2 last:border-b-0"
                      >
                        <p className="text-gray-800 text-sm">
                          {comment.content}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "id-ID"
                          )}{" "}
                          {new Date(comment.createdAt).toLocaleTimeString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Belum ada komentar.</p>
                )}
              </Card>
            </div>
          </div>
        </div>
        {/* Pagination Section */}
        <div className="flex flex-col items-center mt-8 ">
          <div className="mt-6 t">Total Articles: {meta ? meta.total : 0}</div>
          {meta && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <span>
                Page {page} of {meta.pageCount}
              </span>
              <Button
                disabled={page >= meta.pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus artikel{" "}
                <span className="font-semibold">{selectedToDelete?.title}</span>
                ?
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
                onClick={handleDeleteArticle}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Artikel</DialogTitle>
              <DialogDescription>
                Ubah data artikel yang dipilih.
              </DialogDescription>
            </DialogHeader>
            {/* Form Edit Artikel */}
            <div className="space-y-4 py-4 border-gray-500">
              <Input
                {...register("title")}
                placeholder="Judul Artikel"
                value={editData?.title || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, title: e.target.value })
                }
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
              <Textarea
                {...register("description")}
                placeholder="Deskripsi Artikel"
                value={editData?.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="edit-category-select">Kategori</Label>
                <Select
                  onValueChange={(value) =>
                    setEditData({ ...editData!, category: value })
                  }
                  value={editData?.category ? String(editData.category) : ""}
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.documentId} value={cat.documentId}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <Input
                {...register("cover_image_url")}
                placeholder="URL Gambar Cover"
                value={editData?.cover_image_url || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, cover_image_url: e.target.value })
                }
              />
              {errors.cover_image_url && (
                <p className="text-red-500 text-sm">
                  {errors.cover_image_url.message}
                </p>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button
                className="bg-[#3674B5] cursor-pointer hover:bg-[#2c5a8f] text-white"
                onClick={handleUpdateArticle}
              >
                Update
              </Button>
              <Button
                variant="outline"
                className="bg-white cursor-pointer hover:bg-gray-100"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Batal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
