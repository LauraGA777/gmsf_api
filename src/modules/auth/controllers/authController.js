const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { generarToken, generarRefreshToken } = require("../../../core/utils/jwt.js");
const Usuario = require("../../usuario/models/Usuario.js");
const enviarCorreoRecuperacion= require("../../../core/utils/mailer.js");

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

// Registro de usuario ✅
const registro = async (datos) => {
    try {
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
        
        const usuarioExistente = await Usuario.findOne({ where: { correo } });
        if (usuarioExistente) {
            throw { status: 400, message: "El correo ya está registrado" };
        }
        
        // Generar código único
        const codigo = await generarCodigoUsuario();
        
        const hashedPassword = await bcrypt.hash(contrasena, 10);
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
        
        const token = generarToken(usuario.id);
        
        // Excluir contraseña_hash en la respuesta
        const usuarioCreado = await Usuario.findByPk(usuario.id, {
            attributes: { exclude: ["contrasena_hash"] },
        });
        
        return { usuario: usuarioCreado, token };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw { status: 400, message: "El correo o número de documento ya está registrado" };
        }
        console.error("Error detallado:", error);
        throw { status: 500, message: "Error interno al registrar usuario" };
    }
};

// Inicio de sesión ✅
const login = async (datos) => {
    const usuario = await Usuario.findOne({ where: { correo: datos.correo } });
    if (!usuario) {
        throw { status: 401, message: "Credenciales inválidas" }; // Lanzar error
    }
    const contrasenaValida = await bcrypt.compare(datos.contrasena, usuario.contrasena_hash);
    if (!contrasenaValida) {
        throw { status: 401, message: "Credenciales inválidas" }; // Lanzar error
    }
    const accessToken = generarToken(usuario.id); // Access Token
    const refreshToken = generarRefreshToken(usuario.id); // Refresh Token
    console.log("Access Token generado:", accessToken);
    console.log("Refresh Token generado:", refreshToken);
    return { // Devolver resultado, no usar res.json()
        mensaje: "Login exitoso",
        accessToken,
        refreshToken,
        usuario: { id: usuario.id, nombre: usuario.nombre }
    };
};

// Cierre de sesión
const logout = (req, res) => {
    // Enviar instrucción al frontend para eliminar el token (no se puede invalidar JWT directamente)
    res.json({ mensaje: "Sesión cerrada exitosamente" });
};

// Verificación de token ✅
const verifyToken = async (usuarioId) => {
    try {
        const usuario = await Usuario.findByPk(usuarioId, {
            attributes: { exclude: ["contrasena_hash"] }, // Excluir datos sensibles
        });
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }
        return usuario;
    } catch (error) {
        throw { status: 500, message: "Error al verificar el token" };
    }
};

// Recuperación de contraseña ✅
const forgotPassword = async (correo) => {
    try {
        const usuario = await Usuario.findOne({ where: { correo } });
        if (!usuario) {
            throw { status: 404, message: "Correo no registrado" };
        }

        const token = generarToken(usuario.id, "15m");
        await enviarCorreoRecuperacion(correo, token);

        return { mensaje: "Correo de recuperación enviado" };
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        throw { status: 500, message: "Error al procesar la solicitud" };
    }
};

// Cambio de contraseña ✅
const resetPassword = async (token, nuevaContrasena) => {
    try {
        // Verificar que el token existe
        if (!token) {
            throw { status: 400, message: "Token no proporcionado" };
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Buscar al usuario
        const usuario = await Usuario.findByPk(decoded.id);
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
        // Actualizar la contraseña
        usuario.contrasena_hash = hashedPassword;
        await usuario.save();
        return { mensaje: "Contraseña actualizada" };
    } catch (error) {
        console.error("Error en resetPassword:", error);
        throw { status: 400, message: "Token inválido o expirado" };
    }
};

//Cambio de Contraseña ✅
const changePassword = async (datos) => {
    const {  contrasenaActual, nuevaContrasena, usuarioId } = datos;

    try {
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }

        // Verificar la contraseña actual
        const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.contrasena_hash);
        if (!contrasenaValida) {
            throw { status: 401, message: "Contraseña actual incorrecta" };
        }
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
        // Actualizar la contraseña
        usuario.contrasena_hash = hashedPassword;
        await usuario.save();
        return { mensaje: "Contraseña actualizada exitosamente" };
    } catch (error) {
        throw { status: 500, message: "Error al cambiar la contraseña" };
    }
};

//Perfil de Usuario ✅
const getProfile = async (usuarioId) => {
    try {
        const usuario = await Usuario.findByPk(usuarioId, {
            attributes: { exclude: ["contrasena_hash"] }, // Excluir datos sensibles
        });
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }
        return usuario;
    } catch (error) {
        throw { status: error.status || 500, message: error.message || "Error interno del servidor" };
    }
};

//Actualización de Perfil ✅
const updateProfile = async (usuarioId, datos) => {
    try {
        const usuario = await Usuario.findByPk(usuarioId);
        if (!usuario) {
            throw { status: 404, message: "Usuario no encontrado" };
        }
        
        // Actualizar fecha_actualizacion
        datos.fecha_actualizacion = new Date();
        
        // Actualizar solo los campos proporcionados
        await usuario.update(datos);
        const usuarioActualizado = await Usuario.findByPk(usuarioId, {
            attributes: { exclude: ["contrasena_hash"] }
        });

        return { mensaje: "Perfil actualizado exitosamente", usuarioActualizado };
    } catch (error) {
        throw { status: 500, message: "Error al actualizar el perfil" };
    }
};

module.exports = {
    login,
    registro,
    logout,
    verifyToken,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    updateProfile,
};