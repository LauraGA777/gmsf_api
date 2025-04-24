const { DataTypes } = require('sequelize');
const  sequelize  = require('../../../core/database/connection');

const Usuario = sequelize.define(
    'Usuario',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        codigo: {
            type: DataTypes.STRING(10),
            unique: true,
            allowNull: false,
            validate: {
                is: /^U\d{3}$/
            }
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [3, 100]
            }
        },
        apellido: { 
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [3, 100]
            }
        },
        correo: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        contrasena_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(15),
            validate: {
                is: /^\d{7,15}$/
            }
        },
        direccion: {
            type: DataTypes.TEXT
        },
        genero: {
            type: DataTypes.CHAR(1),
            validate: {
                isIn: [['M', 'F', 'O']]
            }
        },
        tipo_documento: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                isIn: [['CC', 'CE', 'TI', 'PP', 'DIE']]
            }
        },
        numero_documento: { 
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false
        },
        fecha_actualizacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        asistencias_totales: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        fecha_nacimiento: { 
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isBeforeMinAge(value) {
                    const minAge = new Date();
                    minAge.setFullYear(minAge.getFullYear() - 15);
                    if (value > minAge) {
                        throw new Error('Debes tener al menos 15 años');
                    }
                }
            }
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        id_rol: {
            type: DataTypes.INTEGER,
            references: {
                model: 'roles',
                key: 'id'
            }
        }
    },
    {
        tableName: "usuarios",
        timestamps: false
    }
);

module.exports = Usuario;