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

## Pendencias antes do piloto

- testar job diario de cobranca no preview
- revisar dados reais iniciais do cliente
- confirmar telefones em formato valido
- testar no celular do dono
- testar no dispositivo da operadora

## Proximo passo

Executar o piloto controlado com o cliente real usando o roteiro em:

- `docs/piloto-operacional.md`
