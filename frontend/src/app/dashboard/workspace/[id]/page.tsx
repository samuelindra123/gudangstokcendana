'use client';

import { useEffect, useState, useRef } from 'react';
import { databases, storage, DATABASE_ID, ITEMS_COLLECTION_ID, LOGS_COLLECTION_ID, BUCKET_ID, ID, Query, account } from '@/lib/appwrite';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Download, Edit2, Search, X, Trash2, Camera, UserSquare2, Image as ImageIcon, Minus, Video } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Item {
  $id: string;
  name: string;
  quantity: number;
  workspaceId: string;
  status: string;
  unit: string;
  imageId?: string;
  imageUrl?: string;
  $createdAt: string;
  $updatedAt: string;
}

export default function WorkspaceDetail() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.id as string;
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Perlu Dicek' | 'Sudah Sesuai'>('Semua');

  // States for Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('0');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newItemStatus, setNewItemStatus] = useState('Perlu Dicek');
  const [newItemImage, setNewItemImage] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // States for Edit Item Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; quantity: number, status: string, unit: string, imageId?: string, imageUrl?: string } | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantityStr, setEditQuantityStr] = useState('');
  const [editUnit, setEditUnit] = useState('pcs');
  const [editStatus, setEditStatus] = useState('Perlu Dicek');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // States for Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // States for Built-in Camera App
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraTarget, setCameraTarget] = useState<'add' | 'edit' | null>(null);

  const startCamera = async (target: 'add' | 'edit') => {
    setCameraTarget(target);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch(err) {
      alert("Gagal mengakses kamera. Pastikan browser memiliki izin kamera.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraTarget(null);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          if (cameraTarget === 'add') {
             setNewItemImage(file);
          } else if (cameraTarget === 'edit') {
             setEditImage(file);
             setEditImagePreview(URL.createObjectURL(file));
          }
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  useEffect(() => {
    async function fetchItems() {
      try {
        await account.get(); // Pastikan user login
        const res = await databases.listDocuments(DATABASE_ID, ITEMS_COLLECTION_ID, [
          Query.equal('workspaceId', workspaceId),
          Query.orderDesc('$createdAt')
        ]);
        setItems(res.documents as unknown as Item[]);
      } catch (err: any) {
        console.error('Failed fetching items or unauthorized:', err);
        if (err.message?.toLowerCase().includes('authorized') || err.message?.toLowerCase().includes('missing scopes')) {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [workspaceId, router]);

  const submitAddItem = async (e: React.FormEvent | React.MouseEvent, keepOpen: boolean = false) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setIsAdding(true);
    
    const quantity = parseInt(newItemQuantity || "0", 10);

    try {
      let imageId = null;
      let imageUrl = null;

      if (newItemImage) {
        const file = await storage.createFile(BUCKET_ID, ID.unique(), newItemImage);
        imageId = file.$id;
        const res = storage.getFilePreview(BUCKET_ID, file.$id);
        imageUrl = res.toString();
      }

      const itemPayload: any = {
        name: newItemName,
        quantity,
        workspaceId,
        status: newItemStatus,
        unit: newItemUnit
      };

      if (imageId && imageUrl) {
        itemPayload.imageId = imageId;
        itemPayload.imageUrl = imageUrl;
      }

      const newItem = await databases.createDocument(DATABASE_ID, ITEMS_COLLECTION_ID, ID.unique(), itemPayload);
      setItems((prev) => [newItem as unknown as Item, ...prev]);
      
      try {
          const u = await account.get();
          await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
            action: 'BARANG_BARU',
            details: `Barang Baru: ${quantity} ${newItemUnit} untuk item ${newItemName} (${newItemStatus}) [ITEM_ID:${newItem.$id}]`,
            userId: u.$id,
            userName: u.name
          });
      } catch(logErr) {
          console.error("Failed logging activity", logErr);
      }

      setNewItemName('');
      setNewItemQuantity('0');
      setNewItemUnit('pcs');
      setNewItemStatus('Perlu Dicek');
      setNewItemImage(null);
      if (!keepOpen) {
        setIsAddModalOpen(false);
      } else {
        setTimeout(() => document.getElementById('newItemNameInput')?.focus(), 100);
      }
    } catch (e) {
      console.error(e);
      alert('Error creating item.');
    } finally {
      setIsAdding(false);
    }
  };

  const processQuickAdjust = async (item: Item, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 0) return; // Prevent negative stock

    try {
      // Optimistic update
      setItems(items.map(i => i.$id === item.$id ? { ...i, quantity: newQty } : i));
      await databases.updateDocument(DATABASE_ID, ITEMS_COLLECTION_ID, item.$id, { quantity: newQty });

      try {
        const u = await account.get();
        const actionType = delta > 0 ? 'STOK_MASUK' : 'STOK_KELUAR';
        const absDelta = Math.abs(delta);
        const detailMsg = delta > 0 
            ? `Stok Masuk: +${absDelta} ${item.unit || 'pcs'} (Total: ${newQty} ${item.unit || 'pcs'}, Status: ${item.status}) untuk item ${item.name} [ITEM_ID:${item.$id}]`
            : `Stok Keluar: -${absDelta} ${item.unit || 'pcs'} (Total: ${newQty} ${item.unit || 'pcs'}, Status: ${item.status}) untuk item ${item.name} [ITEM_ID:${item.$id}]`;
            
        await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
          action: actionType,
          details: detailMsg,
          userId: u.$id,
          userName: u.name
        });
      } catch (logErr) {
        console.error("Log err", logErr);
      }
    } catch(err) {
      console.error(err);
      // Revert optimism
      setItems(items.map(i => i.$id === item.$id ? { ...i, quantity: item.quantity } : i));
      alert("Gagal mengupdate stok.");
    }
  };

  const openEditModal = (item: Item) => {
    setEditingItem({ id: item.$id, name: item.name, quantity: item.quantity, status: item.status || 'Perlu Dicek', unit: item.unit || 'pcs', imageId: item.imageId, imageUrl: item.imageUrl });
    setEditName(item.name);
    setEditQuantityStr(String(item.quantity));
    setEditUnit(item.unit || 'pcs');
    setEditStatus(item.status || 'Perlu Dicek');
    setEditImagePreview(item.imageUrl || '');
    setEditImage(null);
    setIsEditModalOpen(true);
  };

  const submitEditQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const newQty = parseInt(editQuantityStr, 10);
    if(isNaN(newQty)) return;

    setIsEditing(true);

    try {
      const difference = newQty - editingItem.quantity;
      const statusChanged = editStatus !== editingItem.status;
      const unitChanged = editUnit !== editingItem.unit;
      const nameChanged = editName.trim() !== editingItem.name && editName.trim() !== '';
      const finalName = nameChanged ? editName.trim() : editingItem.name;
      
      let imageId = editingItem.imageId;
      let imageUrl = editingItem.imageUrl;

      if (editImage) {
        // Hapus image lama jika mau diganti
        if (editingItem.imageId) {
          try {
            await storage.deleteFile(BUCKET_ID, editingItem.imageId);
          } catch(ignore) { }
        }
        const file = await storage.createFile(BUCKET_ID, ID.unique(), editImage);
        imageId = file.$id;
        const res = storage.getFilePreview(BUCKET_ID, file.$id);
        imageUrl = res.toString();
      }

      let actionType = 'UBAH_STOK_STATUS';
      let detailMsg = `Updated ${editingItem.name} [ITEM_ID:${editingItem.id}]`;
      
      let changes = [];
      if (nameChanged) changes.push(`Nama (${editingItem.name} -> ${finalName})`);
      if (unitChanged) changes.push(`Satuan (${editingItem.unit} -> ${editUnit})`);
      if (editImage) changes.push(`Ubah Foto Barang`);
      if (difference > 0) changes.push(`Stok Masuk: +${difference} ${editUnit}`);
      if (difference < 0) changes.push(`Stok Keluar: -${Math.abs(difference)} ${editUnit}`);
      if (statusChanged) changes.push(`Status (${editingItem.status} -> ${editStatus})`);
      
      if (difference > 0) {
          actionType = 'STOK_MASUK';
          detailMsg = `Stok Masuk: +${difference} ${editUnit} (Total: ${newQty} ${editUnit}, Status: ${editStatus}) untuk item ${finalName} ${editImage?'(Foto Diperbarui)':''} [ITEM_ID:${editingItem.id}]`;
      } else if (difference < 0) {
          actionType = 'STOK_KELUAR';
          detailMsg = `Stok Keluar: ${Math.abs(difference)} ${editUnit} (Total: ${newQty} ${editUnit}, Status: ${editStatus}) untuk item ${finalName} ${editImage?'(Foto Diperbarui)':''} [ITEM_ID:${editingItem.id}]`;
      } else if (statusChanged || nameChanged || unitChanged || editImage) {
          actionType = nameChanged && !statusChanged && !unitChanged && !editImage ? 'UBAH_NAMA' : 'UBAH_PROFIL';
          detailMsg = `Mengubah Profil Barang - ${changes.join(', ')} [ITEM_ID:${editingItem.id}]`;
      }

      const updateData: any = {
        name: finalName,
        quantity: newQty,
        status: editStatus,
        unit: editUnit
      };

      if (imageId) updateData.imageId = imageId;
      if (imageUrl) updateData.imageUrl = imageUrl;

      await databases.updateDocument(DATABASE_ID, ITEMS_COLLECTION_ID, editingItem.id, updateData);
      setItems(items.map(item => item.$id === editingItem.id ? { ...item, name: finalName, quantity: newQty, status: editStatus, unit: editUnit, imageId: imageId||undefined, imageUrl: imageUrl||undefined } : item));

      try {
          // Hanya log if ada perubahan nilai, status, satuan atau nama
          if (difference !== 0 || statusChanged || nameChanged || unitChanged) {
            const u = await account.get();
            await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
              action: actionType,
              details: detailMsg,
              userId: u.$id,
              userName: u.name
            });
          }
      } catch(logErr) {
          console.error("Failed logging activity", logErr);
      }

      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error updating quantity.");
    } finally {
      setIsEditing(false);
    }
  };

  const confirmDelete = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.imageId) {
        try {
          await storage.deleteFile(BUCKET_ID, itemToDelete.imageId);
        } catch(ignore) { }
      }
      await databases.deleteDocument(DATABASE_ID, ITEMS_COLLECTION_ID, itemToDelete.$id);
      setItems(items.filter(i => i.$id !== itemToDelete.$id));

      try {
          const u = await account.get();
          await databases.createDocument(DATABASE_ID, LOGS_COLLECTION_ID, ID.unique(), {
            action: 'HAPUS_BARANG',
            details: `Menghapus Barang: ${itemToDelete.name} (${itemToDelete.quantity} stok terakhir, Status: ${itemToDelete.status}) [ITEM_ID:${itemToDelete.$id}]`,
            userId: u.$id,
            userName: u.name
          });
      } catch(logErr) {
          console.error("Failed logging activity", logErr);
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Error deleting item.");
    } finally {
      setIsDeleting(false);
    }
  };

  const exportExcel = async () => {
    if (items.length === 0) {
      alert("No data to export");
      return;
    }
    setIsExporting(true);
    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Gudang Stok Cendana';
      wb.created = new Date();
      
      let allLogs: any[] = [];
      try {
        const logRes = await databases.listDocuments(DATABASE_ID, LOGS_COLLECTION_ID, [
          Query.limit(3000),
          Query.orderAsc('$createdAt')
        ]);
        allLogs = logRes.documents;
      } catch (err) {
        console.error("Failed fetching logs for export", err);
      }

      // Create Summary Sheet First
      const summarySheet = wb.addWorksheet('Ringkasan Stok', { views: [{ showGridLines: false }] });
      summarySheet.columns = [
        { header: 'No', key: 'no', width: 6 },
        { header: 'ID Barang', key: 'id', width: 28 },
        { header: 'Nama Barang', key: 'name', width: 50 },
        { header: 'Satuan', key: 'unit', width: 15 },
        { header: 'Stok Akhir', key: 'qty', width: 20 }
      ];
      
      const summaryHeader = summarySheet.getRow(1);
      summaryHeader.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      items.forEach((item, index) => {
         const row = summarySheet.addRow({
           no: index + 1, id: item.$id, name: item.name, unit: item.unit || 'pcs', qty: item.quantity
         });
         row.getCell('qty').numFmt = '#,##0';
      });

      summarySheet.eachRow((row) => {
         row.eachCell(cell => {
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
         });
      });
      
      items.forEach(item => {
        const itemLogs = allLogs.filter(log => 
          log.details.includes(`[ITEM_ID:${item.$id}]`) || 
          (log.details.includes(item.name) && !log.details.includes('[ITEM_ID:'))
        );
        
        let sheetName = item.name.substring(0, 31).replace(/[\\/*?:\[\]]/g, '');
        const ws = wb.addWorksheet(sheetName || 'Item', { views: [{ showGridLines: false }] });

        ws.columns = [
           { header: 'Tanggal Log', key: 'date', width: 25 },
           { header: 'Referensi Aksi', key: 'action', width: 35 },
           { header: 'Keterangan', key: 'desc', width: 60 },
           { header: 'Masuk (Debit)', key: 'in', width: 20 },
           { header: 'Keluar (Kredit)', key: 'out', width: 20 },
           { header: 'Satuan', key: 'unit', width: 15 },
           { header: 'Total Saldo', key: 'balance', width: 25 }
        ];

        const wsHeader = ws.getRow(1);
        wsHeader.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        
        if (itemLogs.length === 0) {
           const row = ws.addRow({
             date: new Date().toLocaleString('id-ID'),
             action: 'Data Awal',
             desc: 'Inisiasi Stok',
             in: item.quantity,
             out: 0,
             unit: item.unit || 'pcs'
           });
           row.getCell('balance').value = { formula: 'D2-E2' };
        } else {
           let rowIndex = 2;
           itemLogs.forEach(log => {
              let perubahanIn = 0;
              let perubahanOut = 0;

              // Bersihkan keterangan dari status dan quantity total agar lebih human-readable & "normal" seperti yang di-request
              let detailText = log.details.split('[ITEM_ID:')[0].trim();
              detailText = detailText.replace(/\s*\(Total:[^)]+\)/gi, '');
              
              if(log.details.includes('Stok Masuk:')) {
                  const matchIn = log.details.split('(')[0].replace('Stok Masuk:', '').trim();
                  perubahanIn = parseInt(matchIn.replace('+','')) || 0;
              } else if (log.details.includes('Stok Keluar:')) {
                  const matchOut = log.details.split('(')[0].replace('Stok Keluar:', '').trim();
                  perubahanOut = parseInt(matchOut.replace('-','')) || 0;
              } else if (log.details.includes('Barang Baru:')) {
                  perubahanIn = parseInt(log.details.match(/Barang Baru:\s(\d+)/)?.[1] || '0');
              } else if (log.details.includes('Added')) {
                  perubahanIn = parseInt(log.details.match(/Added\s(\d+)x/)?.[1] || '0');
              }

              // Filter UBAH_STATUS yang tidak merubah kuantitas agar lebih rapih (atau tampilkan tp no qty logic)
              const row = ws.addRow({
                 date: new Date(log.$createdAt).toLocaleString('id-ID'),
                 action: log.action.replace(/_/g, ' '),
                 desc: detailText,
                 in: perubahanIn || 0,
                 out: perubahanOut || 0,
                 unit: item.unit || 'pcs'
              });

              // Implementasi formula Excel otomatis untuk menghitung Saldo agar transparan saat diakses tanpa web
              if (rowIndex === 2) {
                 row.getCell('balance').value = { formula: `D2-E2` };
              } else {
                 row.getCell('balance').value = { formula: `G${rowIndex-1}+D${rowIndex}-E${rowIndex}` };
              }
              rowIndex++;
           });
        }

        // Tambahkan 50 baris kosong berformat agar user offline bisa langsung mengetik tanpa atur table lagi
        let currentRowCount = ws.rowCount;
        for (let i = 0; i < 50; i++) {
           currentRowCount++;
           const emptyRow = ws.addRow({
              date: '',
              action: '',
              desc: '',
              in: '', // dibuat kosong agar file excel lebih bersih terlihatnya (tidak 0 semua)
              out: '', // dibuat kosong
              unit: item.unit || 'pcs'
           });
           // Tetap tambahkan formula ke baris kosong tersebut
           emptyRow.getCell('balance').value = { formula: `IF(AND(ISBLANK(D${currentRowCount}), ISBLANK(E${currentRowCount})), "", G${currentRowCount-1}+D${currentRowCount}-E${currentRowCount})` };
        }
        
        ws.eachRow((row, rowNumber) => {
           row.eachCell(cell => {
              cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
           });
           if(rowNumber > 1) {
              row.getCell('in').numFmt = '#,##0';
              row.getCell('out').numFmt = '#,##0';
              row.getCell('balance').numFmt = '#,##0';
           }
        });
      });
      
      
      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Stok_Workspace_${workspaceId}_${new Date().toISOString().split('T')[0]}.xlsx`);

    } finally {
      setIsExporting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'Semua') return matchesSearch;
    return matchesSearch && item.status === activeTab;
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Item Management</h1>
          <p className="text-zinc-400 text-sm">Manage inventory and search items.</p>
        </div>
        <div className="flex gap-4">
            <button onClick={exportExcel} disabled={isExporting} className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 disabled:opacity-50 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium transition-all text-sm">
                <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:block">{isExporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-indigo-500/20 text-sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:block">Add Item</span>
            </button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3 bg-white/5 border border-white/10 p-2 rounded-xl focus-within:border-indigo-500/50 transition-colors w-full sm:max-w-sm">
              <Search className="h-5 w-5 text-zinc-500 ml-2" />
              <input 
                  type="text" 
                  placeholder="Search items..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-white focus:ring-0 w-full text-sm outline-none placeholder:text-zinc-600"
              />
          </div>

          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-full sm:w-auto overflow-x-auto">
              {(['Semua', 'Perlu Dicek', 'Sudah Sesuai'] as const).map((tab) => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                          activeTab === tab 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                      {tab}
                  </button>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                <ImageIcon className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
                <p className="text-lg font-medium text-white mb-1">Tidak ada barang</p>
                <p>Klik "Add Item" untuk mulai menambahkan stok.</p>
            </div>
        )}
        {filteredItems.map(item => (
          <div key={item.$id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col group">
            {/* Foto Barang Lebih Menonjol */}
            <div className="relative h-48 bg-black/60 flex items-center justify-center overflow-hidden border-b border-white/10">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3 shadow-md shadow-black/50">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                        item.status === 'Sudah Sesuai' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                        {item.status || 'Perlu Dicek'}
                    </span>
                </div>
            </div>

            {/* Info Barang */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2" title={item.name}>{item.name}</h3>
                </div>
                
                <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-2xl font-black text-indigo-400">{item.quantity}</span>
                    <span className="text-sm font-medium text-zinc-400">{item.unit || 'pcs'}</span>
                </div>

                <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/5">
                    {/* Quick Adjust */}
                    <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-inner">
                      <button onClick={() => processQuickAdjust(item, -1)} className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10 active:bg-white/20" title="Minus 1">
                        <Minus className="h-4 w-4" />
                      </button>
                      <button onClick={() => processQuickAdjust(item, 1)} className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors active:bg-white/20" title="Add 1">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg border border-white/10 hover:border-white/20 shadow-sm" title="Edit Item">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirmDelete(item)} className="text-zinc-400 hover:text-red-400 transition-colors bg-white/5 p-1.5 rounded-lg border border-white/10 hover:border-red-500/30 shadow-sm" title="Hapus Item">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Camera Component overlay modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-[61]">
            <h2 className="text-white font-bold text-sm tracking-widest uppercase">Kamera Gudang</h2>
            <button onClick={stopCamera} className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
             <video ref={videoRef} autoPlay playsInline className="absolute min-w-full min-h-full object-cover" />
          </div>
          <div className="h-32 bg-black flex items-center justify-center pb-safe">
            <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-95 transition-transform">
               <div className="w-12 h-12 rounded-full bg-white transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Add New Item</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitAddItem} className="p-6 space-y-6">
                <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Foto Barang <span className="text-zinc-500 font-normal">(opsional)</span></label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                      <button type="button" onClick={() => startCamera('add')} className="flex items-center justify-center flex-1 h-14 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg border border-indigo-500/20 transition-colors gap-2 w-full">
                          <Camera className="w-5 h-5" />
                          <span className="text-sm font-medium">Buka Kamera</span>
                      </button>
                      <label htmlFor="dropzone-file" className="flex items-center justify-center flex-1 h-14 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg border border-white/10 cursor-pointer transition-colors gap-2 w-full">
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                          <span className="text-sm font-medium">Pilih File Galeri</span>
                          <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewItemImage(e.target.files[0]);
                            }
                          }} />
                      </label>
                  </div>
                  {newItemImage && (
                      <div className="mt-3 flex items-center justify-between bg-black/30 p-2 rounded-lg border border-white/5">
                        <span className="text-xs text-emerald-400 font-medium truncate max-w-[200px]">{newItemImage.name}</span>
                        <button type="button" onClick={() => setNewItemImage(null)} className="text-red-400 hover:text-red-300 text-xs font-medium">Hapus</button>
                      </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Item Name</label>
                  <input 
                    id="newItemNameInput"
                    type="text" 
                    autoFocus
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Baut Mur 10mm"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Initial Quantity</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      placeholder="0"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Satuan</label>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    >
                      <option value="pcs">pcs</option>
                      <option value="meter">meter</option>
                      <option value="cm">cm</option>
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="box">box</option>
                      <option value="lusin">lusin</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Status</label>
                  <select
                    value={newItemStatus}
                    onChange={(e) => setNewItemStatus(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value="Perlu Dicek">Perlu Dicek</option>
                    <option value="Sudah Sesuai">Sudah Sesuai</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={(e) => submitAddItem(e, true)} disabled={isAdding} className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isAdding ? 'Adding...' : 'Save & Add Another'}
                </button>
                <button type="submit" disabled={isAdding} className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isAdding ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Quantity & Status Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Update Item</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitEditQuantity} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">                  <label className="text-sm font-medium text-zinc-300">Foto Barang <span className="text-zinc-500 font-normal">(opsional)</span></label>
                  <div className="flex items-center gap-4">
                      {editImagePreview ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group flex-shrink-0">
                            <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => { setEditImage(null); setEditImagePreview(''); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-5 h-5 text-red-400" />
                            </button>
                        </div>
                      ) : (
                          <div className="w-16 h-16 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center text-zinc-500 flex-shrink-0">
                             <ImageIcon className="w-6 h-6" />
                          </div>
                      )}
                      
                      <div className="flex flex-col gap-2 flex-1 w-full">
                          <button type="button" onClick={() => startCamera('edit')} className="flex items-center justify-center w-full h-9 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg border border-indigo-500/20 transition-colors gap-2 text-xs font-medium">
                              <Camera className="w-4 h-4" /> Buka Kamera
                          </button>
                          <label htmlFor="edit-dropzone-file" className="flex items-center justify-center w-full h-9 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg border border-white/10 transition-colors gap-2 cursor-pointer text-xs font-medium">
                              <ImageIcon className="w-4 h-4" /> Pilih dari Galeri
                              <input id="edit-dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  setEditImage(file);
                                  setEditImagePreview(URL.createObjectURL(file));
                                }
                              }} />
                          </label>
                      </div>
                  </div>
                </div>
                <div className="space-y-2">                  <label className="text-sm font-medium text-zinc-300">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">New Quantity</label>
                    <input 
                      type="number" 
                      required
                      value={editQuantityStr}
                      onChange={(e) => setEditQuantityStr(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Satuan</label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    >
                      <option value="pcs">pcs</option>
                      <option value="meter">meter</option>
                      <option value="cm">cm</option>
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="box">box</option>
                      <option value="lusin">lusin</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value="Perlu Dicek">Perlu Dicek</option>
                    <option value="Sudah Sesuai">Sudah Sesuai</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isEditing} className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2">
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Hapus Item</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                Yakin ingin menghapus item <span className="font-bold text-white">"{itemToDelete.name}"</span>? 
                Aksi ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="button" onClick={executeDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}