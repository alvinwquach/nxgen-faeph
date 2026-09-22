-- lovable-cron-fallback-reviewed: 288 runs/day; unpaid reserve holds must auto-release near their 20-minute deadline so slots return to OPEN for other clients; no row-change event exists for "time passed", so a short sweep is required.
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'Pending','Reserved','Booked','Blocked','Confirmed',
    'Unpaid','Partial','Paid','Paid - Cash','Paid - GCash','Paid - Other','Cancelled'
  ));

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reserved_until timestamptz;
CREATE INDEX IF NOT EXISTS bookings_reserved_until_idx
  ON public.bookings (reserved_until) WHERE reserved_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS bookings_status_date_idx ON public.bookings (date, status);

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads settings" ON public.app_settings;
CREATE POLICY "Anyone reads settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Staff write settings" ON public.app_settings;
CREATE POLICY "Staff write settings" ON public.app_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_staff_access(auth.uid()));

DROP POLICY IF EXISTS "Staff update settings" ON public.app_settings;
CREATE POLICY "Staff update settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.has_staff_access(auth.uid()))
  WITH CHECK (public.has_staff_access(auth.uid()));

INSERT INTO public.app_settings (key, value) VALUES
  ('open_hours', '{"start": 6, "end": 23}'::jsonb),
  ('reserve_grace_minutes', '{"minutes": 20}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.schedule_pulse (
  id int PRIMARY KEY,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.schedule_pulse TO anon, authenticated;
GRANT ALL ON public.schedule_pulse TO service_role;

ALTER TABLE public.schedule_pulse ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads schedule pulse" ON public.schedule_pulse;
CREATE POLICY "Anyone reads schedule pulse" ON public.schedule_pulse
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.schedule_pulse (id, updated_at) VALUES (1, now())
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.bump_schedule_pulse()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.schedule_pulse SET updated_at = now() WHERE id = 1;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS bookings_schedule_pulse ON public.bookings;
CREATE TRIGGER bookings_schedule_pulse
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH STATEMENT EXECUTE FUNCTION public.bump_schedule_pulse();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_pulse;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.slot_states(_from date, _to date)
RETURNS TABLE (
  court_id text,
  day date,
  hour int,
  state text,
  booking_id uuid,
  member_id uuid,
  reserved_until timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    b.court_id,
    b.date AS day,
    h.hour::int,
    CASE b.status
      WHEN 'Pending' THEN 'pending'
      WHEN 'Reserved' THEN 'reserved'
      WHEN 'Blocked' THEN 'blocked'
      ELSE 'booked'
    END AS state,
    b.id,
    b.member_id,
    b.reserved_until
  FROM public.bookings b
  CROSS JOIN LATERAL generate_series(b.start_hour, b.start_hour + b.hours - 1) AS h(hour)
  WHERE b.date BETWEEN _from AND LEAST(_to, _from + 31)
    AND b.status <> 'Cancelled'
    AND NOT (b.status = 'Reserved' AND b.reserved_until IS NOT NULL AND b.reserved_until < now())
$$;

REVOKE ALL ON FUNCTION public.slot_states(date, date) FROM public;
GRANT EXECUTE ON FUNCTION public.slot_states(date, date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.release_lapsed_reserves()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE released int; grace int;
BEGIN
  SELECT COALESCE((value->>'minutes')::int, 20) INTO grace
  FROM public.app_settings WHERE key = 'reserve_grace_minutes';
  grace := GREATEST(COALESCE(grace, 20), 1);

  WITH lapsed AS (
    SELECT id FROM public.bookings
    WHERE status = 'Reserved'
      AND COALESCE(deposit_paid, 0) = 0
      AND COALESCE(reserved_until, created_at + make_interval(mins => grace)) < now()
  ), done AS (
    UPDATE public.bookings b
       SET status = 'Cancelled', updated_at = now()
      FROM lapsed l WHERE b.id = l.id
    RETURNING b.id
  )
  SELECT count(*) INTO released FROM done;
  RETURN released;
END; $$;

REVOKE ALL ON FUNCTION public.release_lapsed_reserves() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.release_lapsed_reserves() TO authenticated, service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE j bigint;
BEGIN
  FOR j IN SELECT jobid FROM cron.job WHERE jobname = 'release-lapsed-reserves' LOOP
    PERFORM cron.unschedule(j);
  END LOOP;
  PERFORM cron.schedule(
    'release-lapsed-reserves',
    '*/5 * * * *',
    $cron$SELECT public.release_lapsed_reserves();$cron$
  );
END $$;