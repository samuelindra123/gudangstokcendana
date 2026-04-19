'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Package, AlertCircle, CheckCircle, Loader, Smartphone, Monitor, ChevronLeft } from 'lucide-react';

interface Release {
  version: string;
  tagName: string;
  name: string;
  description: string;
  publishedAt: string;
  downloadUrl?: string;
  portableUrl?: string;
  assets: Array<{
    name: string;
    size: number;
    downloadUrl: string;
    downloadCount: number;
  }>;
}

interface ApiResponse {
  success: boolean;
  releases: Release[];
  latest: Release | null;
  error?: string;
}

export default function DownloadApp() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [latest, setLatest] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/releases');
        const data: ApiResponse = await response.json();

        if (data.success) {
          setReleases(data.releases);
          setLatest(data.latest);
        } else {
          setError(data.error || 'Gagal memuat versi terbaru');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const formatBytes = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb > 0 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative min-h-screen bg-black font-sans text-white selection:bg-white/30">
      {/* Premium subtle background glow effect */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto py-12 px-6 sm:px-8 z-10">
        {/* Header */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-10 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Login
        </Link>

        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Unduh Aplikasi
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Pilih platform yang sesuai dengan perangkat Anda untuk pengalaman manajemen stok terbaik.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 mb-8 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg font-medium transition-all ${
              activeTab === 'desktop'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Monitor className="w-5 h-5" />
            Desktop (Windows)
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg font-medium transition-all ${
              activeTab === 'mobile'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            Mobile (Android)
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Desktop Section */}
          {activeTab === 'desktop' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex gap-4 items-start">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-200 mb-1">Terjadi Kesalahan</h3>
                    <p className="text-red-300/80 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="border border-white/10 bg-white/5 rounded-xl p-12 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                  <p className="text-zinc-400 font-medium">Memeriksa versi Windows terbaru...</p>
                </div>
              )}

              {!loading && !error && latest && (
                <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-indigo-500/20 pb-8">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-wide">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                          VERSI TERBARU
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          Gudang Stok v{latest.version}
                        </h2>
                        <p className="text-zinc-400 text-sm">
                          Diterbitkan pada {formatDate(latest.publishedAt)}
                        </p>
                      </div>
                      <Package className="w-16 h-16 text-indigo-400/50 hidden sm:block" />
                    </div>

                    {latest.description && (
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-8">
                        <p className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                          {latest.description}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                      {latest.downloadUrl && (
                        <a
                          href={latest.downloadUrl}
                          className="flex-1 group relative flex items-center justify-center gap-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-4 px-6 font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                          <Download className="w-5 h-5 flex-shrink-0" />
                          <span>Unduh Installer .exe</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="border border-white/10 bg-white/[0.03] rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex gap-3 mb-4 items-center border-b border-white/10 pb-4">
                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-medium text-zinc-100">Persyaratan Windows</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-400">
                    <li className="flex justify-between items-center">
                      <span className="text-zinc-500">OS</span>
                      <span className="text-zinc-200">Windows 10 / 11 (64-bit)</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-zinc-500">Memori</span>
                      <span className="text-zinc-200">Minimal 2GB RAM</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-zinc-500">Penyimpanan</span>
                      <span className="text-zinc-200">100MB tersedia</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-white/10 bg-white/[0.03] rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="font-medium text-zinc-100 mb-4 border-b border-white/10 pb-4">Cara Pemasangan</h3>
                  <div className="space-y-4 text-sm">
                    {[
                      { step: 1, text: 'Unduh file .exe dari tombol di atas.' },
                      { step: 2, text: 'Buka file installer yang sudah didownload.' },
                      { step: 3, text: 'Ikuti petunjuk di layar (Next > Install).' },
                      { step: 4, text: 'Buka aplikasi dari shortcut Desktop.' },
                    ].map((s) => (
                      <div key={s.step} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-xs font-medium text-zinc-300 mt-0.5">
                          {s.step}
                        </span>
                        <span className="text-zinc-400">{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Section */}
          {activeTab === 'mobile' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="border border-blue-500/30 bg-blue-500/5 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-blue-500/20 pb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-wide">
                        ANDROID APK
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Gudang Stok Mobile
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        Akses gudang di mana saja, fitur scan barcode kamera langsung.
                      </p>
                    </div>
                    <Smartphone className="w-16 h-16 text-blue-400/50 hidden sm:block" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="/app-debug.apk"
                      download
                      className="flex-1 group relative flex items-center justify-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-500 py-4 px-6 font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-[0.98] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      <Download className="w-5 h-5 flex-shrink-0" />
                      <span>Unduh APK Android</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="border border-white/10 bg-white/[0.03] rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="font-medium text-zinc-100 mb-4 border-b border-white/10 pb-4">Cara Pemasangan APK</h3>
                  <div className="space-y-4 text-sm">
                    {[
                      { step: 1, text: 'Ketuk tombol Unduh APK Android di atas.' },
                      { step: 2, text: 'Buka Settings > Security di HP Anda.' },
                      { step: 3, text: 'Aktifkan izin instalasi "Unknown Sources".' },
                      { step: 4, text: 'Buka file .apk dan ketuk Install.' },
                    ].map((s) => (
                      <div key={s.step} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-xs font-medium text-zinc-300 mt-0.5">
                          {s.step}
                        </span>
                        <span className="text-zinc-400">{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border border-white/10 bg-white/[0.03] rounded-xl p-6 backdrop-blur-sm">
                   <div className="flex gap-3 mb-4 items-center border-b border-white/10 pb-4">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <h3 className="font-medium text-zinc-100">Kelebihan Versi Mobile</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-zinc-400 list-disc ml-4">
                    <li>Optimalisasi penyimpanan di cache lokal.</li>
                    <li>Scan QR/Barcode menggunakan kamera bawaan Android.</li>
                    <li>Tampilan antarmuka yang sangat responsif.</li>
                    <li>Notifikasi lokal.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
