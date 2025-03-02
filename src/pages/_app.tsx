import { useEffect } from "react";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { setupRealtimeSync } from "@/utils/db";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    setupRealtimeSync();

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
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
