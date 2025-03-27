const Usuario = require('../../modules/usuario/models/Usuario.js');
const Rol = require('../../modules/roles/models/Roles.js');

// Definir asociaciones con alias explícitos
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