DROP POLICY "Public read active cafe stations" ON public.cafe_stations;
CREATE POLICY "Public read active cafe stations" ON public.cafe_stations FOR SELECT TO anon USING (active);
CREATE POLICY "Authenticated read cafe stations" ON public.cafe_stations FOR SELECT TO authenticated USING (active OR public.has_staff_access(auth.uid()));