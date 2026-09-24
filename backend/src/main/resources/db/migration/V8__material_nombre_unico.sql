-- El nombre de material debe ser único (ADMIN-54).
-- Si ya hay duplicados de pruebas, se distingue el registro más reciente.
UPDATE Material m
INNER JOIN (
  SELECT ID_Material,
         ROW_NUMBER() OVER (PARTITION BY Material ORDER BY ID_Material) AS rn
  FROM Material
) t ON t.ID_Material = m.ID_Material
SET m.Material = CONCAT(m.Material, ' #', m.ID_Material)
WHERE t.rn > 1;

ALTER TABLE `Material`
  ADD UNIQUE KEY `uk_material_nombre` (`Material`);
