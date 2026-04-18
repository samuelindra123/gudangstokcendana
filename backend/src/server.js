require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes and bot
const defaultRoutes = require('./routes');
const bot = require('./bot/telegramBot');

const app = express();
const port = process.env.PORT || 3001;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API Routes
app.use('/api', defaultRoutes);
app.get('/', (req, res) => res.json({ msg: 'Welcome to Backend API' }));

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error(`[Server Error] ${err.message}`);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Bootstrapper for Bot and Express Server
const startServer = async () => {
    try {
        // Launch Telegram Bot
        await bot.launch();
        console.log('🤖 Telegram Bot is running successfully!');

        // Start Express
        app.listen(port, () => {
            console.log(`🚀 Express Server is active and listening on port ${port}`);
            console.log(`🌐 Healthcheck URL: http://localhost:${port}/api`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Enable graceful stop
process.once('SIGINT', () => {
    console.log("Shutting down gracefully...");
    bot.stop('SIGINT');
    process.exit(0);
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    process.exit(0);
});
