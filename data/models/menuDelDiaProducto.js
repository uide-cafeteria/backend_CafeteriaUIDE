// data/models/menuDelDiaProducto.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Producto from './producto.js';
import MenuDelDia from './menuDelDia.js';

const MenuDelDiaProducto = sequelize.define('menu_del_dia_productos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idMenu: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'menu_del_dia',
            key: 'idMenu'
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
            min: { args: [0], msg: 'El precio no puede ser negativo' }
        }
    },
    es_promocion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    tableName: 'menu_del_dia_productos',
    timestamps: false,
    indexes: [
        { fields: ['idMenu'] },
        { unique: true, fields: ['idMenu', 'idProducto'] }
    ]
});

export default MenuDelDiaProducto;