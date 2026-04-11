# Plano de Implementacao

## Objetivo

Levar o sistema ate producao com seguranca, mantendo a arquitetura limpa e
reduzindo risco de erro operacional, financeiro e de integracao.

## Premissa atual

- este sistema esta sendo construido para um unico usuario
- nao ha necessidade de escala neste momento
- para evitar custo agora, o banco padrao da fase atual sera `SQLite`
- a migracao para `PostgreSQL` fica adiada para quando houver necessidade real
  de hospedagem online, multiusuario ou maior robustez operacional

## Como usar este plano

- tarefas marcadas com `[x]` ja foram implementadas na base atual
- tarefas com `[ ]` ainda precisam ser executadas
- este arquivo deve ser atualizado conforme o projeto avancar

## Fase 1: Fundacao tecnica e arquitetura

- [x] Separar a nova base em `frontend`, `backend`, `prisma` e `docs`
- [x] Manter o prototipo antigo isolado como referencia visual
- [x] Estruturar o backend em `domain`, `application`, `infra` e `interfaces`
- [x] Estruturar o frontend em `pages`, `features` e `shared`
- [x] Documentar a arquitetura limpa em `docs/arquitetura-limpa.md`
- [x] Configurar backend com Fastify
- [x] Configurar frontend com React + Vite
- [x] Configurar Prisma como camada de persistencia
- [x] Configurar schema inicial do banco
- [x] Criar seeds de desenvolvimento

## Fase 2: Operacao principal

### Clientes

- [x] Listar clientes pela API
- [x] Criar cliente
- [x] Atualizar cliente
- [x] Normalizar telefone para formato de integracao
- [x] Calcular saldo aberto do cliente a partir das vendas
- [x] Exibir listagem de clientes no frontend
- [x] Exibir ficha detalhada do cliente

### Vendas

- [x] Criar modulo de vendas na arquitetura limpa
- [x] Implementar calculo de valor final da venda
- [x] Suportar acrescimo por valor ou percentual
- [x] Definir status inicial da venda
- [x] Expor `GET /api/sales`
- [x] Expor `POST /api/sales`
- [x] Exibir ultimas vendas no frontend

### Pagamentos

- [x] Criar modulo de pagamentos na arquitetura limpa
- [x] Implementar rateio automatico por debitos mais antigos
- [x] Persistir `payment_allocations`
- [x] Atualizar saldo remanescente da venda apos pagamento
- [x] Atualizar status da venda apos pagamento
- [x] Expor `GET /api/payments`
- [x] Expor `POST /api/payments`
- [x] Exibir ultimos pagamentos no frontend

### Extrato

- [x] Consolidar vendas e pagamentos por cliente
- [x] Expor detalhe do cliente com extrato real
- [x] Exibir extrato inicial no frontend
- [ ] Melhorar visual e navegacao da ficha do cliente para uso operacional

## Fase 3: Cobranca e WhatsApp

### Historico e fila

- [x] Criar modulo de cobrancas na arquitetura limpa
- [x] Persistir historico de mensagens WhatsApp
- [x] Listar cobrancas vencendo em 3 dias
- [x] Listar cobrancas vencendo hoje
- [x] Listar cobrancas em atraso
- [x] Exibir overview operacional de cobrancas no frontend
- [x] Exibir historico de mensagens no frontend

### Envio manual

- [x] Implementar envio manual de cobranca com provider mock
- [x] Registrar auditoria do envio manual
- [x] Permitir preview da mensagem antes do envio
- [x] Permitir edicao manual da mensagem no frontend
- [x] Permitir reenvio manual de falhas

### Envio automatico

- [x] Criar caso de uso de job diario de cobranca
- [x] Disparar mensagens automaticas de 3 dias antes do vencimento
- [x] Disparar mensagens automaticas no dia do vencimento
- [x] Evitar reenvio automatico duplicado por `saleId + triggerType`
- [x] Expor endpoint manual para rodar o job diario
- [x] Exibir resultado do job no frontend
- [x] Ligar scheduler real para execucao diaria automatica
- [x] Implementar politica de retry para falhas de envio

### Integracao real

- [ ] Substituir provider mock por provider real de WhatsApp
- [ ] Definir provedor inicial de producao
- [ ] Persistir `providerMessageId` real
- [ ] Tratar falhas reais da API externa
- [ ] Validar templates e conteudo de mensagens reais

## Fase 4: Autenticacao, autorizacao e auditoria

- [x] Criar modulo de autenticacao
- [x] Implementar login com `login + senha`
- [x] Implementar token assinado
- [x] Implementar `GET /api/auth/me`
- [x] Proteger rotas de negocio com autenticacao
- [x] Persistir auditoria real em banco
- [x] Registrar auditoria nas operacoes principais
- [x] Exibir sessao autenticada no frontend
- [x] Implementar logout explicito no frontend
- [x] Definir expiracao de token
- [x] Implementar autorizacao por perfil
- [x] Restringir execucao do job diario a perfis permitidos
- [ ] Remover credenciais fracas de desenvolvimento fora de ambiente local

## Fase 5: Qualidade e testes

- [x] Adicionar framework de testes automatizados
- [x] Testar calculo de venda e acrescimo
- [x] Testar rateio automatico de pagamentos
- [x] Testar atualizacao de saldo do cliente
- [x] Testar deduplicacao de cobrancas automaticas
- [x] Testar autenticacao e protecao de rotas
- [x] Testar auditoria persistida
- [x] Testar job diario de cobranca

## Fase 6: Banco e dados de producao

- [ ] Reavaliar necessidade de migrar de `sqlite` para PostgreSQL
- [ ] Revisar tipos e constraints para producao
- [ ] Revisar indices do banco
- [ ] Criar fluxo seguro de migracoes
- [ ] Validar timezone e datas de vencimento
- [ ] Revisar seed para separar dados de desenvolvimento de producao

## Fase 7: Observabilidade e operacao

- [x] Melhorar logs estruturados do backend
- [x] Registrar falhas de integracao com contexto suficiente
- [x] Configurar monitoramento do backend
- [x] Configurar monitoramento do job diario
- [ ] Criar alertas para falhas de cobranca
- [x] Configurar backup do banco
- [x] Testar restauracao de backup

## Fase 8: Frontend operacional

- [x] Criar formulario real de nova venda
- [x] Criar formulario real de novo pagamento
- [x] Criar fluxo real de envio manual de cobranca
- [x] Melhorar dashboard com dados reais do banco
- [x] Refinar UX para uso rapido no caixa
- [x] Revisar responsividade mobile
- [x] Revisar feedbacks de loading, erro e sucesso

## Fase 9: Deploy e producao

- [ ] Criar ambiente de staging
- [ ] Configurar deploy do backend
- [ ] Configurar deploy do frontend
- [ ] Configurar variaveis de ambiente de producao
- [ ] Validar execucao de migracoes em staging
- [ ] Validar integracao WhatsApp em staging
- [ ] Executar piloto com uso real controlado
- [ ] Ajustar com base no piloto
- [ ] Publicar producao

## Checklist de liberacao para producao

- [ ] Testes criticos passando
- [ ] PostgreSQL configurado
- [ ] Migracoes revisadas
- [ ] Rotas protegidas por autenticacao
- [ ] Auditoria persistida ativa
- [ ] Provider real de WhatsApp validado
- [x] Scheduler real ativo
- [ ] Logs e monitoramento funcionando
- [ ] Backup validado
- [ ] Staging aprovado
- [ ] Piloto executado com sucesso
