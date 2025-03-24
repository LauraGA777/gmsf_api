const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Remove the immediate sync and make it a function that can be called when needed
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectModule: require('pg'),
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: false // Opcional: desactiva los logs SQL en producción
    }
);

module.exports = sequelize;