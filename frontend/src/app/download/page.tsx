'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ChevronLeft, Smartphone } from "lucide-react";

export default function DownloadApp() {
  const router = useRouter();
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Check if the user is already inside the Capacitor mobile app
    if (typeof window !== "undefined") {
      const isCapacitor = (window as any).Capacitor !== undefined || navigator.userAgent.includes("Capacitor");
      if (isCapacitor) {
        setIsNativeApp(true);
        // Redirect inside app: Because they are already using the native app,
        // redirect them back to the login/web context to prevent downloading the app again.
        router.replace("/");
      }
    }
  }, [router]);

  if (isNativeApp) {
    return <div className="min-h-screen bg-black" />; // Blank while redirecting
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black font-sans selection:bg-white/30 text-white">
      {/* Premium background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-sm px-6">
        
        {/* Back button */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Kembali ke Login
        </Link>

        <div className="flex flex-col items-center space-y-6 text-center">
          
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
            <Smartphone className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
            {/* Notification dot */}
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Gudang Stok Mobile
            </h1>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">
              Unduh aplikasi Android untuk akses kamera langsung, tampilan offline, dan pengalaman yang lebih mulus.
            </p>
          </div>

          <div className="w-full pt-6">
            <a
              href="/app-debug.apk"
              download
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-blue-500/30 bg-blue-600/10 py-3.5 px-4 text-sm font-medium text-blue-400 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] focus:outline-none active:scale-[0.98]"
            >
              <Download className="h-5 w-5" strokeWidth={2} />
              Download APK Android
            </a>
          </div>

          <div className="pt-4 border-t border-white/10 w-full text-left">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Cara Install:</h3>
            <ol className="text-xs text-zinc-500 space-y-2 list-decimal list-inside pl-2">
              <li>Pilih tombol <strong>Download APK</strong> di atas.</li>
              <li>Buka file <code>app-debug.apk</code> yang terunduh.</li>
              <li>Jika diminta, izinkan <strong>Install dari sumber tidak dikenal</strong>.</li>
              <li>Selesai! Buka aplikasi Gudang Stok Cendana di HP Anda.</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}