import MenuDelDia from './menuDelDia.js';
import Producto from './producto.js';
import MenuDelDiaProducto from './menuDelDiaProducto.js';

export function setupMenuAssociations() {

    // Menú → Productos
    MenuDelDia.belongsToMany(Producto, {
        through: MenuDelDiaProducto,
        foreignKey: 'idMenu',
        otherKey: 'idProducto',
        as: 'productos'
    });

    // Producto → Menús
    Producto.belongsToMany(MenuDelDia, {
        through: MenuDelDiaProducto,
        foreignKey: 'idProducto',
        otherKey: 'idMenu',
        as: 'menus'
    });

    // Relaciones directas (útiles)
    MenuDelDia.hasMany(MenuDelDiaProducto, { foreignKey: 'idMenu' });
    MenuDelDiaProducto.belongsTo(MenuDelDia, { foreignKey: 'idMenu' });

    Producto.hasMany(MenuDelDiaProducto, { foreignKey: 'idProducto' });
    MenuDelDiaProducto.belongsTo(Producto, { foreignKey: 'idProducto' });
}