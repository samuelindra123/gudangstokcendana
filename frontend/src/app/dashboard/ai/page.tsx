'use client';

import { useState, useRef, useEffect } from 'react';
import { account, databases, DATABASE_ID, WORKSPACES_COLLECTION_ID, ITEMS_COLLECTION_ID, LOGS_COLLECTION_ID, ID, Query } from '@/lib/appwrite';
import { Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react';
import { askAI } from '@/app/actions/ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1', role: 'assistant', content: 'Halo kak! Saya AI Asisten Gudang Tercanggih. Saya sekarang bisa melihat workspace akun kamu.\n\nMau buat workspace baru? Atau cek dan sesuaikan stok di workspace tertentu? Beritahu saya!', timestamp: new Date()
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
        
        // Fetch User's Workspaces
        const wsRes = await databases.listDocuments(DATABASE_ID, WORKSPACES_COLLECTION_ID, [
          Query.equal('ownerId', u.$id),
          Query.limit(100)
        ]);
        const wsData = wsRes.documents.map((w: any) => ({
          id: w.$id,
          name: w.name
        }));
        setWorkspacesInfo(wsData);

        // Fetch Items
        const wsIds = wsData.map((w: any) => w.id);
        if (wsIds.length > 0) {
          const itemsRes = await databases.listDocuments(DATABASE_ID, ITEMS_COLLECTION_ID, [
            Query.limit(1000)
          ]);
          // Filter items manually valid for user workspaces
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
        return {
          ...item,
          workspaceName: ws ? ws.name : 'Unknown'
        };
      });
      const dbContext = JSON.stringify(itemsContextData);
      
      const systemPrompt = `Anda adalah Asisten IT Profesional & Ramah untuk aplikasi Gudang Stok Cendana.
Berikut adalah daftar WORKSPACE milik user:
${wsContext}

Berikut adalah status stok gudang SAAT INI berdasarkan workspace (database bayangan): 
${dbContext}

Tugas Anda:
1. Membaca pesan user.
2. Memutuskan apakah harus MEMBUAT WORKSPACE BARU, MENAMBAH BARANG BARU (yg belum ada di workspace target), MENGUBAH STOK BARANG (yg sudah ada di workspace), atau HANYA MENJAWAB INFO/TANYA JAWAB.
3. JANGAN berasumsi ID! Cari persis dari daftar di atas. Jika user minta menambah/mengubah barang, PASTI-kan Anda tahu di workspace mana barang itu berada atau akan dibuat. Jika nama workspace tidak disebutkan oleh user dan user memiliki lebih dari 1 workspace, MINTA konfirmasi dari user terlebih dahulu, JANGAN langsung melakukan aksi tindakan.
4. Jika user ingin membuat workspace baru, gunakan type "new_workspace".

OUTPUT HARUS 100% JSON SAJA. TIDAK BOLEH ADA KODE MARKDOWN. TIDAK BOLEH ADA TEKS LAIN.
Struktur JSON yang WAJIB dicantumkan:
{
  "reply": "Respons ramah ke user. (Jika butuh konfirmasi, tanyakan di sini lalu array actions KOSONG).",
  "actions": [
    // Isi JIKA ANDA YAKIN dengan workspace target dan user minta aksi mutasi database
    { "type": "new_workspace", "name": "Gudang Utama" },
    { "type": "new_item", "workspaceId": "id_workspace_didapat_dari_daftar", "name": "Beras Kuning", "qty": 10, "unit": "kg" },
    { "type": "adjust_stock", "id": "id_barang_dari_tabel_items", "diff": 5, "name": "Beras Kuning" }
  ]
}
`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage.content }
      ];

      const res = await askAI(apiMessages);
      let jsonText = res.content.trim();
      
      if (jsonText.startsWith('```json')) jsonText = jsonText.substring(7);
      if (jsonText.startsWith('```')) jsonText = jsonText.substring(3);
      if (jsonText.endsWith('```')) jsonText = jsonText.substring(0, jsonText.length-3);
      
      let parsed: any = { reply: 'Maaf, terjadi kesalahan.', actions: [] };
      try {
          parsed = JSON.parse(jsonText);
      } catch(e) {
          console.error('Invalid JSON from AI:', jsonText);
          parsed.reply = res.content; 
      }
      
      let aiReply = parsed.reply;
      
      let workspacesList = [...workspacesInfo];
      let itemsList = [...itemsInfo];

      if (parsed.actions && parsed.actions.length > 0) {
        for (const action of parsed.actions) {
          if (action.type === 'new_workspace') {
            const newWsDoc = await databases.createDocument(DATABASE_ID, WORKSPACES_COLLECTION_ID, ID.unique(), {
               name: action.name,
               ownerId: user.$id
            });
            workspacesList.push({ id: newWsDoc.$id, name: action.name });

            await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
               action: 'AI_WORKSPACE_BARU',
               details: `Membuat Workspace Baru: ${action.name} (By AI)`,
               userId: user?.$id || 'AI_SYSTEM',
               userName: 'AI Assistant',
               workspaceId: newWsDoc.$id
            });
          } else if (action.type === 'new_item') {
            if (!action.workspaceId) continue;
            const newItemDoc = await databases.createDocument(DATABASE_ID, ITEMS_COLLECTION_ID, ID.unique(), {
              workspaceId: action.workspaceId,
              name: action.name,
              quantity: action.qty,
              unit: action.unit || 'pcs',
              status: 'Baru (AI)'
            });
            itemsList.push({ id: newItemDoc.$id, workspaceId: action.workspaceId, name: action.name, quantity: action.qty, unit: action.unit });
            
            await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
               action: 'AI_BARANG_BARU',
               details: `Barang Baru: ${action.qty} ${action.unit || 'pcs'} untuk item ${action.name} (By AI)`,
               userId: user?.$id || 'AI_SYSTEM',
               userName: 'AI Assistant',
               workspaceId: action.workspaceId
            });
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
             }
          }
        }
        setWorkspacesInfo(workspacesList);
        setItemsInfo(itemsList);
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date()
      }]);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: Gagal memproses permintaan AI.`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            Gudang AI
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Asisten cerdas yang tahu workspace dan stok gudang Anda.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-500/20">
          <Bot className="w-4 h-4" /> Kimi-k2.5
        </div>
      </div>

      <div className="flex-1 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col overflow-hidden relative backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              )}
              
              <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-none' 
                  : 'bg-white/[0.05] border border-white/10 text-zinc-200 rounded-bl-none'
              }`}>
                <p className="text-sm tracking-wide leading-relaxed whitespace-pre-wrap">{m.content}</p>
                <div className={`text-[9px] font-medium mt-2 flex items-center gap-1 ${
                  m.role === 'user' ? 'text-indigo-200 justify-end' : 'text-zinc-500'
                }`}>
                  {m.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-2">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
               </div>
               <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                 <span className="text-sm text-zinc-500 italic animate-pulse">Berpikir dan menyinkronkan data...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10 bg-black/40 relative z-10 backdrop-blur-md">
           <div className="flex items-center gap-2 px-3 py-1 mb-2">
              <Info className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-zinc-500">AI ini terhubung ke multi-Workspace Anda secara real-time.</span>
           </div>
           <div className="flex gap-2 items-center">
              <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
                 placeholder="Cth: Bikin workspace 'Gudang B' lalu isi stok..."
                 className="flex-1 bg-white/5 border border-white/10 text-sm text-white px-4 py-3 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
              <button
                 disabled={!input.trim() || loading}
                 onClick={handleSend}
                 className="w-11 h-11 flex flex-shrink-0 items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl text-white transition-all shadow-lg shadow-indigo-500/20"
              >
                 <Send className="w-5 h-5 ml-0.5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
