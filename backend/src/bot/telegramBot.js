const { Telegraf, Markup } = require('telegraf');
const { databases, Query, ID, DB_ID, WORKSPACE_COLLECTION_ID, ITEM_COLLECTION_ID, TELEGRAM_SESSION_COLLECTION_ID, LOG_COLLECTION_ID } = require('../config/appwrite');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ============ ACTION CONSTANTS (Jangan di-hardcode) ============
const ACTION_TYPES = {
    EDIT_NAME: 'edit_name',
    INCREMENT: 'increment',
    DECREMENT: 'decrement',
};

const INPUT_TYPES = {
    EDIT_NAME: 'edit_name',
    INCREMENT: 'inc',
    DECREMENT: 'dec',
};

// Store editing state in memory (userId -> { itemId, type, itemName, currentQuantity })
const userState = new Map();

// Function to log changes (matching frontend format)
async function logChange(telegramUserId, userName, itemId, itemName, action, oldValue, newValue, quantityChanged = null) {
    try {
        let details = '';
        
        if (action === ACTION_TYPES.EDIT_NAME) {
            details = `Changed item name from '${oldValue}' to '${newValue}'`;
        } else if (action === ACTION_TYPES.INCREMENT) {
            details = `Increased '${itemName}' quantity from ${oldValue} to ${newValue} (+${quantityChanged})`;
        } else if (action === ACTION_TYPES.DECREMENT) {
            details = `Decreased '${itemName}' quantity from ${oldValue} to ${newValue} (-${quantityChanged})`;
        }
        
        await databases.createDocument(DB_ID, LOG_COLLECTION_ID, ID.unique(), {
            telegramUserId: String(telegramUserId),
            userName: userName,
            itemId: itemId,
            itemName: itemName,
            action: action,
            oldValue: String(oldValue),
            newValue: String(newValue),
            quantityChanged: quantityChanged || null,
            details: details
        });
        console.log(`📝 Logged: [${action}] by ${userName}`);
    } catch (error) {
        console.error("Error logging change:", error);
    }
}

// Helper function to get Appwrite UserId from Telegram ChatId
async function getUserIdByChatId(chatId) {
    try {
        const response = await databases.listDocuments(
            DB_ID,
            TELEGRAM_SESSION_COLLECTION_ID,
            [Query.equal('telegramChatId', String(chatId))]
        );
        if (response.documents.length > 0) {
            return response.documents[0].userId;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user session:", error);
        return null;
    }
}

// Greeting Logic
async function handleGreeting(ctx) {
    const chatId = ctx.from.id;
    const firstName = ctx.from.first_name || 'Teman';
    const lastName = ctx.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Mengecek apakah user sudah login (sudah menautkan telegramChatId)
    const userId = await getUserIdByChatId(chatId);

    if (userId) {
        return ctx.reply(
            `Selamat datang kembali, *${fullName}*! ✅\n\n` +
            `Anda sudah terhubung ke sistem *Gudang Stok Cendana*.\n\n` +
            `Ketik /workspaces untuk melihat dan mengelola stok inventaris Anda.\n\n` +
            `_Dibuat dengan ❤️ oleh Samuel Indra Bastian_`,
            { parse_mode: 'Markdown' }
        );
    }

    // Jika belum login, berikan intruksi dengan personalized greeting
    await ctx.reply(
        `Halo, *${fullName}*! 👋 Selamat datang di *Gudang Stok Cendana* 📦\n\n` +
        `Sistem manajemen inventaris yang dibuat khusus untuk memudahkan Anda mengelola stok workspace secara realtime melalui Telegram.\n\n` +
        `🔑 *Langkah Mulai:*\n` +
        `1️⃣ Buka halaman Dashboard di aplikasi Web\n` +
        `2️⃣ Klik menu *Telegram Bot* di sidebar kiri\n` +
        `3️⃣ Tekan tombol *Generate Token* untuk mendapat kode unik\n` +
        `4️⃣ Copy kodenya dan kirim ke sini dengan format:\n\n` +
        `\`/login KODE_TOKEN_ANDA\`\n\n` +
        `_Sistem ini dikembangkan oleh Samuel Indra Bastian_`,
        { parse_mode: 'Markdown' }
    );
}

// Bot triggers for Greeting
bot.start(handleGreeting);
bot.hears(['halo', 'Halo', 'hi', 'Hi', 'hello', 'Hello', 'hai', 'Hai'], handleGreeting);

// Bot Command: login via token
bot.command('login', async (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length !== 2) {
        return ctx.reply(
            "❌ *Format Salah*\n\n" +
            "Gunakan format:\n" +
            "`/login KODE_TOKEN_ANDA`\n\n" +
            "_Contoh: /login ABC123_",
            { parse_mode: 'Markdown' }
        );
    }

    const token = args[1];
    const chatId = ctx.from.id;
    const firstName = ctx.from.first_name || 'Teman';
    const lastName = ctx.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    try {
        const sessions = await databases.listDocuments(DB_ID, TELEGRAM_SESSION_COLLECTION_ID, [
            Query.equal('token', token)
        ]);

        if (sessions.documents.length === 0) {
            return ctx.reply(
                "❌ *Token Tidak Valid*\n\n" +
                "Token yang Anda kirim tidak ditemukan atau sudah kadaluarsa.\n\n" +
                "Silakan buka dashboard lagi dan generate token baru.",
                { parse_mode: 'Markdown' }
            );
        }

        const sessionDoc = sessions.documents[0];
        
        await databases.updateDocument(DB_ID, TELEGRAM_SESSION_COLLECTION_ID, sessionDoc.$id, {
            telegramChatId: String(chatId),
            isVerified: true
        });

        ctx.reply(
            `✅ *Berhasil Tertaut!*\n\n` +
            `Selamat, ${fullName}! Akun Anda telah terhubung ke Gudang Stok Cendana.\n\n` +
            `Mulai sekarang Anda bisa:\n` +
            `• Lihat daftar workspace: /workspaces\n` +
            `• Kelola stok secara realtime\n` +
            `• Update inventaris kapan saja\n\n` +
            `Ketik /workspaces untuk memulai!`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error(error);
        ctx.reply(
            "❌ *Terjadi Kesalahan*\n\n" +
            "Kami mengalami masalah internal saat menghubungkan akun Anda.\n\n" +
            "Silakan coba lagi dalam beberapa saat atau hubungi support.",
            { parse_mode: 'Markdown' }
        );
    }
});

// Bot Command: /help
bot.command('help', async (ctx) => {
    const firstName = ctx.from.first_name || 'Teman';
    
    ctx.reply(
        `*📚 Bantuan - Gudang Stok Cendana*\n\n` +
        `Halo, ${firstName}! Berikut adalah panduan lengkap penggunaan bot:\n\n` +
        `🚀 *Perintah Tersedia:*\n` +
        `• /start - Mulai menggunakan bot\n` +
        `• /workspaces - Lihat dan kelola workspace Anda\n` +
        `• /help - Tampilkan panduan ini\n\n` +
        `💡 *Cara Menggunakan:*\n\n` +
        `1️⃣ *Login Pertama Kali*\n` +
        `   • Buka Dashboard di Web\n` +
        `   • Klik menu "Telegram Bot" di sidebar\n` +
        `   • Tekan "Generate Token"\n` +
        `   • Kirim token ke sini dengan format: /login TOKEN\n\n` +
        `2️⃣ *Lihat Workspace*\n` +
        `   • Ketik /workspaces\n` +
        `   • Pilih workspace dari list\n\n` +
        `3️⃣ *Kelola Stok*\n` +
        `   • Pilih item dari workspace\n` +
        `   • Tekan ➕ untuk tambah stok\n` +
        `   • Tekan ➖ untuk kurangi stok\n\n` +
        `❓ *Pertanyaan Umum:*\n` +
        `Q: Token saya hilang?\n` +
        `A: Generate token baru di dashboard. Token berlaku 24 jam.\n\n` +
        `Q: Workspace tidak muncul?\n` +
        `A: Buat workspace baru di dashboard web terlebih dahulu.\n\n` +
        `Q: Stok tidak ter-update?\n` +
        `A: Refresh dashboard web. Update tersinkronisasi realtime.\n\n` +
        `_Dibuat oleh Samuel Indra Bastian_`,
        { parse_mode: 'Markdown' }
    );
});

// Bot Command: /workspaces
bot.command('workspaces', async (ctx) => {
    const firstName = ctx.from.first_name || 'Teman';
    const userId = await getUserIdByChatId(ctx.from.id);
    if (!userId) {
        return ctx.reply(
            `Halo, *${firstName}*! 🔐\n\n` +
            "Anda perlu login terlebih dahulu untuk melihat workspace.\n\n" +
            "Ketik `halo` atau `/start` untuk panduan login.",
            { parse_mode: 'Markdown' }
        );
    }

    try {
        const response = await databases.listDocuments(DB_ID, WORKSPACE_COLLECTION_ID);
        const workspaces = response.documents;

        if (workspaces.length === 0) {
            return ctx.reply(
                `Halo, *${firstName}*! 📦\n\n` +
                "Anda belum memiliki workspace.\n\n" +
                "Silakan buat workspace baru melalui dashboard web.",
                { parse_mode: 'Markdown' }
            );
        }

        const buttons = workspaces.map(ws => [Markup.button.callback(`🏢 ${ws.name}`, `ws_${ws.$id}`)]);
        ctx.reply(
            `*Daftar Workspace Anda*, ${firstName}:\n\n` +
            "Pilih salah satu untuk melihat dan mengelola itemnya.",
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard(buttons)
            }
        );
    } catch (error) {
        console.error("Workspace fetch error:", error);
        ctx.reply(
            "❌ Gagal mengambil data workspace.\n\n" +
            "_Silakan coba lagi dalam beberapa saat._",
            { parse_mode: 'Markdown' }
        );
    }
});

// Action: View Workspace
bot.action(/ws_(.+)/, async (ctx) => {
    const workspaceId = ctx.match[1];
    
    try {
        const response = await databases.listDocuments(DB_ID, ITEM_COLLECTION_ID, [
            Query.equal('workspaceId', workspaceId)
        ]);
        
        const items = response.documents;
        
        let message = `📦 *Item di Workspace Ini:*\n\n`;
        if(items.length === 0) message = `📭 Workspace ini masih kosong.\n\n_Tambahkan item baru untuk memulai._\n\n`;
        
        const buttons = items.map(item => [Markup.button.callback(`📦 ${item.name} (${item.quantity})`, `item_${item.$id}`)]);
        
        buttons.push([Markup.button.callback("➕ Tambah Item Baru", `additem_${workspaceId}`)]);
        buttons.push([Markup.button.callback("⬅️ Kembali ke Daftar", "back_workspaces")]);
        
        ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons)
        });
    } catch (error) {
        ctx.reply("❌ Gagal mengambil item di workspace ini.");
    }
});

// Action: View Item
bot.action(/item_(.+)/, async (ctx) => {
    const itemId = ctx.match[1];
    
    try {
        const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
        
        const buttons = [
            [Markup.button.callback("➖ Kurangi (1)", `dec_${itemId}`), Markup.button.callback("➕ Tambah (1)", `inc_${itemId}`)],
            [Markup.button.callback("📝 Edit Nama", `edit_${itemId}`)],
            [Markup.button.callback("⬅️ Kembali ke Workspace", `ws_${item.workspaceId}`)]
        ];
        
        ctx.editMessageText(
            `📦 *${item.name}*\n\n` +
            `📊 Stok Saat Ini: *${item.quantity}*\n` +
            `📝 Keterangan: ${item.description || '_Tidak ada deskripsi_'}\n\n` +
            `_Tekan tombol untuk mengubah stok_`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard(buttons)
            }
        );
    } catch (error) {
        ctx.reply("Gagal memuat detail item.");
    }
});

// Action: Tambah Stok (Increment)
bot.action(/inc_(.+)/, async (ctx) => {
    const itemId = ctx.match[1];
    const userId = ctx.from.id;
    
    try {
        const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
        
        // Store state: user is in "increment mode" for this item
        userState.set(userId, { itemId, type: INPUT_TYPES.INCREMENT, itemName: item.name, currentQuantity: item.quantity });
        
        ctx.reply(
            `➕ *Tambah Stok*\n\n` +
            `Item: *${item.name}*\n` +
            `Stok Saat Ini: *${item.quantity}*\n\n` +
            `Berapa jumlah yang ingin ditambahkan?\n` +
            `_Kirim angka, contoh: 5_`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error("Error incrementing:", error);
        ctx.reply("❌ Gagal memproses permintaan tambah stok.");
    }
});

// Action: Kurangi Stok (Decrement)
bot.action(/dec_(.+)/, async (ctx) => {
    const itemId = ctx.match[1];
    const userId = ctx.from.id;
    
    try {
        const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
        
        // Store state: user is in "decrement mode" for this item
        userState.set(userId, { itemId, type: INPUT_TYPES.DECREMENT, itemName: item.name, currentQuantity: item.quantity });
        
        ctx.reply(
            `➖ *Kurangi Stok*\n\n` +
            `Item: *${item.name}*\n` +
            `Stok Saat Ini: *${item.quantity}*\n\n` +
            `Berapa jumlah yang ingin dikurangi?\n` +
            `_Kirim angka, contoh: 3_`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error("Error decrementing:", error);
        ctx.reply("❌ Gagal memproses permintaan kurangi stok.");
    }
});

// Action: Edit Nama Item
bot.action(/edit_(.+)/, async (ctx) => {
    const itemId = ctx.match[1];
    const userId = ctx.from.id;
    
    try {
        const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
        
        // Store the item ID in state for the next text input
        userState.set(userId, { itemId, type: INPUT_TYPES.EDIT_NAME, itemName: item.name });
        
        ctx.reply(
            `📝 *Edit Nama Item*\n\n` +
            `Item saat ini: *${item.name}*\n\n` +
            `Silakan kirim nama baru untuk item ini:\n\n` +
            `_Contoh: Barang Elektronik, Perlengkapan Kantor, dll_`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error("Error editing:", error);
        ctx.reply("❌ Gagal memproses permintaan edit.");
    }
});


// Go back to Workspaces List
bot.action("back_workspaces", async (ctx) => {
    // Re-trigger the logic for workspaces mapping
    const firstName = ctx.from.first_name || 'User';
    const userId = await getUserIdByChatId(ctx.from.id);
    if (!userId) return ctx.reply(
        "🔐 Anda perlu login terlebih dahulu.",
        { parse_mode: 'Markdown' }
    );

    try {
        const response = await databases.listDocuments(DB_ID, WORKSPACE_COLLECTION_ID);
        if (response.documents.length === 0) {
            return ctx.editMessageText(
                `Anda belum memiliki workspace.\n\n_Silakan buat workspace baru via dashboard._`
            );
        }
        const buttons = response.documents.map(ws => [Markup.button.callback(`🏢 ${ws.name}`, `ws_${ws.$id}`)]);
        ctx.editMessageText(
            `*Daftar Workspace Anda*, ${firstName}:\n\n_Pilih workspace untuk melihat item._`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard(buttons)
            }
        );
    } catch (error) {
        ctx.reply("❌ Gagal mengambil data workspace.");
    }
});

// Text Input: Handle nama item baru ketika user mengedit, atau qty ketika increment/decrement
bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || 'User';
    const lastName = ctx.from.last_name || '';
    const userName = `${firstName} ${lastName}`.trim();
    const input = ctx.message.text.trim();
    
    // Cek apakah user sedang dalam satu dari tiga mode
    if (userState.has(userId)) {
        const state = userState.get(userId);
        const { itemId, type, itemName, currentQuantity } = state;
        
        // Mode: Edit Nama
        if (type === INPUT_TYPES.EDIT_NAME) {
            const newName = input;
            
            if (!newName || newName.length === 0) {
                return ctx.reply("❌ Nama tidak boleh kosong. Silakan coba lagi.");
            }
            
            try {
                const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
                
                await databases.updateDocument(DB_ID, ITEM_COLLECTION_ID, itemId, {
                    name: newName
                });
                
                // Log the change
                await logChange(userId, userName, itemId, itemName, ACTION_TYPES.EDIT_NAME, itemName, newName);
                
                // Clear state
                userState.delete(userId);
                
                // Send confirmation
                await ctx.reply(
                    `✅ *Nama Item Berhasil Diubah*\n\n` +
                    `📦 Nama Lama: *${itemName}*\n` +
                    `📝 Nama Baru: *${newName}*\n\n` +
                    `_Perubahan tersinkronisasi ke dashboard web_`,
                    { parse_mode: 'Markdown' }
                );
                
                // Show updated item detail
                const buttons = [
                    [Markup.button.callback("➖ Kurangi", `dec_${itemId}`), Markup.button.callback("➕ Tambah", `inc_${itemId}`)],
                    [Markup.button.callback("📝 Edit Nama", `edit_${itemId}`)],
                    [Markup.button.callback("⬅️ Kembali ke Workspace", `ws_${item.workspaceId}`)]
                ];
                
                ctx.reply(
                    `📦 *${newName}*\n\n` +
                    `📊 Stok Saat Ini: *${item.quantity}*\n` +
                    `📝 Keterangan: ${item.description || '_Tidak ada deskripsi_'}\n\n` +
                    `_Tekan tombol untuk mengubah stok_`,
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard(buttons)
                    }
                );
            } catch (error) {
                console.error("Error updating name:", error);
                ctx.reply("❌ Gagal mengubah nama item.");
                userState.delete(userId);
            }
        }
        
        // Mode: Increment Stok
        else if (type === INPUT_TYPES.INCREMENT) {
            const quantity = parseInt(input);
            
            if (isNaN(quantity) || quantity <= 0) {
                return ctx.reply("❌ Masukkan angka yang valid dan lebih besar dari 0. Contoh: 5");
            }
            
            try {
                const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
                const newQuantity = item.quantity + quantity;
                
                await databases.updateDocument(DB_ID, ITEM_COLLECTION_ID, itemId, {
                    quantity: newQuantity
                });
                
                // Log the change
                await logChange(userId, userName, itemId, itemName, ACTION_TYPES.INCREMENT, currentQuantity, newQuantity, quantity);
                
                // Clear state
                userState.delete(userId);
                
                // Send confirmation
                await ctx.reply(
                    `✅ *Stok Ditambah*\n\n` +
                    `📦 Item: *${itemName}*\n` +
                    `📊 Stok Lama: ${currentQuantity}\n` +
                    `➕ Ditambah: *+${quantity}*\n` +
                    `🎯 Stok Baru: *${newQuantity}*\n\n` +
                    `_Perubahan tersinkronisasi ke dashboard web_`,
                    { parse_mode: 'Markdown' }
                );
                
                // Refresh item detail
                const buttons = [
                    [Markup.button.callback("➖ Kurangi", `dec_${itemId}`), Markup.button.callback("➕ Tambah", `inc_${itemId}`)],
                    [Markup.button.callback("📝 Edit Nama", `edit_${itemId}`)],
                    [Markup.button.callback("⬅️ Kembali ke Workspace", `ws_${item.workspaceId}`)]
                ];
                
                ctx.reply(
                    `📦 *${itemName}*\n\n` +
                    `📊 Stok Saat Ini: *${newQuantity}*\n` +
                    `📝 Keterangan: ${item.description || '_Tidak ada deskripsi_'}\n\n` +
                    `_Tekan tombol untuk mengubah stok_`,
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard(buttons)
                    }
                );
            } catch (error) {
                console.error("Error incrementing:", error);
                ctx.reply("❌ Gagal menambah stok.");
                userState.delete(userId);
            }
        }
        
        // Mode: Decrement Stok
        else if (type === INPUT_TYPES.DECREMENT) {
            const quantity = parseInt(input);
            
            if (isNaN(quantity) || quantity <= 0) {
                return ctx.reply("❌ Masukkan angka yang valid dan lebih besar dari 0. Contoh: 3");
            }
            
            try {
                const item = await databases.getDocument(DB_ID, ITEM_COLLECTION_ID, itemId);
                const newQuantity = Math.max(0, item.quantity - quantity);
                
                await databases.updateDocument(DB_ID, ITEM_COLLECTION_ID, itemId, {
                    quantity: newQuantity
                });
                
                // Log the change
                await logChange(userId, userName, itemId, itemName, ACTION_TYPES.DECREMENT, currentQuantity, newQuantity, quantity);
                
                // Clear state
                userState.delete(userId);
                
                // Send confirmation
                await ctx.reply(
                    `✅ *Stok Dikurangi*\n\n` +
                    `📦 Item: *${itemName}*\n` +
                    `📊 Stok Lama: ${currentQuantity}\n` +
                    `➖ Dikurangi: *-${quantity}*\n` +
                    `🎯 Stok Baru: *${newQuantity}*\n\n` +
                    `_Perubahan tersinkronisasi ke dashboard web_`,
                    { parse_mode: 'Markdown' }
                );
                
                // Refresh item detail
                const buttons = [
                    [Markup.button.callback("➖ Kurangi", `dec_${itemId}`), Markup.button.callback("➕ Tambah", `inc_${itemId}`)],
                    [Markup.button.callback("📝 Edit Nama", `edit_${itemId}`)],
                    [Markup.button.callback("⬅️ Kembali ke Workspace", `ws_${item.workspaceId}`)]
                ];
                
                ctx.reply(
                    `📦 *${itemName}*\n\n` +
                    `📊 Stok Saat Ini: *${newQuantity}*\n` +
                    `📝 Keterangan: ${item.description || '_Tidak ada deskripsi_'}\n\n` +
                    `_Tekan tombol untuk mengubah stok_`,
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard(buttons)
                    }
                );
            } catch (error) {
                console.error("Error decrementing:", error);
                ctx.reply("❌ Gagal mengurangi stok.");
                userState.delete(userId);
            }
        }
    }
});

module.exports = bot;
