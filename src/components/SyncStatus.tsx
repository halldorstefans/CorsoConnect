import { useEffect, useState } from "react";
import { AlertTriangle, Cloud, CloudOff } from "lucide-react";
import { forceSyncWithServer, getSyncStatus } from "@/utils/db";

interface SyncStatusProps {
  showDetails?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ showDetails = false }) => {
  const [status, setStatus] = useState({
    pendingCount: 0,
    lastSyncAttempt: null as number | null,
    hasErrors: false,
    isOnline: true,
    isSyncing: false,
  });

  useEffect(() => {
    // Initial status check
    checkSyncStatus();

    // Set up periodic status check
    const interval = setInterval(checkSyncStatus, 30000); // Check every 30 seconds

    // Listen for connection status changes
    const handleConnectionChange = (event: CustomEvent) => {
      setStatus((prev) => ({ ...prev, isOnline: event.detail.online }));
      if (event.detail.online) {
        checkSyncStatus();
      }
    };

    document.addEventListener(
      "connection-status-change",
      handleConnectionChange as EventListener,
    );

    // Set initial online status
    setStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      clearInterval(interval);
      document.removeEventListener(
        "connection-status-change",
        handleConnectionChange as EventListener,
      );
    };
  }, []);

  const checkSyncStatus = async () => {
    try {
      const syncStatus = await getSyncStatus();
      setStatus((prev) => ({
        ...prev,
        pendingCount: syncStatus.pendingCount,
        lastSyncAttempt: syncStatus.lastSyncAttempt,
        hasErrors: syncStatus.hasErrors,
      }));
    } catch (error) {
      console.error("Failed to check sync status:", error);
    }
  };

  const handleManualSync = async () => {
    if (!status.isOnline || status.isSyncing) return;

    try {
      setStatus((prev) => ({ ...prev, isSyncing: true }));
      await forceSyncWithServer();
      await checkSyncStatus();
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setStatus((prev) => ({ ...prev, isSyncing: false }));
    }
  };

  // Simple indicator for minimal display
  if (!showDetails) {
    return (
      <div
        className="flex items-center"
        title={status.isOnline ? "Online" : "Offline"}
        role="status"
        aria-live="polite"
      >
        {status.isOnline ? (
          <Cloud
            className={`w-5 h-5 ${status.pendingCount > 0 ? "text-amber-500" : "text-green-500"}`}
            aria-hidden="true"
          />
        ) : (
          <CloudOff className="w-5 h-5 text-neutral-500" aria-hidden="true" />
        )}
        <span className="sr-only">
          {status.isOnline
            ? status.pendingCount > 0
              ? "Online with pending changes"
              : "Online and synced"
            : "Offline"}
        </span>
        {status.hasErrors && (
          <>
            <AlertTriangle
              className="w-5 h-5 text-error ml-1"
              aria-hidden="true"
            />
            <span className="sr-only">Sync errors detected</span>
          </>
        )}
      </div>
    );
  }

  // Detailed display
  return (
    <div
      className="bg-background-card p-3 rounded-lg shadow-sm border border-neutral-300"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {status.isOnline ? (
            <>
              <Cloud
                className={`w-5 h-5 ${status.pendingCount > 0 ? "text-amber-500" : "text-green-500"}`}
                aria-hidden="true"
              />
              <span className="ml-2">
                {status.pendingCount > 0
                  ? `Online (${status.pendingCount} pending)`
                  : "Online (synced)"}
              </span>
            </>
          ) : (
            <>
              <CloudOff
                className="w-5 h-5 text-neutral-500"
                aria-hidden="true"
              />
              <span className="ml-2">Offline</span>
            </>
          )}
        </div>
        <button
          onClick={handleManualSync}
          disabled={!status.isOnline || status.isSyncing}
          aria-busy={status.isSyncing ? "true" : "false"}
          className={`text-xs px-2 py-1 rounded ${
            !status.isOnline || status.isSyncing
              ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              : "bg-primary text-background hover:bg-primary-hover"
          }`}
        >
          {status.isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {status.hasErrors && (
        <div className="mt-2 text-xs flex items-center text-error" role="alert">
          <AlertTriangle className="w-4 h-4 mr-1" aria-hidden="true" />
          <span>Sync errors detected. Try manual sync.</span>
        </div>
      )}

      {status.lastSyncAttempt && (
        <div className="mt-1 text-xs text-neutral-500">
          Last sync: {new Date(status.lastSyncAttempt).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default SyncStatus;
