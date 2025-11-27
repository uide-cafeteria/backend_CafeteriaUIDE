import Producto from '../data/models/producto.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();


// Para usar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productoController = {
    // Mostrar todos los productos (con URL completa de imagen)
    obtenerProductos: async (req, res) => {
        try {
            const productos = await Producto.findAll();
            const baseUrl = `${req.protocol}://${req.get('host')}`;

            const productosConUrlCompleta = productos.map(p => {
                const data = p.toJSON();
                if (data.imagen && !data.imagen.startsWith('http')) {
                    data.imagen = `${baseUrl}${data.imagen}`;
                }
                return data;
            });

            res.status(200).json({
                status: true,
                message: 'Productos obtenidos exitosamente',
                productos: productosConUrlCompleta
            });
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                status: false,
                message: 'Error al obtener los productos'
            });
        }
    },

    // Endpoint para crear producto siendo administrador
    crearProducto: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { nombre, descripcion, precio, categoria, ubicacion, activo } = req.body;

            let imagen = null;

            // GUARDAR SIEMPRE URL COMPLETA EN LA BASE DE DATOS
            if (req.file) {
                imagen = `${process.env.IMAGES_PATH}/${req.file.filename}`;
            }
            // Si el admin pegó una URL externa (Unsplash, etc.)
            else if (req.body.imagen && req.body.imagen.trim() !== '') {
                const url = req.body.imagen.trim();
                imagen = url.startsWith('http') ? url : `${process.env.IMAGES_PATH}/${url}`;
            }

            const producto = await Producto.create({
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                precio: parseFloat(precio),
                imagen, // Usa la url: http://localhost:3001/uploads/xxx.jpg
                categoria,
                ubicacion: ubicacion || 'cafeteria',
                activo: activo !== 'false',
                creado_por: req.usuario.idUsuario
            });

            res.status(201).json({
                status: true,
                message: 'Producto creado con éxito',
                producto
            });

        } catch (error) {
            console.error('Error:', error);
            if (req.file) {
                const fs = require('fs');
                const path = require('path');
                fs.unlink(path.join(process.cwd(), process.env.IMAGES_PATH, req.file.filename), () => { });
            }
            res.status(500).json({ status: false, message: 'Error al crear producto' });
        }
    },

    // ACTUALIZAR PRODUCTO (con cambio de imagen y borrado de la antigua)
    actualizarProducto: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idProducto } = req.params;
            const { nombre, descripcion, precio, categoria, ubicacion, activo } = req.body;
            const baseUrl = `${req.protocol}://${req.get('host')}`;

            const producto = await Producto.findByPk(idProducto);
            if (!producto) {
                return res.status(404).json({ status: false, message: 'Producto no encontrado' });
            }

            let nuevaImagen = producto.imagen; // Por defecto mantener la actual

            // Caso 1: Subió nueva imagen = borrar la antigua
            if (req.file) {
                // Borrar imagen anterior si existe y es local
                if (producto.imagen && !producto.imagen.startsWith('http')) {
                    const oldPath = path.join(__dirname, '..', process.env.IMAGES_PATH, path.basename(producto.imagen));
                    fs.unlink(oldPath, (err) => err && console.error('Error borrando imagen antigua:', err));
                }
                nuevaImagen = `${process.env.IMAGES_PATH}/${req.file.filename}`;
            }
            // Caso 2: Envió URL externa nueva
            else if (req.body.imagen && req.body.imagen.trim() !== '') {
                const url = req.body.imagen.trim();
                if (url.startsWith('http')) {
                    // Si era imagen local antes = borrarla
                    if (producto.imagen && !producto.imagen.startsWith('http')) {
                        const oldPath = path.join(__dirname, '..', process.env.IMAGES_PATH, path.basename(producto.imagen));
                        fs.unlink(oldPath, () => { });
                    }
                    nuevaImagen = url;
                }
            }
            // Caso 3: No envió nada = mantener la actual

            // Actualizar campos
            producto.nombre = nombre?.trim() || producto.nombre;
            producto.descripcion = descripcion?.trim() || null;
            producto.precio = precio ? parseFloat(precio) : producto.precio;
            producto.categoria = categoria || producto.categoria;
            producto.ubicacion = ubicacion || producto.ubicacion;
            producto.activo = activo !== undefined ? (activo !== 'false') : producto.activo;
            producto.imagen = nuevaImagen;

            await producto.save();

            res.status(200).json({
                status: true,
                message: 'Producto actualizado con éxito',
                producto: {
                    ...producto.toJSON(),
                    imagen: nuevaImagen && !nuevaImagen.startsWith('http')
                        ? `${baseUrl}${nuevaImagen}`
                        : nuevaImagen
                }
            });

        } catch (error) {
            console.error('Error actualizando producto:', error);

            // Si subió archivo y falló = borrarlo
            if (req.file) {
                const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
                fs.unlink(filePath, () => { });
            }

            res.status(500).json({
                status: false,
                message: 'Error al actualizar el producto',
                error: error.message
            });
        }
    },

    // Cambiar estado activo/inactivo
    actualizarEstadoProducto: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { idProducto } = req.params;
            const { activo } = req.body;

            if (activo === undefined) {
                return res.status(400).json({ status: false, message: 'Falta el campo activo' });
            }

            const producto = await Producto.findByPk(idProducto);
            if (!producto) {
                return res.status(404).json({ status: false, message: 'Producto no encontrado' });
            }

            producto.activo = activo;
            await producto.save();

            res.status(200).json({
                status: true,
                message: `Producto ${activo ? 'activado' : 'desactivado'} correctamente`
            });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Error al cambiar estado', error });
        }
    }
};

export default productoController;