import { useEffect } from "react";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { VehicleProvider } from "@/contexts/VehicleContext";
import { setupConnectionHandlers, setupRealtimeSync } from "@/utils/db";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Set up realtime sync and connection handlers
    const realtimeSyncCleanup = setupRealtimeSync();
    const connectionHandlersCleanup = setupConnectionHandlers();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed", error);
        });
    }

    // Clean up on unmount
    return () => {
      if (realtimeSyncCleanup) realtimeSyncCleanup();
      if (connectionHandlersCleanup) connectionHandlersCleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <VehicleProvider>
        <Component {...pageProps} />
      </VehicleProvider>
    </AuthProvider>
  );
}
