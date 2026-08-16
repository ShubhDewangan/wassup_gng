import { useGoogleLogin } from "@react-oauth/google";
import { apiFetch } from "../../lib/fetcher";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";

const GoogleAuth = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkIfAuth = async () => {
      try {
        const res = await apiFetch("/api/auth/status");
        if (res.token) {
          navigate("/chat");
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkIfAuth();
  }, [setIsCheckingAuth]);

  const googleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsAuthenticating(true);
      setError(null);
      try {
        await apiFetch("/api/auth/google-auth", {
          method: "POST",
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });
        window.location.reload()
        navigate("/chat");
      } catch (err) {
        console.log("Authentication Error: ", err);
        setError("Something went wrong signing you in. Please try again.");
        setIsAuthenticating(false);
      }
    },
    onError: () => {
      setError("Google sign-in failed. Please try again.");
    },
  });

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#141414]">
        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#141414] p-4">
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-[#a5e6da] via-[#b6c7f8] to-[#d3b4ed] rounded-[32px] p-8 shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm mb-6">
            <MessageCircle className="h-7 w-7 text-[#5F2A89]" strokeWidth={2} />
          </div>

          <h1 className="text-[32px] leading-[1.1] font-bold text-white tracking-tight mb-2">
            <span className="block text-[#5F2A89]">WASSUP?!</span>
            <span>Let's Stay Connected</span>
          </h1>

          <button
            onClick={() => googleAuth()}
            disabled={isAuthenticating}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-neutral-100 disabled:bg-white/70 disabled:cursor-not-allowed text-neutral-800 font-medium text-sm rounded-xl transition shadow-sm"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 text-xs text-red-900/80 bg-white/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuth;