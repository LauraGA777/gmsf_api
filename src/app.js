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
        console.log('Intentando conectar a:', process.env.DB_HOST);
        console.log('SSL configurado:', process.env.DB_SSL);
        await sequelize.authenticate();
        res.status(200).json({ message: 'Conexión exitosa a la base de datos' });
    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ message: 'Error al conectar a la base de datos', error: error.message });
    }
});

// Log environment variables for debugging
console.log('Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : undefined);
console.log('DB_SSL:', process.env.DB_SSL);

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