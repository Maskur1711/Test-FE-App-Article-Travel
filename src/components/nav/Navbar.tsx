import { useDispatch, useSelector } from "react-redux";
import { logout, getUserProfile } from "@/redux/features/authSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Label } from "../ui/label";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user && !fetchedRef.current) {
      fetchedRef.current = true;
      dispatch(getUserProfile());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between border-b-2">
      <Label className="text-xl font-bold text-[#3674B5]">Artikel Travel</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar>
              <AvatarImage alt={user?.username || "User"} />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">
              {user?.username || "User"}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>{user?.username || "User"}</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
