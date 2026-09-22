CREATE TABLE public.sponsor_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  company text NOT NULL CHECK (char_length(company) BETWEEN 2 AND 160),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.sponsor_inquiries TO anon, authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;

ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit sponsor inquiries"
ON public.sponsor_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);