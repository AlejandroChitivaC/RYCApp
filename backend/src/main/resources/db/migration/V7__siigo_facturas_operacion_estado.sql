ALTER TABLE `Operaciones_Lineas_Negocio`
  ADD COLUMN `Estado` VARCHAR(32) NOT NULL DEFAULT 'REGISTRADA' AFTER `Descripcion`;

UPDATE `Operaciones_Lineas_Negocio`
SET `Estado` = 'CONFIRMADA'
WHERE `Fecha_Fin` IS NOT NULL;

CREATE TABLE `Factura_Siigo` (
  `ID_Factura_Siigo` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Operacion` BIGINT NULL,
  `Siigo_Invoice_Id` VARCHAR(64) NOT NULL,
  `Numero` VARCHAR(80) NULL,
  `Prefijo` VARCHAR(20) NULL,
  `Fecha` DATE NULL,
  `Fecha_Vencimiento` DATE NULL,
  `Identificacion_Cliente` VARCHAR(30) NULL,
  `Nombre_Cliente` VARCHAR(200) NULL,
  `Total` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `Saldo` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `Estado_Pago` VARCHAR(20) NOT NULL,
  `Observaciones` VARCHAR(1000) NULL,
  `Fecha_Sincronizacion` DATETIME(3) NOT NULL,
  PRIMARY KEY (`ID_Factura_Siigo`),
  UNIQUE KEY `uk_factura_siigo_invoice` (`Siigo_Invoice_Id`),
  KEY `ix_factura_siigo_operacion` (`ID_Operacion`),
  KEY `ix_factura_siigo_estado` (`Estado_Pago`),
  CONSTRAINT `fk_factura_siigo_operacion`
    FOREIGN KEY (`ID_Operacion`) REFERENCES `Operaciones_Lineas_Negocio` (`ID_Operacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
