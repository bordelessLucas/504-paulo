# Checklist da atualização — 03/08/2026

## Inicialização e Supabase

- [x] Confirmar o carregamento de `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` pelo Expo.
- [x] Verificar resolução DNS e resposta HTTPS do projeto Supabase.
- [x] Corrigir o temporizador de profile que registrava timeout mesmo após uma resposta bem-sucedida.
- [x] Reaproveitar requisições simultâneas do mesmo profile para evitar consultas duplicadas.

## Desempenho da navegação

- [x] Identificar que as telas lazy eram compiladas somente no primeiro acesso.
- [x] Criar registro central dos loaders das telas.
- [x] Pré-carregar em segundo plano somente as telas permitidas para o papel do usuário.
- [x] Manter o carregamento inicial responsivo enquanto reduz a espera ao trocar de página.

## Pesquisa global

- [x] Adicionar botão de lupa ao cabeçalho mobile.
- [x] Criar modal de pesquisa compatível com temas claro e escuro.
- [x] Pesquisar páginas disponíveis para o perfil logado.
- [x] Pesquisar colaboradores por nome, função, departamento e código interno.
- [x] Aplicar debounce para reduzir chamadas ao Supabase durante a digitação.
- [x] Respeitar as permissões e políticas de acesso existentes no Supabase.
- [x] Abrir diretamente a página selecionada nos resultados.
- [x] Abrir o Relatório Individual já carregado ao selecionar um colaborador.
- [x] Adicionar estados de carregamento, erro, lista vazia e limpeza da pesquisa.
- [x] Adicionar rótulos de acessibilidade aos controles da pesquisa.

## Qualidade

- [x] Consultar a documentação versionada exigida do Expo SDK 55 antes das alterações.
- [x] Executar `npm run typecheck` sem erros.
- [x] Executar ESLint nos arquivos da pesquisa e navegação sem erros.
- [x] Preservar alterações locais não relacionadas em `package-lock.json` e `Untitled`.

## Teste manual recomendado

- [ ] Reiniciar o Metro com `npx expo start --clear`.
- [ ] Validar a lupa em um iPhone conectado à mesma rede do computador.
- [ ] Pesquisar uma página e confirmar a navegação direta.
- [ ] Pesquisar um colaborador por nome, função, departamento e código interno.
- [ ] Confirmar que o Relatório Individual abre com o colaborador selecionado.
- [ ] Validar o comportamento com diferentes papéis de usuário.
