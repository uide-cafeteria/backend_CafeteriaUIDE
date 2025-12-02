import express from 'express';
import menuDiarioController from '../controllers/menuDiarioController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/mostrar', menuDiarioController.obtenerMenuDiario);

//CRUD menu diario
router.post('/crear', verificarToken, menuDiarioController.crearMenuDiario);
router.put('/actualizar/:idMenuDiario', verificarToken, menuDiarioController.actualizarMenuDiario);
router.put('/estado/:idMenuDiario', verificarToken, menuDiarioController.actualizarEstadoMenuDiario);
router.delete('/eliminar/:idMenuDiario', verificarToken, menuDiarioController.eliminarMenuDiario);