create or replace function public.build_manual_charge_message(
  p_customer_name text,
  p_open_balance_cents integer,
  p_due_date timestamptz default null
)
returns text
language plpgsql
stable
as $$
declare
  v_balance numeric;
  v_due_text text := '';
begin
  v_balance := p_open_balance_cents::numeric / 100.0;

  if p_due_date is not null then
    v_due_text := ' com vencimento em ' || to_char(timezone('America/Sao_Paulo', p_due_date), 'DD/MM/YYYY');
  end if;

  return 'Ola ' || p_customer_name ||
    ', seu saldo em aberto no Mercadinho do Tonhao e de R$ ' ||
    to_char(v_balance, 'FM999999990.00') ||
    v_due_text ||
    '. Responda esta mensagem para combinar o pagamento.';
end;
$$;

create or replace function public.run_daily_charge_job()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_profile_id uuid;
  v_actor_role public.app_role;
  v_reference_date timestamptz := timezone('utc', now());
  v_today_start timestamptz := date_trunc('day', timezone('America/Sao_Paulo', now())) at time zone 'America/Sao_Paulo';
  v_today_end timestamptz := (date_trunc('day', timezone('America/Sao_Paulo', now())) + interval '1 day' - interval '1 millisecond') at time zone 'America/Sao_Paulo';
  v_due_soon_start timestamptz := (date_trunc('day', timezone('America/Sao_Paulo', now())) + interval '3 day') at time zone 'America/Sao_Paulo';
  v_due_soon_end timestamptz := (date_trunc('day', timezone('America/Sao_Paulo', now())) + interval '4 day' - interval '1 millisecond') at time zone 'America/Sao_Paulo';
  v_auto_3_days_sent integer := 0;
  v_auto_due_date_sent integer := 0;
  v_skipped_duplicates integer := 0;
  v_failed_messages integer := 0;
  v_sale record;
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
    raise exception 'Apenas OWNER pode executar o job diario.';
  end if;

  for v_sale in
    select s.id, s.customer_id, s.due_date, s.remaining_amount_cents, c.name as customer_name
    from public.sales s
    join public.customers c on c.id = s.customer_id
    where s.status in ('OPEN', 'PARTIAL', 'OVERDUE')
      and s.remaining_amount_cents > 0
      and s.due_date between v_due_soon_start and v_due_soon_end
    order by s.due_date asc
  loop
    if exists (
      select 1
      from public.whatsapp_messages m
      where m.sale_id = v_sale.id
        and m.trigger_type = 'AUTO_3_DAYS'
        and m.send_status in ('PENDING', 'SENT')
    ) then
      v_skipped_duplicates := v_skipped_duplicates + 1;
    else
      insert into public.whatsapp_messages (
        customer_id,
        sale_id,
        trigger_type,
        message_body,
        send_status,
        provider_name,
        provider_response,
        scheduled_for
      )
      values (
        v_sale.customer_id,
        v_sale.id,
        'AUTO_3_DAYS',
        public.build_manual_charge_message(v_sale.customer_name, v_sale.remaining_amount_cents, v_sale.due_date),
        'PENDING',
        'wa_link',
        'Lembrete gerado automaticamente para envio manual.',
        v_reference_date
      );

      v_auto_3_days_sent := v_auto_3_days_sent + 1;
    end if;
  end loop;

  for v_sale in
    select s.id, s.customer_id, s.due_date, s.remaining_amount_cents, c.name as customer_name
    from public.sales s
    join public.customers c on c.id = s.customer_id
    where s.status in ('OPEN', 'PARTIAL', 'OVERDUE')
      and s.remaining_amount_cents > 0
      and s.due_date between v_today_start and v_today_end
    order by s.due_date asc
  loop
    if exists (
      select 1
      from public.whatsapp_messages m
      where m.sale_id = v_sale.id
        and m.trigger_type = 'AUTO_DUE_DATE'
        and m.send_status in ('PENDING', 'SENT')
    ) then
      v_skipped_duplicates := v_skipped_duplicates + 1;
    else
      insert into public.whatsapp_messages (
        customer_id,
        sale_id,
        trigger_type,
        message_body,
        send_status,
        provider_name,
        provider_response,
        scheduled_for
      )
      values (
        v_sale.customer_id,
        v_sale.id,
        'AUTO_DUE_DATE',
        public.build_manual_charge_message(v_sale.customer_name, v_sale.remaining_amount_cents, v_sale.due_date),
        'PENDING',
        'wa_link',
        'Lembrete gerado automaticamente para envio manual.',
        v_reference_date
      );

      v_auto_due_date_sent := v_auto_due_date_sent + 1;
    end if;
  end loop;

  insert into public.audit_logs (
    actor_profile_id,
    action,
    entity_type,
    entity_id,
    payload_json
  )
  values (
    v_actor_profile_id,
    'daily_charge_job_ran',
    'job',
    'daily-charge-job',
    jsonb_build_object(
      'processedAt', v_reference_date,
      'auto3DaysSent', v_auto_3_days_sent,
      'autoDueDateSent', v_auto_due_date_sent,
      'skippedDuplicates', v_skipped_duplicates,
      'failedMessages', v_failed_messages
    )
  );

  return jsonb_build_object(
    'processedAt', v_reference_date,
    'auto3DaysSent', v_auto_3_days_sent,
    'autoDueDateSent', v_auto_due_date_sent,
    'skippedDuplicates', v_skipped_duplicates,
    'failedMessages', v_failed_messages
  );
end;
$$;

grant execute on function public.run_daily_charge_job() to authenticated;
