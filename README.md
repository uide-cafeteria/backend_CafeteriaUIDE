# Cafeteria Universitaria

Aplicación móvil para la cafetería universitaria que muestra el menú diario, promociones, horarios, permite solicitar catering y registra el historial de compras, mejorando la información disponible y agilizando la atención para los estudiantes.

## Integrantes

- **Aldrin Venegas** - Full Stack Developer - @alddrinW
- **Anthony Sanchez** - Full Stack Developer - @Ivanxx16
- **Savier Torres** - Full Stack Developer - @Savier
- **Anderson Calva** - Full Stack Developer - @AndersonMCV
- **Erick Morales**- Full Stack Developer - @benitocr7

## Enlaces a GitHub Projects

- [Product Backlog](https://github.com/orgs/uide-cafeteria/projects/14)
- [Sprint 1](https://github.com/orgs/uide-cafeteria/projects/15)

## Capacidad del Equipo

- **Integrantes:** 5 personas
- **Disponibilidad:** 12 horas por persona por sprint (2 semanas)
- **Velocidad estimada:** 3.5 SP por persona = 14 SP total por sprint
- **Sprint duration:** 2 semanas


## Instalación

```bash
# Clonar repositorio
git clone [URL]
cd [nombre-repo]

# Instalar dependencias del proyecto
npm install

# Verificar versión de Node.js y npm
node -v
npm -v

# Ejecutar el servidor en modo desarrollo
npm run dev 

##  Estructura del Proyecto
BACKEND_CAFETERIAUIDE/
│
├── controllers/
│
├── data/
│ ├── config/
│ │ ├── db.js
│ │ └── google.js
│ └── models/
│
├── middleware/
│
├── node_modules/
│
├── routes/
│ ├── index.js
│
├── services/
│
├── uploads/
│
├── .env
├── .gitignore
├── README.md
├── server.js

##  Tecnologías Utilizadas

- **Node.js** – Entorno de ejecución del backend.
- **Express.js** – Framework para el manejo de rutas, controladores y middlewares.
- **MySQL** – Sistema de gestión de base de datos relacional.
- **MySQL2 / Sequelize** – Manejo de modelos y consultas SQL.
- **JWT(JSON Web Tokens)** – Autenticación y manejo de sesiones.
- **Multer** – Gestión de carga de archivos(carpeta `/uploads`).
- **Gmail API** – Envío de correos electrónicos.
- **CORS** – Permisos de acceso entre dominios.
- **npm** – Gestor de dependencias del proyecto.
