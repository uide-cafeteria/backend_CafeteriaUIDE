import express from 'express';
import usuarioRoutes from './usuarioRoutes.js';

const router = express.Router();

router.use('/usuario', usuarioRoutes);

export default router;