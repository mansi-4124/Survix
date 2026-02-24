import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { Providers } from "./app/provider.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
