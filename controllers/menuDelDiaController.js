import MenuDelDia from '../data/models/menuDelDia.js';
import MenuDelDiaProducto from '../data/models/menuDelDiaProducto.js';
import Producto from '../data/models/producto.js';
import { Op } from 'sequelize';

const menuDelDiaController = {

    // 1. Obtener el menú ACTIVO del día actual (para clientes/app)
    obtenerMenuActivoHoy: async (req, res) => {
        try {
            const hoy = new Date();
            const diaSemanaMap = {
                0: 'Domingo',   // No usado
                1: 'Lunes',
                2: 'Martes',
                3: 'Miércoles',
                4: 'Jueves',
                5: 'Viernes',
                6: 'Sábado'     // No usado
            };
            const diaSemana = diaSemanaMap[hoy.getDay()];

            // Buscar el menú activo para el día de la semana actual
            const menuActivo = await MenuDelDia.findOne({
                where: {
                    activo: true,
                    dia_semana: diaSemana
                },
                include: [{
                    model: MenuDelDiaProducto,
                    as: 'productos',
                    include: [{
                        model: Producto,
                        as: 'producto',
                        where: { activo: true }, // Solo productos activos
                        required: false
                    }],
                }],
                order: [['creado_en', 'DESC']] // Por si hay más de uno (aunque no debería)
            });

            if (!menuActivo) {
                return res.status(404).json({
                    status: false,
                    message: 'No hay menú activo para hoy'
                });
            }

            res.status(200).json({
                status: true,
                message: 'Menú del día obtenido con éxito',
                menu: menuActivo
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: false,
                message: 'Error al obtener el menú del día',
                error: error.message
            });
        }
    },

    // 2. Crear un nuevo menú completo (solo admin)
    crearMenu: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { nombre, dia_semana, fecha_especifica } = req.body;

            const menu = await MenuDelDia.create({
                nombre,
                dia_semana,
                fecha_especifica: fecha_especifica || null,
                activo: false // Por defecto no activo
            });

            res.status(201).json({
                status: true,
                message: 'Menú creado con éxito',
                menu
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al crear el menú',
                error: error.message
            });
        }
    },

    // 3. Agregar un producto a un menú específico (solo admin)
    agregarProductoAlMenu: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenu } = req.params;
            const { idProducto, precio_especial, es_promocion } = req.body;

            const producto = await Producto.findByPk(idProducto);
            if (!producto || !producto.activo) {
                return res.status(404).json({
                    status: false,
                    message: 'Producto no existe o no está activo'
                });
            }

            const menu = await MenuDelDia.findByPk(idMenu);
            if (!menu) {
                return res.status(404).json({ status: false, message: 'Menú no encontrado' });
            }

            const [relacion, created] = await MenuDelDiaProducto.findOrCreate({
                where: { idMenu, idProducto },
                defaults: {
                    precio_especial,
                    es_promocion: es_promocion || false,
                }
            });

            if (!created) {
                // Si ya existe, actualizamos
                await relacion.update({ precio_especial, es_promocion });
            }

            res.status(200).json({
                status: true,
                message: 'Producto agregado/actualizado en el menú',
                relacion
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al agregar producto al menú',
                error: error.message
            });
        }
    },

    // 4. Activar un menú (desactiva los otros del mismo día)
    activarMenu: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenu } = req.params;

            const menu = await MenuDelDia.findByPk(idMenu);
            if (!menu) {
                return res.status(404).json({ status: false, message: 'Menú no encontrado' });
            }

            // Desactivar todos los menús del mismo día_semana (y fecha_especifica si aplica)
            await MenuDelDia.update(
                { activo: false },
                {
                    where: {
                        dia_semana: menu.dia_semana,
                        idMenu: { [Op.ne]: idMenu }
                    }
                }
            );

            // Activar el seleccionado
            menu.activo = true;
            await menu.save();

            res.status(200).json({
                status: true,
                message: `Menú "${menu.nombre}" activado para ${menu.dia_semana}`,
                menu
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al activar el menú',
                error: error.message
            });
        }
    },

    // 5. Listar todos los menús (para panel admin)
    listarTodosLosMenus: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const menus = await MenuDelDia.findAll({
                include: [{
                    model: MenuDelDiaProducto,
                    as: 'productos',
                    include: [{ model: Producto, as: 'producto' }]
                }],
                order: [['dia_semana', 'ASC'], ['nombre', 'ASC']]
            });

            res.status(200).json({
                status: true,
                message: 'Menús obtenidos con éxito',
                menus
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al listar menús',
                error: error.message
            });
        }
    },

    // 6. Eliminar un menú completo (cascade borra los productos asociados)
    eliminarMenu: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenu } = req.params;

            const menu = await MenuDelDia.findByPk(idMenu);
            if (!menu) {
                return res.status(404).json({ status: false, message: 'Menú no encontrado' });
            }

            if (menu.activo) {
                return res.status(400).json({
                    status: false,
                    message: 'No se puede eliminar un menú activo. Desactívalo primero.'
                });
            }

            await menu.destroy();

            res.status(200).json({
                status: true,
                message: 'Menú eliminado con éxito'
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al eliminar menú',
                error: error.message
            });
        }
    },

    // 7. Quitar un producto de un menú
    quitarProductoDelMenu: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idMenu, idProducto } = req.params;

            const eliminado = await MenuDelDiaProducto.destroy({
                where: { idMenu, idProducto }
            });

            if (eliminado === 0) {
                return res.status(404).json({
                    status: false,
                    message: 'Producto no encontrado en este menú'
                });
            }

            res.status(200).json({
                status: true,
                message: 'Producto eliminado del menú'
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al quitar producto',
                error: error.message
            });
        }
    }
};

export default menuDelDiaController;