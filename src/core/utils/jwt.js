// src/core/utils/jwt.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Generar token JWT
const generarToken = (usuarioId) => {
    console.log("Se esta ejecutando generarToken");
    return jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Generar Refresh Token
const generarRefreshToken = (usuarioId) => {
    return jwt.sign({ id: usuarioId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // Tiempo de expiración más largo
    });
};

// Verificar Refresh Token
const verificarRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        return decoded; // Devuelve el payload decodificado
    } catch (error) {
        console.error("Error en verificarRefreshToken:", error);
        throw new Error("Refresh Token inválido o expirado");
    }
};

module.exports = { generarToken, generarRefreshToken, verificarRefreshToken };