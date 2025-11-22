import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME ?? 'cafeteria_uide', process.env.DB_USER ?? 'root', process.env.DB_PASSWORD ?? 'root', {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Probar la conexión
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return { success: true, message: 'Conexión a MySQL establecida' };
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    throw error;
  }
}

export { sequelize };