import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

// Plain TanStack Start + Supabase + Vercel. Lovable fully removed (no @lovable.dev
// wrapper, no PWA/service worker). nitro() is REQUIRED or Vercel 404s every route.
export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // src/server.ts is our SSR error-wrapping server entry.
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
  resolve: { dedupe: ["react", "react-dom"] },
});
