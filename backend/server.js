const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');

dotenv.config();

const app = express();

// Enhanced CORS for network access
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH CHECK ENDPOINT ==========
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Dashen Bank Exchange Rate API is running'
    });
});

// ========== TEST ENDPOINT ==========
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is working!',
        endpoints: {
            health: 'GET /api/health',
            currencies: 'GET /api/currencies',
            auth: 'POST /api/auth/login',
            videos: 'GET /api/videos'
        }
    });
});

// ========== DASHEN BANK ROUTES (No v1) ==========
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/currencies', require('./routes/currencyRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// ========== 404 HANDLER ==========
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Route ${req.method} ${req.url} not found`,
        availableEndpoints: {
            health: 'GET /api/health',
            test: 'GET /api/test',
            currencies: 'GET /api/currencies',
            auth: 'POST /api/auth/login',
            videos: 'GET /api/videos',
            users: 'GET /api/users'
        }
    });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Something went wrong!' 
    });
});

// Helper to get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const dbConnected = await testConnection();
    if (dbConnected) {
        const localIP = getLocalIP();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🏦 Dashen Bank Exchange Rate API`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Local:   http://localhost:${PORT}`);
            console.log(`📍 Network: http://${localIP}:${PORT}`);
            console.log(`\n📡 Available endpoints:`);
            console.log(`   Health:    http://localhost:${PORT}/api/health`);
            console.log(`   Test:      http://localhost:${PORT}/api/test`);
            console.log(`   Currencies: http://localhost:${PORT}/api/currencies`);
            console.log(`   Auth:      http://localhost:${PORT}/api/auth/login`);
            console.log(`   Videos:    http://localhost:${PORT}/api/videos`);
            console.log(`\n✅ CORS enabled for all origins`);
        });
    } else {
        console.error('❌ Failed to connect to database. Server not started.');
        process.exit(1);
    }
};

startServer();