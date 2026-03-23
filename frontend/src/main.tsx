import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "./app/api-client";
import { validateEnv } from "@/lib/env";

validateEnv();
import { Providers } from "./app/provider.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.tsx";
import { ErrorBoundary } from "@/components/common/error-boundary";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </ErrorBoundary>,
);
