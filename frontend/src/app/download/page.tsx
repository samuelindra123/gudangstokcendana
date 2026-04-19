'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Package, AlertCircle, CheckCircle, Loader, Smartphone, Monitor } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-8">
          ← Kembali
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Unduh Gudang Stok Cendana
          </h1>
          <p className="text-lg text-gray-600">
            Pilih versi yang sesuai dengan perangkat Anda
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'desktop'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-5 h-5" />
            Desktop (Windows)
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'mobile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            Mobile (Android)
          </button>
        </div>

        {/* Desktop Section */}
        {activeTab === 'desktop' && (
          <div className="space-y-8">
            {/* System Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <h3 className="font-semibold text-blue-900 text-lg">Persyaratan Sistem</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="font-semibold min-w-24">OS:</span>
                  <span>Windows 10, Windows 11 (64-bit)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-24">RAM:</span>
                  <span>Minimum 2GB</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-24">Storage:</span>
                  <span>Minimum 100MB free space</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold min-w-24">Internet:</span>
                  <span>Untuk auto-update</span>
                </li>
              </ul>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Memuat versi terbaru...</p>
              </div>
            )}

            {/* Latest Release */}
            {!loading && !error && latest && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      VERSI TERBARU
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      v{latest.version}
                    </h2>
                    <p className="text-gray-600">
                      Rilis: {formatDate(latest.publishedAt)}
                    </p>
                  </div>
                  <Package className="w-12 h-12 text-green-600" />
                </div>

                <div className="bg-white rounded-lg p-4 mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">
                    {latest.description || 'Tidak ada deskripsi tersedia'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latest.downloadUrl && (
                    <a
                      href={latest.downloadUrl}
                      className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Installer (Recommended)</span>
                    </a>
                  )}
                  {latest.portableUrl && (
                    <a
                      href={latest.portableUrl}
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Portable Version</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Installation Instructions */}
            {!loading && !error && (
              <div className="bg-gray-100 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  📝 Cara Instalasi
                </h3>
                <div className="space-y-6">
                  {[
                    {
                      num: 1,
                      title: 'Unduh File',
                      desc: 'Klik tombol "Installer" di atas untuk mengunduh aplikasi',
                    },
                    {
                      num: 2,
                      title: 'Jalankan Installer',
                      desc: 'Double-click file .exe yang telah diunduh untuk memulai instalasi',
                    },
                    {
                      num: 3,
                      title: 'Ikuti Petunjuk',
                      desc: 'Pilih folder instalasi dan tunggu hingga instalasi selesai',
                    },
                    {
                      num: 4,
                      title: 'Buka Aplikasi',
                      desc: 'Cari aplikasi di Start Menu atau gunakan Desktop Shortcut',
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                          {step.num}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                        <p className="text-gray-700 text-sm mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portable Version Info */}
            {!loading && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">💾 Versi Portable</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Versi portable dapat dijalankan langsung tanpa instalasi. Cocok untuk:
                </p>
                <ul className="text-blue-800 text-sm space-y-1 ml-4">
                  <li>✓ Menjalankan dari USB drive</li>
                  <li>✓ Tidak perlu hak akses administrator</li>
                  <li>✓ Instalasi otomatis tanpa perlu wizard</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Mobile Section */}
        {activeTab === 'mobile' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    APLIKASI MOBILE
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Aplikasi Android
                  </h2>
                  <p className="text-gray-600">
                    Akses langsung dari smartphone Anda
                  </p>
                </div>
                <Smartphone className="w-12 h-12 text-blue-600" />
              </div>

              <div className="bg-white rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm">
                  Unduh aplikasi Android untuk akses kamera langsung, tampilan offline, dan pengalaman yang lebih mulus di smartphone Anda.
                </p>
              </div>

              <a
                href="/app-debug.apk"
                download
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full md:w-auto"
              >
                <Download className="w-5 h-5" />
                <span>Download APK (Android)</span>
              </a>
            </div>

            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                📝 Cara Instalasi
              </h3>
              <div className="space-y-6">
                {[
                  {
                    num: 1,
                    title: 'Unduh APK',
                    desc: 'Klik tombol "Download APK" di atas untuk mengunduh file instalasi',
                  },
                  {
                    num: 2,
                    title: 'Izinkan Sumber Tidak Dikenal',
                    desc: 'Buka Settings > Security dan aktifkan "Unknown Sources"',
                  },
                  {
                    num: 3,
                    title: 'Buka File',
                    desc: 'Buka file APK yang telah diunduh untuk memulai instalasi',
                  },
                  {
                    num: 4,
                    title: 'Selesai',
                    desc: 'Tunggu instalasi selesai dan buka aplikasi dari home screen',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold">
                        {step.num}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      <p className="text-gray-700 text-sm mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}