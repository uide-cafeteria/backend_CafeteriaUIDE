import jwt from 'jsonwebtoken';
import Usuario from '../data/models/usuario.js';

export const verificarToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ ok: false, msg: 'Token requerido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findByPk(decoded.id);
        if (!usuario) throw new Error();

        req.usuario = usuario;
        next();
    } catch (error) {
        return res.status(401).json({ ok: false, msg: 'Token inválido' });
    }
};