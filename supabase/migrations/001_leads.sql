begin;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  payload_hash text not null check (length(payload_hash) = 64),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (char_length(email) between 3 and 254),
  service text not null check (service in ('knowledge', 'support', 'documents')),
  description text not null check (char_length(btrim(description)) between 20 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists leads_email_created_at_idx on public.leads (email, created_at desc);

alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;
grant select, insert on public.leads to service_role;

-- Both the replay check and rate limit run in the same transaction as the insert.
-- Database locks make this work across multiple serverless instances.
create or replace function public.submit_lead(
  p_request_id uuid,
  p_payload_hash text,
  p_name text,
  p_email text,
  p_service text,
  p_description text
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  existing public.leads%rowtype;
  saved_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('request:' || p_request_id::text, 0));

  select * into existing from public.leads where request_id = p_request_id;
  if found then
    if existing.payload_hash <> p_payload_hash then
      raise exception 'IDEMPOTENCY_CONFLICT' using errcode = 'P0001';
    end if;
    return pg_catalog.jsonb_build_object('id', existing.id, 'replayed', true);
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('email:' || p_email, 0));
  if (select count(*) from public.leads where email = p_email and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'RATE_LIMITED' using errcode = 'P0001';
  end if;

  insert into public.leads (request_id, payload_hash, name, email, service, description)
  values (p_request_id, p_payload_hash, p_name, p_email, p_service, p_description)
  returning id into saved_id;

  return pg_catalog.jsonb_build_object('id', saved_id, 'replayed', false);
end;
$$;

revoke all on function public.submit_lead(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_lead(uuid, text, text, text, text, text) to service_role;

commit;
