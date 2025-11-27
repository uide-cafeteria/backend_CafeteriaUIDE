import express from 'express';
import MenuDiario from '../data/models/menuDiario.js';

const menuDiarioController = {

    //Endpoint para mostrar el menu diario
    obtenerMenuDiario: async (req, res) => {
        try {
            const menuDiario = await MenuDiario.findAll();
            res.status(200).json({
                status: true,
                message: 'Menú Diario Obtenido con éxito',
                menuDiario
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: 'Error al obtener el menú diario',
                error
            });
        }
    }
}

export default menuDiarioController;
