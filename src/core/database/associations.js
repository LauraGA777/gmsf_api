const Usuario = require('../../modules/usuario/models/Usuario.js');
const Rol = require('../../modules/roles/models/Roles.js');

// Relación directa (un usuario tiene un rol)
Usuario.belongsTo(Rol, {
    foreignKey: 'id_rol'
});

// Relación inversa (un rol puede tener muchos usuarios)
Rol.hasMany(Usuario, {
    foreignKey: 'id_rol'
});

// Mantener la relación muchos a muchos por compatibilidad
Usuario.belongsToMany(Rol, {
    through: "usuario_rol",
    foreignKey: "id_usuario",
    otherKey: "id_rol",
    timestamps: false
});

Rol.belongsToMany(Usuario, {
    through: "usuario_rol",
    foreignKey: "id_rol",
    otherKey: "id_usuario",
    timestamps: false
});

module.exports = {
    Usuario,
    Rol
};