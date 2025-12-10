import express from 'express';
import historialAlmuerzoController from '../controllers/historialAlmuerzoController.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas para mostrar el historial, para el usuario, y para el administrador
router.get('/usuario/mostrar', verificarToken, historialAlmuerzoController.mostrarHistorialUsuario);
router.get('/admin/mostrar', verificarToken, historialAlmuerzoController.mostrarHistorialAdmin);

//Ruta para registrar almuerzo
router.post('/registrar', verificarToken, historialAlmuerzoController.registrarAlmuerzo);

//Ruta para buscar usuario por token
router.get('/buscar/:token', historialAlmuerzoController.buscarPorToken);

export default router;