'use client';

import { useEffect, useState } from 'react';
import { databases, DATABASE_ID, LOGS_COLLECTION_ID, account, Query } from '@/lib/appwrite';
import { Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        await account.get();
        // Fetch Logs - Get more for the dedicated page
        const lgRes = await databases.listDocuments(DATABASE_ID, LOGS_COLLECTION_ID, [
            Query.orderDesc('$createdAt'),
            Query.limit(500)
        ]);
        setLogs(lgRes.documents);
      } catch (err) {
        console.error("Session expired or unauthorized", err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [router]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Activity Logs</h1>
          <p className="text-zinc-400 text-sm">Track all system activities and changes.</p>
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300 min-w-[800px]">
            <thead className="bg-white/5 text-xs uppercase font-semibold text-zinc-400 border-b border-white/10 relative">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 relative z-10">
            {loading && (
                 <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                     Loading logs...
                 </td>
             </tr>
            )}
            {!loading && logs.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        No recent activity found.
                    </td>
                </tr>
            )}
            {logs.map(log => (
              <tr key={log.$id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-4 text-zinc-500">{new Date(log.$createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-white">{log.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-zinc-300">
                    <Activity className="h-3 w-3 text-indigo-400" />
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 min-w-[300px]">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}