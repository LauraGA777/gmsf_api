const { Usuario, Rol } = require('../../core/database/associations');
const sequelize = require('../../core/database/connection');

const esAdmin = async (req, res, next) => {
    try {
        // Simplificamos la consulta para evitar problemas con la tabla intermedia
        const usuario = await Usuario.findByPk(req.usuarioId);
        
        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(403).json({ error: "Usuario no encontrado" });
        }
        
        // Verificar si tiene un rol asignado directamente
        if (usuario.id_rol) {
            // Buscar el rol directamente
            const rol = await Rol.findByPk(usuario.id_rol);
            if (rol && rol.nombre.toLowerCase() === "admin") {
                next();
                return;
            }
        }
        
        // Si llegamos aquí, intentamos buscar en la tabla usuario_rol usando SQL nativo
        const roles = await sequelize.query(
            `SELECT r.nombre FROM roles r 
            JOIN usuario_rol ur ON r.id = ur.id_rol 
            WHERE ur.id_usuario = :usuarioId AND ur.fecha_fin IS NULL`,
            {
                replacements: { usuarioId: req.usuarioId },
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        // Verificar si tiene el rol "admin"
        const esAdministrador = roles && roles.some(rol => rol.nombre.toLowerCase() === "admin");
        if (!esAdministrador) {
            return res.status(403).json({ error: "Acceso restringido a administradores" });
        }
        
        // Si pasa todas las verificaciones, continuar
        next();
    } catch (error) {
        console.error('Error en middleware esAdmin:', error);
        next(error);
    }
};

// Exportar la función directamente, no como un objeto
module.exports = esAdmin;