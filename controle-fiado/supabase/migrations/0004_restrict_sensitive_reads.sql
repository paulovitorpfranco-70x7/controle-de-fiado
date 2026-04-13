drop policy if exists "payments_select_authenticated" on public.payments;
drop policy if exists "payment_allocations_select_authenticated" on public.payment_allocations;
drop policy if exists "whatsapp_messages_select_authenticated" on public.whatsapp_messages;

create policy "payments_select_owner_only"
on public.payments
for select
to authenticated
using (public.is_owner());

create policy "payment_allocations_select_owner_only"
on public.payment_allocations
for select
to authenticated
using (public.is_owner());

create policy "whatsapp_messages_select_owner_only"
on public.whatsapp_messages
for select
to authenticated
using (public.is_owner());
