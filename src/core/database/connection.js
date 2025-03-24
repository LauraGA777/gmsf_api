const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Crear instancia de Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: false // Opcional: desactiva los logs SQL en producción
    }
);

(async () => {
    try {
        await sequelize.sync({ force: false }); // No usar force: true en producción
        console.log("Modelos sincronizados");
    } catch (error) {
        console.error("Error al sincronizar modelos:", error);
    }
})();

module.exports = sequelize;