import MenuDiario from '../data/models/menuDiario.js';
import Producto from '../data/models/producto.js';

const menuDiarioController = {

    //Endpoint para mostrar el menu diario
    obtenerMenuDiario: async (req, res) => {
        try {
            const menuDiario = await MenuDiario.findAll();
            res.status(200).json({
                status: true,
                message: 'Menú Diario Obtenido con éxito',
                menuDiario
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al obtener el menú diario',
                error
            });
        };
    },

    // CRUD menu_diario
    crearMenuDiario: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { nombre, dia_semana, idProducto, precio_especial, es_promocion } = req.body;

            // validar si el producto existe, o si no está activo
            const producto = await Producto.findByPk(idProducto);
            if (!producto || !producto.activo) {
                return res.status(404).json({
                    status: false,
                    message: 'El producto no existe o no está activo'
                });
            }

            // crear el producto
            const menuDiario = await MenuDiario.create({
                nombre,
                dia_semana,
                idProducto,
                precio_especial,
                es_promocion,
                activo: true
            });

            res.status(201).json({
                status: true,
                message: 'Menu Diario creado con éxito',
                menuDiario
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al crear el menú diario',
                error
            });
        };
    },

    actualizarMenuDiario: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenuDiario } = req.params;
            const { nombre, dia_semana, idProducto, precio_especial, es_promocion } = req.body;

            // validar si el producto existe, o si no está activo
            const producto = await Producto.findByPk(idProducto);
            if (!producto || !producto.activo) {
                return res.status(404).json({
                    status: false,
                    message: 'El producto no existe o no está activo'
                });
            }

            // actualizar el producto
            const menuDiario = await MenuDiario.update({
                nombre,
                dia_semana,
                idProducto,
                precio_especial,
                es_promocion,
                activo: true
            }, {
                where: {
                    idMenuDiario
                }
            });

            res.status(200).json({
                status: true,
                message: 'Menu Diario actualizado con éxito',
                menuDiario
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al actualizar el menú diario',
                error
            });
        };
    },

    actualizarEstadoMenuDiario: async (req, res) => {
        try {
            // Actualizar el estado (activo) del menú diario
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenuDiario } = req.params;
            const { activo } = req.body;

            const menuDiario = await MenuDiario.findByPk(idMenuDiario);
            if (!menuDiario) {
                return res.status(404).json({
                    status: false,
                    message: 'El menú diario no existe'
                });
            }

            menuDiario.activo = activo;
            await menuDiario.save();

            res.status(200).json({
                status: true,
                message: `El menú diario ${menuDiario.nombre} ha sido ${activo ? 'activado' : 'desactivado'}`,
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al actualizar el estado del menú diario',
                error
            });
        }
    },

    eliminarMenuDiario: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenuDiario } = req.params;

            // eliminar el producto
            const menuDiario = await MenuDiario.destroy({
                where: {
                    idMenuDiario
                }
            });

            res.status(200).json({
                status: true,
                message: 'Menu Diario eliminado con éxito',
                menuDiario
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al eliminar el menú diario',
                error
            });
        };
    }
}

export default menuDiarioController;
