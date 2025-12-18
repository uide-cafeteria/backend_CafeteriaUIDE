import express from 'express';
import usuarioRoutes from './usuarioRoutes.js';
import productoRoutes from './productoRoutes.js';
import menuDelDiaRoutes from './menuDelDiaRoutes.js';

const router = express.Router();

router.use('/usuario', usuarioRoutes);
router.use('/producto', productoRoutes);
router.use('/menu', menuDelDiaRoutes);

export default router;