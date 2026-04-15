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

- revisar dados reais iniciais do cliente
- confirmar telefones em formato valido
- testar no dispositivo da operadora com dados reais
- coletar feedback operacional
- decidir se o preview atual vira ambiente definitivo

## Proximo passo

Executar o piloto com dados reais do cliente usando o roteiro em:

- `docs/piloto-operacional.md`
