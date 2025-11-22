import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('usuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  codigoUnico: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  rol: {
    type: DataTypes.ENUM('administrador', 'cliente'),
    allowNull: false,
    defaultValue: 'cliente'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  google_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  foto_perfil: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  loyalty_token: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    defaultValue: Sequelize.literal("REPLACE(UUID(), '-', '')")
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuario',
  timestamps: false, // No agregar createdAt/updatedAt automáticos
  indexes: [
    {
      unique: false,
      fields: ['loyalty_token']
    }
  ]
});


export default Usuario;