// src/core/middlewares/errorHandler.js
const { z } = require("zod");

const handleErrorResponse = (error, res) => {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            error: "Datos inválidos",
            detalles: error.errors.map(e => ({
                campo: e.path[0],
                mensaje: e.message
            }))
        });
    }

    const status = error.status || 500;
    const message = error.message || "Error interno del servidor";
    res.status(status).json({ error: message });
};

// Middleware para Express (maneja errores asíncronos)
const errorHandler = (err, req, res, next) => {
    handleErrorResponse(err, res);
};

module.exports = { errorHandler, handleErrorResponse };