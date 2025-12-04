// models/HistorialAlmuerzo.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./Usuario.js";
import Producto from "./Producto.js";

const HistorialAlmuerzo = sequelize.define(
    "historial_almuerzo",
    {
        idHistorial: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        idUsuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: "idUsuario",
            },
        },
        fecha: {
            type: DataTypes.DATEONLY, // solo fecha sin hora
            allowNull: false,
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Producto,
                key: "idProducto",
            },
        },
        registrado_por: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: "idUsuario",
            },
        },
        es_gratis: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "Indica si este almuerzo fue el gratis de la promoción 10=1",
        },
        fecha_registro: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "historial_almuerzo",
        timestamps: false,
        indexes: [
            // Para buscar rápido por estudiante
            { fields: ["idUsuario"] },
            // Para contar rápido los pagados
            { fields: ["idUsuario", "es_gratis"] },
            // Para ordenar por fecha
            { fields: ["fecha"] },
        ],
        comment: "Historial de almuerzos consumidos - promoción 10 almuerzos = 1 gratis",
    }
);

// Relaciones
HistorialAlmuerzo.belongsTo(Usuario, { foreignKey: "idUsuario", as: "estudiante" });
HistorialAlmuerzo.belongsTo(Usuario, { foreignKey: "registrado_por", as: "cajero" });
HistorialAlmuerzo.belongsTo(Producto, { foreignKey: "idProducto", as: "producto" });

// Opcional: si quieres acceder desde Usuario a su historial
Usuario.hasMany(HistorialAlmuerzo, { foreignKey: "idUsuario", as: "historialAlmuerzos" });
Usuario.hasMany(HistorialAlmuerzo, { foreignKey: "registrado_por", as: "almuerzosRegistrados" });

export default HistorialAlmuerzo;