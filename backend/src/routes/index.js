const express = require('express');
const defaultRoutes = express.Router();

// Root route health check
defaultRoutes.get('/', (req, res) => {
    res.json({
        message: 'Gudang Stok Cendana API & Telegram Bot is running smoothly!',
        status: 'UP',
        timestamp: new Date().toISOString()
    });
});

module.exports = defaultRoutes;
