const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./core/database/connection.js');
const setupAssociations = require('./modules/associations.js');
const { errorHandler } = require("./core/middlewares/errorHandler");

dotenv.config();

const app = express();

// Conexión a la base de datos
sequelize.sync({ force: false })
    .then(() => {
        console.log('Tablas creadas');
        setupAssociations();
    })
    .catch((error) => {
        console.error('Error al sincronizar:', error);
    });

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const usuarioRoutes = require('./modules/usuario/routes/usuarioRoutes.js');
const authRoutes = require("./modules/auth/routes/authRoutes");

app.get("/", (req, res) => {
    res.send("API funcionando en Vercel 🚀");
});

app.use('/api/usuarios', usuarioRoutes);
app.use("/api/auth", authRoutes);

// Manejo de errores
app.use(errorHandler);

// No iniciamos el servidor con app.listen()
// Solo exportamos la app para que la función serverless la use
module.exports = app;
