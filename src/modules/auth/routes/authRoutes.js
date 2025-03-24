const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { errorHandler } = require("../../../core/middlewares/errorHandler.js");
const { login, registro, logout, verifyToken, forgotPassword, resetPassword, changePassword, getProfile, updateProfile, } = require("../controllers/authController.js");
const { generarToken, verificarRefreshToken } = require("../../../core/utils/jwt.js");
const verificarToken = require("../../../core/middlewares/authMiddleware.js");
const { loginSchema, registroSchema, forgotPasswordSchema, changePasswordSchema, updateProfileSchema, } = require("../validations/authSchema.js");

// 1. Registro ✅
router.post("/registro", async (req, res, next) => {
    try {
        const datos = registroSchema.parse(req.body);
        const usuario = await registro(datos);
        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
});

// 2. Login ✅
router.post("/login", async (req, res, next) => {
    try {
        const datos = loginSchema.parse(req.body);
        const resultado = await login(datos);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
});

// 3. Actualización de Token ✅ 
router.post("/refresh-token", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh Token no proporcionado" });
        }

        // Verificar el Refresh Token
        const decoded = verificarRefreshToken(refreshToken);

        // Generar un nuevo Access Token
        const newAccessToken = generarToken(decoded.id);

        res.json({ token: newAccessToken });
    } catch (error) {
        next(error);
    }
});

// 4. Cierre de Sesión 
router.post("/logout", verificarToken.verificarToken, async (req, res, next) => {
    try {
        const resultado = await logout(req.usuarioId);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// 5. Verificación de Token ✅ 
router.get("/verify", verificarToken.verificarToken, async (req, res, next) => {
    try {
        const resultado = await verifyToken(req.usuarioId);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// 6. Recuperación de Contraseña ✅ 
router.post("/forgot-password", async (req, res, next) => {
    try {
        const { correo } = forgotPasswordSchema.parse(req.body);
        const resultado = await forgotPassword(correo);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// 7. Cambio Contraseña ✅ 
router.post("/reset-password", async (req, res, next) => {
    try {
        const token = req.query.token || req.body.token;
        const { nuevaContrasena } = req.body;
        if (!token) {
            return res.status(400).json({ error: "Token no proporcionado. Debe incluir el token en la URL." });
        }
        const resultado = await resetPassword(token, nuevaContrasena);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// 8. Cambiar Contraseña (Requiere autenticación) ✅
router.post("/change-password", verificarToken.verificarToken, async (req, res, next) => {
    try {
        console.log("Cuerpo de la solicitud:", req.body);
        console.log("Usuario ID:", req.usuarioId);
        // Depuración adicional
        const datos = changePasswordSchema.parse({
            contrasenaActual: req.body.contrasenaActual,
            nuevaContrasena: req.body.nuevaContrasena,
            usuarioId: Number(req.usuarioId), // Añade el ID del usuario autenticado
        });
        const resultado = await changePassword(datos);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// 9. Obtener Perfil 
router.get("/me", verificarToken.verificarToken, async (req, res, next) => {
    try {
        console.log("Usuario ID:", req.usuarioId); // Depuración adicional
        const resultado = await getProfile(req.usuarioId);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// 10. Actualizar Perfil
router.patch("/me", verificarToken.verificarToken, async (req, res, next) => {
    try {
        // Validar el cuerpo de la solicitud
        const datos = updateProfileSchema.parse(req.body);
        // Actualizar el perfil
        const resultado = await updateProfile(req.usuarioId, datos);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

module.exports = router;