create extension if not exists pgcrypto;

create type public.app_role as enum ('OWNER', 'STAFF');
create type public.sale_status as enum ('OPEN', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELED');
create type public.payment_method as enum ('CASH', 'PIX', 'CARD');
create type public.whatsapp_trigger_type as enum ('AUTO_3_DAYS', 'AUTO_DUE_DATE', 'MANUAL');
create type public.whatsapp_send_status as enum ('PENDING', 'SENT', 'FAILED', 'CANCELED');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  role public.app_role not null default 'STAFF',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_e164 text,
  address text,
  credit_limit_cents integer,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  description text not null,
  original_amount_cents integer not null check (original_amount_cents > 0),
  fee_amount_cents integer not null default 0 check (fee_amount_cents >= 0),
  final_amount_cents integer not null check (final_amount_cents > 0),
  remaining_amount_cents integer not null check (remaining_amount_cents >= 0),
  sale_date timestamptz not null,
  due_date timestamptz not null,
  status public.sale_status not null default 'OPEN',
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (final_amount_cents = original_amount_cents + fee_amount_cents),
  check (remaining_amount_cents <= final_amount_cents),
  check (due_date >= sale_date)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  payment_date timestamptz not null,
  method public.payment_method not null,
  notes text,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  sale_id uuid not null references public.sales(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0)
);

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  sale_id uuid references public.sales(id) on delete set null,
  trigger_type public.whatsapp_trigger_type not null,
  template_code text,
  message_body text not null,
  send_status public.whatsapp_send_status not null default 'PENDING',
  provider_name text,
  provider_message_id text,
  provider_response text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  payload_json jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index sales_customer_due_date_idx on public.sales (customer_id, due_date);
create index sales_status_due_date_idx on public.sales (status, due_date);
create index payments_customer_payment_date_idx on public.payments (customer_id, payment_date);
create index payment_allocations_payment_id_idx on public.payment_allocations (payment_id);
create index payment_allocations_sale_id_idx on public.payment_allocations (sale_id);
create index whatsapp_messages_customer_created_at_idx on public.whatsapp_messages (customer_id, created_at desc);
create index whatsapp_messages_sale_trigger_status_created_at_idx on public.whatsapp_messages (sale_id, trigger_type, send_status, created_at desc);
create index whatsapp_messages_send_status_scheduled_for_idx on public.whatsapp_messages (send_status, scheduled_for);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_action_created_at_idx on public.audit_logs (action, created_at desc);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger set_sales_updated_at
before update on public.sales
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select p.role
  from public.profiles p
  where p.auth_user_id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_app_role() = 'OWNER', false);
$$;

create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_owner_update"
on public.profiles
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "customers_select_authenticated"
on public.customers
for select
to authenticated
using (true);

create policy "customers_insert_owner_or_staff"
on public.customers
for insert
to authenticated
with check (public.current_app_role() in ('OWNER', 'STAFF'));

create policy "customers_update_owner_or_staff"
on public.customers
for update
to authenticated
using (public.current_app_role() in ('OWNER', 'STAFF'))
with check (public.current_app_role() in ('OWNER', 'STAFF'));

create policy "sales_select_authenticated"
on public.sales
for select
to authenticated
using (true);

create policy "sales_insert_owner_or_staff"
on public.sales
for insert
to authenticated
with check (
  public.current_app_role() in ('OWNER', 'STAFF')
  and created_by_profile_id = public.current_profile_id()
);

create policy "sales_update_owner_only"
on public.sales
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "payments_select_authenticated"
on public.payments
for select
to authenticated
using (true);

create policy "payments_insert_owner_only"
on public.payments
for insert
to authenticated
with check (
  public.is_owner()
  and created_by_profile_id = public.current_profile_id()
);

create policy "payments_update_owner_only"
on public.payments
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "payment_allocations_select_authenticated"
on public.payment_allocations
for select
to authenticated
using (true);

create policy "payment_allocations_owner_only"
on public.payment_allocations
for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "whatsapp_messages_select_authenticated"
on public.whatsapp_messages
for select
to authenticated
using (true);

create policy "whatsapp_messages_insert_owner_only"
on public.whatsapp_messages
for insert
to authenticated
with check (
  public.is_owner()
  and (
    created_by_profile_id is null
    or created_by_profile_id = public.current_profile_id()
  )
);

create policy "whatsapp_messages_update_owner_only"
on public.whatsapp_messages
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "audit_logs_select_owner_only"
on public.audit_logs
for select
to authenticated
using (public.is_owner());

create policy "audit_logs_insert_owner_only"
on public.audit_logs
for insert
to authenticated
with check (public.is_owner());
