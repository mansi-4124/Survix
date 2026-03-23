import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { IncomingMessage, ServerResponse } from "node:http";
type NextFunction = (err?: unknown) => void;

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isServe = command === "serve";
  const stripCspHeaders = (): Plugin => ({
    name: "strip-csp-headers",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((
        _req: IncomingMessage,
        res: ServerResponse,
        next: NextFunction,
      ) => {
        res.removeHeader("Content-Security-Policy");
        res.removeHeader("content-security-policy");
        res.removeHeader("Content-Security-Policy-Report-Only");
        res.removeHeader("content-security-policy-report-only");

        const originalWriteHead = res.writeHead;
        res.writeHead = function (
          _statusCode: any,
          reason: any,
          headers?: any,
        ) {
          const actualHeaders =
            typeof reason === "object" && headers === undefined ? reason : headers;
          if (actualHeaders) {
            delete actualHeaders["Content-Security-Policy"];
            delete actualHeaders["content-security-policy"];
            delete actualHeaders["Content-Security-Policy-Report-Only"];
            delete actualHeaders["content-security-policy-report-only"];
          }
          res.removeHeader("Content-Security-Policy");
          res.removeHeader("content-security-policy");
          res.removeHeader("Content-Security-Policy-Report-Only");
          res.removeHeader("content-security-policy-report-only");
          return (originalWriteHead as any).apply(this, arguments as any);
        };
        next();
      });
    },
  });
  const rawApiBase = process.env.VITE_API_BASE_URL;
  const apiBase =
    typeof rawApiBase === "string" && rawApiBase.length > 0
      ? rawApiBase
      : "http://localhost:3000";
  const apiOrigin = new URL(apiBase).origin;
  const wsOrigin = apiOrigin.replace(/^http/, "ws");

  const scriptSrc = [
    "'self'",
    "https://accounts.google.com",
    "https://apis.google.com",
    "'unsafe-inline'",
    ...(isServe ? ["'unsafe-eval'"] : []),
  ].join(" ");

  const connectSrc = [
    "'self'",
    apiOrigin,
    wsOrigin,
    ...(isServe
      ? [
          "http://localhost:5173",
          "ws://localhost:5173",
          "http://127.0.0.1:5173",
          "ws://127.0.0.1:5173",
        ]
      : []),
    "https://accounts.google.com",
    "https://*.googleapis.com",
  ].join(" ");

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https: blob:",
    "style-src 'self' 'unsafe-inline' https:",
    "font-src 'self' data: https://fonts.gstatic.com https:",
    `script-src ${scriptSrc}`,
    `connect-src ${connectSrc}`,
    "frame-src https://accounts.google.com",
  ].join("; ");

  const securityHeaders = {
    "Content-Security-Policy": csp,
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
  };

  const serverHeaders = isServe ? {} : securityHeaders;

  return {
    plugins: [react(), ...(isServe ? [stripCspHeaders()] : [])],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      minify: "esbuild",
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            data: ["axios", "@tanstack/react-query", "zustand"],
          },
        },
      },
    },
    server: {
      headers: serverHeaders,
      proxy: {
        "/auth": "http://localhost:3000",
        "/organizations": "http://localhost:3000",
        "/surveys": "http://localhost:3000",
        "/responses": "http://localhost:3000",
        "/pages": "http://localhost:3000",
        "/questions": "http://localhost:3000",
        "/media": "http://localhost:3000",
        "/polls": "http://localhost:3000",
      },
    },
    preview: {
      headers: securityHeaders,
    },
  };
});
