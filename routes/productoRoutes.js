import express from 'express';
import productoController from '../controllers/productoController.js';
import { verificarToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

//Rutas para mostrar productos
router.get('/mostrar', productoController.obtenerProductos);

//Rutas para el CRUD de los productos
router.post('/crear', verificarToken, upload.single('imagen'), productoController.crearProducto);
router.put('/estado/:idProducto', verificarToken, productoController.actualizarEstadoProducto);
router.put('/actualizar/:idProducto', verificarToken, upload.single('imagen'), productoController.actualizarProducto);

export default router;
