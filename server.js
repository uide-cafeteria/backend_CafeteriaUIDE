import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './data/config/db.js';
import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupMenuAssociations } from './data/models/associations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

app.get('/api/health', (req, res) => {
    res.send('Servidor funcionando correctamente');
})

app.use('/api', routes);

//probar conexion bd

testConnection();

setupMenuAssociations();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
