import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './data/config/db.js';
import routes from './routes/index.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
    res.send('Servidor funcionando correctamente');
})

app.use('/api', routes);

//probar conexion bd

testConnection();

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
