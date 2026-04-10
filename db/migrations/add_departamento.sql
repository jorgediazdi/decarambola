-- Agregar departamento a tabla jugadores
ALTER TABLE jugadores
ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT NULL;

-- Agregar departamento a tabla profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS departamento TEXT DEFAULT NULL;

-- Índice para búsquedas por departamento
CREATE INDEX IF NOT EXISTS idx_jugadores_departamento
ON jugadores(departamento);

-- Ver los valores actuales de ciudad para referencia
SELECT DISTINCT ciudad, COUNT(*) as total
FROM jugadores
WHERE ciudad IS NOT NULL
GROUP BY ciudad
ORDER BY total DESC;
