import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ErrorBoundary } from "./app/error/ErrorBoundary.tsx";
import "./styles/index.css";

// Service worker registration is handled by Vite PWA plugin

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Root element not found!");
}

createRoot(rootElement).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);