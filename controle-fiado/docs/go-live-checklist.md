# Checklist de Go-Live

## Objetivo

Consolidar o que ja esta pronto e o que ainda falta antes de entregar o sistema
para uso final do cliente sem acompanhamento constante.

## Leitura rapida

- `PRONTO`: item atendido no estado atual
- `PENDENTE CRITICO`: precisa ser resolvido antes da entrega final
- `PENDENTE RECOMENDADO`: nao bloqueia piloto assistido, mas deve ser resolvido para uma entrega mais profissional

## Status executivo

O sistema esta apto para:

- piloto real
- uso assistido com baixo volume
- operacao controlada com `OWNER` e `STAFF`

O sistema ainda nao esta totalmente fechado como entrega final profissional
sem alinhar operacao, suporte e ambiente definitivo.

## 1. Ambiente definitivo

- `PENDENTE CRITICO` decidir se o projeto atual da Vercel sera o ambiente definitivo ou apenas preview
- `PENDENTE CRITICO` definir dominio oficial ou aceitar temporariamente a URL da Vercel
- `PENDENTE CRITICO` registrar quem e responsavel por Vercel, Supabase e faturamento
- `PENDENTE CRITICO` definir quem aprova mudancas futuras em producao

Aceite:

- existe uma URL oficial de uso
- existe um responsavel tecnico
- existe uma regra clara de deploy

## 2. Banco e operacao

- `PRONTO` Supabase como banco e auth ja validados no fluxo web
- `PRONTO` migrations do fluxo principal ja previstas na documentacao
- `PENDENTE CRITICO` definir rotina de backup do Supabase
- `PENDENTE CRITICO` definir procedimento de restauracao em caso de erro humano
- `PENDENTE CRITICO` registrar onde ficam guardados acessos e chaves do projeto

Aceite:

- backup com frequencia definida
- pessoa responsavel sabe restaurar
- acessos administrativos estao organizados

## 3. Usuarios e permissoes

- `PRONTO` perfis `OWNER` e `STAFF` existem e o recorte operacional esta validado
- `PRONTO` o piloto validou restricoes de acesso
- `PENDENTE CRITICO` formalizar o processo de criar novo usuario
- `PENDENTE CRITICO` formalizar o processo de desativar usuario
- `PENDENTE RECOMENDADO` criar tela administrativa para gestao de usuarios em fase posterior

Aceite:

- existe passo a passo de onboarding
- existe passo a passo de bloqueio ou desligamento
- o dono entende quem pode acessar o que

## 4. Fluxos de negocio

- `PRONTO` login `OWNER`
- `PRONTO` login `STAFF`
- `PRONTO` cadastro de clientes
- `PRONTO` registro de vendas
- `PRONTO` registro de pagamentos pelo `OWNER`
- `PRONTO` pagamento direcionado para titulo especifico
- `PRONTO` cobranca manual com `Abrir no WhatsApp`
- `PRONTO` fila de cobranca
- `PRONTO` prevencao de duplicidade no fluxo validado

Aceite:

- dono e operadora conseguem usar sem ajuda constante
- saldo e vencimento aparecem corretamente
- WhatsApp abre no celular do dono

## 5. Estabilidade tecnica

- `PRONTO` build do backend
- `PRONTO` build do frontend
- `PRONTO` testes do backend passando
- `PENDENTE RECOMENDADO` criar smoke test automatizado do frontend
- `PENDENTE RECOMENDADO` criar verificacao minima em CI para build e testes

Aceite:

- backend compila
- frontend compila
- backend passa na suite atual
- existe ao menos uma esteira minima de validacao automatica

## 6. Seguranca e configuracao

- `PRONTO` frontend usa `anon key`, nao `service_role`
- `PRONTO` perfis e permissoes estao apoiados tambem no banco
- `PENDENTE CRITICO` revisar e trocar qualquer segredo padrao remanescente se o backend legado continuar exposto
- `PENDENTE CRITICO` definir onde ficam armazenadas as credenciais administrativas
- `PENDENTE RECOMENDADO` revisar expiracao de sessao e politica operacional de troca de senha

Aceite:

- nao existe segredo de desenvolvimento em runtime real
- acessos administrativos estao sob controle
- equipe sabe recuperar acesso sem improviso

## 7. PWA e app no celular

- `PRONTO` manifest configurado
- `PRONTO` service worker registrado
- `PRONTO` instalacao em tela inicial suportada
- `PENDENTE RECOMENDADO` validar reinstalacao do app apos troca de icone
- `PENDENTE RECOMENDADO` definir rotina de invalidacao de cache quando houver deploy importante

Aceite:

- app instala no Android e iPhone
- dono sabe remover e instalar novamente se o icone ficar em cache

## 8. Suporte e manutencao

- `PENDENTE CRITICO` definir como o cliente vai pedir suporte
- `PENDENTE CRITICO` definir tempo de resposta esperado
- `PENDENTE CRITICO` definir o que entra em manutencao mensal e o que vira melhoria cobrada a parte
- `PENDENTE RECOMENDADO` criar changelog simples por versao publicada

Aceite:

- cliente sabe para quem falar
- voce sabe o que e suporte e o que e nova demanda
- existe expectativa alinhada de atendimento

## 9. Documentacao minima de entrega

- `PRONTO` documentacao tecnica principal existe
- `PRONTO` roteiro de piloto existe
- `PRONTO` roteiro de feedback existe
- `PENDENTE CRITICO` consolidar um manual curto do usuario final
- `PENDENTE RECOMENDADO` consolidar um manual curto do administrador

Manual do usuario deve cobrir:

- como entrar
- como cadastrar cliente
- como registrar venda
- como registrar pagamento
- como cobrar pelo WhatsApp

Manual do administrador deve cobrir:

- como criar usuarios
- como conferir perfil `OWNER` e `STAFF`
- como validar se o sistema esta no ar
- o que fazer em caso de erro

## 10. Go / No-Go

### Go

Seguir para entrega final quando:

- ambiente definitivo estiver decidido
- backup e restauracao estiverem definidos
- processo de usuarios estiver documentado
- suporte e manutencao estiverem combinados
- manual curto do usuario estiver pronto

### No-Go

Nao entregar como sistema final se:

- ainda nao existe dono tecnico do ambiente
- nao existe processo de backup
- nao existe processo de desligamento de usuario
- o cliente ainda depende de voce para toda operacao basica

## Recomendacao objetiva

Hoje o sistema pode ser classificado como:

- `pronto para uso real assistido`

Para virar:

- `pronto para entrega final`

faltam principalmente definicoes operacionais, nao grandes lacunas de produto.

## Proxima acao recomendada

Executar nesta ordem:

1. decidir ambiente definitivo
2. fechar backup e restauracao
3. escrever procedimento de usuarios
4. alinhar suporte e manutencao
5. escrever manual curto do usuario
