const express = require('express');
const router = express.Router();
const { idSchema } = require("../validations/usuarioSchema.js"); // Importar el esquema
const verificarToken = require("../../../core/middlewares/authMiddleware").verificarToken;
const esAdmin = require("../../../core/middlewares/rolesMiddleware");
const { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario,searchUsuarios } = require('../controllers/usuarioController.js');
const { registroSchema } = require("../../auth/validations/authSchema.js"); // Importar el esquema

const validarId = (req, res, next) => {
    try {
        idSchema.parse({ id: req.params.id }); // Validar el ID usando Zod
        next();
    } catch (error) {
        next(error); // Pasar el error al manejador central
    }
};
router.post('/', async (req, res, next) => {
    try {
        const datos = registroSchema.parse(req.body);
        const usuario = await createUsuario(datos);
        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
});
router.get('/', verificarToken, esAdmin, getUsuarios); // Solo admin, comentar en pruebas
router.get('/buscar', verificarToken, esAdmin, searchUsuarios);
router.get('/:id', validarId, verificarToken, esAdmin, getUsuarioById); // Solo admin, comentar en pruebas
router.put('/:id', validarId, verificarToken, esAdmin, updateUsuario); // Solo admin, comentar en pruebas
router.delete('/:id', validarId, verificarToken, esAdmin, deleteUsuario); // Solo admin, comentar en pruebas

module.exports = router;