'use client';

import { useEffect, useState } from 'react';
import { databases, DATABASE_ID, WORKSPACES_COLLECTION_ID, LOGS_COLLECTION_ID, ITEMS_COLLECTION_ID, account, ID, Query } from '@/lib/appwrite';
import Link from 'next/link';
import { Plus, FolderOpen, X, BarChart3, Package, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function DashboardOverview() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Custom Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const u = await account.get();
        setUser(u);

        // Fetch Workspaces
        const wsRes = await databases.listDocuments(DATABASE_ID, WORKSPACES_COLLECTION_ID, [
          Query.limit(100)
        ]);
        setWorkspaces(wsRes.documents);

        // Fetch Items for Analytics
        const itemsRes = await databases.listDocuments(DATABASE_ID, ITEMS_COLLECTION_ID, [
          Query.limit(5000)
        ]);
        setItems(itemsRes.documents);
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadData();
  }, [router]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setIsCreating(true);

    try {
      const newWs = await databases.createDocument(DATABASE_ID, WORKSPACES_COLLECTION_ID, ID.unique(), {
        name: newWsName,
        ownerId: user.$id
      });
      setWorkspaces((prev) => [...prev, newWs]);
      
      // Log activity
      await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
        action: 'CREATED_WORKSPACE',
        details: `Created workspace: ${newWsName}`,
        userId: user.$id,
        userName: user.name
      });

      setNewWsName('');
      setIsModalOpen(false);
    } catch (err) {
      alert("Error creating workspace. Make sure Database and Collection ID are set up.");
    } finally {
      setIsCreating(false);
    }
  };

  // Analytics Data Prep
  const totalItems = items.length;
  const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const lowStockItems = items.filter(i => i.quantity <= 10).length;

  const wsChartData = workspaces.map(ws => {
    const wsItems = items.filter(i => i.workspaceId === ws.$id);
    const qty = wsItems.reduce((acc, current) => acc + (current.quantity || 0), 0);
    return {
      name: ws.name,
      TotalBarang: wsItems.length,
      TotalStok: qty
    };
  });

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back, {user?.name || "..."}</h1>
          <p className="text-zinc-400">Manage your stock workspaces and analytics.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm shadow-lg shadow-indigo-500/20">
          <Plus className="h-4 w-4" />
          New Workspace
        </button>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Total Workspaces</h3>
            <FolderOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-4">{workspaces.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Total Jenis Barang</h3>
            <Package className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-4">{isLoadingStats ? '...' : totalItems}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Total Stok Tersedia</h3>
            <Archive className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-4">{isLoadingStats ? '...' : totalQuantity.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Barang Stok Menipis (≤10)</h3>
            <BarChart3 className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-4">{isLoadingStats ? '...' : lowStockItems}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      {workspaces.length > 0 && wsChartData.length > 0 && !isLoadingStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Distribusi Stok per Workspace</h3>
            <div className="h-64 w-full text-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wsChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="TotalStok" radius={[4, 4, 0, 0]}>
                    {wsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Persentase Jenis Barang</h3>
            <div className="h-64 w-full text-sm flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wsChartData.filter(d => d.TotalBarang > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="TotalBarang"
                    nameKey="name"
                  >
                    {wsChartData.filter(d => d.TotalBarang > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {workspaces.map(ws => (
              <Link key={ws.$id} href={`/dashboard/workspace/${ws.$id}`} className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col gap-4 shadow-xl shadow-black/50">
                <FolderOpen className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <div>
                  <h3 className="font-semibold text-white group-hover:text-indigo-100">{ws.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">Manage items</p>
                </div>
              </Link>
            ))}
            {workspaces.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-zinc-500 border border-dashed border-white/10 rounded-xl">
                    No workspaces yet. Create one to get started.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Tailwind Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Create New Workspace</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateWorkspace} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Workspace Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. Gudang Utama"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2">
                  {isCreating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
