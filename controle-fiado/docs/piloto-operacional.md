# Piloto Operacional

## Objetivo

Validar o sistema em uso real controlado antes da liberacao definitiva para o
cliente.

Este piloto considera o estado atual do projeto:

- app web hospedado na Vercel
- Supabase Auth
- Supabase Postgres
- perfis `OWNER` e `STAFF`
- cobranca manual por botao `Abrir no WhatsApp`
- baixo volume operacional

## Escopo do piloto

O piloto deve ser pequeno e controlado.

Recomendacao inicial:

- 1 dono usando o perfil `OWNER`
- 1 operadora usando o perfil `STAFF`
- 5 a 15 clientes reais
- poucos dias de operacao acompanhada
- sem migracao em massa de dados antigos nesta primeira etapa

## Antes de iniciar

Confirmar:

- preview da Vercel acessivel no celular e no computador
- `OWNER` consegue fazer login
- `STAFF` consegue fazer login
- migrations `0001`, `0002`, `0003`, `0004` aplicadas no Supabase
- migration `0005` aplicada se o pagamento direcionado estiver ativo
- perfis corretos em `profiles`
- o dono sabe que o WhatsApp e manual
- os telefones dos clientes estao em formato valido

## Preparacao de usuarios

### OWNER

Responsavel por:

- consultar visao geral
- registrar pagamentos
- preparar cobrancas
- abrir WhatsApp
- marcar mensagens como enviadas
- acompanhar pendencias

### STAFF

Responsavel por:

- cadastrar clientes
- registrar vendas
- consultar ficha basica de clientes

Restricoes esperadas:

- nao registra pagamentos
- nao acessa cobrancas
- nao visualiza historico financeiro sensivel

## Cadastro inicial

Antes do primeiro dia real:

- cadastrar o dono como `OWNER`
- cadastrar a operadora como `STAFF`
- cadastrar 5 a 15 clientes reais
- conferir telefone de cada cliente
- criar pelo menos uma venda de teste com vencimento futuro
- criar pelo menos uma venda de teste vencendo hoje ou em 3 dias

## Roteiro de validacao

### Fluxo 1: acesso remoto

- abrir o preview da Vercel no computador
- abrir o preview da Vercel no celular
- fazer login com `OWNER`
- fazer login com `STAFF`
- confirmar que a sessao funciona nos dois dispositivos

### Fluxo 2: permissao da STAFF

- entrar como `STAFF`
- cadastrar cliente
- registrar venda
- confirmar que pagamentos nao aparecem como acao operacional
- confirmar que cobrancas nao aparecem

### Fluxo 3: operacao do OWNER

- entrar como `OWNER`
- consultar cliente criado pela `STAFF`
- registrar pagamento parcial
- escolher manualmente qual titulo quitar primeiro
- confirmar saldo atualizado
- confirmar alocacao na ficha do cliente

### Fluxo 4: venda

- registrar venda com vencimento futuro
- confirmar valor final
- confirmar acrescimo, se houver
- confirmar que o vencimento aparece no dia correto
- confirmar que a venda aparece na ficha do cliente

### Fluxo 5: pagamento

- registrar pagamento parcial
- confirmar reducao do saldo
- testar pagamento direcionado para um titulo especifico
- confirmar venda `PARTIAL` ou `PAID`
- confirmar dashboard do `OWNER`

### Fluxo 6: cobranca manual

- selecionar cliente com saldo aberto
- revisar preview da mensagem
- editar mensagem, se necessario
- clicar em `Preparar cobranca`
- clicar em `Abrir no WhatsApp`
- confirmar que o texto abre corretamente
- enviar manualmente pelo WhatsApp

### Fluxo 7: fila de cobranca

- criar venda vencendo em 3 dias
- criar venda vencendo hoje
- executar o job manual pelo `OWNER`
- confirmar mensagens `PENDING`
- abrir mensagem pelo historico
- marcar como enviada
- confirmar que nao cria duplicidade ao rodar novamente

### Fluxo 8: celular do dono

- abrir o preview no celular do dono
- fazer login
- consultar clientes
- abrir cobranca no WhatsApp
- confirmar que o WhatsApp abre no app ou navegador

## Indicadores minimos de aceite

O piloto pode ser considerado estavel quando:

- `OWNER` e `STAFF` conseguem operar sem erro critico
- vendas e pagamentos alteram saldo corretamente
- vencimentos aparecem no dia correto
- cobranca manual abre WhatsApp corretamente
- permissoes impedem a `STAFF` de acessar areas sensiveis
- o dono entende o fluxo manual de envio
- nao houve duplicidade indevida de cobranca

## Sinais de bloqueio

Nao avance para producao se ocorrer:

- saldo errado
- pagamento abatendo titulo errado sem o usuario entender
- `STAFF` acessando pagamento ou cobranca
- vencimento aparecendo em dia errado
- WhatsApp nao abrindo no celular do dono
- erro recorrente de login
- perda ou duplicidade de dados

## Go/No-Go

### Go

Seguir para uso real quando:

- checklist principal for validado
- dono aprovar o fluxo
- operadora conseguir registrar clientes e vendas sem suporte constante

### No-Go

Segurar a liberacao se:

- houver erro financeiro
- houver erro de permissao
- houver falha recorrente na cobranca
- o dono nao confiar no fluxo operacional

## Proximos passos depois do piloto

Se o piloto passar:

- refinar UI final usando o prototipo original como referencia visual
- ajustar textos e labels conforme feedback real
- definir rotina de manutencao do Supabase/Vercel
- decidir se o preview vira ambiente de producao

Se o piloto falhar:

- registrar o problema
- reproduzir em dados de teste
- corrigir
- repetir piloto curto antes de liberar
