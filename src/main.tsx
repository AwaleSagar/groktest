import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VaultProvider } from "@/context/VaultContext";
import { App } from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VaultProvider>
      <App />
    </VaultProvider>
  </StrictMode>,
);