import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Pure client SPA — no SSR, no Cloudflare Worker.
// Routing: react-router-dom BrowserRouter (AppRoutes.tsx)
// State:   Redux Toolkit + RTK Query (src/app/store.ts)
// Talks to Express microservices via VITE_*_SERVICE_URL env vars.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // SPA mode: Vite will serve index.html for all unmatched routes in dev
  appType: "spa",
  server: {
    port: 5173,
    strictPort: true,
  },
});

