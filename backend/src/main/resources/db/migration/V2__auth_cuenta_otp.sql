-- Autenticación: credenciales y OTP de verificación de correo (SecureRandom en aplicación)

INSERT INTO `Rol` (`Descripcion`) VALUES ('Usuario registrado');

CREATE TABLE `Cuenta_Autenticacion` (
  `ID_Cuenta` BIGINT NOT NULL AUTO_INCREMENT,
  `ID_Usuario` BIGINT NOT NULL,
  `Correo` VARCHAR(120) NOT NULL,
  `Contrasena_Hash` VARCHAR(255) NOT NULL,
  `Correo_Verificado` TINYINT(1) NOT NULL DEFAULT 0,
  `OTP_Hash` VARCHAR(64) NULL,
  `OTP_Expira` DATETIME(3) NULL,
  PRIMARY KEY (`ID_Cuenta`),
  UNIQUE KEY `uk_cuenta_usuario` (`ID_Usuario`),
  UNIQUE KEY `uk_cuenta_correo` (`Correo`),
  CONSTRAINT `fk_cuenta_usuario` FOREIGN KEY (`ID_Usuario`) REFERENCES `Usuario` (`ID_Usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
