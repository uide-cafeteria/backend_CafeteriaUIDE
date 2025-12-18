CREATE DATABASE cafeteria_uide;
USE cafeteria_uide;

-- 1. Usuarios
CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100),
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),                     
    codigoUnico VARCHAR(15),                  -- matrícula o cédula, NULL para externos
    rol ENUM(
        'administrador',
        'cliente'
    ) NOT NULL DEFAULT 'cliente',
    password_hash VARCHAR(255),               
    google_id VARCHAR(100),                   
    foto_perfil VARCHAR(255),
    loyalty_token VARCHAR(32) NOT NULL UNIQUE DEFAULT (REPLACE(UUID(), '-', '')),  -- ← QR aquí
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_auth CHECK (
        (password_hash IS NOT NULL) OR (google_id IS NOT NULL)
    )
);

-- Índice extra para escaneo rápido (muy importante cuando haya miles de usuarios)
CREATE INDEX idx_loyalty_token ON usuario(loyalty_token);

-- 2. Productos / Platos del catálogo
CREATE TABLE producto (
    idProducto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(8,2) NOT NULL,
    imagen VARCHAR(255),
    categoria ENUM('Desayuno', 'Almuerzo', 'Postre', 'Otro') NOT NULL,
    ubicacion ENUM('cafeteria', 'rooftop', 'ambos') NOT NULL DEFAULT 'cafeteria',
    creado_por INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (creado_por) REFERENCES usuario(idUsuario) ON DELETE RESTRICT
);

-- 3. Menú del día
CREATE TABLE menu_diario (
    idMenuDiario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes') NOT NULL,
    idProducto INT NOT NULL,
    precio_especial DECIMAL(8,2) NULL,
    es_promocion BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON DELETE CASCADE
);

-- 4. Promociones especiales (opcional pero útil)
CREATE TABLE promocion (
    idPromocion INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 5. Historial de almuerzos (promoción almuerzo gratis)
CREATE TABLE historial_almuerzo (
    idHistorial INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT NOT NULL,
    fecha DATE NOT NULL,
    idProducto INT NULL,                      -- NULL = cualquier almuerzo cuenta igual
    registrado_por INT NOT NULL,              -- personal o admin que escaneó el QR
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    es_gratis BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (idProducto) REFERENCES producto(idProducto),
    FOREIGN KEY (registrado_por) REFERENCES usuario(idUsuario),
    UNIQUE KEY unico_almuerzo_dia (idUsuario, fecha)  -- una sola vez por día
);

-- 6. Horarios de atención
CREATE TABLE horario_atencion (
    idHorario INT PRIMARY KEY AUTO_INCREMENT,
    ubicacion ENUM('cafeteria', 'rooftop') NOT NULL,
    dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes') NOT NULL,
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    abierto BOOLEAN DEFAULT true,
    UNIQUE KEY unico_dia_ubicacion (ubicacion, dia_semana)
);

-- 7. Solicitudes de catering
CREATE TABLE solicitud_catering (
    idSolicitud INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_evento DATE NOT NULL,
    hora_evento TIME,
    tipo_evento VARCHAR(100) NOT NULL,
    cantidad_personas INT,
    descripcion TEXT,
    estado ENUM('pendiente', 'confirmada', 'rechazada', 'cancelada') DEFAULT 'pendiente',
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    respondida_por INT NULL,
    respuesta TEXT,
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (respondida_por) REFERENCES usuario(idUsuario)
);

-- 8. Comentarios y sugerencias
CREATE TABLE comentario (
    idComentario INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT NULL,
    nombre VARCHAR(150),
    texto TEXT NOT NULL,
    calificacion TINYINT CHECK (calificacion BETWEEN 1 AND 5),
    ubicacion ENUM('cafeteria', 'rooftop', 'general') DEFAULT 'general',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    respondido BOOLEAN DEFAULT FALSE
);

-- Índices útiles
CREATE INDEX idx_historial_usuario ON historial_almuerzo(idUsuario);
CREATE INDEX idx_historial_fecha ON historial_almuerzo(fecha);