# Estado atual do preview

## Resumo

O primeiro preview web na Vercel foi criado e validado com Supabase.

Stack ativa no preview:

- frontend React/Vite na Vercel
- Supabase Auth
- Supabase Postgres
- RLS para `OWNER` e `STAFF`
- cobranca manual por link do WhatsApp

## Validado

- login com `OWNER`
- login com `STAFF`
- listagem e cadastro de clientes
- criacao de vendas
- pagamento pelo `OWNER`
- escolha manual de qual titulo quitar primeiro
- ocultacao de financeiro/cobranca para `STAFF`
- preparo de mensagem de cobranca
- botao explicito `Abrir no WhatsApp`
- fila de cobranca
- marcacao de mensagem como enviada
- nao duplicidade ao rodar o job novamente
- teste no celular do dono

## Pendencias antes da producao

- decidir se o preview atual vira ambiente definitivo
- aplicar ajustes finos de UI/visual final
- definir rotina minima de manutencao do Supabase/Vercel

## Proximo passo

Refinar a UI final usando o prototipo original como referencia visual e o
feedback do piloto real.

Referencia:

- `docs/piloto-operacional.md`
- `docs/roteiro-feedback-cliente.md`
