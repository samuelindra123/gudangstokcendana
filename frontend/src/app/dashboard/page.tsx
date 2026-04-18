'use client';

import { useEffect, useState } from 'react';
import { databases, DATABASE_ID, WORKSPACES_COLLECTION_ID, LOGS_COLLECTION_ID, ITEMS_COLLECTION_ID, account, ID, Query } from '@/lib/appwrite';
import Link from 'next/link';
import { Plus, FolderOpen, X, BarChart3, Package, Archive, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { StatsCard, RecentActivityItem, SearchFilter, LoadingSkeleton, EmptyState } from '@/components/dashboard/DashboardComponents';
import { ExportButton } from '@/lib/export';

export default function DashboardOverview() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<any[]>([]);
  
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
        setFilteredWorkspaces(wsRes.documents);

        // Fetch Items for Analytics
        const itemsRes = await databases.listDocuments(DATABASE_ID, ITEMS_COLLECTION_ID, [
          Query.limit(5000)
        ]);
        setItems(itemsRes.documents);

        // Fetch Recent Logs
        const logsRes = await databases.listDocuments(DATABASE_ID, LOGS_COLLECTION_ID, [
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]);
        setLogs(logsRes.documents);
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadData();
  }, [router]);

  // Filter workspaces by search term
  useEffect(() => {
    const filtered = workspaces.filter(ws =>
      ws.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredWorkspaces(filtered);
  }, [searchTerm, workspaces]);

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
      </header>

      {/* Analytics Cards - Enhanced with Stats Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Workspaces"
          value={workspaces.length}
          icon={<FolderOpen className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard
          title="Total Jenis Barang"
          value={isLoadingStats ? '...' : totalItems}
          icon={<Package className="h-5 w-5" />}
          color="emerald"
        />
        <StatsCard
          title="Total Stok Tersedia"
          value={isLoadingStats ? '...' : totalQuantity.toLocaleString()}
          icon={<Archive className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard
          title="Stok Rendah (≤10)"
          value={isLoadingStats ? '...' : lowStockItems}
          icon={<AlertCircle className="h-5 w-5" />}
          color="rose"
        />
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

      {/* Recent Activities Section */}
      {logs.length > 0 && !isLoadingStats && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
              <p className="text-xs text-zinc-500 mt-1">Latest {Math.min(logs.length, 10)} changes</p>
            </div>
            <Zap className="h-5 w-5 text-amber-400/50" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.slice(0, 10).map((log, idx) => (
              <RecentActivityItem
                key={idx}
                userName={log.userName || 'Unknown'}
                action={log.action || 'Modified'}
                itemName={log.itemName || 'Item'}
                details={log.details || ''}
                timestamp={new Date(log.$createdAt).toLocaleTimeString('id-ID')}
                badge={
                  log.action?.toLowerCase().includes('increment') ? 'increment' :
                  log.action?.toLowerCase().includes('decrement') ? 'decrement' :
                  log.action?.toLowerCase().includes('edit') ? 'edit' : 'create'
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Workspaces Section with Search & Export */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-64">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Cari workspace..."
            />
          </div>
          <div className="flex items-center gap-2">
            {filteredWorkspaces.length > 0 && (
              <ExportButton
                items={filteredWorkspaces}
                filename="workspaces"
                label="Export Workspaces"
              />
            )}
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-500/20">
              <Plus className="h-4 w-4" />
              New Workspace
            </button>
          </div>
        </div>

        {/* Workspaces Grid */}
        {filteredWorkspaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWorkspaces.map(ws => {
              const wsItems = items.filter(i => i.workspaceId === ws.$id);
              const lowStockCount = wsItems.filter(i => i.quantity <= 10).length;
              
              return (
                <Link key={ws.$id} href={`/dashboard/workspace/${ws.$id}`} className="group relative overflow-hidden p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <FolderOpen className="h-6 w-6 text-indigo-400 mb-3 group-hover:text-indigo-300 transition-colors relative z-10" />
                  
                  <h3 className="font-semibold text-white group-hover:text-indigo-100 mb-2 relative z-10">{ws.name}</h3>
                  
                  <div className="space-y-2 text-xs relative z-10">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Items:</span>
                      <span className="text-white font-medium">{wsItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Total Stock:</span>
                      <span className="text-white font-medium">{wsItems.reduce((a, c) => a + (c.quantity || 0), 0)}</span>
                    </div>
                    {lowStockCount > 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>{lowStockCount} low stock</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<FolderOpen className="h-10 w-10" />}
            title={searchTerm ? "No workspaces found" : "No workspaces yet"}
            description={searchTerm ? `Try searching with different keywords` : "Create your first workspace to get started"}
            action={!searchTerm ? { label: 'Create Workspace', onClick: () => setIsModalOpen(true) } : undefined}
          />
        )}
      </div>

      <div className="grid grid-cols-1">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
