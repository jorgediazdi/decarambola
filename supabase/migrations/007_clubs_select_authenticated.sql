-- Portal /club/: leer nombre y logo_url desde el navegador con sesión (rol authenticated).
-- Si el hero queda en "Portal club" sin logo, ejecutar esto en SQL Editor.

DROP POLICY IF EXISTS "clubs_select_authenticated" ON public.clubs;
CREATE POLICY "clubs_select_authenticated"
  ON public.clubs
  FOR SELECT
  TO authenticated
  USING (true);
