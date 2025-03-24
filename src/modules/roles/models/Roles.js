const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database/connection');

const Rol = sequelize.define(
    'Rol', {
    nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    descripcion: {
        type: DataTypes.TEXT,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: "roles",
    timestamps: false,
});

module.exports = Rol;