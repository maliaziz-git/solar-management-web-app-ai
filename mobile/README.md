# Mobile (React Native / Expo) — field companion

Shares the **same REST APIs** as the web app (`/api/projects`, `/api/tickets`, `/api/metrics`).

```bash
cd mobile
npm install
# point at your API (deployed Vercel URL or LAN IP for device testing)
EXPO_PUBLIC_API_URL="https://your-app.vercel.app" npx expo start
```

Screens in this starter: fleet list with pull-to-refresh.
Next iterations: ticket triage (PATCH `/api/tickets/[id]`), site detail with power curve, offline queue.
