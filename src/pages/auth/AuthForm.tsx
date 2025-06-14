// src/pages/AuthForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  type LoginForm,
  type RegisterForm,
} from "@/lib/schemaFormAuth";
import { loginUser, registerUser } from "@/redux/features/authSlice";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import IlustrationAuth from "@/assets/vectorAuth-removebg-preview.png";
import Bg from "@/assets/bg.jpg";
import { Loader2 } from "lucide-react";

export default function AuthForm() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmitLogin = async (data: LoginForm) => {
    setIsLoadingLogin(true);
    try {
      const res = await dispatch(loginUser(data));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Login berhasil!", {
          duration: 3000,
          position: "top-center",
        });
        navigate("/dashboard");
      } else {
        throw new Error("Login gagal");
      }
    } catch (error) {
      toast.error("Login gagal. Cek kembali email dan password Anda.");
      console.error("Login error:", error);
    } finally {
      setIsLoadingLogin(false);
    }
  };

  const onSubmitRegister = async (data: RegisterForm) => {
    setIsLoadingRegister(true);
    try {
      const res = await dispatch(registerUser(data));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Registrasi berhasil! Silakan login.");
        setTab("login");
      } else {
        throw new Error("Registrasi gagal");
      }
    } catch (error) {
      toast.error("Registrasi gagal. Pastikan data sudah benar.");
      console.error("Register error:", error);
    } finally {
      setIsLoadingRegister(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-white">
        <div className="hidden md:flex items-center justify-center bg-[#00809D]">
          <img
            src={IlustrationAuth}
            alt="Ilustrasi Auth"
            className="w-auto max-w-xs"
          />
        </div>

        <div className="flex items-center justify-center p-8">
          <Tabs
            value={tab}
            onValueChange={(val) => setTab(val as "login" | "register")}
            className="w-full max-w-md flex flex-col items-center"
          >
            <TabsList className="grid grid-cols-2 gap-4 mb-6 bg-gray-100 p-1 rounded-xl w-full max-w-sm">
              <TabsTrigger
                value="login"
                className="cursor-pointer data-[state=active]:bg-[#3674B5] data-[state=active]:text-white text-[#3674B5] font-semibold rounded-lg py-2"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="cursor-pointer data-[state=active]:bg-[#3674B5] data-[state=active]:text-white text-[#3674B5] font-semibold rounded-lg py-2"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <div className="relative min-h-[20rem] transition-all duration-300 flex items-center justify-center w-full">
              <TabsContent
                value="login"
                className="w-full transition-opacity duration-300 max-w-sm"
              >
                <form
                  onSubmit={loginForm.handleSubmit(onSubmitLogin)}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-[#222831]">Email</Label>
                    <Input
                      {...loginForm.register("identifier")}
                      placeholder="Masukan Email"
                      className="placeholder-black mt-1 border-gray-500"
                    />
                    {loginForm.formState.errors.identifier && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.identifier.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[#222831]">Password</Label>
                    <Input
                      {...loginForm.register("password")}
                      placeholder="Masukan Password"
                      type="password"
                      className="placeholder-black mt-1 border-gray-500"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoadingLogin}
                    className="w-full bg-[#3674B5] hover:bg-[#2c5e91] text-white font-semibold cursor-pointer"
                  >
                    {isLoadingLogin ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent
                value="register"
                className="w-full transition-opacity duration-300 max-w-sm"
              >
                <form
                  onSubmit={registerForm.handleSubmit(onSubmitRegister)}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-[#222831]">Email</Label>
                    <Input
                      {...registerForm.register("email")}
                      placeholder="Email"
                      type="email"
                      className="placeholder-black mt-1"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[#222831]">Username</Label>
                    <Input
                      {...registerForm.register("username")}
                      placeholder="Username"
                      className="placeholder-black mt-1"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[#222831]">Password</Label>
                    <Input
                      {...registerForm.register("password")}
                      placeholder="Password"
                      type="password"
                      className="placeholder-black mt-1"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoadingRegister}
                    className="w-full bg-[#3674B5] hover:bg-[#2c5e91] text-white font-semibold cursor-pointer"
                  >
                    {isLoadingRegister ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
