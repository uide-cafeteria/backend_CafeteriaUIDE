import HistorialAlmuerzo from "../data/models/historialAlmuerzo";
import Producto from "../data/models/producto";

const historialAlmuerzoController = {

    //mostrar el historial al usuario
    mostrarHistorialUsuario: async (req, res) => {
        try {
            const idUsuario = req.usuario.idUsuario;

            // Obtener el historial
            const historial = await HistorialAlmuerzo.findAll({
                where: { idUsuario },
                attributes: ['fecha', 'es_gratis', 'fechaRegistro'],
                include: [
                    {
                        model: Producto,
                        attributes: ['nombre', 'imagen'],
                        required: false
                    }
                ]
            })

            res.status(200).json({
                status: true,
                message: 'Historial obtenido exitosamente',
                historial
            })
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al mostrar el historial de almuerzos',
                error
            })
        }
    }
}