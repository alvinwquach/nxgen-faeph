-- Applied to project lyyvtzdtebsyuoxgakua on 2026-09-23 via Supabase MCP.
-- Signed-out visitors got 401 on the home leaderboard (view joins profiles, which anon can't read)
-- and on the KOTC bracket pool (registrations is owner/staff-only). Expose only public-safe fields.
create or replace function public.get_leaderboard_totals()
returns setof public.leaderboard_totals
language sql stable security definer
set search_path = public
as $$
  select * from public.leaderboard_totals lt
  where app_private.is_visible_stat_player(lt.player_id)
$$;

create or replace function public.get_kotc_pool()
returns setof text
language sql stable security definer
set search_path = public
as $$
  select r.full_name from public.registrations r
  where r.division = 'King of the Court' and r.deleted_at is null
  order by r.created_at
$$;

revoke all on function public.get_leaderboard_totals() from public;
revoke all on function public.get_kotc_pool() from public;
grant execute on function public.get_leaderboard_totals() to anon, authenticated;
grant execute on function public.get_kotc_pool() to anon, authenticated;