const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Importa las funciones de conexión
const { errorHandler } = require("./core/middlewares/errorHandler");

dotenv.config();

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