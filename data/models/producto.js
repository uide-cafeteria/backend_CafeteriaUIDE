import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/db.js';

const Producto = sequelize.define('producto', {
  idProducto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre del producto es requerido'
      },
      len: {
        args: [3, 150],
        msg: 'El nombre debe tener entre 3 y 150 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La descripción no debe exceder 500 caracteres'
      }
    }
  },
  precio: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'El precio debe ser un valor decimal válido'
      },
      min: {
        args: [0],
        msg: 'El precio no puede ser negativo'
      }
    }
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  categoria: {
    type: DataTypes.ENUM('Desayuno', 'Almuerzo', 'Postre', 'Otro'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Desayuno', 'Almuerzo', 'Postre', 'Otro']],
        msg: 'La categoría debe ser una de las opciones válidas'
      }
    }
  },
  ubicacion: {
    type: DataTypes.ENUM('cafeteria', 'rooftop', 'ambos'),
    allowNull: false,
    defaultValue: 'cafeteria',
    validate: {
      isIn: {
        args: [['cafeteria', 'rooftop', 'ambos']],
        msg: 'La ubicación debe ser una de las opciones válidas'
      }
    }
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuario',
      key: 'idUsuario'
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'producto',
  timestamps: false
});

export default Producto;