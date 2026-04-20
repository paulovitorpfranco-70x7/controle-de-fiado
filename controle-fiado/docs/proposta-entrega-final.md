# Proposta de Entrega Final

## Objetivo

Este documento organiza a entrega do sistema em linguagem simples para alinhamento
com o cliente.

Ele separa:

- o que ja esta entregue
- o que entra em manutencao
- o que fica como evolucao futura

## 1. Escopo entregue

O sistema entregue contempla:

- login com perfis `OWNER` e `STAFF`
- painel inicial com visao operacional
- cadastro e consulta de clientes
- ficha resumida do cliente
- registro de vendas
- registro de pagamentos pelo `OWNER`
- pagamento parcial
- pagamento direcionado para titulo especifico
- fila de cobranca
- cobranca manual com abertura direta no WhatsApp
- uso no computador e no celular
- instalacao como app web no celular via PWA

## 2. Forma de operacao atual

O sistema opera hoje com:

- frontend hospedado na Vercel
- autenticacao no Supabase
- banco no Supabase
- cobranca por WhatsApp em fluxo manual

Fluxo de cobranca atual:

1. o sistema identifica cliente com vencimento ou atraso
2. o operador abre a mensagem
3. o sistema monta o texto
4. o envio final e feito manualmente no WhatsApp

## 3. O que esta incluido na entrega

Esta entrega inclui:

- sistema funcionando no ambiente atual
- configuracao dos perfis principais
- documentacao basica de uso
- documentacao basica administrativa
- checklist de go-live

Documentos de apoio:

- `docs/go-live-checklist.md`
- `docs/manual-usuario-final.md`
- `docs/manual-administrador.md`

## 4. O que entra em manutencao

A manutencao cobre o funcionamento do sistema ja entregue.

Exemplos:

- correcao de erro
- ajuste de deploy
- validacao de acesso
- apoio em incidente operacional
- pequenas correcoes sem mudar regra de negocio

Nao entra como manutencao padrao:

- novas telas
- novas regras de negocio
- relatorios novos
- automacoes novas
- integracoes novas
- mudancas grandes de fluxo

Esses itens devem ser tratados como evolucao.

## 5. O que fica como evolucao futura

Itens que podem virar fase 2:

- tela para criar e gerenciar usuarios
- convite de novos usuarios pelo sistema
- historico financeiro mais completo
- relatorios gerenciais
- importacao de base antiga
- automacao real de WhatsApp
- notificacoes automáticas
- dashboard mais analitico
- exportacao de dados
- auditoria administrativa mais detalhada

## 6. Limites da versao atual

Para evitar expectativa errada, a versao atual deve ser entendida assim:

- foco em operacao simples da loja
- baixo volume operacional
- uso por poucos usuarios
- cobranca com confirmacao humana

Nao e objetivo desta fase:

- ERP completo
- automacao pesada
- operacao multiunidade
- onboarding administrativo sofisticado

## 7. Responsabilidades do cliente

Para usar o sistema em operacao, o cliente precisa:

- manter os acessos dos usuarios organizados
- informar quando alguem deve ser bloqueado
- usar corretamente os perfis `OWNER` e `STAFF`
- validar telefone dos clientes
- informar incidentes com contexto minimo

## 8. Responsabilidades do responsavel tecnico

O responsavel tecnico fica com:

- deploy
- manutencao corretiva
- suporte tecnico
- acompanhamento de incidentes
- evolucoes futuras contratadas a parte

## 9. Recomendacao de modelo comercial

Modelo simples recomendado:

- valor de implantacao / entrega inicial
- valor mensal de manutencao
- melhorias e novas funcoes cobradas a parte

## 10. Declaracao final

O sistema pode ser considerado entregue quando:

- ambiente oficial estiver definido
- cliente tiver acesso funcionando
- perfis principais estiverem criados
- documentacao basica tiver sido repassada
- checklist de go-live tiver sido validado

## Resumo executivo

O que o cliente recebe agora:

- um sistema operacional de controle de fiado
- com clientes, vendas, pagamentos e cobranca manual
- pronto para uso real assistido

O que fica para depois:

- recursos administrativos avancados
- automacoes novas
- expansao de escopo
