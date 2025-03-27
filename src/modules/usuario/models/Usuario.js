const { DataTypes } = require('sequelize');
const sequelize = require('../../../core/database/connection');

const Usuario = sequelize.define(
    'Usuario',
    {
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        apellido: { 
            type: DataTypes.STRING(50),
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        },
        contrasena_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(15)
        },
        direccion: {
            type: DataTypes.STRING(200)
        },
        tipo_documento: {
            type: DataTypes.ENUM(
                "TI",    
                "CC",    
                "TE",    
                "CE",    
                "NIT",   
                "PP",          
                "PEP",
                "DIE"
            ),
            allowNull: false
        },
        numero_documento: { 
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false
        },
        fecha_nacimiento: { 
            type: DataTypes.DATE,
            allowNull: false 
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    { // <-- Opciones de configuración del modelo (tercer parámetro)
        tableName: "usuarios",
        timestamps: false // Desactiva createdAt/updatedAt si no los necesitas
    }
);

module.exports = Usuario;