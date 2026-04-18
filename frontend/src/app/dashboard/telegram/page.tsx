'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, DATABASE_ID, TELEGRAM_SESSION_COLLECTION_ID, ID } from '@/lib/appwrite';
import { Copy, Check, Bot, ArrowLeft, RefreshCw, Send, Info, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { TELEGRAM_BOT } from '@/lib/constants';

export default function TelegramAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const u = await account.get();
        setUser(u);
      } catch (error) {
        // Redirect to login if not authenticated
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const generateToken = async () => {
    setIsGenerating(true);
    try {
      const rawToken = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await databases.createDocument(
        DATABASE_ID,
        TELEGRAM_SESSION_COLLECTION_ID,
        ID.unique(),
        {
          userId: user?.$id,
          token: rawToken,
          isVerified: false
        }
      );

      setToken(rawToken);
    } catch (error: any) {
      console.error('Error generating token:', error);
      alert('Gagal menghasilkan token: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(`/login ${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse space-y-4 text-center">
            <Bot className="h-10 w-10 text-indigo-500/50 mx-auto" />
            <p className="text-sm text-zinc-500">Memuat koneksi Telegram...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl tracking-tight font-bold text-white mb-2">Integrasi Telegram</h1>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Tautkan akun ini ke bot Telegram agar Anda dapat memantau dan mengelola stok workspace secara langsung menggunakan pesan chat.
        </p>
      </div>

      {/* Bot Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-400 text-sm font-medium">Bot Name</p>
            <p className="text-white text-sm">Gudang Stok Cendana</p>
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Bot className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 text-sm font-medium">Bot Handler</p>
            <p className="text-white text-sm font-mono">@{TELEGRAM_BOT.HANDLER}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:bg-white/[0.04]">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

        {!token ? (
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 relative z-10">
            <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex flex-col items-center justify-center border border-indigo-500/20 shadow-2xl">
              <Bot className="h-10 w-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>
            
            <div className="max-w-md">
              <h3 className="text-lg font-medium text-white mb-2">Siap untuk Memulai?</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Tekan tombol di bawah untuk membuat Token Akses aman. Token ini berfungsi sebagai kunci pribadi yang akan menghubungkan bot dengan sistem Gudang Stok Cendana.
              </p>
              
              <button
                onClick={generateToken}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mx-auto w-full sm:w-auto"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isGenerating ? 'Membuat Token...' : 'Generate Token Akses'}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-8">
            {/* Step 1 */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6 transition-all hover:border-white/10">
              <span className="inline-flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-xs font-bold w-6 h-6 rounded-full mb-4">1</span>
              <h4 className="text-sm font-medium text-white mb-3">Copy Perintah Login Anda</h4>
              
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
                <div className="flex-1 w-full bg-zinc-950 font-mono text-indigo-300 px-4 py-3 rounded-lg border border-white/10 select-all tracking-wider text-center sm:text-left">
                  /login {token}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-lg font-medium text-sm transition-colors"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 text-emerald-400" /> <span className="text-emerald-400">Tersalin!</span></>
                  ) : (
                    <><Copy className="h-4 w-4" /> Salin Perintah</>
                  )}
                </button>
              </div>
              <p className="text-zinc-500 text-xs mt-3">Token valid selama 24 jam</p>
            </div>

            {/* Step 2 */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6 transition-all hover:border-white/10">
               <span className="inline-flex items-center justify-center bg-emerald-500/20 text-emerald-400 text-xs font-bold w-6 h-6 rounded-full mb-4">2</span>
               <h4 className="text-sm font-medium text-white mb-2">Buka Bot Telegram</h4>
               <p className="text-zinc-400 text-sm mb-4">
                 Buka obrolan dengan <strong>@GudangStokCendana_bot</strong> di Telegram, lalu <em>Paste</em> (Tempel) perintah yang di-copy tadi dan tekan kirim.
               </p>
               <a 
                 href={TELEGRAM_BOT.DIRECT_LINK()} 
                 target="_blank" 
                 rel="noreferrer"
                 className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
               >
                 Buka Bot Telegram Sekarang →
               </a>
            </div>

            {/* Step 3 - Image Prompts */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 md:p-6 transition-all hover:border-white/10">
               <span className="inline-flex items-center justify-center bg-violet-500/20 text-violet-400 text-xs font-bold w-6 h-6 rounded-full mb-4">3</span>
               <h4 className="text-sm font-medium text-white mb-3">Setup Gambar Bot (Optional)</h4>
               <p className="text-zinc-400 text-xs mb-4">Prompt untuk AI Image Generator:</p>
               
               <div className="space-y-3">
                 <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                   <p className="text-xs text-zinc-300 mb-2"><strong>Foto Profil:</strong> Professional warehouse icon, dark blue & indigo, minimalist design</p>
                 </div>
                 <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                   <p className="text-xs text-zinc-300"><strong>Welcome Picture:</strong> Dashboard mockup, dark theme, workspace cards, inventory items</p>
                 </div>
               </div>

               <p className="text-xs text-zinc-500 mt-4">Gunakan: DALL-E, Midjourney, atau ChatGPT Vision</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
