// data/models/menuDelDia.js

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const MenuDelDia = sequelize.define('menu_del_dia', {
    idMenu: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del menú es obligatorio' },
            notNull: { msg: 'El nombre del menú es obligatorio' }
        }
    },
    dia_semana: {
        type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']],
                msg: 'Día de la semana inválido'
            }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'menu_del_dia',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false
});

export default MenuDelDia;