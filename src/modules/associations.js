function setupAssociations() {
    const Usuario = require('./usuario/models/Usuario.js');
    const Rol = require('./roles/models/Roles.js');
    
    // Definir asociaciones con alias explícitos
    Usuario.belongsToMany(Rol, {
        through: "usuario_rol",
        foreignKey: "id_usuario",
        otherKey: "id_rol",
        as: "Rols", // Asegúrate de que este alias sea consistente
        timestamps: false
    });
    
    Rol.belongsToMany(Usuario, {
        through: "usuario_rol",
        foreignKey: "id_rol",
        otherKey: "id_usuario",
        as: "Usuarios",
        timestamps: false
    });
}

module.exports = setupAssociations;