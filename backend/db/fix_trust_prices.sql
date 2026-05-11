-- Migración para mitigar A-06 (Trust Exploitation)
-- Añade columna de precios base para que el servidor pueda validar montos.

ALTER TABLE tipo_membresia ADD precio_base DECIMAL(10, 2) NULL;
GO

UPDATE tipo_membresia SET precio_base = 20000.00 WHERE id_tipo_membresia = 1; -- Mensual
UPDATE tipo_membresia SET precio_base = 50000.00 WHERE id_tipo_membresia = 2; -- Trimestral
UPDATE tipo_membresia SET precio_base = 180000.00 WHERE id_tipo_membresia = 3; -- Anual
UPDATE tipo_membresia SET precio_base = 90000.00 WHERE id_tipo_membresia = 4; -- Semestral
UPDATE tipo_membresia SET precio_base = 2500.00 WHERE id_tipo_membresia = 5; -- Diaria
GO

ALTER TABLE tipo_membresia ALTER COLUMN precio_base DECIMAL(10, 2) NOT NULL;
GO
