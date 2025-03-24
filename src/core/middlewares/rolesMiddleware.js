const Usuario = require("../../modules/usuario/models/Usuario.js");
const Rol = require("../../modules/roles/models/Roles.js");

const esAdmin = async (req, res, next) => {
    try {
        // 1. Obtener usuario autenticado con sus roles
        // Ahora especificamos el alias 'Rols' en el include
        const usuario = await Usuario.findByPk(req.usuarioId, {
            include: [{
                model: Rol,
                through: { attributes: [] },
                as: "Rols" // Especificar el alias usado en la asociación
            }],
        });

        // 2. Verificar si el usuario existe
        if (!usuario) {
            return res.status(403).json({ error: "Usuario no encontrado" });
        }

        // 3. Imprimir información de depuración
        console.log('Usuario encontrado:', usuario.nombre, usuario.apellido);
        console.log('Roles del usuario:', usuario.Rols ? usuario.Rols.map(r => r.nombre).join(', ') : 'ninguno');

        // 4. Verificar si tiene roles asignados
        if (!usuario.Rols || usuario.Rols.length === 0) {
            return res.status(403).json({ error: "Acceso denegado: usuario sin roles asignados" });
        }

        // 5. Verificar si tiene el rol "admin"
        const esAdministrador = usuario.Rols.some(rol => rol.nombre.toLowerCase() === "admin");
        if (!esAdministrador) {
            return res.status(403).json({ error: "Acceso restringido a administradores" });
        }

        next();
    } catch (error) {
        console.error('Error en middleware esAdmin:', error);
        next(error);
    }
};

module.exports = esAdmin;