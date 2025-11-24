import express from 'express';
import usuarioRoutes from './usuarioRoutes.js';
import productoRoutes from './productoRoutes.js';

const router = express.Router();

router.use('/usuario', usuarioRoutes);
router.use('/producto', productoRoutes);

export default router;