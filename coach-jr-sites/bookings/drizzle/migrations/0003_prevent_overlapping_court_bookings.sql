CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_no_active_overlap
EXCLUDE USING gist (
  court_id WITH =,
  date WITH =,
  int4range(start_hour, start_hour + hours, '[)') WITH &&
)
WHERE (status IS DISTINCT FROM 'Cancelled');