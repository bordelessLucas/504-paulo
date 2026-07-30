# Vertek Avalia — Web (React + PWA)

App web separado do mobile Expo. Reutiliza as APIs de `src/features` e oferece UI própria com suporte a instalação PWA (standalone, safe-areas, bottom nav, offline shell).

## Desenvolvimento

Na raiz do monorepo (com `.env` contendo `EXPO_PUBLIC_SUPABASE_*` ou `VITE_SUPABASE_*`):

```bash
npm run web:dev
```

Abre em http://localhost:5180  
(Service Worker **não** registra em localhost para evitar cache cruzado.)

## Build / preview (PWA real)

```bash
npm run web:build
npm run web:preview
```

No preview (HTTPS/localhost), teste:
- Instalar app (Chrome) / “Adicionar à Tela de Início” (iOS Safari)
- Bottom bar no mobile + drawer “Mais”
- Banner offline (DevTools → Network → Offline)
- Perfil → Ativar notificações

## Deploy (Netlify)

`netlify.toml` na raiz publica `web/dist` com SPA redirect e headers do SW.

## Estrutura

- `web/src/pages` — telas React
- `web/src/layouts` — shell com sidebar + bottom nav por papel
- `web/src/pwa` — standalone, offline queue, notifications
- `web/src/shims` — document/camera/share/print para Web APIs
- Mobile Expo permanece na raiz para APK/iOS
