'use client';

import { useState, useRef, useEffect } from 'react';
import { account, databases, DATABASE_ID, WORKSPACES_COLLECTION_ID, ITEMS_COLLECTION_ID, LOGS_COLLECTION_ID, ID, Query } from '@/lib/appwrite';
import { Send, Bot, Sparkles, Loader2, Info, CheckCircle2, Box, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { askAI } from '@/app/actions/ai';

interface ActionLog {
  type: string;
  name: string;
  details: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ActionLog[];
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1', role: 'assistant', content: 'Halo kak! Saya AI Asisten Gudang Tercanggih. Saya sekarang terhubung langsung dengan seluruh workspace akun kamu.\n\nMau buat workspace baru? Atau cek dan sesuaikan stok di workspace tertentu? Beritahu saya saja, saya akan mengerjakannya untukmu!', timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [workspacesInfo, setWorkspacesInfo] = useState<any[]>([]);
  const [itemsInfo, setItemsInfo] = useState<any[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const u = await account.get();
        setUser(u);
        
        const wsRes = await databases.listDocuments(DATABASE_ID, WORKSPACES_COLLECTION_ID, [
          Query.limit(100)
        ]);
        const wsData = wsRes.documents.map((w: any) => ({
            id: w.$id,
            name: w.name,
            ownerId: w.ownerId
        }));
        setWorkspacesInfo(wsData);

        const wsIds = wsData.map((w: any) => w.id);
        if (wsIds.length > 0) {
          const itemsRes = await databases.listDocuments(DATABASE_ID, ITEMS_COLLECTION_ID, [
            Query.limit(1000)
          ]);
          const allItems = itemsRes.documents
            .filter((d: any) => wsIds.includes(d.workspaceId))
            .map((d: any) => ({
              id: d.$id,
              workspaceId: d.workspaceId,
              name: d.name,
              quantity: d.quantity,
              unit: d.unit || 'pcs'
            }));
          setItemsInfo(allItems);
        }
      } catch(e) {
        console.error('Failed loading db state', e);
      }
    };
    loadState();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const wsContext = JSON.stringify(workspacesInfo);
      const itemsContextData = itemsInfo.map(item => {
        const ws = workspacesInfo.find(w => w.id === item.workspaceId);
        return { ...item, workspaceName: ws ? ws.name : 'Unknown' };
      });
      const dbContext = JSON.stringify(itemsContextData);
      
      const systemPrompt = `Anda adalah Asisten IT Profesional & Ramah untuk aplikasi Gudang Stok Cendana.
Berikut adalah daftar WORKSPACE milik user:
${wsContext}

Berikut adalah status stok gudang SAAT INI berdasarkan workspace: 
${dbContext}

Tugas Anda:
1. Membaca pesan user.
2. Memutuskan apakah harus MEMBUAT WORKSPACE BARU, MENAMBAH BARANG BARU, MENGUBAH STOK BARANG, atau HANYA MENJAWAB INFO/TANYA JAWAB.
3. JANGAN berasumsi ID! Cari persis dari daftar di atas. Jika user tidak menyebutkan target workspace, MINTA konfirmasi dulu sebelum melakukan instruksi menambah barang.
4. JIKA USER INGIN MENAMBAHKAN BARANG ACAK BEBAS SEBANYAK X ITEM, silakan buat datanya dan masukkan ke target workspace yg diminta user menggunakan array JSON "new_item" berulang.

FORMAT BALASAN ANDA (SANGAT PENTING):
1. TEKS BIASA (Markdown): Tuliskan pesan ramah, detail, dan rapi untuk pengguna sebagai bagian awal balasan Anda! Gunakan Bullet point, Bold, dsb sesuka Anda.
2. BLOK KODE JSON AKSI (Wajib di akhir pesan, JIKA dan HANYA JIKA Anda melakukan mutasi database / menambah/mengubah stok). Format mutasi berupa ARRAY dari aksi yang ingin dilakukan.

Contoh Struktur Balasan Anda yang SEMPURNA:
Halo kak! 👋 Selamat datang di **Gudang Stok Cendana**!
Saya sudah membuatkan workspace baru dan menambah barang ke dalamnya. Silakan di cek!

\`\`\`json
[
  { "type": "new_workspace", "name": "Gudang Rahasia" },
  { "type": "new_item", "workspaceId": "id_workspace_didapat_dari_daftar", "name": "Sensor DHT22", "qty": 10, "unit": "pcs" },
  { "type": "adjust_stock", "id": "id_barang_dari_tabel_items", "diff": 5, "name": "Beras Kuning" }
]
\`\`\`
JANGAN meletakkan pesan balasan ke dalam JSON. Pesan ditujukan kepada user harus DI LUAR blok JSON tsb!
Jika Anda HANYA menjawab/memberi info dan TIDAK ADA perintah perubahan mutasi, JANGAN TULIS BLOK KODE JSON SAMA SEKALI. Tulis saja teksnya.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content }
      ];

      const res = await askAI(apiMessages);
      let fullContent = res.content.trim();
      
      let aiReply = fullContent;
      let parsedActions: any[] = [];
      const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
      const match = fullContent.match(jsonBlockRegex);
      
      if (match && match[1]) {
          try {
              parsedActions = JSON.parse(match[1]);
              aiReply = fullContent.replace(jsonBlockRegex, '').trim();
          } catch(e) {
              console.error('Invalid JSON block in AI reply:', match[1]);
              aiReply = fullContent.replace(jsonBlockRegex, '').trim() + '\n\n*(Catatan: Blok JSON tindakan gagal dieksekusi karena format AI salah)*';
          }
      }
      
      let workspacesList = [...workspacesInfo];
      let itemsList = [...itemsInfo];
      let executedActions: ActionLog[] = [];

      if (parsedActions && parsedActions.length > 0) {
        for (const action of parsedActions) {
          try {
            if (action.type === 'new_workspace') {
              const newWsDoc = await databases.createDocument(DATABASE_ID, WORKSPACES_COLLECTION_ID, ID.unique(), {
                 name: action.name,
                 ownerId: user.$id
              });
              workspacesList.push({ id: newWsDoc.$id, name: action.name, ownerId: user.$id });

              await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
                 action: 'AI_WORKSPACE_BARU',
                 details: `Membuat Workspace Baru: ${action.name} (By AI)`,
                 userId: user?.$id || 'AI_SYSTEM',
                 userName: 'AI Assistant',
                 workspaceId: newWsDoc.$id
              });
              executedActions.push({ type: 'workspace', name: action.name, details: 'Membuat workspace baru' });
            } else if (action.type === 'new_item') {
              if (!action.workspaceId) continue;
              const newItemDoc = await databases.createDocument(DATABASE_ID, ITEMS_COLLECTION_ID, ID.unique(), {
                workspaceId: action.workspaceId,
                name: action.name,
                quantity: action.qty,
                unit: action.unit || 'pcs',
                status: 'Baru (AI)'
              });
              itemsList.push({ id: newItemDoc.$id, workspaceId: action.workspaceId, name: action.name, quantity: action.qty, unit: action.unit || 'pcs' });
              
              await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
                 action: 'AI_BARANG_BARU',
                 details: `Barang Baru: ${action.qty} ${action.unit || 'pcs'} untuk item ${action.name} (By AI)`,
                 userId: user?.$id || 'AI_SYSTEM',
                 userName: 'AI Assistant',
                 workspaceId: action.workspaceId
              });
              executedActions.push({ type: 'add', name: action.name, details: `+${action.qty} ${action.unit || 'pcs'}` });
            } else if (action.type === 'adjust_stock') {
               const existing = itemsList.find(i => i.id === action.id);
               if (existing) {
                   const newQty = existing.quantity + action.diff;
                   await databases.updateDocument(DATABASE_ID, ITEMS_COLLECTION_ID, action.id, {
                       quantity: newQty
                   });
                   existing.quantity = newQty;
                   
                   const actionCode = action.diff > 0 ? 'TAMBAH_STOK' : 'KURANG_STOK';
                   const sign = action.diff > 0 ? '+' : '';
                   await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
                     action: `AI_${actionCode}`,
                     details: `${action.diff > 0 ? 'Menambah' : 'Mengurangi'} Stok: ${sign}${action.diff} ${existing.unit} untuk item ${existing.name} (By AI)`,
                     userId: user?.$id || 'AI_SYSTEM',
                     userName: 'AI Assistant',
                     workspaceId: existing.workspaceId
                   });
                   executedActions.push({ type: action.diff > 0 ? 'up' : 'down', name: existing.name, details: `${sign}${action.diff} ${existing.unit}` });
               }
            }
          } catch (axErr) {
            console.error('Failed executing action', action, axErr);
          }
        }
        setWorkspacesInfo(workspacesList);
        setItemsInfo(itemsList);
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiReply.replace(/\\n/g, '\n'), // Restore newlines for display
        actions: executedActions,
        timestamp: new Date()
      }]);

    } catch (err: any) {
      console.error('Main askAI loop error', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: Gagal memproses balasan. Mohon ulangi lagi nanti.`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    // Basic markdown bold parsing
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            Gudang AI
          </h1>
          <p className="text-zinc-500 text-sm mt-1 mb-2">Asisten Generatif dengan Automasi Data Akurat.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-500/20">
          <Bot className="w-4 h-4" /> Kimi-k2.5
        </div>
      </div>

      <div className="flex-1 border border-white/10 rounded-2xl bg-black/20 flex flex-col overflow-hidden relative backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${m.role === 'user' ? 'ml-auto justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300 shadow-inner">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className={`rounded-2xl px-5 py-4 shadow-xl ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none' 
                    : 'bg-white/[0.04] border border-white/10 text-zinc-200 rounded-bl-sm'
                }`}>
                  <div className="text-[15px] tracking-wide leading-relaxed whitespace-pre-wrap font-light">
                    {renderContent(m.content)}
                  </div>
                  <div className={`text-[10px] font-medium mt-3 flex items-center gap-1.5 ${
                    m.role === 'user' ? 'text-indigo-200 justify-end' : 'text-zinc-500'
                  }`}>
                    {m.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    {m.role === 'assistant' && m.actions?.length ? <CheckCircle2 className="w-3 h-3 text-indigo-400" /> : null}
                  </div>
                </div>

                {/* Log UI untuk Actions */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1 ml-2 animate-in fade-in slide-in-from-top-2 duration-500">
                     {m.actions.map((act, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 w-max shadow-sm backdrop-blur-md">
                           {act.type === 'workspace' && <Box className="w-4 h-4 text-emerald-400" />}
                           {act.type === 'add' && <PlusCircle className="w-4 h-4 text-indigo-400" />}
                           {act.type === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                           {act.type === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                           
                           <div>
                             <p className="text-[13px] text-zinc-300 font-medium">{act.name}</p>
                             <p className="text-[10px] text-zinc-500 font-mono">{act.details}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
               </div>
               <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-bl-none px-6 py-4 flex items-center gap-3">
                 <span className="flex gap-1.5">
                   <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0ms'}}></span>
                   <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '150ms'}}></span>
                   <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '300ms'}}></span>
                 </span>
                 <span className="text-sm text-zinc-400 font-medium animate-pulse ml-2">Asisten sedang memproses...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40 relative z-10 backdrop-blur-md">
           <div className="flex gap-3 mb-3 px-2">
              <Info className="w-4 h-4 text-amber-500/80 flex-shrink-0" />
              <p className="text-xs text-zinc-400/80 leading-tight">AI melakukan otomatisasi mutasi gudang. Permintaan aksi besar mungkin memerlukan 3-5 detik karena menyimpan ke database.</p>
           </div>
           <div className="flex gap-3 items-center group shadow-xl shadow-indigo-900/10 rounded-2xl bg-white/[0.03] border border-white/10 focus-within:border-indigo-500/50 hover:border-white/20 transition-all p-1">
              <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
                 placeholder="Ketik instruksi atau pertanyaan stok..."
                 className="flex-1 bg-transparent text-[15px] tracking-wide text-white px-4 py-3 outline-none transition-all placeholder:text-zinc-600"
              />
              <button
                 disabled={!input.trim() || loading}
                 onClick={handleSend}
                 className="w-12 h-12 flex flex-shrink-0 items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl text-white transition-all shadow-lg shadow-indigo-500/30 mx-1"
              >
                 <Send className="w-5 h-5 ml-1" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
