-- 1) OTP codes: backend-only, no client access at all
REVOKE ALL ON public.otp_codes FROM anon, authenticated;
GRANT ALL ON public.otp_codes TO service_role;
COMMENT ON TABLE public.otp_codes IS 'Backend-only: one-time codes. No client roles may read or write. RLS enabled with no policies by design.';

-- 2) KotC bracket: hide internal player identifiers from clients
REVOKE ALL ON public.kotc_bracket_matches FROM anon;
REVOKE SELECT ON public.kotc_bracket_matches FROM authenticated;
GRANT SELECT (id, round, slot, player_a_name, player_b_name, winner, scheduled_at, created_at, updated_at)
  ON public.kotc_bracket_matches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kotc_bracket_matches TO authenticated;
GRANT ALL ON public.kotc_bracket_matches TO service_role;

-- 3) Player of the Game: filter by profile consent/visibility, hide identifier columns from anon
REVOKE ALL ON public.player_of_the_game FROM anon;
GRANT SELECT (id, game_id, division, player_name, team, stat_line, post_date, image_url, post_url, notes, title, created_at, updated_at)
  ON public.player_of_the_game TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_of_the_game TO authenticated;
GRANT ALL ON public.player_of_the_game TO service_role;

DROP POLICY IF EXISTS "POTG readable by all" ON public.player_of_the_game;

CREATE POLICY "POTG public rows are viewable"
  ON public.player_of_the_game
  FOR SELECT
  TO anon
  USING (app_private.player_row_is_public(player_id));

CREATE POLICY "POTG visible to signed-in users or staff"
  ON public.player_of_the_game
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()) OR app_private.player_row_is_public(player_id));