'use client';

import { useState, useRef, useEffect } from 'react';
import { account, databases, DATABASE_ID, ITEMS_COLLECTION_ID, LOGS_COLLECTION_ID, ID, Query } from '@/lib/appwrite';
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
    id: '1', role: 'assistant', content: 'Halo kak! Saya AI Asisten Gudang Anda. Apa yang bisa saya bantu hari ini?\n\n(Contoh: "Aku tambahin stok beras kuning 10 karung" atau "Ada sisa kecap manis berapa?" atau "Kurangi stok telur 5 kg krn pecah")', timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [itemsInfo, setItemsInfo] = useState<any[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const u = await account.get();
        setUser(u);
        const res = await databases.listDocuments(DATABASE_ID, ITEMS_COLLECTION_ID, [Query.limit(500)]);
        setItemsInfo(res.documents.map(d => ({
          id: d.$id,
          name: d.name,
          quantity: d.quantity,
          unit: d.unit || 'pcs'
        })));
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
      const dbContext = JSON.stringify(itemsInfo);
      
      const systemPrompt = `Anda adalah Asisten IT Profesional & Ramah untuk aplikasi Gudang Stok Cendana.
Berikut adalah status stok gudang SAAT INI (sebagai database bayangan Anda): 
${dbContext}

Tugas Anda:
1. Membaca pesan user.
2. Memutuskan apakah harus MENAMBAH BARANG BARU (yg belum ada), MENGUBAH STOK BARU (barang yg sudah ada), atau HANYA MENJAWAB INFO/TANYA JAWAB.
3. JANGAN berasumsi ID! Cari persis atau yang mirip dari daftar di atas. Jika user minta mengubah barang tapi namanya belum ada, tambah barang baru.

OUTPUT HARUS 100% JSON SAJA. TIDAK BOLEH ADA KODE MARKDOWN \`\`\`json. TIDAK BOLEH ADA TEKS LAIN.
Struktur:
{
  "reply": "Respons ramah dalam bahasa Indonesia kepada user (Bantu jelaskan apa yang baru saja Anda lakukan ke database, atau jawab pertanyaan).",
  "actions": [
    // Isi jika ada DUA tipe aksi ini:
    { "type": "new_item", "name": "Beras Kuning", "qty": 10, "unit": "kg" },
    { "type": "adjust_stock", "id": "id barang di database dari tabel di atas", "diff": 5atau -5, "name": "Nama" }
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
      
      // Sanitasi Kimi terkadang memberikan MD
      if (jsonText.startsWith('```json')) jsonText = jsonText.substring(7);
      if (jsonText.startsWith('```')) jsonText = jsonText.substring(3);
      if (jsonText.endsWith('```')) jsonText = jsonText.substring(0, jsonText.length-3);
      
      let parsed: any = { reply: 'Maaf, terjadi kesalahan parsing.', actions: [] };
      try {
          parsed = JSON.parse(jsonText);
      } catch(e) {
          console.error('Invalid JSON from AI:', jsonText);
          parsed.reply = res.content; // fallback
      }
      
      let aiReply = parsed.reply;
      
      let itemsList = [...itemsInfo];

      if (parsed.actions && parsed.actions.length > 0) {
        for (const action of parsed.actions) {
          if (action.type === 'new_item') {
            const newItemDoc = await databases.createDocument(DATABASE_ID, ITEMS_COLLECTION_ID, ID.unique(), {
              name: action.name,
              quantity: action.qty,
              unit: action.unit || 'pcs',
              status: 'Baru (AI)'
            });
            itemsList.push({ id: newItemDoc.$id, name: action.name, quantity: action.qty, unit: action.unit });
            
            await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
               action: 'AI_BARANG_BARU',
               details: `Barang Baru: ${action.qty} ${action.unit || 'pcs'} untuk item ${action.name} (By AI) [ITEM_ID:${newItemDoc.$id}]`,
               userId: user?.$id || 'AI_SYSTEM',
               userName: 'AI Assistant'
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
                   details: `${action.diff > 0 ? 'Menambah' : 'Mengurangi'} Stok: ${sign}${action.diff} ${existing.unit} untuk item ${existing.name} (By AI) [ITEM_ID:${existing.id}]`,
                   userId: user?.$id || 'AI_SYSTEM',
                   userName: 'AI Assistant'
                 });
             }
          }
        }
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
        content: `Error: Gagal memproses permintaan (${err.message || 'Koneksi AI sibuk'}).`,
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
          <p className="text-zinc-500 text-sm mt-1">Mengotomatisasi tugas stok gudang dengan asisten cerdas.</p>
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
                 <span className="text-sm text-zinc-500 italic animate-pulse">Menghitung gudang...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-white/10 bg-black/40 relative z-10 backdrop-blur-md">
           <div className="flex items-center gap-2 px-3 py-1 mb-2">
              <Info className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-zinc-500">AI terhubung ke Database dan akan terekam Otomatis pada Log.</span>
           </div>
           <div className="flex gap-2 items-center">
              <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
                 placeholder="Ketik instruksi masuk/keluar barang atau tanya stok..."
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
