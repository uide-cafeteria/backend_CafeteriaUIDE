import { DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/db.js';

const MenuDiario = sequelize.define('menu_diario', {
    idMenuDiario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dia_semana: {
        type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']],
                msg: 'El día de la semana debe ser una de las opciones válidas'
            }
        }
    },
    idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'producto',
            key: 'idProducto'
        }
    },
    precio_especial: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'El precio especial debe ser un valor decimal válido'
            },
            min: {
                args: [0],
                msg: 'El precio especial no puede ser negativo'
            }
        }
    },
    es_promocion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'menu_diario',
    timestamps: false, // No agregar createdAt/updatedAt automáticos
    indexes: [
        {
            unique: true,
            fields: ['fecha', 'idProducto'],
            name: 'unica_fecha_producto'
        }
    ]
});

export default MenuDiario;