'use client';

import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
    } catch (err) {
      console.log('Session already deleted or expired', err);
    } finally {
      router.push('/');
    }
  };

  const navLinkClass = (path: string) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === path ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="font-semibold tracking-tight text-white/90">Gudang Stok</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className={navLinkClass('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            Workspaces Overview
          </Link>
          <Link href="/dashboard/logs" className={navLinkClass('/dashboard/logs')}>
            <Activity className="h-4 w-4" />
            Activity Logs
          </Link>
          <Link href="/dashboard/ai" className={navLinkClass('/dashboard/ai')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            Gudang AI
          </Link>
          <Link href="/dashboard/telegram" className={navLinkClass('/dashboard/telegram')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            Telegram Bot
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-black relative pb-20 md:pb-0">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="p-4 md:p-8 relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between h-16 px-2">
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${pathname === '/dashboard' || pathname.startsWith('/dashboard/workspace') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">Overview</span>
          </Link>
          <Link 
            href="/dashboard/logs" 
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${pathname === '/dashboard/logs' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Activity className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">Logs</span>
          </Link>
          <Link 
            href="/dashboard/ai" 
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${pathname === '/dashboard/ai' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            <span className="text-[10px] font-medium tracking-wide">AI Assistant</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-wide">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
