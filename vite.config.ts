import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-oxc";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: "**/*.svg",
      svgrOptions: {
        exportType: "default",
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
