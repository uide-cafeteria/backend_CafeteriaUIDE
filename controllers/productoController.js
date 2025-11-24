import Producto from '../data/models/producto.js';
import { verificarToken } from '../middleware/auth.js';

const productoController = {
    //Endpoint para listar y mostrar los productos en base de datos
    obtenerProductos: async (req, res) => {
        try {
            const productos = await Producto.findAll();
            res.status(200).json({
                status: true,
                message: 'Productos obtenidos exitosamente',
                productos
            });
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            res.status(500).json({
                status: false,
                message: 'Error al obtener los productos'
            });
        }
    },

    //CRUD PARA LOS PRODUCTOS POR PARTE DE ADMINISTRACIÓN

    //1. Endpoint para crear un producto siendo rol Admin
    crearProducto: async (req, res) => {
        try {
            //Verificar si el rol del usuario es Admin
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({
                    status: false,
                    message: 'Acceso denegado'
                });
            }

            const { nombre, descripcion, precio, imagen, categoria, ubicacion, activo } = req.body;

            //Crea el producto teniendo en cuenta el id del usuario admin que lo creó
            const producto = await Producto.create({
                nombre,
                precio,
                descripcion,
                imagen,
                categoria,
                ubicacion,
                activo,
                creado_por: req.usuario.idUsuario //Tener en cuenta que el token envia idUsuario, no solo id XD
            });

            res.status(201).json({
                status: true,
                message: 'Producto creado con éxito',
                producto
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al crear el producto',
                error
            });
        };
    },

    //Endpoint para marcar el producto como activo / inactivo
    actualizarEstadoProducto: async (req, res) => {
        try {
            //Verificar si el rol del usuario es Admin
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({
                    status: false,
                    message: 'Acceso denegado'
                });
            }

            const { idProducto } = req.params;
            const { activo } = req.body; // Espera { activo: true } o { activo: false } en el body

            if (activo === undefined) {
                return res.status(400).json({
                    status: false,
                    message: 'Debe proporcionar el estado (activo: true/false)'
                });
            }

            const producto = await Producto.findByPk(idProducto);
            if (!producto) {
                return res.status(404).json({
                    status: false,
                    message: 'Producto no encontrado'
                });
            }

            producto.activo = activo;
            await producto.save();

            res.status(200).json({
                status: true,
                message: `Producto marcado como ${activo ? 'activo' : 'inactivo'}`
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al actualizar el estado del producto',
                error
            });
        };
    },

    //Endpoint para actualizar el producto
    actualizarProducto: async (req, res) => {
        try {
            //Verificar si el rol del usuario es Admin
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({
                    status: false,
                    message: 'Acceso denegado'
                });
            }

            const { idProducto } = req.params;
            const { nombre, descripcion, precio, imagen, categoria, ubicacion, activo } = req.body;

            const producto = await Producto.findByPk(idProducto);
            if (!producto) {
                return res.status(404).json({
                    status: false,
                    message: 'Producto no encontrado'
                });
            }

            producto.nombre = nombre;
            producto.descripcion = descripcion;
            producto.precio = precio;
            producto.imagen = imagen;
            producto.categoria = categoria;
            producto.ubicacion = ubicacion;
            producto.activo = activo;
            await producto.save();

            res.status(200).json({
                status: true,
                message: 'Producto actualizado con éxito',
                producto
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al actualizar el producto',
                error
            });
        };
    },
}

export default productoController;