import express from 'express';
import usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

// Ruta para el registro de clientes
router.post('/registro/firebase', usuarioController.registroClienteFirebase);
router.post('/registro/correo', usuarioController.registroClienteCorreo);

//autenticación 
router.post('/auth/admin', usuarioController.adminAuth);
router.post('/auth/cliente', usuarioController.userAuth);
//cerrar sesion administrador
router.post('/logout/admin', usuarioController.logoutAdmin);

export default router;