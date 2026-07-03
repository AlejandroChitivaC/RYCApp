-- HU Tickets: carga, asociación, consulta, duplicados y auditoría
CREATE TABLE `Ticket` (
  `ID_Ticket`                BIGINT       NOT NULL AUTO_INCREMENT,
  `ID_Operacion`             BIGINT       NOT NULL,
  `ID_Usuario_Carga`         BIGINT       NOT NULL,
  `Numero_Ticket`            VARCHAR(100) NULL,
  `Nombre_Archivo_Original`  VARCHAR(255) NOT NULL,
  `Hash_Sha256`              VARCHAR(64)  NOT NULL,
  `Tipo_Contenido_Original`  VARCHAR(100) NOT NULL,
  `Tamano_Bytes_Original`    BIGINT       NOT NULL,
  `Fecha_Carga`              DATETIME(3)  NOT NULL,
  PRIMARY KEY (`ID_Ticket`),
  UNIQUE KEY `uk_ticket_hash`   (`Hash_Sha256`),
  UNIQUE KEY `uk_ticket_numero` (`Numero_Ticket`),
  KEY `ix_ticket_operacion` (`ID_Operacion`),
  KEY `ix_ticket_fecha`     (`Fecha_Carga`),
  CONSTRAINT `fk_ticket_operacion` FOREIGN KEY (`ID_Operacion`)     REFERENCES `Operaciones_Lineas_Negocio` (`ID_Operacion`),
  CONSTRAINT `fk_ticket_usuario`   FOREIGN KEY (`ID_Usuario_Carga`) REFERENCES `Usuario` (`ID_Usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Contenido PDF separado para no cargar el BLOB en consultas de metadatos
CREATE TABLE `Ticket_Contenido` (
  `ID_Ticket`    BIGINT   NOT NULL,
  `Contenido_Pdf` LONGBLOB NOT NULL,
  PRIMARY KEY (`ID_Ticket`),
  CONSTRAINT `fk_tc_ticket` FOREIGN KEY (`ID_Ticket`) REFERENCES `Ticket` (`ID_Ticket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Auditoría de acciones sobre tickets
CREATE TABLE `Ticket_Auditoria` (
  `ID_Auditoria` BIGINT      NOT NULL AUTO_INCREMENT,
  `ID_Ticket`    BIGINT      NOT NULL,
  `ID_Usuario`   BIGINT      NOT NULL,
  `Fecha_Accion` DATETIME(3) NOT NULL,
  `Accion`       VARCHAR(60) NOT NULL,
  PRIMARY KEY (`ID_Auditoria`),
  KEY `ix_ta_ticket` (`ID_Ticket`),
  KEY `ix_ta_fecha`  (`Fecha_Accion`),
  CONSTRAINT `fk_ta_ticket`  FOREIGN KEY (`ID_Ticket`)  REFERENCES `Ticket`  (`ID_Ticket`),
  CONSTRAINT `fk_ta_usuario` FOREIGN KEY (`ID_Usuario`) REFERENCES `Usuario` (`ID_Usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
