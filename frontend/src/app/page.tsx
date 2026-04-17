'use client';

import { account } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OAuthProvider } from "appwrite";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    async function checkSession() {
      try {
        await account.get();
        router.push("/dashboard");
      } catch (err) {
        setIsLoading(false);
      }
    }
    checkSession();
  }, [router]);

  const loginWithGoogle = () => {
    // OAuth with Appwrite
    account.createOAuth2Session(
      OAuthProvider.Google, // provider
      window.location.origin + '/dashboard', // success url
      window.location.origin // fail url
    );
  };

  if (isLoading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black font-sans selection:bg-white/30">
      {/* Premium subtle background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-sm px-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo / Brand Icon placeholder */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Gudang Stok Cendana
            </h1>
            <p className="text-sm font-medium text-zinc-500">
              System access restricted.
            </p>
          </div>

          <div className="w-full pt-4">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="group relative flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 py-3 px-4 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-[0.98]"
            >
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-600 font-mono tracking-wider">
            ENG. SAMUEL INDRABASTIAN
          </p>
        </div>
      </div>
    </div>
  );
}
