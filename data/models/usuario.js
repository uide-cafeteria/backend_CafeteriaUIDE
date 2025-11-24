import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/db.js';

const Usuario = sequelize.define('usuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [3, 100],
        msg: 'El username debe tener entre 3 y 100 caracteres'
      }
    }
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre es requerido'
      },
      len: {
        args: [3, 150],
        msg: 'El nombre debe tener entre 3 y 150 caracteres'
      }
    }
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'El correo debe ser un email válido'
      }
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'El teléfono debe tener entre 10 y 20 caracteres si se proporciona'
      }
    }
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
    allowNull: true,
    validate: {
      len: {
        args: [60, 255], // Longitud típica para hashes bcrypt
        msg: 'El hash de contraseña debe tener entre 60 y 255 caracteres'
      }
    }
  },
  google_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  foto_perfil: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'La foto de perfil debe ser una URL válida'
      }
    }
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