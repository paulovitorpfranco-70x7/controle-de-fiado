# Piloto Operacional

## Objetivo

Validar o sistema em uso real controlado antes de qualquer liberacao mais ampla.

Este piloto considera o contexto atual do projeto:

- unico usuario
- execucao local
- banco `SQLite`
- cobranca por WhatsApp no modo manual via `wa.me`

## Quando iniciar o piloto

Inicie o piloto somente quando estes itens estiverem verdadeiros:

- backend sobe sem erro
- frontend sobe sem erro
- login funciona
- backup do banco foi executado com sucesso
- seed local nao sera mais usado como fonte de dados reais
- usuario do piloto ja recebeu credencial propria

## Preparacao do ambiente

### Maquina do piloto

- definir a maquina principal onde o sistema vai rodar
- garantir que essa maquina tenha backup dos arquivos do projeto
- garantir que o WhatsApp Web ou WhatsApp Business esteja acessivel nela
- garantir horario e timezone corretos do Windows

### Banco

- criar backup antes do primeiro uso real
- registrar onde os backups serao guardados
- definir frequencia minima de backup:
  - antes de qualquer mudanca estrutural
  - ao final de cada dia de uso na primeira semana

### Configuracao

- revisar `backend/.env`
- conferir `AUTH_SECRET`
- conferir `AUTH_TTL_SECONDS`
- conferir `ENABLE_DAILY_CHARGE_SCHEDULER`
- conferir `DAILY_CHARGE_SCHEDULE_TIME`
- confirmar `WHATSAPP_PROVIDER="wa_link"`

## Cadastro inicial

Antes do primeiro dia real:

- criar usuario definitivo do dono
- remover dependencia do usuario de seed
- cadastrar 3 a 10 clientes reais
- cadastrar pelo menos 2 clientes com telefone valido para WhatsApp
- registrar pelo menos 3 vendas reais de teste
- registrar pelo menos 1 pagamento parcial

## Roteiro de validacao

### Fluxo 1: autenticacao

- fazer login
- recarregar a pagina
- confirmar que a sessao continua valida
- fazer logout
- confirmar que rotas protegidas nao respondem sem login

### Fluxo 2: cliente

- criar cliente
- editar telefone
- editar observacao
- confirmar que a ficha detalhada abre sem erro

### Fluxo 3: venda

- registrar venda com vencimento futuro
- confirmar valor final e saldo
- confirmar que a venda aparece no extrato
- confirmar que vencimento nao caiu no dia errado

### Fluxo 4: pagamento

- registrar pagamento parcial
- confirmar reducao do saldo
- confirmar rateio no debito mais antigo
- registrar pagamento total
- confirmar mudanca de status da venda

### Fluxo 5: cobranca manual

- abrir cliente com saldo aberto
- gerar mensagem de cobranca
- editar a mensagem
- clicar em abrir no WhatsApp
- confirmar que o texto abriu corretamente
- marcar envio como concluido
- confirmar historico da mensagem

### Fluxo 6: fila de cobranca

- validar lista vencendo em 3 dias
- validar lista vencendo hoje
- validar lista em atraso
- abrir cliente a partir da fila
- confirmar coerencia entre fila e ficha do cliente

### Fluxo 7: scheduler diario

- deixar `ENABLE_DAILY_CHARGE_SCHEDULER=true`
- validar proxima execucao no painel do sistema
- rodar o endpoint manual do job pelo frontend
- confirmar que nao houve duplicidade
- confirmar criacao de lembretes `PENDING` quando aplicavel

### Fluxo 8: backup e restore

- rodar `npm run db:backup`
- conferir arquivo gerado em `backups/sqlite/`
- executar restore para arquivo temporario
- confirmar que o restore termina sem erro

## Indicadores minimos de aceite

O piloto pode ser considerado estavel quando, por pelo menos 5 dias de uso:

- nenhum dado financeiro foi perdido
- nenhum vencimento apareceu em data errada
- nenhuma cobranca duplicada foi criada pelo job
- o fluxo manual de WhatsApp foi usado sem erro operacional grave
- backup foi executado e conferido
- usuario conseguiu operar sem depender de ajuste tecnico diario

## Sinais de bloqueio

Nao avance para liberacao mais ampla se ocorrer qualquer um destes:

- venda ou pagamento altera saldo de forma errada
- vencimento aparece no dia anterior ou posterior ao esperado
- historico de mensagens fica inconsistente
- job diario cria duplicidade
- o usuario nao consegue operar sem suporte tecnico constante
- backup falha ou restore falha

## Go/No-Go

### Go

Liberar continuidade de uso quando:

- checklist funcional foi concluido
- aceite minimo foi atingido
- dono confirma confianca operacional

### No-Go

Segurar expansao e corrigir antes se:

- houver erro financeiro
- houver erro de data
- houver perda de historico
- houver falha recorrente no fluxo de cobranca

## Proximos passos depois do piloto

Se o piloto passar:

- revisar ajustes finos de UX
- definir rotina fixa de backup
- preparar empacotamento/deploy leve
- decidir se o app continua local ou vai para hospedagem

Se o piloto falhar:

- registrar o problema
- reproduzir com dados de teste
- corrigir
- repetir piloto curto antes de retomar uso real
