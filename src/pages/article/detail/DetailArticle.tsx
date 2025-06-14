import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleById } from "@/service/articleAPI";
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/service/commentAPI";
import type { Article, Comment } from "@/types/article";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ArticleDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const navigate = useNavigate();

  const [selectedCommentToDelete, setSelectedCommentToDelete] =
    useState<Comment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedCommentToEdit, setSelectedCommentToEdit] =
    useState<Comment | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const getArticleDetails = useCallback(async () => {
    setLoading(true);
    try {
      if (documentId) {
        const res = await getArticleById(documentId);
        setArticle(res);
      }
    } catch (err) {
      console.error("Gagal mengambil detail artikel:", err);
      toast.error("Gagal memuat detail artikel.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    getArticleDetails();
  }, [getArticleDetails]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !article?.documentId) {
      toast.error("Isi komentar tidak boleh kosong.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      await createComment({
        content: commentContent,
        article: article.documentId,
      });
      setCommentContent("");
      toast.success("Komentar berhasil ditambahkan!");
      await getArticleDetails();
    } catch (error) {
      console.error("Gagal menambahkan komentar:", error);
      toast.error("Gagal menambahkan komentar.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedCommentToDelete) return;

    try {
      await deleteComment(selectedCommentToDelete.documentId);
      toast.success("Komentar berhasil dihapus!");
      await getArticleDetails();
    } catch (error) {
      toast.error("Gagal menghapus komentar.");
      console.error("Gagal menghapus komentar:", error);
    } finally {
      setSelectedCommentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleOpenEditDialog = (comment: Comment) => {
    setSelectedCommentToEdit(comment);
    setEditCommentContent(comment.content);
    setIsEditDialogOpen(true);
  };

  const handleEditCommentSubmit = async () => {
    if (!selectedCommentToEdit || !editCommentContent.trim()) {
      toast.error("Isi komentar tidak boleh kosong.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await updateComment(selectedCommentToEdit.documentId, editCommentContent);
      toast.success("Komentar berhasil diperbarui!");
      await getArticleDetails();
    } catch (error) {
      toast.error("Gagal memperbarui komentar.");
      console.error("Gagal memperbarui komentar:", error);
    } finally {
      setIsSubmittingEdit(false);
      setSelectedCommentToEdit(null);
      setEditCommentContent("");
      setIsEditDialogOpen(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={handleGoBack}
          className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg inline-flex items-center mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Kembali
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <>
              <Skeleton className="w-full h-80 rounded-md mb-6" />
              <Skeleton className="w-1/2 h-8 mb-4" />
              <Skeleton className="w-full h-20 mb-6" />
              <Skeleton className="w-1/4 h-4 mb-8" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="w-32 h-10" />
            </>
          ) : article ? (
            <>
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-80 object-cover rounded-md mb-6"
              />
              <Label className="text-3xl font-bold mb-4">{article.title}</Label>
              <p className="text-gray-700 leading-relaxed mb-4">
                {article.description}
              </p>
              {article.category && (
                <p className="text-gray-500 text-sm mb-6">
                  Kategori:{" "}
                  <span className="font-semibold">{article.category.name}</span>
                </p>
              )}

              <h2 className="text-xl font-semibold mb-2">Tambahkan Komentar</h2>
              <form onSubmit={handleCommentSubmit} className="space-y-2 mb-6">
                <Textarea
                  placeholder="Tulis komentar Anda di sini..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                />

                {commentContent.trim() && (
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-white hover:bg-gray-100 cursor-pointer"
                      onClick={() => setCommentContent("")}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="bg-[#3674B5] hover:bg-[#2c5a8f] text-white cursor-pointer"
                    >
                      {isSubmittingComment ? "Mengirim..." : "Kirim Komentar"}
                    </Button>
                  </div>
                )}
              </form>

              <hr className="my-6 border-gray-300" />
              <h2 className="text-xl font-semibold mb-4">Komentar</h2>
              {article.comments && article.comments.length > 0 ? (
                <div className="space-y-4">
                  {article.comments
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((comment) => (
                      <div
                        key={comment.documentId}
                        className="border-b pb-4 last:border-b-0 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-gray-800">{comment.content}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "id-ID"
                            )}{" "}
                            {new Date(comment.createdAt).toLocaleTimeString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDialog(comment)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedCommentToDelete(comment);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="bg-[#b53636] hover:bg-[#8f2c2c] text-white cursor-pointer"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600">Belum ada komentar.</p>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center">
              Artikel tidak ditemukan.
            </p>
          )}
        </div>

        {/* Dialog Hapus Komentar */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Hapus Komentar</DialogTitle>
              <DialogDescription>
                Anda yakin ingin menghapus komentar ini?
                <span className="font-semibold block mt-2">
                  "{selectedCommentToDelete?.content}"
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                className="bg-white text-black hover:bg-gray-200 border"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="bg-[#b53636] hover:bg-[#8f2c2c] text-white"
                onClick={handleDeleteComment}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Edit Komentar */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Edit Komentar</DialogTitle>
              <DialogDescription>
                Silakan ubah komentar Anda di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                onClick={handleEditCommentSubmit}
                disabled={isSubmittingEdit}
                className="bg-[#3674B5] hover:bg-[#2c5a8f] text-white"
              >
                {isSubmittingEdit ? "Memperbarui..." : "Perbarui Komentar"}
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-100"
                onClick={() => setIsEditDialogOpen(false)}
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
