-- Booking email notifications: status-change trigger + expiry reminder sweep.

create extension if not exists pg_net with schema extensions;

alter table public.bookings
  add column if not exists notified_event text,
  add column if not exists reminder_sent boolean not null default false;

-- Private config for the notifier (endpoint + shared secret). No API access:
-- only security-definer functions running as the table owner can read it.
create table if not exists public.notify_config (
  key text primary key,
  value text not null
);
alter table public.notify_config enable row level security;
revoke all on public.notify_config from anon, authenticated;
grant all on public.notify_config to service_role;

insert into public.notify_config (key, value) values
  ('endpoint_url', 'https://project--38968c5d-24a7-4370-876b-de82a8383a51.lovable.app/api/public/booking-emails'),
  ('shared_secret', '8237b39afe3dfab0e4b94fb52ebf46ce6cf00d61a80e1ae8')
on conflict (key) do update set value = excluded.value;

create or replace function public.notify_booking_email(_booking_id uuid, _event text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  _url text;
  _secret text;
begin
  select value into _url from public.notify_config where key = 'endpoint_url';
  select value into _secret from public.notify_config where key = 'shared_secret';
  if _url is null or _secret is null then
    return;
  end if;

  perform net.http_post(
    url := _url,
    body := jsonb_build_object('booking_id', _booking_id, 'event', _event),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _secret
    )
  );
end;
$$;

revoke all on function public.notify_booking_email(uuid, text) from public, anon, authenticated;

create or replace function public.booking_email_on_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _event text;
begin
  if tg_op = 'INSERT' then
    if new.status = 'Pending' then
      _event := 'requested';
    elsif new.status in ('Booked', 'Confirmed') then
      _event := 'confirmed';
    end if;
  elsif new.status is distinct from old.status then
    if new.status = 'Pending' then
      _event := 'requested';
    elsif new.status = 'Reserved' then
      _event := 'approved';
    elsif new.status in ('Booked', 'Confirmed') then
      _event := 'confirmed';
    elsif new.status = 'Cancelled' then
      _event := 'released';
    end if;
  end if;

  if _event is null or _event = coalesce(new.notified_event, '') then
    return null;
  end if;

  perform public.notify_booking_email(new.id, _event);
  return null;
end;
$$;

drop trigger if exists booking_email_status_change on public.bookings;
create trigger booking_email_status_change
after insert or update of status on public.bookings
for each row execute function public.booking_email_on_status_change();

-- Reminder sweep: reserved, unpaid, expiring within 5 minutes, not yet reminded.
create or replace function public.send_reserve_expiry_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  _row record;
  _count integer := 0;
begin
  for _row in
    select id from public.bookings
    where status = 'Reserved'
      and reserved_until is not null
      and reserved_until > now()
      and reserved_until <= now() + interval '5 minutes'
      and reminder_sent = false
      and coalesce(deposit_paid, 0) = 0
  loop
    perform public.notify_booking_email(_row.id, 'expiring');
    update public.bookings set reminder_sent = true where id = _row.id;
    _count := _count + 1;
  end loop;
  return _count;
end;
$$;

revoke all on function public.send_reserve_expiry_reminders() from public, anon, authenticated;

-- Reuse the existing 5-minute sweep job; no additional schedule is added.
-- lovable-cron-fallback-reviewed: 288 runs/day; existing job reused, no new schedule added
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'release-lapsed-reserves'),
  command := 'SELECT public.send_reserve_expiry_reminders(); SELECT public.release_lapsed_reserves();'
);