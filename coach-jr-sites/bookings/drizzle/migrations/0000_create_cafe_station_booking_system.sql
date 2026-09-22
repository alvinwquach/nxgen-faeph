CREATE TABLE public.cafe_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  station_type text NOT NULL CHECK (station_type IN ('gaming_pc', 'console')),
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  hourly_rate numeric NOT NULL CHECK (hourly_rate >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'offline')),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.cafe_stations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cafe_stations TO authenticated;
GRANT ALL ON public.cafe_stations TO service_role;
ALTER TABLE public.cafe_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active cafe stations" ON public.cafe_stations FOR SELECT TO anon, authenticated USING (active OR public.has_staff_access(auth.uid()));
CREATE POLICY "Staff manage cafe stations" ON public.cafe_stations FOR ALL TO authenticated USING (public.has_staff_access(auth.uid())) WITH CHECK (public.has_staff_access(auth.uid()));

CREATE TABLE public.cafe_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  station_id uuid NOT NULL REFERENCES public.cafe_stations(id) ON DELETE RESTRICT,
  date date NOT NULL,
  start_hour integer NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  hours integer NOT NULL CHECK (hours BETWEEN 1 AND 18),
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'completed', 'cancelled')),
  ref text NOT NULL UNIQUE,
  channel text NOT NULL DEFAULT 'Website' CHECK (channel IN ('Website', 'Counter')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE ON public.cafe_bookings TO authenticated;
GRANT ALL ON public.cafe_bookings TO service_role;
ALTER TABLE public.cafe_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own cafe bookings" ON public.cafe_bookings FOR SELECT TO authenticated USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_staff_access(auth.uid()));
CREATE POLICY "Members create own cafe bookings" ON public.cafe_bookings FOR INSERT TO authenticated WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_staff_access(auth.uid()));
CREATE POLICY "Members update own cafe bookings" ON public.cafe_bookings FOR UPDATE TO authenticated USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_staff_access(auth.uid())) WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()) OR public.has_staff_access(auth.uid()));
CREATE POLICY "Staff delete cafe bookings" ON public.cafe_bookings FOR DELETE TO authenticated USING (public.has_staff_access(auth.uid()));

CREATE TABLE public.cafe_booking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.cafe_bookings(id) ON DELETE CASCADE,
  station_id uuid NOT NULL REFERENCES public.cafe_stations(id) ON DELETE RESTRICT,
  date date NOT NULL,
  hour integer NOT NULL CHECK (hour BETWEEN 0 AND 23),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (station_id, date, hour)
);
GRANT SELECT ON public.cafe_booking_slots TO anon, authenticated;
GRANT INSERT, DELETE ON public.cafe_booking_slots TO authenticated;
GRANT ALL ON public.cafe_booking_slots TO service_role;
ALTER TABLE public.cafe_booking_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cafe availability" ON public.cafe_booking_slots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members create own cafe slots" ON public.cafe_booking_slots FOR INSERT TO authenticated WITH CHECK (booking_id IN (SELECT cb.id FROM public.cafe_bookings cb JOIN public.members m ON m.id = cb.member_id WHERE m.user_id = auth.uid()) OR public.has_staff_access(auth.uid()));
CREATE POLICY "Members release own cafe slots" ON public.cafe_booking_slots FOR DELETE TO authenticated USING (booking_id IN (SELECT cb.id FROM public.cafe_bookings cb JOIN public.members m ON m.id = cb.member_id WHERE m.user_id = auth.uid()) OR public.has_staff_access(auth.uid()));

CREATE INDEX cafe_bookings_member_date_idx ON public.cafe_bookings(member_id, date);
CREATE INDEX cafe_bookings_station_date_idx ON public.cafe_bookings(station_id, date);
CREATE INDEX cafe_booking_slots_date_idx ON public.cafe_booking_slots(date, station_id);

CREATE OR REPLACE FUNCTION public.create_cafe_booking(_station_id uuid, _date date, _hours integer[])
RETURNS public.cafe_bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _member public.members;
  _station public.cafe_stations;
  _booking public.cafe_bookings;
  _hour integer;
  _sorted integer[];
  _ref text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to reserve a station.'; END IF;
  SELECT * INTO _member FROM public.members WHERE user_id = auth.uid();
  IF _member.id IS NULL THEN RAISE EXCEPTION 'Finish setting up your member profile first.'; END IF;
  SELECT * INTO _station FROM public.cafe_stations WHERE id = _station_id AND active = true;
  IF _station.id IS NULL OR _station.status <> 'available' THEN RAISE EXCEPTION 'That station is not available.'; END IF;
  SELECT array_agg(DISTINCT h ORDER BY h) INTO _sorted FROM unnest(_hours) h;
  IF _sorted IS NULL OR cardinality(_sorted) < 1 OR cardinality(_sorted) > 12 THEN RAISE EXCEPTION 'Choose between 1 and 12 hours.'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(_sorted) h WHERE h < 6 OR h > 23) THEN RAISE EXCEPTION 'Choose a valid operating hour.'; END IF;
  IF _date < (now() AT TIME ZONE 'Asia/Manila')::date THEN RAISE EXCEPTION 'Choose today or a future date.'; END IF;
  IF EXISTS (SELECT 1 FROM generate_subscripts(_sorted, 1) i WHERE i > 1 AND _sorted[i] <> _sorted[i - 1] + 1) THEN RAISE EXCEPTION 'Choose consecutive hours for one booking.'; END IF;
  _ref := 'CAFE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 7));
  INSERT INTO public.cafe_bookings (member_id, station_id, date, start_hour, hours, amount, ref)
  VALUES (_member.id, _station.id, _date, _sorted[1], cardinality(_sorted), _station.hourly_rate * cardinality(_sorted), _ref)
  RETURNING * INTO _booking;
  BEGIN
    FOREACH _hour IN ARRAY _sorted LOOP
      INSERT INTO public.cafe_booking_slots (booking_id, station_id, date, hour) VALUES (_booking.id, _station.id, _date, _hour);
    END LOOP;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'One of those hours was just reserved. Pick another time.';
  END;
  INSERT INTO public.activity_log (action, details, actor_id, actor_name)
  VALUES ('Cafe booking created · ' || _station.name, _date::text || ' · ' || _sorted[1] || ':00 · ' || cardinality(_sorted) || 'h · ' || _ref, auth.uid(), _member.name);
  RETURN _booking;
END;
$$;
REVOKE ALL ON FUNCTION public.create_cafe_booking(uuid, date, integer[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_cafe_booking(uuid, date, integer[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.cancel_cafe_booking(_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _booking public.cafe_bookings;
  _member public.members;
  _is_staff boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to cancel a booking.'; END IF;
  SELECT * INTO _booking FROM public.cafe_bookings WHERE id = _booking_id;
  IF _booking.id IS NULL THEN RAISE EXCEPTION 'Booking not found.'; END IF;
  SELECT * INTO _member FROM public.members WHERE id = _booking.member_id;
  _is_staff := public.has_staff_access(auth.uid());
  IF NOT _is_staff AND _member.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _booking.status IN ('cancelled', 'completed') THEN RETURN true; END IF;
  UPDATE public.cafe_bookings SET status = 'cancelled', updated_at = now(), updated_by = auth.uid() WHERE id = _booking_id;
  DELETE FROM public.cafe_booking_slots WHERE booking_id = _booking_id;
  INSERT INTO public.activity_log (action, details, actor_id, actor_name)
  VALUES ('Cafe booking cancelled · ' || _booking.ref, _booking.date::text || ' · ' || _booking.start_hour || ':00', auth.uid(), COALESCE(_member.name, 'Staff'));
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.cancel_cafe_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_cafe_booking(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.touch_cafe_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER cafe_stations_touch_updated_at BEFORE UPDATE ON public.cafe_stations FOR EACH ROW EXECUTE FUNCTION public.touch_cafe_updated_at();
CREATE TRIGGER cafe_bookings_touch_updated_at BEFORE UPDATE ON public.cafe_bookings FOR EACH ROW EXECUTE FUNCTION public.touch_cafe_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.cafe_stations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cafe_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cafe_booking_slots;