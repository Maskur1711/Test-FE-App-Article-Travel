import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import AuthForm from "./pages/auth/AuthForm";
import MainLayout from "@/pages/layouts";
import ArticlePage from "@/pages/article/artilePage";
import DetailArticle from "@/pages/article/detail/DetailArticle";
import CategoryPage from "./pages/category/CategoryPage";

function App() {
  return (
    <Router>
      <Toaster richColors />
      <Routes>
        <Route path="/" element={<AuthForm />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ArticlePage />} />
          <Route path="/article" element={<ArticlePage />} />
          <Route path="/articles/:documentId" element={<DetailArticle />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route
            path="/categories/:documentId"
            element={<CategoryPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
