import express from 'express';
import usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

// Ruta para el registro de clientes
router.post('/registro/firebase', usuarioController.registroClienteFirebase);
router.post('/registro/correo', usuarioController.registroClienteCorreo);

//autenticación 
router.post('/auth/admin', usuarioController.adminAuth);
router.post('/auth/cliente', usuarioController.userAuth);

export default router;