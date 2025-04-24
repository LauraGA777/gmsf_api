const { Usuario, Rol } = require('../../core/database/associations');

const esAdmin = async (req, res, next) => {
    try {
        // 1. Obtener usuario autenticado con sus roles
        const usuario = await Usuario.findByPk(req.usuarioId, {
            include: [{
                model: Rol,
                // Mantener la relación many-to-many para compatibilidad
                through: { attributes: [] }
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
            // Verificar si tiene un rol asignado directamente
            if (usuario.id_rol) {
                // Buscar el rol directamente
                const rolDirecto = await Rol.findByPk(usuario.id_rol);
                if (rolDirecto && rolDirecto.nombre.toLowerCase() === "admin") {
                    console.log('Usuario es administrador por asignación directa. Continuando...');
                    next();
                    return;
                }
            }
            return res.status(403).json({ error: "Acceso denegado: usuario sin roles asignados" });
        }
        
        // 5. Verificar si tiene el rol "admin"
        const esAdministrador = usuario.Rols.some(rol => rol.nombre.toLowerCase() === "admin");
        if (!esAdministrador) {
            return res.status(403).json({ error: "Acceso restringido a administradores" });
        }
        
        // 6. Si pasa todas las verificaciones, continuar con la siguiente función
        console.log('Usuario es administrador. Continuando...');
        next();
    } catch (error) {
        console.error('Error en middleware esAdmin:', error);
        next(error);
    }
};

module.exports = esAdmin;