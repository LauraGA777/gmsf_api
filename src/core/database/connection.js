const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Crear instancia de Sequelize
let sequelize;

// Primero intentar usar DATABASE_URL si está disponible
if (process.env.DATABASE_URL) {
    console.log('Usando DATABASE_URL para la conexión');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectModule: require('pg'),
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    // Check if required environment variables are set
    const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
        console.error('Error: Missing required environment variables:', missingEnvVars.join(', '));
        console.error('Please check your .env file');
    }

    // Usar parámetros individuales como respaldo
    console.log('Usando parámetros individuales para la conexión');
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: process.env.DB_SSL === 'true' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            },
            logging: false
        }
    );
}

module.exports = sequelize;