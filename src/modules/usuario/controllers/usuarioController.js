const Usuario = require('../models/Usuario');
const { idSchema, updateUsuarioSchema } = require('../validations/usuarioSchema');
const { Op } = require("sequelize");
const { searchUsuarioSchema, usuarioSchema } = require("../validations/usuarioSchema");
const { generarToken } = require("../../../core/utils/jwt.js");
const bcrypt = require("bcrypt");

// Función para generar código único de usuario
const generarCodigoUsuario = async () => {
    // Buscar el último código de usuario
    const ultimoUsuario = await Usuario.findOne({
        order: [['id', 'DESC']]
    });
    
    let numero = 1;
    if (ultimoUsuario && ultimoUsuario.codigo) {
        // Extraer el número del código (U001 -> 1)
        const match = ultimoUsuario.codigo.match(/U(\d{3})/);
        if (match) {
            numero = parseInt(match[1]) + 1;
        }
    }
    
    // Formatear el número a 3 dígitos (1 -> 001)
    return `U${numero.toString().padStart(3, '0')}`;
};

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
        // Validar datos de entrada
        const datos = usuarioSchema.parse(req.body);
        
        const {
            nombre,
            apellido,
            correo,
            contrasena,
            telefono,
            direccion,
            tipo_documento,
            numero_documento,
            fecha_nacimiento,
            genero,
            id_rol
        } = datos;
        
        // Verificar si el correo ya existe
        const usuarioExistente = await Usuario.findOne({ where: { correo } });
        if (usuarioExistente) {
            throw { status: 400, message: "El correo ya está registrado" };
        }
        
        // Generar código único
        const codigo = await generarCodigoUsuario();
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        // Crear el usuario
        const usuario = await Usuario.create({
            codigo,
            nombre,
            apellido,
            correo,
            contrasena_hash: hashedPassword,
            telefono,
            direccion,
            tipo_documento,
            numero_documento,
            fecha_nacimiento,
            genero,
            id_rol
        });
        
        // Generar token de autenticación
        const token = generarToken(usuario.id);
        
        // Excluir contraseña_hash en la respuesta
        const usuarioCreado = await Usuario.findByPk(usuario.id, {
            attributes: { exclude: ["contrasena_hash"] },
        });
        
        res.status(201).json({
            usuario: usuarioCreado,
            token
        });
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw { status: 400, message: "El correo o número de documento ya está registrado" };
        }
        console.error("Error detallado:", error);
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

//Desactivar usuario (cambiar estado a false)
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

//Buscar usuarios por nombre, correo o documento (con paginación)
const searchUsuarios = async (req, res, next) => {
    try {
        // Validar parámetros de búsqueda
        const { q, pagina, limite, orden, direccion } = searchUsuarioSchema.parse(req.query);
        const offset = (pagina - 1) * limite;

        // Construir condiciones de búsqueda
        const where = {};
        if (q) {
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${q}%` } },
                { apellido: { [Op.iLike]: `%${q}%` } },
                { correo: { [Op.iLike]: `%${q}%` } },
                { numero_documento: { [Op.like]: `%${q}%` } },
                { codigo: { [Op.like]: `%${q}%` } }
            ];
        }

        // Consulta con paginación
        const { count, rows } = await Usuario.findAndCountAll({
            where,
            limit: limite,
            offset: offset,
            order: [[orden, direccion]],
            attributes: { exclude: ["contrasena_hash"] }
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