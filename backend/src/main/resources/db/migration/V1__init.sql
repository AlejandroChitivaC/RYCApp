-- Modelo ER: tablas y columnas según diagrama (MySQL 8)

CREATE TABLE `Rol` (
  `ID_Rol` BIGINT NOT NULL AUTO_INCREMENT,
  `Descripcion` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`ID_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Usuario` (
  `ID_Usuario` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Rol` BIGINT NOT NULL,
  `Cedula` VARCHAR(20) NOT NULL,
  `Nombre` VARCHAR(80) NOT NULL,
  `Apellido` VARCHAR(80) NOT NULL,
  `Estado` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`ID_Usuario`),
  UNIQUE KEY `uk_usuario_cedula` (`Cedula`),
  KEY `ix_usuario_rol` (`ID_Rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`ID_Rol`) REFERENCES `Rol` (`ID_Rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Tipo_Costo` (
  `ID_Tipo_Costo` BIGINT NOT NULL AUTO_INCREMENT,
  `Tipo_costo` VARCHAR(120) NOT NULL,
  `Flujo` VARCHAR(60) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  `Estado` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`ID_Tipo_Costo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Vehiculo` (
  `ID_Vehiculo` BIGINT NOT NULL AUTO_INCREMENT,
  `Placa` VARCHAR(20) NOT NULL,
  `Clase` VARCHAR(60) NOT NULL,
  `Marca` VARCHAR(60) NOT NULL,
  `Modelo` VARCHAR(60) NOT NULL,
  `Estado` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`ID_Vehiculo`),
  UNIQUE KEY `uk_vehiculo_placa` (`Placa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Linea_Negocio` (
  `ID_Linea_Negocio` BIGINT NOT NULL AUTO_INCREMENT,
  `Linea_Negocio` VARCHAR(120) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  `Estado` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`ID_Linea_Negocio`),
  UNIQUE KEY `uk_linea_negocio_nombre` (`Linea_Negocio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Material` (
  `ID_Material` BIGINT NOT NULL AUTO_INCREMENT,
  `Material` VARCHAR(120) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Material`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Proveedor` (
  `ID_Proveedor` BIGINT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(160) NOT NULL,
  `NIT` VARCHAR(30) NOT NULL,
  `Departamento` VARCHAR(80) NULL,
  `Municipio` VARCHAR(80) NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Proveedor`),
  UNIQUE KEY `uk_proveedor_nit` (`NIT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Operaciones_Lineas_Negocio` (
  `ID_Operacion` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Usuario_Registro` BIGINT NOT NULL,
  `ID_Linea_Negocio` BIGINT NOT NULL,
  `ID_Vehiculo` BIGINT NOT NULL,
  `ID_Material` BIGINT NOT NULL,
  `ID_Proveedor` BIGINT NOT NULL,
  `Fecha_Insercion` DATETIME(3) NOT NULL,
  `Fecha_Inicio` DATETIME(3) NULL,
  `Fecha_Fin` DATETIME(3) NULL,
  `Medio_Pago` VARCHAR(60) NOT NULL,
  `Valor` DECIMAL(14,2) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Operacion`),
  KEY `ix_op_linea` (`ID_Linea_Negocio`),
  KEY `ix_op_fecha_ins` (`Fecha_Insercion`),
  CONSTRAINT `fk_op_usuario` FOREIGN KEY (`ID_Usuario_Registro`) REFERENCES `Usuario` (`ID_Usuario`),
  CONSTRAINT `fk_op_linea` FOREIGN KEY (`ID_Linea_Negocio`) REFERENCES `Linea_Negocio` (`ID_Linea_Negocio`),
  CONSTRAINT `fk_op_vehiculo` FOREIGN KEY (`ID_Vehiculo`) REFERENCES `Vehiculo` (`ID_Vehiculo`),
  CONSTRAINT `fk_op_material` FOREIGN KEY (`ID_Material`) REFERENCES `Material` (`ID_Material`),
  CONSTRAINT `fk_op_proveedor` FOREIGN KEY (`ID_Proveedor`) REFERENCES `Proveedor` (`ID_Proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Costo_Financiero_OtrosGastos` (
  `ID_Costo_Financiero` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Usuario_Registro` BIGINT NOT NULL,
  `ID_Tipo_Costo` BIGINT NOT NULL,
  `Fecha_Insercion` DATETIME(3) NOT NULL,
  `Medio_Pago` VARCHAR(60) NOT NULL,
  `Valor` DECIMAL(14,2) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Costo_Financiero`),
  CONSTRAINT `fk_cf_usuario` FOREIGN KEY (`ID_Usuario_Registro`) REFERENCES `Usuario` (`ID_Usuario`),
  CONSTRAINT `fk_cf_tipo` FOREIGN KEY (`ID_Tipo_Costo`) REFERENCES `Tipo_Costo` (`ID_Tipo_Costo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Nomina` (
  `ID_Nomina` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Usuario_Registro` BIGINT NOT NULL,
  `ID_Tipo_Costo` BIGINT NOT NULL,
  `ID_Usuario_Debitado` BIGINT NOT NULL,
  `Fecha_Insercion` DATETIME(3) NOT NULL,
  `Fecha_Inicio` DATETIME(3) NULL,
  `Fecha_Fin` DATETIME(3) NULL,
  `Medio_Pago` VARCHAR(60) NOT NULL,
  `Valor` DECIMAL(14,2) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Nomina`),
  CONSTRAINT `fk_nom_reg` FOREIGN KEY (`ID_Usuario_Registro`) REFERENCES `Usuario` (`ID_Usuario`),
  CONSTRAINT `fk_nom_tipo` FOREIGN KEY (`ID_Tipo_Costo`) REFERENCES `Tipo_Costo` (`ID_Tipo_Costo`),
  CONSTRAINT `fk_nom_deb` FOREIGN KEY (`ID_Usuario_Debitado`) REFERENCES `Usuario` (`ID_Usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Costo_Administrativo` (
  `ID_Costo_Administrativo` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Usuario_Registro` BIGINT NOT NULL,
  `ID_Tipo_Costo` BIGINT NOT NULL,
  `Fecha_Insercion` DATETIME(3) NOT NULL,
  `Fecha_Inicio` DATETIME(3) NULL,
  `Fecha_Fin` DATETIME(3) NULL,
  `Medio_Pago` VARCHAR(60) NOT NULL,
  `Valor` DECIMAL(14,2) NOT NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Costo_Administrativo`),
  CONSTRAINT `fk_ca_usuario` FOREIGN KEY (`ID_Usuario_Registro`) REFERENCES `Usuario` (`ID_Usuario`),
  CONSTRAINT `fk_ca_tipo` FOREIGN KEY (`ID_Tipo_Costo`) REFERENCES `Tipo_Costo` (`ID_Tipo_Costo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Costo_Vehiculo` (
  `ID_Costo_Vehiculo` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Usuario_Registro` BIGINT NOT NULL,
  `ID_Tipo_Costo` BIGINT NOT NULL,
  `ID_Vehiculo` BIGINT NOT NULL,
  `Fecha_Insercion` DATETIME(3) NOT NULL,
  `Fecha_Inicio` DATETIME(3) NULL,
  `Fecha_Fin` DATETIME(3) NULL,
  `Medio_Pago` VARCHAR(60) NOT NULL,
  `Valor` DECIMAL(14,2) NOT NULL,
  `Motivo` VARCHAR(200) NULL,
  `Descripcion` VARCHAR(500) NULL,
  PRIMARY KEY (`ID_Costo_Vehiculo`),
  CONSTRAINT `fk_cv_usuario` FOREIGN KEY (`ID_Usuario_Registro`) REFERENCES `Usuario` (`ID_Usuario`),
  CONSTRAINT `fk_cv_tipo` FOREIGN KEY (`ID_Tipo_Costo`) REFERENCES `Tipo_Costo` (`ID_Tipo_Costo`),
  CONSTRAINT `fk_cv_veh` FOREIGN KEY (`ID_Vehiculo`) REFERENCES `Vehiculo` (`ID_Vehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Rol` (`Descripcion`) VALUES ('Administrador');
INSERT INTO `Usuario` (`ID_Rol`, `Cedula`, `Nombre`, `Apellido`, `Estado`)
VALUES (1, '0000000000', 'Sistema', 'Inicial', 'ACTIVO');

INSERT INTO `Material` (`Material`, `Descripcion`) VALUES ('Genérico', 'Catálogo inicial');
INSERT INTO `Proveedor` (`Nombre`, `NIT`, `Departamento`, `Municipio`, `Descripcion`)
VALUES ('Proveedor inicial', '900000000-1', NULL, NULL, 'Catálogo inicial');
