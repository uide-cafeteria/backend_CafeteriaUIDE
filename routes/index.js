import express from 'express';
import usuarioRoutes from './usuarioRoutes.js';
import productoRoutes from './productoRoutes.js';
import historialAlmuerzoRoutes from './historialAlmuerzoRoutes.js';

const router = express.Router();

router.use('/usuario', usuarioRoutes);
router.use('/producto', productoRoutes);
router.use('/historial', historialAlmuerzoRoutes);

export default router;