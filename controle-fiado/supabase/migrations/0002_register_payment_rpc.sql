create or replace function public.resolve_sale_status_from_balance(
  p_remaining_amount_cents integer,
  p_due_date timestamptz
)
returns public.sale_status
language plpgsql
stable
as $$
begin
  if p_remaining_amount_cents <= 0 then
    return 'PAID';
  end if;

  if p_due_date < timezone('utc', now()) then
    return 'OVERDUE';
  end if;

  return 'PARTIAL';
end;
$$;

create or replace function public.register_payment(
  p_customer_id uuid,
  p_amount_cents integer,
  p_payment_date timestamptz,
  p_method public.payment_method,
  p_notes text default null,
  p_target_sale_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_actor_profile_id uuid;
  v_actor_role public.app_role;
  v_remaining_payment integer;
  v_allocated_amount integer;
  v_total_allocated integer := 0;
  v_unallocated_amount integer := 0;
  v_sale record;
  v_next_remaining integer;
  v_allocations jsonb := '[]'::jsonb;
begin
  v_actor_profile_id := public.current_profile_id();
  v_actor_role := public.current_app_role();

  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  if v_actor_profile_id is null then
    raise exception 'Usuario autenticado sem profile.';
  end if;

  if v_actor_role <> 'OWNER' then
    raise exception 'Apenas OWNER pode registrar pagamentos nesta fase.';
  end if;

  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Valor do pagamento invalido.';
  end if;

  if p_target_sale_id is not null and not exists (
    select 1
    from public.sales
    where id = p_target_sale_id
      and customer_id = p_customer_id
      and status in ('OPEN', 'PARTIAL', 'OVERDUE')
      and remaining_amount_cents > 0
  ) then
    raise exception 'Titulo selecionado nao esta em aberto para este cliente.';
  end if;

  insert into public.payments (
    customer_id,
    amount_cents,
    payment_date,
    method,
    notes,
    created_by_profile_id
  )
  values (
    p_customer_id,
    p_amount_cents,
    p_payment_date,
    p_method,
    p_notes,
    v_actor_profile_id
  )
  returning id into v_payment_id;

  v_remaining_payment := p_amount_cents;

  if p_target_sale_id is not null then
    select
      id,
      remaining_amount_cents,
      due_date
    into v_sale
    from public.sales
    where id = p_target_sale_id
      and customer_id = p_customer_id
      and status in ('OPEN', 'PARTIAL', 'OVERDUE')
      and remaining_amount_cents > 0
    for update;

    if found and v_remaining_payment > 0 then
      v_allocated_amount := least(v_remaining_payment, v_sale.remaining_amount_cents);

      if v_allocated_amount > 0 then
        insert into public.payment_allocations (
          payment_id,
          sale_id,
          amount_cents
        )
        values (
          v_payment_id,
          v_sale.id,
          v_allocated_amount
        );

        v_next_remaining := greatest(v_sale.remaining_amount_cents - v_allocated_amount, 0);

        update public.sales
        set
          remaining_amount_cents = v_next_remaining,
          status = public.resolve_sale_status_from_balance(v_next_remaining, v_sale.due_date)
        where id = v_sale.id;

        v_allocations := v_allocations || jsonb_build_object(
          'sale_id', v_sale.id,
          'amount_cents', v_allocated_amount
        );

        v_total_allocated := v_total_allocated + v_allocated_amount;
        v_remaining_payment := v_remaining_payment - v_allocated_amount;
      end if;
    end if;
  end if;

  for v_sale in
    select
      id,
      remaining_amount_cents,
      due_date
    from public.sales
    where customer_id = p_customer_id
      and status in ('OPEN', 'PARTIAL', 'OVERDUE')
      and remaining_amount_cents > 0
      and (p_target_sale_id is null or id <> p_target_sale_id)
    order by sale_date asc, created_at asc
    for update
  loop
    exit when v_remaining_payment <= 0;

    v_allocated_amount := least(v_remaining_payment, v_sale.remaining_amount_cents);

    if v_allocated_amount <= 0 then
      continue;
    end if;

    insert into public.payment_allocations (
      payment_id,
      sale_id,
      amount_cents
    )
    values (
      v_payment_id,
      v_sale.id,
      v_allocated_amount
    );

    v_next_remaining := greatest(v_sale.remaining_amount_cents - v_allocated_amount, 0);

    update public.sales
    set
      remaining_amount_cents = v_next_remaining,
      status = public.resolve_sale_status_from_balance(v_next_remaining, v_sale.due_date)
    where id = v_sale.id;

    v_allocations := v_allocations || jsonb_build_object(
      'sale_id', v_sale.id,
      'amount_cents', v_allocated_amount
    );

    v_total_allocated := v_total_allocated + v_allocated_amount;
    v_remaining_payment := v_remaining_payment - v_allocated_amount;
  end loop;

  v_unallocated_amount := greatest(v_remaining_payment, 0);

  insert into public.audit_logs (
    actor_profile_id,
    action,
    entity_type,
    entity_id,
    payload_json
  )
  values (
    v_actor_profile_id,
    'payment_created',
    'payment',
    v_payment_id::text,
    jsonb_build_object(
      'customer_id', p_customer_id,
      'amount_cents', p_amount_cents,
      'target_sale_id', p_target_sale_id,
      'allocated_amount_cents', v_total_allocated,
      'unallocated_amount_cents', v_unallocated_amount,
      'allocations', v_allocations
    )
  );

  return jsonb_build_object(
    'payment_id', v_payment_id,
    'customer_id', p_customer_id,
    'amount_cents', p_amount_cents,
    'target_sale_id', p_target_sale_id,
    'allocated_amount_cents', v_total_allocated,
    'unallocated_amount_cents', v_unallocated_amount,
    'allocations', v_allocations
  );
end;
$$;

grant execute on function public.register_payment(uuid, integer, timestamptz, public.payment_method, text, uuid) to authenticated;
