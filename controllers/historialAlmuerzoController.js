import HistorialAlmuerzo from "../data/models/historialAlmuerzo.js";
import Producto from "../data/models/producto.js";
import Usuario from "../data/models/usuario.js";

const historialAlmuerzoController = {

    // mostrar el historial para el usuario
    mostrarHistorialUsuario: async (req, res) => {
        try {
            const idUsuario = req.usuario.idUsuario;

            const historial = await HistorialAlmuerzo.findAll({
                where: { idUsuario },
                attributes: ['fecha', 'es_gratis', 'fecha_registro'],
                include: [
                    { model: Producto, as: 'producto', attributes: ['nombre', 'imagen'], required: false },
                    { model: Usuario, as: 'registradoPor', attributes: ['nombre'], required: false }
                ],
                order: [['fecha', 'DESC']]
            });

            // CÁLCULO DEL PROGRESO
            const pagados = historial.filter(h => !h.es_gratis).length;
            const gratisObtenidos = historial.filter(h => h.es_gratis).length;
            const hoy = new Date().toISOString().split('T')[0];
            const yaConsumioHoy = historial.some(h => h.fecha === hoy);
            const tieneGratisHoy = pagados % 10 === 0 && pagados > 0 && !yaConsumioHoy;
            const faltan = tieneGratisHoy ? 0 : (10 - (pagados % 10));

            res.status(200).json({
                status: true,
                message: 'Historial obtenido exitosamente',
                data: {
                    historial,
                    progreso: {
                        pagados,
                        gratis_obtenidos: gratisObtenidos,
                        total_almuerzos: historial.length,
                        faltan_para_gratis: faltan,
                        tiene_gratis_hoy: tieneGratisHoy,
                        ya_consumio_hoy: yaConsumioHoy
                    }
                }
            });

        } catch (error) {
            console.error("Error en mostrarHistorialUsuario:", error);
            res.status(500).json({
                status: false,
                message: 'Error al obtener historial',
                error: error.message
            });
        }
    },

    // mostrar el historial para el admin (filtrado por usuario)
    mostrarHistorialAdmin: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const idUsuario = req.query.idUsuario;

            // Obtener el historial para administradores
            const historial = await HistorialAlmuerzo.findAll({
                where: { idUsuario },
                attributes: ['fecha', 'es_gratis', 'fecha_registro'],
                include: [
                    {
                        model: Producto,
                        as: 'producto',
                        attributes: ['nombre', 'imagen'],
                        required: false
                    },
                    {
                        model: Usuario,
                        as: 'cliente',
                        attributes: ['nombre', 'correo', 'codigoUnico'],
                        required: false
                    },
                    {
                        model: Usuario,
                        as: 'registradoPor',
                        attributes: ['nombre'],
                        required: false
                    }
                ]
            });

            res.status(200).json({
                status: true,
                message: 'Historial obtenido exitosamente',
                historial
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al mostrar el historial de almuerzos',
                error
            });
        };
    },

    // Registrar almuerzo cargando loyalty_token del usuario
    registrarAlmuerzo: async (req, res) => {
        try {
            if (req.usuario.rol !== 'administrador') {
                return res.status(403).json({ status: false, message: 'Acceso denegado' });
            }

            const { loyalty_token } = req.body;

            // 2. Validar que se envíe el token
            if (!loyalty_token || loyalty_token.trim() === '') {
                return res.status(400).json({
                    status: false,
                    message: 'El QR (loyalty_token) es requerido'
                });
            }

            // 3. Buscar al estudiante por su QR permanente
            const estudiante = await Usuario.findOne({
                where: {
                    loyalty_token: loyalty_token.trim(),
                    activo: true
                },
                attributes: ['idUsuario', 'nombre', 'correo']
            });

            if (!estudiante) {
                return res.status(404).json({
                    status: false,
                    message: 'Estudiante no encontrado o cuenta inactiva'
                });
            }

            const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // 4. Verificar si ya consumió hoy
            const yaConsumio = await HistorialAlmuerzo.findOne({
                where: {
                    idUsuario: estudiante.idUsuario,
                    fecha: hoy
                }
            });

            if (yaConsumio) {
                return res.status(400).json({
                    status: false,
                    message: 'Este estudiante ya consumió su almuerzo hoy',
                    data: { estudiante: estudiante.nombre }
                });
            }

            // 5. Contar cuántos almuerzos pagados lleva (sin contar los gratis)
            const pagadosCount = await HistorialAlmuerzo.count({
                where: {
                    idUsuario: estudiante.idUsuario,
                    es_gratis: false
                }
            });

            const esGratisHoy = (pagadosCount + 1) % 10 === 0;

            // 6. Registrar el almuerzo
            const nuevoAlmuerzo = await HistorialAlmuerzo.create({
                idUsuario: estudiante.idUsuario,
                fecha: hoy,
                registrado_por: req.usuario.idUsuario,
                es_gratis: esGratisHoy,
                fecha_registro: new Date()
            });

            // 7. Respuesta exitosa
            res.status(201).json({
                status: true,
                message: esGratisHoy
                    ? '¡ALMUERZO GRATIS REGISTRADO! Completó 10 almuerzos'
                    : 'Almuerzo registrado correctamente',
                data: {
                    estudiante: {
                        id: estudiante.idUsuario,
                        nombre: estudiante.nombre
                    },
                    almuerzo: {
                        fecha: hoy,
                        es_gratis: esGratisHoy,
                        registrado_por: req.usuario.nombre
                    },
                    progreso: {
                        almuerzos_pagados: pagadosCount + 1,
                        gratis_obtenidos: Math.floor((pagadosCount + 1) / 10),
                        siguiente_gratis_en: esGratisHoy ? 10 : (10 - ((pagadosCount + 1) % 10))
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al registrar almuerzo',
                error
            })
        }
    },

    //Endpoint para buscar al usuario por el loyalty_token
    buscarPorToken: async (req, res) => {
        try {
            const { token } = req.params;

            if (!token || token.trim() === '') {
                return res.status(400).json({
                    status: false,
                    message: 'Token requerido'
                });
            }

            const usuario = await Usuario.findOne({
                where: {
                    loyalty_token: token.trim(),
                    activo: true
                },
                attributes: ['idUsuario', 'nombre', 'codigoUnico', 'correo']
            });

            if (!usuario) {
                return res.status(404).json({
                    status: false,
                    message: 'Usuario no encontrado o cuenta inactiva'
                });
            }

            res.json({
                status: true,
                message: 'Usuario encontrado',
                usuario: {
                    idUsuario: usuario.idUsuario,
                    nombre: usuario.nombre,
                    codigoUnico: usuario.codigoUnico || null,
                    correo: usuario.correo
                }
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al buscar usuario por token',
                error
            });
        }
    }
}

export default historialAlmuerzoController;