import Usuario from '../data/models/usuario.js';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { Sequelize } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SALT_ROUNDS = 12;

// INICIALIZA FIREBASE ADMIN
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            join(__dirname, '../services/cafeteriauide-firebase.json')
        )
    });
}

const usuarioController = {
    // Endpoint para registrar un cliente con firebase
    registroClienteFirebase: async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({
                    status: false,
                    message: 'Token de identificación es requerido'
                });
            };

            // Verificacion por parde de firebase
            const decoded = await admin.auth().verifyIdToken(idToken);
            const { email, name, uid } = decoded;

            // busca para crear en la bd o retornar usuario existente
            let user = await Usuario.findOne({ where: { correo: email } });
            if (!user) {
                user = await Usuario.create({
                    username: name?.split(' ')[0].toLowerCase() || email.split('@')[0],
                    nombre: name || (name?.split(' ')[0] || email.split('@')[0]),
                    correo: email,
                    telefono: '0000000000',
                    codigoUnico: 'U' + Math.random().toString(36).slice(-4).toUpperCase(),
                    rol: 'cliente',
                    password_hash: null,
                    google_id: uid,
                    loyalty_token: crypto.randomUUID().replaceAll('-', '') //Genera el token para la generación del QR por la promoción de almuerzos
                });
            }

            // Genera el JWT
            const token = jwt.sign(
                { id: user.idUsuario, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            //respuesta
            return res.status(200).json({
                status: true,
                message: 'Autenticacion exitosa',
                token,
                usuario: {
                    id: user.idUsuario,
                    username: user.username,
                    correo: user.correo,
                    telefono: user.telefono,
                    rol: user.rol,
                    codigoUnico: user.codigoUnico, //El código unico es para diferenciar usuarios
                    loyalty_token: user.loyalty_token
                }
            });
        } catch (error) {
            console.error('Firebase error:', error);
            return res.status(500).json({
                status: false,
                message: 'Error interno del servidor'
            });
        }
    },

    //Endpoint para registrar un cliente por OTP telefono
    registroClienteOTP: async (req, res) => {
        // TODO: IMPLEMENTACIÓN PENDIENTE CON FIREBASE (OPCIÓN MAS VIABLE Y GRATUITA)
    },

    //Endpoint para registrar un cliente por correo y contraseña
    //TODO: Implementar verificación de correo para posibles cuentas faltas mediante codigo de verificación o enlace
    registroClienteCorreo: async (req, res) => {
        try {
            // VALIDAR CAMPOS
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: false,
                    errores: errors.array().map(e => e.msg)
                });
            }

            const { username, correo, telefono, contrasenia } = req.body;

            // Verifica si el correo ya está registrado, y si se proporciona teléfono, verifica también
            let whereClause = { correo };
            if (telefono) {
                whereClause = { [Sequelize.Op.or]: [{ correo }, { telefono }] };
            }
            const existe = await Usuario.findOne({ where: whereClause });
            if (existe) {
                return res.status(409).json({
                    status: false,
                    message: existe.correo === correo
                        ? 'Este correo ya está registrado'
                        : 'Este teléfono ya está registrado'
                });
            }

            // Hashea la contraseña
            const hash = await bcrypt.hash(contrasenia, SALT_ROUNDS);

            // Crear el usuario
            const user = await Usuario.create({
                username: username.trim(),
                nombre: username.trim(),
                correo: correo.toLowerCase().trim(),
                telefono: telefono || null,
                codigoUnico: 'U' + Math.random().toString(36).slice(-4).toUpperCase(),
                rol: 'cliente',
                password_hash: hash,
                loyalty_token: crypto.randomUUID().replaceAll('-', '') //Genera el token para la generación del QR por la promoción de almuerzos
            });

            // Jwt
            const token = jwt.sign(
                { id: user.idUsuario, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            //Respuesta
            return res.status(201).json({
                status: true,
                message: 'Cuenta creada con éxito',
                token,
                usuario: {
                    id: user.idUsuario,
                    username: user.username,
                    correo: user.correo,
                    telefono: user.telefono,
                    rol: user.rol,
                    codigoUnico: user.codigoUnico,
                    loyalty_token: user.loyalty_token
                }
            });

        } catch (error) {
            console.error('Registro error:', error);
            return res.status(500).json({
                status: false,
                message: 'Error del servidor. Intenta más tarde'
            });
        };
    },

    //Endpoint para autenticacion de administrador
    adminAuth: async (req, res) => {
        try {
            // Estructura de correo y contraseña

            // Logueo del admin con correo y contraseña
            const { correo, contrasenia } = req.body;

            // Valida campos
            if (!correo || !contrasenia) {
                return res.status(400).json({
                    status: false,
                    message: 'Correo y contraseña son requeridos'
                });
            }

            // Busca la existencia del correo
            const usuario = await Usuario.findOne({
                where: {
                    correo: correo.toLowerCase().trim(),
                    rol: 'administrador'
                }
            });
            if (!usuario) {
                return res.status(401).json({
                    status: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verifica rol administrador
            if (usuario.rol.toLowerCase() !== 'administrador') {
                return res.status(403).json({
                    status: false,
                    message: 'Acceso denegado'
                });
            }

            // verifica contraseña
            const valido = await bcrypt.compare(contrasenia, usuario.password_hash);
            if (!valido) {
                return res.status(401).json({
                    status: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Genera JWT (8h)
            const token = jwt.sign(
                { id: usuario.idUsuario, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            //Respuesta
            return res.status(200).json({
                status: true,
                message: 'Autenticación exitosa',
                token,
                admin: {
                    id: usuario.idUsuario,
                    username: usuario.username,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });
        } catch (error) {
            console.error('Admin error:', error);
            return res.status(500).json({
                status: false,
                message: 'Error interno del servidor'
            });
        };
    },

    //Endpoint para cerrar sesion administrador
    logoutAdmin: async (req, res) => {
        try {
            res.clearCookie('token');
            return res.status(200).json({
                status: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                status: false,
                message: 'Error al cerrar sesión'
            });
        }
    },

    //Endpoint para login cliente
    userAuth: async (req, res) => {
        try {
            // Estructura de correo y contraseña

            // Logueo del cliente con correo y contraseña
            const { correo, contrasenia } = req.body;

            // Valida campos
            if (!correo || !contrasenia) {
                return res.status(400).json({
                    status: false,
                    message: 'Correo y contraseña son requeridos'
                });
            }

            // Busca la existencia del correo
            const usuario = await Usuario.findOne({
                where: {
                    correo: correo.toLowerCase().trim(),
                    rol: 'cliente'
                }
            });
            if (!usuario) {
                return res.status(401).json({
                    status: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verifica rol cliente
            if (usuario.rol.toLowerCase() !== 'cliente') {
                return res.status(403).json({
                    status: false,
                    message: 'Acceso denegado'
                });
            }

            // verifica contraseña
            const valido = await bcrypt.compare(contrasenia, usuario.password_hash);
            if (!valido) {
                return res.status(401).json({
                    status: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Genera JWT (8h)
            const token = jwt.sign(
                { id: usuario.idUsuario, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            //Respuesta
            return res.status(200).json({
                status: true,
                message: 'Autenticación exitosa',
                token,
                usuario: {
                    id: usuario.idUsuario,
                    username: usuario.username,
                    correo: usuario.correo,
                    rol: usuario.rol,
                    codigoUnico: usuario.codigoUnico,
                    loyalty_token: usuario.loyalty_token
                }
            });
        } catch (error) {
            console.error('Admin error: ', error);
            return res.status(500).json({
                status: false,
                message: 'Error interno del servidor'
            });
        };
    }
};

export default usuarioController;