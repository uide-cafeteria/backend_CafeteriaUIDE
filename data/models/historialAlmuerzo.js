// data/models/historialAlmuerzo.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./usuario.js";
import Producto from "./producto.js";

const HistorialAlmuerzo = sequelize.define(
    "HistorialAlmuerzo",
    {
        idHistorial: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        registrado_por: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        es_gratis: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        fecha_registro: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "historial_almuerzo",
        timestamps: false,
        indexes: [
            { fields: ["idUsuario"] },
            { fields: ["idUsuario", "es_gratis"] },
            { fields: ["fecha"] },
            { unique: true, fields: ["idUsuario", "fecha"] },
        ],
    }
);

// RELACIONES CON LOS NOMBRES QUE TÚ QUIERES
HistorialAlmuerzo.belongsTo(Usuario, {
    foreignKey: "idUsuario",
    as: "cliente",              // ← Aquí está lo que querías
});

HistorialAlmuerzo.belongsTo(Usuario, {
    foreignKey: "registrado_por",
    as: "registradoPor",        // ← cajero o admin que escaneó
});

HistorialAlmuerzo.belongsTo(Producto, {
    foreignKey: "idProducto",
    as: "producto",
});

// Relaciones inversas (muy útiles)
Usuario.hasMany(HistorialAlmuerzo, {
    foreignKey: "idUsuario",
    as: "historialAlmuerzos",
});

Usuario.hasMany(HistorialAlmuerzo, {
    foreignKey: "registrado_por",
    as: "almuerzosEscaneados",
});

export default HistorialAlmuerzo;