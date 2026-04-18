const axios = require('axios');
require('dotenv').config();

const { TELEGRAM_API, BOT_CONFIG, BOT_TOKEN } = require('../config/constants');

async function setBotDescription() {
  try {
    console.log('🤖 Setting Bot Description...');
    await axios.post(`${TELEGRAM_API.API_URL}/setMyDescription`, {
      description: BOT_CONFIG.DESCRIPTION,
      language_code: 'id'
    });
    console.log('✅ Bot Description berhasil diatur');
  } catch (error) {
    console.error('❌ Error Setting Description:', error.response?.data || error.message);
  }
}

async function setBotShortDescription() {
  try {
    console.log('🤖 Setting Bot Short Description...');
    await axios.post(`${TELEGRAM_API.API_URL}/setMyShortDescription`, {
      short_description: BOT_CONFIG.SHORT_DESCRIPTION,
      language_code: 'id'
    });
    console.log('✅ Bot Short Description berhasil diatur');
  } catch (error) {
    console.error('❌ Error Setting Short Description:', error.response?.data || error.message);
  }
}

async function setBotCommands() {
  try {
    console.log('🤖 Setting Bot Commands...');
    await axios.post(`${TELEGRAM_API.API_URL}/setMyCommands`, {
      commands: BOT_CONFIG.COMMANDS,
      language_code: 'id'
    });
    console.log('✅ Bot Commands berhasil diatur');
  } catch (error) {
    console.error('❌ Error Setting Commands:', error.response?.data || error.message);
  }
}

async function setupAllBotInfo() {
  try {
    console.log('\n═══════════════════════════════════════');
    console.log('  🚀 Gudang Stok Cendana - Bot Setup');
    console.log('═══════════════════════════════════════\n');
    
    await setBotDescription();
    await setBotShortDescription();
    await setBotCommands();
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Bot Setup Selesai!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📋 Info Bot yang Diatur:');
    console.log(`📌 Nama: ${BOT_CONFIG.NAME}`);
    console.log(`📝 Deskripsi (Short): ${BOT_CONFIG.SHORT_DESCRIPTION}`);
    console.log(`📢 Jumlah Commands: ${BOT_CONFIG.COMMANDS.length}`);
    console.log('\n💡 Catatan:');
    console.log('• Foto profil bot harus diatur manual via BotFather (/setuserpic)');
    console.log('• Atau upload langsung di pengaturan bot Telegram');
    console.log('• Welcome picture bisa di-set di halaman dashboard /telegram\n');
    
  } catch (error) {
    console.error('❌ Error dalam Setup Bot:', error.message);
  }
}

// Run setup
setupAllBotInfo();
