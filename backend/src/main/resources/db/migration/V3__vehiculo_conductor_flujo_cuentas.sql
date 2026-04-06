-- Rol Conductor (usuarios asignables como conductor de un vehículo, relación 1:1 opcional)
INSERT INTO `Rol` (`Descripcion`) VALUES ('Conductor');

-- Vehículo ↔ Conductor (Usuario): cada conductor a lo sumo un vehículo; cada vehículo a lo sumo un conductor
ALTER TABLE `Vehiculo`
  ADD COLUMN `ID_Conductor` BIGINT NULL,
  ADD UNIQUE KEY `uk_vehiculo_conductor` (`ID_Conductor`),
  ADD CONSTRAINT `fk_vehiculo_conductor` FOREIGN KEY (`ID_Conductor`) REFERENCES `Usuario` (`ID_Usuario`);
