# V1 do Sistema de Controle de Fiado

## Objetivo

Transformar o prototipo atual em um sistema operacional real para o Mercadinho do Tonhao, com cadastro de clientes, lancamento de vendas fiado, registro de pagamentos, acompanhamento de vencimentos e cobranca por WhatsApp.

## Escopo do V1

O V1 deve permitir:

- cadastrar, editar e desativar clientes
- registrar venda fiado com valor, descricao, data e vencimento
- registrar pagamento total ou parcial
- calcular saldo atual por cliente
- listar contas em aberto, vencendo e vencidas
- exibir extrato do cliente com compras e pagamentos
- enviar mensagens de cobranca por WhatsApp automaticamente
- permitir envio manual de mensagem de cobranca pelo dono a qualquer momento

## Fora do escopo inicial

- multiempresa
- integracao contabil
- app mobile nativo
- automacao financeira bancaria
- bot conversacional no WhatsApp

## Regras de negocio

### Cliente

- cliente deve ter nome e telefone
- endereco, observacoes e limite de credito sao opcionais
- telefone deve ser armazenado em formato padronizado para integracao com WhatsApp
- cliente pode ser desativado sem perder historico

### Venda fiado

- cada venda gera um debito vinculado a um cliente
- a venda deve guardar:
  - descricao
  - valor original
  - percentual ou valor de acrescimo, quando aplicavel
  - valor final
  - data da venda
  - data de vencimento
  - status
- status da venda:
  - `aberta`
  - `parcial`
  - `paga`
  - `vencida`
- a regra de vencimento deve considerar a data real do debito
- o acrescimo por prazo deve ser configuravel pelo sistema, nao fixo no front

### Pagamento

- pagamento pode ser parcial ou total
- um pagamento deve registrar:
  - cliente
  - valor pago
  - data do pagamento
  - forma de pagamento
  - observacao
- pagamento deve abater automaticamente os debitos mais antigos em aberto
- sistema deve manter historico de rateio do pagamento por debito
- saldo do cliente deve ser derivado dos debitos menos pagamentos, nunca digitado manualmente

### Limite de credito

- limite de credito deve ser inicialmente informativo
- sistema deve avisar quando nova venda ultrapassar o limite
- o bloqueio automatico pode ficar para fase posterior

## Requisitos de WhatsApp

## Objetivo operacional

O sistema deve reduzir esquecimento de cobranca e dar ao dono controle manual quando quiser cobrar um cliente.

### Tipos de envio

- automatico 3 dias antes do vencimento
- automatico no dia do vencimento
- manual, disparado pelo dono a qualquer momento

### Regras de disparo automatico

- o sistema deve verificar diariamente os debitos em aberto
- deve enviar mensagem 3 dias antes do vencimento apenas para debitos ainda nao pagos
- deve enviar mensagem no dia do vencimento apenas para debitos ainda nao pagos
- nao deve reenviar a mesma campanha automatica para o mesmo debito se ela ja tiver sido enviada com sucesso
- se o envio falhar, deve registrar a falha e permitir reenvio manual

### Envio manual

- dono deve conseguir enviar cobranca manual pela tela do cliente
- dono deve conseguir enviar cobranca manual pela lista de vencidos
- antes do envio, deve existir preview da mensagem
- usuario deve poder editar a mensagem antes de enviar

### Historico de mensagens

- cada mensagem enviada deve registrar:
  - cliente
  - debito relacionado, quando houver
  - tipo do envio: `automatico_3_dias`, `automatico_vencimento`, `manual`
  - conteudo enviado
  - data e hora
  - status do envio
  - retorno da integracao

### Status da mensagem

- `pendente`
- `enviada`
- `falhou`
- `cancelada`

### Conteudo minimo da mensagem

- nome do cliente
- nome do mercadinho
- valor em aberto
- data de vencimento
- instrucoes curtas para pagamento ou contato

## Integracao com WhatsApp

### Direcao recomendada

Usar API oficial do WhatsApp Business, com provedor como:

- Meta Cloud API
- Z-API
- Evolution API
- Twilio WhatsApp

### Recomendacao inicial

Para V1, a melhor abordagem e desacoplar o sistema da transportadora de mensagens:

- criar uma camada `whatsapp_provider`
- registrar cada tentativa de envio em banco
- permitir trocar o provedor depois sem reescrever regra de negocio

## Requisitos de seguranca e auditoria

- sistema deve exigir autenticacao
- usuario autenticado deve registrar nome ou identificador nas operacoes criticas
- vendas, pagamentos e envios manuais devem gerar auditoria
- exclusoes fisicas de dados financeiros devem ser evitadas

## Requisitos de interface

- dashboard deve usar dados reais do banco
- tela de clientes deve permitir busca por nome e telefone
- ficha do cliente deve exibir:
  - saldo atual
  - limite
  - historico de compras e pagamentos
  - proximos vencimentos
  - historico de mensagens
  - botao de enviar cobranca
- tela de cobrancas deve permitir:
  - filtrar por vencendo em 3 dias
  - filtrar por vencidos hoje
  - ver falhas de envio
  - reenviar mensagem

## Criticos para producao

- persistencia real em banco
- timezone configurado corretamente
- rotina agendada diaria para cobrancas automaticas
- log de erro de integracao
- backup do banco

