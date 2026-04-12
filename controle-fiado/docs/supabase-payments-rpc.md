# Pagamentos no Supabase

## Objetivo

Definir como o modulo de pagamentos deve funcionar no Supabase sem mover a regra
financeira critica para o frontend.

Arquivo base:

- `supabase/migrations/0002_register_payment_rpc.sql`

## Problema

No backend atual, o pagamento faz mais do que inserir uma linha:

- busca debitos em aberto do cliente
- ordena por debitos mais antigos
- faz rateio automatico
- grava `payment_allocations`
- atualiza `remaining_amount_cents`
- atualiza `status` da venda
- registra auditoria

Se isso for migrado de forma ingenua para o frontend, o risco e alto.

## Decisao

O pagamento deve ser registrado por uma RPC no Supabase:

- `public.register_payment(...)`

Assim:

- a transacao fica no banco
- o rateio fica centralizado
- a UI apenas chama a operacao

## Regra preservada

A RPC segue a mesma logica da base atual:

- debitos mais antigos primeiro
- alocacao ate acabar o valor pago
- venda quitada vira `PAID`
- venda parcialmente abatida vira `PARTIAL`
- se ainda houver saldo e o vencimento ja passou, vira `OVERDUE`
- auditoria e criada ao final

## Assinatura da RPC

Entradas:

- `p_customer_id`
- `p_amount_cents`
- `p_payment_date`
- `p_method`
- `p_notes`

Saida:

- `payment_id`
- `customer_id`
- `amount_cents`
- `allocated_amount_cents`
- `unallocated_amount_cents`
- `allocations`

## Regra de permissao

Na primeira fase, a RPC exige:

- usuario autenticado
- `profile` existente
- papel `OWNER`

Motivo:

- reduz risco no inicio
- evita liberar operacao sensivel antes da migracao estar madura

## Papel da STAFF

Neste momento da migracao:

- `STAFF` ainda nao registra pagamentos direto no modo Supabase

Opcoes futuras:

1. manter pagamento apenas com `OWNER`
2. liberar `STAFF` depois, quando a operacao estiver bem validada

## Fluxo esperado no frontend

1. `OWNER` preenche pagamento
2. frontend chama `rpc('register_payment', ...)`
3. Supabase executa a transacao
4. frontend atualiza ficha, pagamentos e saldo

## O que a RPC nao faz

Ela nao:

- envia WhatsApp
- resolve dashboard
- reabre venda cancelada

Ela faz apenas o nucleo financeiro do pagamento.

## Validacoes minimas recomendadas

Antes de ligar isso na UI:

- pagamento parcial em um unico debito
- pagamento cobrindo varios debitos
- pagamento maior que o saldo aberto
- cliente sem debitos em aberto
- debito vencido permanecendo `OVERDUE` quando parcial
- debito quitado mudando para `PAID`

## Proximo passo

Depois de criar essa RPC no Supabase, a ordem recomendada e:

1. adicionar camada `supabase-payments.ts` no frontend
2. ligar `fetchPayments` em modo dual
3. ligar `createPayment` na RPC
4. testar com usuario `OWNER`
