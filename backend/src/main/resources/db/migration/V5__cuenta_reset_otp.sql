-- OTP independiente para recuperación de contraseña (no interfiere con verificación de correo)
ALTER TABLE `Cuenta_Autenticacion`
  ADD COLUMN `Reset_OTP_Hash` VARCHAR(64) NULL,
  ADD COLUMN `Reset_OTP_Expira` DATETIME(3) NULL;
