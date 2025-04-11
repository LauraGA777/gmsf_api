const Usuario = require('../models/Usuario');
const { usuarioSchema, idSchema, updateUsuarioSchema } = require('../validations/usuarioSchema');
const { Op } = require("sequelize");
const { searchUsuarioSchema } = require("../validations/usuarioSchema");
const bcrypt = require("bcrypt"); // Añadir importación de bcrypt


// Traer todos los usuarios
const getUsuarios = async (req, res, next) => {
    try {
        const { pagina = 1, limite = 10, orden = 'nombre', direccion = 'ASC' } = req.query;
        const offset = (pagina - 1) * limite;

        const usuarios = await Usuario.findAll({
            limit: parseInt(limite),
            offset: offset,
            order: [[orden, direccion]],
        });

        res.json({
            total: await Usuario.count(),
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            datos: usuarios
        });
    } catch (error) {
        next(error);
    }
};

// Traer un usuario por ID
const getUsuarioById = async (req, res, next) => {
    try {
        const { id } = idSchema.parse({ id: req.params.id });
        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ["contrasena_hash"] },
        });
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }
        res.json(usuario);
    } catch (error) {
        next(error);
    }
};

// Crear un nuevo usuario
const createUsuario = async (req, res, next) => {
    try {
        // Preparar los datos antes de validar
        const datosEntrada = { ...req.body };
        
        // Si viene contraseña, hashearla antes de validar
        if (datosEntrada.contrasena) {
            const hashedPassword = await bcrypt.hash(datosEntrada.contrasena, 10);
            datosEntrada.contrasena_hash = hashedPassword;
            delete datosEntrada.contrasena;
        }
        
        // Ahora validamos con los datos ya preparados
        const datosValidados = usuarioSchema.parse(datosEntrada);
        
        const usuario = await Usuario.create(datosValidados);
        
        // Devolver usuario sin el hash de contraseña
        const usuarioSinHash = await Usuario.findByPk(usuario.id, {
            attributes: { exclude: ["contrasena_hash"] },
        });
        
        res.status(201).json(usuarioSinHash);
    } catch (error) {
        next(error);
    }
};


// Actualizar todos los campos de un usuario
const updateUsuario = async (req, res, next) => {
    try {
        // Validar datos de entrada
        const datosValidados = updateUsuarioSchema.parse(req.body);

        // Buscar usuario por ID
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }

        // Actualizar campos
        await usuario.update(datosValidados);

        // Excluir contraseña_hash en la respuesta
        const usuarioActualizado = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ["contrasena_hash"] },
        });

        res.json(usuarioActualizado);
    } catch (error) {
        next(error);
    }
};

//Actualizar campos específicos de un usuario.

//Desactivar usuario (cambiar estado a false).
const deleteUsuario = async (req, res, next) => {
    try {
        const { id } = idSchema.parse({ id: req.params.id }); // Validar ID

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }
        // Actualizar estado a false (soft delete)
        await usuario.update({ estado: false });
        res.json({
            mensaje: "Usuario desactivado exitosamente",
            id: usuario.id,
            estado: usuario.estado
        });
    } catch (error) {
        next(error);
    }
};

//Buscar usuarios por nombre, correo o documento (con paginación).
const searchUsuarios = async (req, res, next) => {
    try {
        // Validar parámetros de búsqueda
        const { q, pagina, limite, orden, direccion } = searchUsuarioSchema.parse(req.query);
        const offset = (pagina - 1) * limite;

        // Construir condiciones de búsqueda
        const where = {};
        if (q) {
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${q}%` } }, // Búsqueda insensible a mayúsculas
                { correo: { [Op.iLike]: `%${q}%` } },
                { numero_documento: { [Op.like]: `%${q}%` } }
            ];
        }

        // Consulta con paginación
        const { count, rows } = await Usuario.findAndCountAll({
            where,
            limit: limite,
            offset: offset,
            order: [[orden, direccion]],
            attributes: { exclude: ["contrasena_hash"] } // Excluir datos sensibles
        });

        res.json({
            total: count,
            pagina: pagina,
            limite: limite,
            datos: rows
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario, searchUsuarios };