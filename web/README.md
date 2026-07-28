# Vertek Avalia — Web (React + PWA)

App web separado do mobile Expo. Reutiliza as APIs de `src/features` e oferece UI própria com suporte a instalação PWA.

## Desenvolvimento

Na raiz do monorepo (com `.env` contendo `EXPO_PUBLIC_SUPABASE_*` ou `VITE_SUPABASE_*`):

```bash
npm run web:dev
```

Abre em http://localhost:5180

## Build / preview

```bash
npm run web:build
npm run web:preview
```

## Deploy (Netlify)

`netlify.toml` na raiz publica `web/dist` com SPA redirect.

## Estrutura

- `web/src/pages` — telas React
- `web/src/layouts` — shell com sidebar por papel
- `web/src/contexts` — auth e assinatura (web)
- `packages/shared` — reexports de tokens/menus/tipos
- Mobile Expo permanece na raiz para APK/iOS
