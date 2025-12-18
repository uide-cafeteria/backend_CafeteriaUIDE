import express from 'express';
import menuDelDiaController from '../controllers/menuDelDiaController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/mostrar', menuDelDiaController.obtenerMenuActivoHoy);

//CRUD menu diario
router.post('/crear', verificarToken, menuDelDiaController.crearMenu);
router.post('/agregar/:idMenu/producto', verificarToken, menuDelDiaController.agregarProductoAlMenu);
router.put('/actualizar/:idMenu/activar', verificarToken, menuDelDiaController.activarMenu);
//muestra todos los menus existentes
router.get('/mostrar/menu', verificarToken, menuDelDiaController.listarTodosLosMenus);
//Elimina todo el menu
router.delete('/eliminar/:idMenu', verificarToken, menuDelDiaController.eliminarMenu);
//Elimina un producto del menu
router.delete('/eliminar/:idMenu/producto/:idProducto', verificarToken, menuDelDiaController.quitarProductoDelMenu);

export default router;