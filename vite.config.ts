import crossOriginIsolation from "vite-plugin-cross-origin-isolation";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          // res.setHeader("Cross-Origin-Resource-Policy", "same-site"); // no need this line to be crossOriginIsolated
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin"); // allow popup not working
          next();
        });
      },
    },
  ],
  // under the hood
  //   {
  //     name: "configure-response-headers",
  //     configureServer: (server) => {
  //       server.middlewares.use((_req, res, next) => {
  //         res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  //         res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  //         res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  //         next();
  //       });
  //     },
  //   },
  // ],
});
