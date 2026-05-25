import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  // Set base to "/" for GitHub Pages with a custom domain,
  // or to "/repo-name/" if deploying to username.github.io/repo-name
  base: "/CrimData/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
