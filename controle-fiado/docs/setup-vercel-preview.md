# Setup do Preview na Vercel

## Objetivo

Publicar o frontend web em preview na Vercel usando o Supabase que ja foi
configurado e validado localmente.

## Pasta do deploy

O deploy deve apontar para:

- `frontend/`

Nao publique a raiz inteira do repositorio. O backend legado e os arquivos do
prototipo antigo nao entram nesse deploy.

## Arquivos preparados no repositorio

- `frontend/vercel.json`
- `frontend/.env.example`

## Passo a passo no painel da Vercel

1. Criar um novo projeto a partir do repositorio.
2. Definir `Root Directory` como `frontend`.
3. Confirmar que o framework detectado e `Vite`.
4. Revisar:
   - `Install Command`: `npm install`
   - `Build Command`: `npm run build`
   - `Output Directory`: `dist`

## Variaveis de ambiente

Cadastrar no projeto da Vercel:

- `VITE_AUTH_MODE=supabase`
- `VITE_DATA_MODE=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Importante:

- nao usar `service_role` no frontend
- manter os dois modos em `supabase`

## Validacao do preview

Depois do primeiro deploy, validar:

1. tela de login abre
2. `OWNER` autentica
3. `STAFF` autentica
4. clientes aparecem
5. venda pode ser registrada
6. pagamento aparece apenas para `OWNER`
7. cobranca manual prepara mensagem
8. botao `Abrir no WhatsApp` funciona no celular

## Checklist minimo antes de compartilhar

- `0001`, `0002`, `0003`, `0004` aplicadas no Supabase
- `OWNER` e `STAFF` criados
- frontend local validado em modo Supabase
- variaveis da Vercel preenchidas
- preview remoto testado com os dois perfis

## Observacao importante

O fluxo de WhatsApp ficou manual por decisao de custo e estabilidade:

- o sistema prepara a mensagem
- o usuario clica em `Abrir no WhatsApp`
- o envio final continua humano

Isso e esperado e faz parte da versao atual do produto.
