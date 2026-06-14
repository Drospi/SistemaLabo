-- =============================================================================
-- SISTEMA GESTOR DE LABORATORIOS EMI
-- Schema SQLite — compatible Node.js v24 / better-sqlite3
-- =============================================================================
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- =============================================================================
-- BLOQUE 1: USUARIOS (Estudiantes y Docentes)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ESTUDIANTE (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigoSaga    TEXT    NOT NULL UNIQUE,          -- Código institucional EMI
  nombres       TEXT    NOT NULL,
  apellidos     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password      TEXT    NOT NULL,                 -- bcrypt hash
  carrera       TEXT    NOT NULL,
  semestre      INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  telefono      TEXT,
  estado        TEXT    NOT NULL DEFAULT 'ACTIVO'
                        CHECK (estado IN ('ACTIVO','INACTIVO','SUSPENDIDO')),
  creadoEn      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  actualizadoEn TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS DOCENTE (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigoSaga    TEXT    NOT NULL UNIQUE,          -- Código institucional EMI
  nombres       TEXT    NOT NULL,
  apellidos     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password      TEXT    NOT NULL,                 -- bcrypt hash
  especialidad  TEXT    NOT NULL,
  grado         TEXT,                             -- Lic., Msc., PhD., etc.
  telefono      TEXT,
  estado        TEXT    NOT NULL DEFAULT 'ACTIVO'
                        CHECK (estado IN ('ACTIVO','INACTIVO')),
  creadoEn      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  actualizadoEn TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- =============================================================================
-- BLOQUE 2: LABORATORIOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS TIPO_LABORATORIO (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,   -- Redes, Sistemas, Química, Física, Electrónica
  descripcion TEXT,
  icono       TEXT                    -- slug para icono en frontend (ej: 'network', 'cpu')
);

CREATE TABLE IF NOT EXISTS LABORATORIO (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  idTipoLaboratorio   INTEGER NOT NULL REFERENCES TIPO_LABORATORIO(id),
  codigo              TEXT    NOT NULL UNIQUE,   -- Ej: LAB-RED-01, LAB-SIS-02
  nombre              TEXT    NOT NULL,
  ubicacion           TEXT    NOT NULL,          -- Pabellón / Piso / Aula
  capacidadPersonas   INTEGER NOT NULL DEFAULT 0,
  descripcion         TEXT,
  responsableId       INTEGER REFERENCES DOCENTE(id),  -- Docente encargado
  estado              TEXT    NOT NULL DEFAULT 'OPERATIVO'
                              CHECK (estado IN ('OPERATIVO','MANTENIMIENTO','CERRADO','INACTIVO')),
  creadoEn            TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- =============================================================================
-- BLOQUE 3: INVENTARIO DE EQUIPOS Y MATERIALES
-- =============================================================================

-- Categorías de materiales por tipo de laboratorio
CREATE TABLE IF NOT EXISTS CATEGORIA_MATERIAL (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  idTipoLaboratorio   INTEGER REFERENCES TIPO_LABORATORIO(id),  -- NULL = aplica a todos
  nombre              TEXT NOT NULL,    -- Ej: Equipos de Cómputo, Reactivos, Instrumentos de Medición
  descripcion         TEXT
);

-- Catálogo maestro de materiales/equipos
CREATE TABLE IF NOT EXISTS MATERIAL (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  idCategoria         INTEGER NOT NULL REFERENCES CATEGORIA_MATERIAL(id),
  codigo              TEXT    NOT NULL UNIQUE,   -- Código interno del activo
  nombre              TEXT    NOT NULL,
  marca               TEXT,
  modelo              TEXT,
  descripcion         TEXT,
  -- Tipo de gestión: UNITARIO = registro individual, STOCK = cantidad
  tipoGestion         TEXT    NOT NULL DEFAULT 'UNITARIO'
                              CHECK (tipoGestion IN ('UNITARIO','STOCK')),
  unidadMedida        TEXT    DEFAULT 'UNIDAD', -- UNIDAD, LITRO, GRAMO, METRO, etc.
  stockMinimo         INTEGER DEFAULT 0,         -- Solo para tipo STOCK
  creadoEn            TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- ─── INVENTARIO UNITARIO ─────────────────────────────────────────────────────
-- Para equipos que se rastrean individualmente (cada PC, microscopio, router, etc.)
CREATE TABLE IF NOT EXISTS INVENTARIO_UNITARIO (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idMaterial      INTEGER NOT NULL REFERENCES MATERIAL(id),
  idLaboratorio   INTEGER NOT NULL REFERENCES LABORATORIO(id),
  numeroSerie     TEXT    UNIQUE,               -- Serie del fabricante
  codigoInventario TEXT   NOT NULL UNIQUE,      -- Código interno EMI (etiqueta física)
  fechaAdquisicion TEXT,
  valorAdquisicion REAL,
  estado          TEXT    NOT NULL DEFAULT 'DISPONIBLE'
                          CHECK (estado IN (
                            'DISPONIBLE',       -- Listo para usar
                            'EN_USO',           -- Asignado/en préstamo
                            'MANTENIMIENTO',    -- En reparación
                            'DETERIORADO',      -- Funciona con fallas
                            'DADO_DE_BAJA'      -- Fuera de servicio definitivo
                          )),
  observaciones   TEXT,
  actualizadoEn   TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- ─── INVENTARIO POR STOCK ────────────────────────────────────────────────────
-- Para materiales fungibles o contables en conjunto (cables, reactivos, herramientas, etc.)
CREATE TABLE IF NOT EXISTS INVENTARIO_STOCK (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idMaterial      INTEGER NOT NULL REFERENCES MATERIAL(id),
  idLaboratorio   INTEGER NOT NULL REFERENCES LABORATORIO(id),
  cantidadTotal   INTEGER NOT NULL DEFAULT 0,
  cantidadDisponible INTEGER NOT NULL DEFAULT 0,
  cantidadReservada  INTEGER NOT NULL DEFAULT 0,
  cantidadDañada     INTEGER NOT NULL DEFAULT 0,
  ubicacionFisica TEXT,                        -- Estante, gaveta, armario, etc.
  actualizadoEn   TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  UNIQUE (idMaterial, idLaboratorio)
);

-- =============================================================================
-- BLOQUE 4: MANTENIMIENTO DE EQUIPOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS MANTENIMIENTO (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  idInventarioUnitario INTEGER NOT NULL REFERENCES INVENTARIO_UNITARIO(id),
  tipo                TEXT NOT NULL CHECK (tipo IN ('PREVENTIVO','CORRECTIVO','EMERGENCIA')),
  descripcionFalla    TEXT,
  trabajoRealizado    TEXT,
  responsable         TEXT NOT NULL,            -- Técnico/empresa externa
  costo               REAL DEFAULT 0,
  fechaInicio         TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  fechaFin            TEXT,
  estadoAnterior      TEXT,                     -- Estado del equipo antes del mantenimiento
  resultado           TEXT CHECK (resultado IN ('REPARADO','IRREPARABLE','PENDIENTE',NULL)),
  observaciones       TEXT,
  registradoPor       INTEGER REFERENCES DOCENTE(id)
);

-- =============================================================================
-- BLOQUE 5: PRÁCTICAS / SESIONES DE CLASE
-- =============================================================================

CREATE TABLE IF NOT EXISTS PRACTICA (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idLaboratorio   INTEGER NOT NULL REFERENCES LABORATORIO(id),
  idDocente       INTEGER NOT NULL REFERENCES DOCENTE(id),
  titulo          TEXT    NOT NULL,
  descripcion     TEXT,
  materia         TEXT    NOT NULL,
  semestre        INTEGER NOT NULL,
  duracionHoras   REAL    NOT NULL DEFAULT 2.0,
  estado          TEXT    NOT NULL DEFAULT 'ACTIVA'
                          CHECK (estado IN ('ACTIVA','FINALIZADA','CANCELADA')),
  creadoEn        TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- Materiales requeridos para una práctica
CREATE TABLE IF NOT EXISTS PRACTICA_MATERIAL (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idPractica      INTEGER NOT NULL REFERENCES PRACTICA(id),
  idMaterial      INTEGER NOT NULL REFERENCES MATERIAL(id),
  cantidadRequerida INTEGER NOT NULL DEFAULT 1,
  observaciones   TEXT
);

-- =============================================================================
-- BLOQUE 6: RESERVAS / HORARIOS DE LABORATORIO
-- =============================================================================

CREATE TABLE IF NOT EXISTS RESERVA (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idLaboratorio   INTEGER NOT NULL REFERENCES LABORATORIO(id),
  idPractica      INTEGER REFERENCES PRACTICA(id),   -- NULL si es reserva libre
  -- Solicitante: docente O estudiante (solo uno tendrá valor)
  idDocente       INTEGER REFERENCES DOCENTE(id),
  idEstudiante    INTEGER REFERENCES ESTUDIANTE(id),
  fecha           TEXT    NOT NULL,                  -- YYYY-MM-DD
  horaInicio      TEXT    NOT NULL,                  -- HH:MM
  horaFin         TEXT    NOT NULL,                  -- HH:MM
  motivo          TEXT    NOT NULL,
  numParticipantes INTEGER DEFAULT 1,
  estado          TEXT    NOT NULL DEFAULT 'PENDIENTE'
                          CHECK (estado IN (
                            'PENDIENTE',    -- Esperando aprobación
                            'APROBADA',
                            'RECHAZADA',
                            'CANCELADA',
                            'EN_CURSO',
                            'COMPLETADA'
                          )),
  motivoRechazo   TEXT,
  aprobadoPor     INTEGER REFERENCES DOCENTE(id),
  aprobadoEn      TEXT,
  creadoEn        TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  -- Evitar solapamiento de reservas aprobadas en el mismo lab
  CHECK (horaInicio < horaFin),
  CHECK (idDocente IS NOT NULL OR idEstudiante IS NOT NULL)
);

-- =============================================================================
-- BLOQUE 7: SOLICITUDES DE MATERIALES
-- =============================================================================

CREATE TABLE IF NOT EXISTS SOLICITUD_MATERIAL (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  idReserva       INTEGER REFERENCES RESERVA(id),    -- Puede estar ligada a una reserva
  idDocente       INTEGER REFERENCES DOCENTE(id),
  idEstudiante    INTEGER REFERENCES ESTUDIANTE(id),
  fechaSolicitud  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  fechaNecesaria  TEXT    NOT NULL,
  estado          TEXT    NOT NULL DEFAULT 'PENDIENTE'
                          CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA','ENTREGADA','DEVUELTA')),
  observaciones   TEXT,
  aprobadoPor     INTEGER REFERENCES DOCENTE(id),
  CHECK (idDocente IS NOT NULL OR idEstudiante IS NOT NULL)
);

-- Detalle de cada solicitud (qué materiales y en qué cantidad)
CREATE TABLE IF NOT EXISTS SOLICITUD_MATERIAL_DETALLE (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  idSolicitud         INTEGER NOT NULL REFERENCES SOLICITUD_MATERIAL(id),
  idMaterial          INTEGER NOT NULL REFERENCES MATERIAL(id),
  -- Para unitarios: referencia al ítem específico (puede asignarse al aprobar)
  idInventarioUnitario INTEGER REFERENCES INVENTARIO_UNITARIO(id),
  cantidadSolicitada  INTEGER NOT NULL DEFAULT 1,
  cantidadAprobada    INTEGER DEFAULT 0,
  estadoDevolucion    TEXT DEFAULT 'PENDIENTE'
                           CHECK (estadoDevolucion IN ('PENDIENTE','DEVUELTO','PERDIDO','DAÑADO'))
);

-- =============================================================================
-- BLOQUE 8: DATOS SEMILLA (SEED)
-- =============================================================================

-- Tipos de laboratorio EMI
INSERT OR IGNORE INTO TIPO_LABORATORIO (id, nombre, descripcion, icono) VALUES
  (1, 'Redes y Telecomunicaciones', 'Laboratorio de infraestructura de redes, cableado estructurado y telecomunicaciones', 'network'),
  (2, 'Sistemas / Computación',     'Laboratorio de computadoras, programación y sistemas operativos', 'cpu'),
  (3, 'Química',                    'Laboratorio de química general, analítica y experimental', 'flask'),
  (4, 'Física',                     'Laboratorio de física experimental, mecánica y óptica', 'atom'),
  (5, 'Electrónica',                'Laboratorio de circuitos electrónicos, protoboards y soldadura', 'zap');

-- Laboratorios físicos EMI
INSERT OR IGNORE INTO LABORATORIO (id, idTipoLaboratorio, codigo, nombre, ubicacion, capacidadPersonas, descripcion, estado) VALUES
  (1, 1, 'LAB-RED-01', 'Laboratorio de Redes I',             'Pabellón A - Piso 2 - Aula 201', 30, 'Equipado con routers Cisco, switches y panel de parcheo', 'OPERATIVO'),
  (2, 1, 'LAB-RED-02', 'Laboratorio de Redes II',            'Pabellón A - Piso 2 - Aula 202', 30, 'Laboratorio de redes inalámbricas y fibra óptica', 'OPERATIVO'),
  (3, 2, 'LAB-SIS-01', 'Laboratorio de Sistemas I',          'Pabellón B - Piso 1 - Aula 101', 40, 'Sala de computadoras para programación y bases de datos', 'OPERATIVO'),
  (4, 2, 'LAB-SIS-02', 'Laboratorio de Sistemas II',         'Pabellón B - Piso 1 - Aula 102', 40, 'Sala de computadoras para diseño y multimedia', 'OPERATIVO'),
  (5, 3, 'LAB-QUI-01', 'Laboratorio de Química General',     'Pabellón C - Piso 1 - Aula 110', 24, 'Laboratorio de química con campana extractora y reactivos', 'OPERATIVO'),
  (6, 3, 'LAB-QUI-02', 'Laboratorio de Química Analítica',   'Pabellón C - Piso 1 - Aula 111', 20, 'Equipado con equipos de análisis y espectrofotómetros', 'OPERATIVO'),
  (7, 4, 'LAB-FIS-01', 'Laboratorio de Física I',            'Pabellón D - Piso 1 - Aula 120', 28, 'Física mecánica, cinemática y dinámica', 'OPERATIVO'),
  (8, 4, 'LAB-FIS-02', 'Laboratorio de Física II',           'Pabellón D - Piso 1 - Aula 121', 28, 'Física eléctrica, óptica y termodinámica', 'OPERATIVO'),
  (9, 5, 'LAB-ELE-01', 'Laboratorio de Electrónica I',       'Pabellón E - Piso 2 - Aula 210', 24, 'Circuitos analógicos, protoboards y osciloscopios', 'OPERATIVO'),
  (10,5, 'LAB-ELE-02', 'Laboratorio de Electrónica Digital', 'Pabellón E - Piso 2 - Aula 211', 24, 'Circuitos digitales, FPGAs y microprocesadores', 'OPERATIVO');

-- Categorías de materiales por tipo de laboratorio
INSERT OR IGNORE INTO CATEGORIA_MATERIAL (id, idTipoLaboratorio, nombre) VALUES
  -- Redes
  (1,  1, 'Equipos de Enrutamiento y Conmutación'),
  (2,  1, 'Cableado y Conectores'),
  (3,  1, 'Herramientas de Red'),
  -- Sistemas
  (4,  2, 'Equipos de Cómputo'),
  (5,  2, 'Periféricos'),
  (6,  2, 'Almacenamiento'),
  -- Química
  (7,  3, 'Reactivos Químicos'),
  (8,  3, 'Cristalería y Recipientes'),
  (9,  3, 'Equipos de Laboratorio Químico'),
  -- Física
  (10, 4, 'Instrumentos de Medición'),
  (11, 4, 'Equipos de Mecánica'),
  (12, 4, 'Equipos de Óptica'),
  -- Electrónica
  (13, 5, 'Instrumentos de Medición Electrónica'),
  (14, 5, 'Componentes Electrónicos'),
  (15, 5, 'Herramientas de Soldadura'),
  -- Generales (todos los labs)
  (16, NULL, 'Mobiliario y Equipamiento General'),
  (17, NULL, 'Seguridad y Protección Personal');

-- Catálogo de materiales
INSERT OR IGNORE INTO MATERIAL (id, idCategoria, codigo, nombre, marca, modelo, tipoGestion, unidadMedida, stockMinimo) VALUES
  -- Redes: Enrutamiento
  (1,  1, 'MAT-RED-001', 'Router Cisco ISR',         'Cisco',    'ISR 4321',      'UNITARIO', 'UNIDAD', 0),
  (2,  1, 'MAT-RED-002', 'Switch Cisco Catalyst',    'Cisco',    'WS-C2960X-24',  'UNITARIO', 'UNIDAD', 0),
  (3,  1, 'MAT-RED-003', 'Access Point WiFi',        'Cisco',    'Aironet 1850',  'UNITARIO', 'UNIDAD', 0),
  (4,  1, 'MAT-RED-004', 'Firewall/UTM',             'Fortinet', 'FortiGate 60F', 'UNITARIO', 'UNIDAD', 0),
  -- Redes: Cableado
  (5,  2, 'MAT-RED-005', 'Cable UTP Cat6',           'Panduit',  NULL,            'STOCK',    'METRO',  50),
  (6,  2, 'MAT-RED-006', 'Conector RJ45 Cat6',       'AMP',      NULL,            'STOCK',    'UNIDAD', 100),
  (7,  2, 'MAT-RED-007', 'Cable de Fibra Óptica MM', 'Corning',  NULL,            'STOCK',    'METRO',  20),
  (8,  2, 'MAT-RED-008', 'Patch Panel 24 puertos',   'Panduit',  'DP24688TGY',    'UNITARIO', 'UNIDAD', 0),
  -- Redes: Herramientas
  (9,  3, 'MAT-RED-009', 'Crimpeadora RJ45',         'Klein',    NULL,            'UNITARIO', 'UNIDAD', 0),
  (10, 3, 'MAT-RED-010', 'Tester de Red',            'Fluke',    'LinkRunner',    'UNITARIO', 'UNIDAD', 0),
  -- Sistemas: Cómputo
  (11, 4, 'MAT-SIS-001', 'Computadora de Escritorio','Dell',     'OptiPlex 7090', 'UNITARIO', 'UNIDAD', 0),
  (12, 4, 'MAT-SIS-002', 'Laptop',                   'HP',       'EliteBook 840', 'UNITARIO', 'UNIDAD', 0),
  (13, 4, 'MAT-SIS-003', 'Servidor Rack',            'Dell',     'PowerEdge R740','UNITARIO', 'UNIDAD', 0),
  -- Sistemas: Periféricos
  (14, 5, 'MAT-SIS-004', 'Monitor LED 24"',          'LG',       '24MK600M',      'UNITARIO', 'UNIDAD', 0),
  (15, 5, 'MAT-SIS-005', 'Teclado USB',              'Logitech', 'K120',          'UNITARIO', 'UNIDAD', 0),
  (16, 5, 'MAT-SIS-006', 'Mouse USB',                'Logitech', 'M100',          'UNITARIO', 'UNIDAD', 0),
  -- Sistemas: Almacenamiento
  (17, 6, 'MAT-SIS-007', 'Disco Duro SSD 512GB',     'Samsung',  '870 EVO',       'STOCK',    'UNIDAD', 5),
  (18, 6, 'MAT-SIS-008', 'Memoria RAM DDR4 8GB',     'Kingston', 'KVR32N22S8/8',  'STOCK',    'UNIDAD', 5),
  -- Química: Reactivos
  (19, 7, 'MAT-QUI-001', 'Ácido Clorhídrico HCl 37%','Merck',   NULL,            'STOCK',    'LITRO',  2),
  (20, 7, 'MAT-QUI-002', 'Hidróxido de Sodio NaOH',  'Merck',   NULL,            'STOCK',    'GRAMO',  500),
  (21, 7, 'MAT-QUI-003', 'Etanol 96%',               'Merck',   NULL,            'STOCK',    'LITRO',  5),
  (22, 7, 'MAT-QUI-004', 'Ácido Sulfúrico H2SO4',    'Merck',   NULL,            'STOCK',    'LITRO',  1),
  -- Química: Cristalería
  (23, 8, 'MAT-QUI-005', 'Vaso de Precipitados 250ml','Pyrex',  NULL,            'STOCK',    'UNIDAD', 10),
  (24, 8, 'MAT-QUI-006', 'Matraz Erlenmeyer 500ml',  'Pyrex',   NULL,            'STOCK',    'UNIDAD', 10),
  (25, 8, 'MAT-QUI-007', 'Probeta Graduada 100ml',   'Pyrex',   NULL,            'STOCK',    'UNIDAD', 5),
  (26, 8, 'MAT-QUI-008', 'Pipeta de 10ml',           'Pyrex',   NULL,            'STOCK',    'UNIDAD', 10),
  -- Química: Equipos
  (27, 9, 'MAT-QUI-009', 'Balanza Analítica',        'Ohaus',   'Pioneer PA214', 'UNITARIO', 'UNIDAD', 0),
  (28, 9, 'MAT-QUI-010', 'Espectrofotómetro UV-Vis', 'Shimadzu','UV-1900',       'UNITARIO', 'UNIDAD', 0),
  (29, 9, 'MAT-QUI-011', 'Plancha de Calefacción',   'IKA',     'C-MAG HS7',     'UNITARIO', 'UNIDAD', 0),
  -- Física: Medición
  (30,10, 'MAT-FIS-001', 'Multímetro Digital',       'Fluke',   '87V',           'UNITARIO', 'UNIDAD', 0),
  (31,10, 'MAT-FIS-002', 'Vernier / Pie de Rey',     'Mitutoyo','530-312',        'UNITARIO', 'UNIDAD', 0),
  (32,10, 'MAT-FIS-003', 'Cronómetro Digital',       'Casio',   'HS-3V',         'UNITARIO', 'UNIDAD', 0),
  -- Física: Mecánica
  (33,11, 'MAT-FIS-004', 'Riel de Aire / Dinámica',  'Pasco',   'ME-9435',       'UNITARIO', 'UNIDAD', 0),
  (34,11, 'MAT-FIS-005', 'Juego de Pesas Patrón',    'Ohaus',   NULL,            'UNITARIO', 'UNIDAD', 0),
  (35,11, 'MAT-FIS-006', 'Péndulo Simple',           'Pasco',   'ME-8748',       'UNITARIO', 'UNIDAD', 0),
  -- Física: Óptica
  (36,12, 'MAT-FIS-007', 'Banco Óptico',             'Pasco',   'OS-8508',       'UNITARIO', 'UNIDAD', 0),
  (37,12, 'MAT-FIS-008', 'Láser Diodo',              'Pasco',   'OS-8525A',      'UNITARIO', 'UNIDAD', 0),
  -- Electrónica: Instrumentos
  (38,13, 'MAT-ELE-001', 'Osciloscopio Digital',     'Rigol',   'DS1054Z',       'UNITARIO', 'UNIDAD', 0),
  (39,13, 'MAT-ELE-002', 'Generador de Señales',     'Rigol',   'DG1022Z',       'UNITARIO', 'UNIDAD', 0),
  (40,13, 'MAT-ELE-003', 'Fuente de Alimentación',   'Rigol',   'DP832',         'UNITARIO', 'UNIDAD', 0),
  (41,13, 'MAT-ELE-004', 'Multímetro de Precisión',  'Fluke',   '115',           'UNITARIO', 'UNIDAD', 0),
  -- Electrónica: Componentes
  (42,14, 'MAT-ELE-005', 'Protoboard 830 puntos',    'BreadBoard',NULL,          'STOCK',    'UNIDAD', 10),
  (43,14, 'MAT-ELE-006', 'Kit Resistencias surtidas','Genérico', NULL,           'STOCK',    'UNIDAD', 5),
  (44,14, 'MAT-ELE-007', 'Kit Capacitores surtidos', 'Genérico', NULL,           'STOCK',    'UNIDAD', 5),
  (45,14, 'MAT-ELE-008', 'Arduino UNO R3',           'Arduino',  'UNO R3',       'UNITARIO', 'UNIDAD', 0),
  (46,14, 'MAT-ELE-009', 'Raspberry Pi 4',           'Raspberry','Model B 4GB',  'UNITARIO', 'UNIDAD', 0),
  -- Electrónica: Soldadura
  (47,15, 'MAT-ELE-010', 'Estación de Soldadura',    'Hakko',   'FX-888D',       'UNITARIO', 'UNIDAD', 0),
  (48,15, 'MAT-ELE-011', 'Estaño para Soldadura',    'Genérico', NULL,           'STOCK',    'GRAMO',  200),
  -- Generales: Seguridad
  (49,17, 'MAT-SEG-001', 'Lentes de Seguridad',      '3M',      NULL,            'STOCK',    'UNIDAD', 10),
  (50,17, 'MAT-SEG-002', 'Guantes de Látex (caja)',  'Genérico', NULL,           'STOCK',    'CAJA',   3),
  (51,17, 'MAT-SEG-003', 'Bata de Laboratorio',      'Genérico', NULL,           'STOCK',    'UNIDAD', 5),
  (52,17, 'MAT-SEG-004', 'Extintor CO2',             'Amerex',  'B10T',          'UNITARIO', 'UNIDAD', 0);

-- =============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_estudiante_codigoSaga   ON ESTUDIANTE(codigoSaga);
CREATE INDEX IF NOT EXISTS idx_docente_codigoSaga      ON DOCENTE(codigoSaga);
CREATE INDEX IF NOT EXISTS idx_laboratorio_tipo        ON LABORATORIO(idTipoLaboratorio);
CREATE INDEX IF NOT EXISTS idx_laboratorio_estado      ON LABORATORIO(estado);
CREATE INDEX IF NOT EXISTS idx_inv_unitario_lab        ON INVENTARIO_UNITARIO(idLaboratorio);
CREATE INDEX IF NOT EXISTS idx_inv_unitario_estado     ON INVENTARIO_UNITARIO(estado);
CREATE INDEX IF NOT EXISTS idx_inv_stock_lab           ON INVENTARIO_STOCK(idLaboratorio);
CREATE INDEX IF NOT EXISTS idx_reserva_fecha           ON RESERVA(fecha);
CREATE INDEX IF NOT EXISTS idx_reserva_lab             ON RESERVA(idLaboratorio);
CREATE INDEX IF NOT EXISTS idx_reserva_estado          ON RESERVA(estado);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_equipo    ON MANTENIMIENTO(idInventarioUnitario);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado        ON SOLICITUD_MATERIAL(estado);
