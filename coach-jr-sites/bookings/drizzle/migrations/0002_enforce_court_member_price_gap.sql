UPDATE public.court_rates
SET member_rate = CASE
      WHEN sport IN ('basketball', 'volleyball') THEN 1000.00
      WHEN sport = 'pickleball' THEN 500.00
      ELSE member_rate
    END,
    non_member_rate = CASE
      WHEN sport IN ('basketball', 'volleyball') THEN 1200.00
      WHEN sport = 'pickleball' THEN 700.00
      ELSE non_member_rate
    END,
    updated_at = now()
WHERE sport IN ('basketball', 'volleyball', 'pickleball');

ALTER TABLE public.court_rates
ADD CONSTRAINT court_rates_non_member_200_premium
CHECK (sport NOT IN ('basketball', 'volleyball', 'pickleball') OR non_member_rate = member_rate + 200.00);