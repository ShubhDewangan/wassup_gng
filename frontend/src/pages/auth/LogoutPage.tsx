import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

const LogoutPage = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#141414]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 shadow-xl">
          <LogOut className="h-7 w-7 text-purple-400 stroke-[1.5]" />
          <span className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-200">Signing you out</p>
          <p className="text-xs text-neutral-500 mt-1">This'll just take a moment...</p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;