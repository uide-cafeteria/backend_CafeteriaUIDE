import express from 'express';
import productoController from '../controllers/productoController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

//Rutas para mostrar productos
router.get('/mostrar', productoController.obtenerProductos);

//Rutas para el CRUD de los productos
router.post('/crear', verificarToken, productoController.crearProducto);
router.put('/estado/:idProducto', verificarToken, productoController.actualizarEstadoProducto);
router.put('/actualizar/:idProducto', verificarToken, productoController.actualizarProducto);

export default router;
