-- Repair legacy bookings and stop court renames from orphaning rows again.
--
-- Two bookings from 2026-08-23 sat on court_id 'full-court', an id that no
-- longer exists after the court was renamed to 'bb-full'. They belonged to a
-- real member, so they were repointed rather than deleted, then cancelled:
-- both were Unpaid on a long-past date and were still counting as outstanding.

update public.bookings set court_id = 'bb-full', updated_at = now()
where court_id = 'full-court';

update public.bookings set status = 'Cancelled', updated_at = now()
where ref in ('FAE-22576','FAE-83615') and status = 'Unpaid';

-- The orphan was a symptom: court_id was free text with nothing pointing at a
-- real court. court_rates is now the source of truth, so bind bookings to it.
-- ON UPDATE CASCADE means a future rename follows through automatically;
-- ON DELETE RESTRICT stops a court being removed while bookings reference it.
alter table public.bookings drop constraint if exists bookings_court_fk;
alter table public.bookings add constraint bookings_court_fk
  foreign key (court_id) references public.court_rates(court_id)
  on update cascade on delete restrict;
