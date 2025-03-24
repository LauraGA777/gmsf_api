const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');
const sequelize = require('./core/database/connection.js');
const setupAssociations = require('./modules/associations.js');
const { errorHandler } = require("./core/middlewares/errorHandler");
dotenv.config();

// Sincronizar modelos con la base de datos y configurar asociaciones
sequelize.sync({ force: false }) // ¡Cuidado! `force: true` borra datos existentes
    .then(() => {
        console.log('Tablas creadas');
        // Configurar asociaciones después de sincronizar la base de datos
        setupAssociations();
    })
    .catch((error) => {
        console.error('Error al sincronizar:', error);
    });

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas después de configurar asociaciones
const usuarioRoutes = require('./modules/usuario/routes/usuarioRoutes.js');
const authRoutes = require("./modules/auth/routes/authRoutes");
app.get("/", (req, res) => {
    res.send("API funcionando en Vercel 🚀");
});

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use("/api/auth", authRoutes);

// Manejo de errores
app.use(errorHandler);

module.exports = app;