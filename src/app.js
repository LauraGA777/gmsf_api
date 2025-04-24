const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
// Make sure to load this BEFORE importing any modules that use these variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Now import modules that use environment variables
const sequelize = require('./core/database/connection');
const { errorHandler } = require("./core/middlewares/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
require('./core/database/associations.js');

// Rutas
const usuarioRoutes = require('./modules/usuario/routes/usuarioRoutes.js');
const authRoutes = require("./modules/auth/routes/authRoutes");

app.get("/", (req, res) => {
    res.send("API funcionando en Vercel 🚀");
});
app.use('/api/usuarios', usuarioRoutes);
app.use("/api/auth", authRoutes);

// Endpoint para probar la conexión
app.get('/test-db', async (req, res) => {
    try {
        // Check for Vercel authentication if needed
        const vercelToken = req.headers['x-vercel-authentication'];
        const isVercelRequest = process.env.VERCEL === '1';
        
        // If we're on Vercel and the token doesn't match, reject
        if (isVercelRequest && vercelToken !== process.env.VERCEL_AUTH_TOKEN) {
            return res.status(401).json({ message: 'Vercel authentication required' });
        }
        
        await sequelize.authenticate();
        res.status(200).json({ 
            message: 'Conexión exitosa a la base de datos',
            database: process.env.DB_NAME || process.env.POSTGRES_DATABASE,
            environment: process.env.VERCEL ? 'Vercel' : 'Local'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar a la base de datos', error: error.message });
    }
});

// Endpoint para probar la conexión (sin autenticación)
app.get('/test-db-public', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.status(200).json({ 
            message: 'Conexión exitosa a la base de datos',
            database: process.env.DB_NAME || process.env.POSTGRES_DATABASE
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al conectar a la base de datos' });
    }
});

// Manejo de errores
app.use(errorHandler);

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;