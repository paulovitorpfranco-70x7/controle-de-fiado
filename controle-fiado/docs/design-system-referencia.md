# Design System de Referencia

## Fonte oficial

O visual final do app deve seguir o design system Lumina informado pelo cliente.

Arquivo de referencia local:

`c:\Users\User\Desktop\PAULO\Cursos\09 - Doacao\Asimov\Formacao AI Designer - Asimov\01 Fundamentos do Vibe Design\Material\design systems\lumina-video\design-system.html`

Arquivo base usado para extracao:

`c:\Users\User\Desktop\PAULO\Cursos\09 - Doacao\Asimov\Formacao AI Designer - Asimov\01 Fundamentos do Vibe Design\Material\design systems\lumina-video\index.html`

## Regra para os proximos ajustes de UI

Nao redesenhar a interface livremente.

Todo ajuste visual deve reaproveitar os padroes existentes no design system:

- fundo escuro com imagem/overlay e linhas verticais sutis
- acento laranja/amber
- cards glass com borda branca baixa
- botoes arredondados com gradiente laranja
- tipografia com hierarquia forte e tracking negativo nos titulos
- labels pequenas em uppercase com tracking alto
- animacoes de beam, hover glow e transicoes suaves

## O que nao fazer

- nao trocar a estrutura inteira da UI de uma vez
- nao criar tema visual novo
- nao mudar cores, gradientes ou estilos fora do design system
- nao mexer em regra de negocio durante ajustes visuais
- nao alterar fluxo validado de venda, pagamento, cliente ou cobranca

## Forma segura de aplicar no app

Aplicar em etapas pequenas:

1. ajustar tokens visuais globais sem mudar layout
2. adaptar botoes e inputs
3. adaptar cards/listas
4. adaptar header/sidebar se necessario
5. revisar mobile
6. validar com build
7. publicar e testar no link da Vercel

Cada etapa deve ser revisada antes da proxima.

