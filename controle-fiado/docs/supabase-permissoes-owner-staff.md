# Permissoes OWNER e STAFF no Supabase

## Objetivo

Amarrar no banco o mesmo recorte que a UI ja aplica:

- `OWNER` com acesso total
- `STAFF` limitada a clientes e vendas

Arquivo principal:

- `supabase/migrations/0004_restrict_sensitive_reads.sql`

## Decisao

Leituras sensiveis deixam de ser abertas para qualquer autenticado:

- `payments`
- `payment_allocations`
- `whatsapp_messages`

A partir desta migration, somente `OWNER` pode consultar esses dados.

## O que continua liberado para STAFF

- `customers`
- `sales`

Isso permite:

- cadastrar clientes
- consultar ficha basica
- registrar vendas

## O que fica com OWNER

- pagamentos
- rateio de pagamentos
- mensagens de cobranca
- job diario de cobranca
- auditoria

## Motivo

Esconder na UI nao basta. Como o app agora roda web com Supabase, o recorte de
papel precisa existir tambem no banco.

## Proximo passo operacional

Depois de aplicar `0004_restrict_sensitive_reads.sql` no Supabase:

1. testar login com `STAFF`
2. confirmar que clientes e vendas continuam funcionando
3. confirmar que pagamentos e cobrancas nao aparecem nem ficam consultaveis
4. testar login com `OWNER`
5. confirmar acesso total
