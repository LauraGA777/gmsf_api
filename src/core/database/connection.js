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
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        logging: false // Opcional: desactiva los logs SQL en producción
    }
);

// Export a function to sync models instead of running it immediately
const syncModels = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log("Models synchronized");
        return true;
    } catch (error) {
        console.error("Error synchronizing models:", error);
        return false;
    }
};

// Add a test connection function
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
};

module.exports = { sequelize, syncModels, testConnection };