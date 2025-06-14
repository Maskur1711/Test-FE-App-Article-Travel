# 🚀 AuthForm - React Authentication UI

Ini adalah halaman Aplikasi Website App Article Travel dibangun dengan React, TypeScript, Zod, Redux Toolkit, Redux, dan Tailwind CSS (shadcn/ui).

---

## 📦 Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/Maskur1711/Test-FE-App-Article-Travel.git
   cd nama-proyek
2. npm install
3. npm run dev

## 📦 Teknologi
1. ReactJs
2. TypeScript
3. Redux ToolKit
4. Zod
5. React Hook Form
6. Tailwind CSS + shadcn/ui
7. React Router DOM
8. Lucid React

## 🧑‍💻 Kontribusi

## 📄 Lisensi

MIT © Maskur

### 📜 Struktur Folder
src/
├── assets/                 # Gambar, ilustrasi, background, dll.
├── components/             # Komponen UI reusable (Navbar, Button, dsb.)
│   ├── nav/
│   └── ui/
├── lib/                    # Validasi Zod dan utilitas
│   ├── schemaFormArticle.ts
│   ├── schemaFormAuth.ts
│   ├── schemaFormCategory.ts
│   └── utils.ts
├── pages/                  # Halaman utama aplikasi
│   ├── article/
│   ├── auth/
│   ├── category/
│   ├── dashboard/
│   └── layouts.tsx
├── redux/                  # Konfigurasi dan fitur Redux Toolkit
│   ├── features/
│   │   └── authSlice.ts
│   ├── hooks.ts
│   └── store.ts
├── service/                # File untuk memanggil API
│   ├── articleAPI.ts
│   ├── categoryAPI.ts
│   └── commentAPI.ts
├── types/                  # Tipe data TypeScript
│   ├── article.ts
│   ├── category.ts
│   └── comment.ts
├── App.tsx                 # Root component utama
├── index.css               # Global CSS
├── main.tsx                # Entry point React
└── vite-env.d.ts           # Environment Vite

