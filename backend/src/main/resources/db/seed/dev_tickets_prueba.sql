-- Datos de prueba para operaciones y tickets (R&C Transportes)
-- Ejecutar manualmente en entorno local: mysql -u root -proot rycapp < dev_tickets_prueba.sql

SET NAMES utf8mb4;

-- Catálogos complementarios
INSERT INTO `Material` (`Material`, `Descripcion`)
SELECT 'Arena de río', 'Material granular para construcción'
WHERE NOT EXISTS (SELECT 1 FROM `Material` WHERE `Material` = 'Arena de río');

INSERT INTO `Material` (`Material`, `Descripcion`)
SELECT 'Grava triturada', 'Agregado grueso 3/4 pulgada'
WHERE NOT EXISTS (SELECT 1 FROM `Material` WHERE `Material` = 'Grava triturada');

INSERT INTO `Proveedor` (`Nombre`, `NIT`, `Departamento`, `Municipio`, `Descripcion`)
SELECT 'Cemex Colombia S.A.S.', '860002964-4', 'Cundinamarca', 'Bogotá', 'Cliente obra vía Bogotá-Chía'
WHERE NOT EXISTS (SELECT 1 FROM `Proveedor` WHERE `NIT` = '860002964-4');

INSERT INTO `Proveedor` (`Nombre`, `NIT`, `Departamento`, `Municipio`, `Descripcion`)
SELECT 'Concretos del Valle Ltda.', '805012345-6', 'Valle del Cauca', 'Cali', 'Planta de concreto sur occidente'
WHERE NOT EXISTS (SELECT 1 FROM `Proveedor` WHERE `NIT` = '805012345-6');

-- Conductor de prueba (sin cuenta de autenticación; útil para asignación a vehículo)
INSERT INTO `Usuario` (`ID_Rol`, `Cedula`, `Nombre`, `Apellido`, `Estado`)
SELECT 3, '80123456', 'Carlos', 'Mendoza', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM `Usuario` WHERE `Cedula` = '80123456');

-- Contador de prueba
INSERT INTO `Usuario` (`ID_Rol`, `Cedula`, `Nombre`, `Apellido`, `Estado`)
SELECT 4, '52987654', 'María', 'López', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM `Usuario` WHERE `Cedula` = '52987654');

-- Vehículos
INSERT INTO `Vehiculo` (`Placa`, `Clase`, `Marca`, `Modelo`, `Estado`, `ID_Conductor`)
SELECT 'SKR-458', 'Camión', 'Volvo', 'FH 460', 'ACTIVO', u.`ID_Usuario`
FROM `Usuario` u
WHERE u.`Cedula` = '80123456'
  AND NOT EXISTS (SELECT 1 FROM `Vehiculo` WHERE `Placa` = 'SKR-458');

INSERT INTO `Vehiculo` (`Placa`, `Clase`, `Marca`, `Modelo`, `Estado`)
SELECT 'WXY-921', 'Volqueta', 'Chevrolet', 'NPR 816', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM `Vehiculo` WHERE `Placa` = 'WXY-921');

-- Operaciones de prueba (usuario administrador id=7)
INSERT INTO `Operaciones_Lineas_Negocio` (
  `ID_Usuario_Registro`, `ID_Linea_Negocio`, `ID_Vehiculo`, `ID_Material`, `ID_Proveedor`,
  `Fecha_Insercion`, `Fecha_Inicio`, `Fecha_Fin`, `Medio_Pago`, `Valor`, `Descripcion`
)
SELECT
  7,
  ln.`ID_Linea_Negocio`,
  v.`ID_Vehiculo`,
  m.`ID_Material`,
  p.`ID_Proveedor`,
  '2026-06-28 08:15:00.000',
  '2026-06-28 06:00:00.000',
  '2026-06-28 14:30:00.000',
  'Transferencia',
  2850000.00,
  'Transporte de arena de río: planta Mosquera → obra Autopista Norte km 18'
FROM `Linea_Negocio` ln, `Vehiculo` v, `Material` m, `Proveedor` p
WHERE ln.`Linea_Negocio` = 'Transporte de Carga'
  AND v.`Placa` = 'SKR-458'
  AND m.`Material` = 'Arena de río'
  AND p.`NIT` = '860002964-4'
  AND NOT EXISTS (
    SELECT 1 FROM `Operaciones_Lineas_Negocio` o
    WHERE o.`Descripcion` LIKE 'Transporte de arena de río: planta Mosquera%'
  );

INSERT INTO `Operaciones_Lineas_Negocio` (
  `ID_Usuario_Registro`, `ID_Linea_Negocio`, `ID_Vehiculo`, `ID_Material`, `ID_Proveedor`,
  `Fecha_Insercion`, `Fecha_Inicio`, `Fecha_Fin`, `Medio_Pago`, `Valor`, `Descripcion`
)
SELECT
  7,
  ln.`ID_Linea_Negocio`,
  v.`ID_Vehiculo`,
  m.`ID_Material`,
  p.`ID_Proveedor`,
  '2026-07-01 16:40:00.000',
  '2026-07-01 07:00:00.000',
  '2026-07-01 17:45:00.000',
  'Efectivo',
  1920000.00,
  'Transporte de grava triturada: cantera Palmira → planta Concretos del Valle'
FROM `Linea_Negocio` ln, `Vehiculo` v, `Material` m, `Proveedor` p
WHERE ln.`Linea_Negocio` = 'Transporte de Carga'
  AND v.`Placa` = 'WXY-921'
  AND m.`Material` = 'Grava triturada'
  AND p.`NIT` = '805012345-6'
  AND NOT EXISTS (
    SELECT 1 FROM `Operaciones_Lineas_Negocio` o
    WHERE o.`Descripcion` LIKE 'Transporte de grava triturada: cantera Palmira%'
  );

-- Tickets de prueba (PDF mínimo embebido; hash SHA-256 del supuesto archivo imagen original)
SET @pdf = UNHEX('255044462D312E340A312030206F626A3C3C2F547970652F436174616C6F672F50616765732032203020523E3E656E646F626A0A322030206F626A3C3C2F547970652F50616765732F4B6964735B33203020525D2F436F756E7420313E3E656E646F626A0A332030206F626A3C3C2F547970652F506167652F4D65646961426F785B30203020333030203430305D2F506172656E742032203020523E3E656E646F626A0A787265660A3020340A303030303030303030302036353533352066200A3030303030303030393030303030206E200A3030303030303030353830303030206E200A3030303030303031313530303030206E200A747261696C65723C3C2F53697A6520342F526F6F742031203020523E3E0A7374617274787265660A3139300A2525454F460A');

INSERT INTO `Ticket` (
  `ID_Operacion`, `ID_Usuario_Carga`, `Numero_Ticket`, `Nombre_Archivo_Original`,
  `Hash_Sha256`, `Tipo_Contenido_Original`, `Tamano_Bytes_Original`, `Fecha_Carga`
)
SELECT
  o.`ID_Operacion`,
  7,
  'TK-2026-00041',
  'ticket-bascula-mosquera.jpg',
  'acbdd3737516f9e417e12c2bd4d1fd0e034a21614efa5039ae823944c11c0fcd',
  'image/jpeg',
  245760,
  '2026-06-28 14:35:00.000'
FROM `Operaciones_Lineas_Negocio` o
WHERE o.`Descripcion` LIKE 'Transporte de arena de río: planta Mosquera%'
  AND NOT EXISTS (SELECT 1 FROM `Ticket` WHERE `Numero_Ticket` = 'TK-2026-00041');

INSERT INTO `Ticket_Contenido` (`ID_Ticket`, `Contenido_Pdf`)
SELECT t.`ID_Ticket`, @pdf
FROM `Ticket` t
WHERE t.`Numero_Ticket` = 'TK-2026-00041'
  AND NOT EXISTS (SELECT 1 FROM `Ticket_Contenido` tc WHERE tc.`ID_Ticket` = t.`ID_Ticket`);

INSERT INTO `Ticket_Auditoria` (`ID_Ticket`, `ID_Usuario`, `Fecha_Accion`, `Accion`)
SELECT t.`ID_Ticket`, 7, '2026-06-28 14:35:00.000', 'CARGA'
FROM `Ticket` t
WHERE t.`Numero_Ticket` = 'TK-2026-00041'
  AND NOT EXISTS (
    SELECT 1 FROM `Ticket_Auditoria` a
    WHERE a.`ID_Ticket` = t.`ID_Ticket` AND a.`Accion` = 'CARGA'
  );

INSERT INTO `Ticket` (
  `ID_Operacion`, `ID_Usuario_Carga`, `Numero_Ticket`, `Nombre_Archivo_Original`,
  `Hash_Sha256`, `Tipo_Contenido_Original`, `Tamano_Bytes_Original`, `Fecha_Carga`
)
SELECT
  o.`ID_Operacion`,
  7,
  'TK-2026-00058',
  'recibo-pesaje-palmira.png',
  '51adbf55db06657e46d3bc07be98f5de2a795ff7f5be1a864d975ad386eca8e1',
  'image/png',
  318400,
  '2026-07-01 17:50:00.000'
FROM `Operaciones_Lineas_Negocio` o
WHERE o.`Descripcion` LIKE 'Transporte de grava triturada: cantera Palmira%'
  AND NOT EXISTS (SELECT 1 FROM `Ticket` WHERE `Numero_Ticket` = 'TK-2026-00058');

INSERT INTO `Ticket_Contenido` (`ID_Ticket`, `Contenido_Pdf`)
SELECT t.`ID_Ticket`, @pdf
FROM `Ticket` t
WHERE t.`Numero_Ticket` = 'TK-2026-00058'
  AND NOT EXISTS (SELECT 1 FROM `Ticket_Contenido` tc WHERE tc.`ID_Ticket` = t.`ID_Ticket`);

INSERT INTO `Ticket_Auditoria` (`ID_Ticket`, `ID_Usuario`, `Fecha_Accion`, `Accion`)
SELECT t.`ID_Ticket`, 7, '2026-07-01 17:50:00.000', 'CARGA'
FROM `Ticket` t
WHERE t.`Numero_Ticket` = 'TK-2026-00058'
  AND NOT EXISTS (
    SELECT 1 FROM `Ticket_Auditoria` a
    WHERE a.`ID_Ticket` = t.`ID_Ticket` AND a.`Accion` = 'CARGA'
  );
