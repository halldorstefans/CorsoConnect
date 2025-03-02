import { openDB } from "idb";
import { createClient } from "@/utils/supabase/component";
import { DatabaseError, NetworkError } from "@/types/errors";
import { Service } from "@/types/service";
import { Vehicle } from "@/types/vehicle";

const DB_NAME = "engineer_a_car";
const DB_VERSION = 1;
const VEHICLE_STORE = "vehicles";
const SERVICE_STORE = "services";
const SYNC_STORE = "syncQueue";

const supabase = createClient();

// Initialize IndexedDB
async function initDB() {
  try {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create vehicles store
        if (!db.objectStoreNames.contains(VEHICLE_STORE)) {
          const vehicleStore = db.createObjectStore(VEHICLE_STORE, {
            keyPath: "id",
          });
          vehicleStore.createIndex("user_id", "user_id", { unique: false });
          vehicleStore.createIndex("updated_at", "updated_at", {
            unique: false,
          });
        }

        // Create services store
        if (!db.objectStoreNames.contains(SERVICE_STORE)) {
          const serviceStore = db.createObjectStore(SERVICE_STORE, {
            keyPath: "id",
          });
          serviceStore.createIndex("vehicle_id", "vehicle_id", {
            unique: false,
          });
          serviceStore.createIndex("user_id", "user_id", { unique: false });
          serviceStore.createIndex("updated_at", "updated_at", {
            unique: false,
          });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          const syncStore = db.createObjectStore(SYNC_STORE, {
            keyPath: "id",
          });
          syncStore.createIndex("timestamp", "timestamp", { unique: false });
          syncStore.createIndex("table", "table", { unique: false });
          syncStore.createIndex("operation", "operation", { unique: false });
          syncStore.createIndex("by-data-id", "data.id", { unique: false });
          syncStore.createIndex("syncStatus", "syncStatus", { unique: false });
        }
      },
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new DatabaseError(
      "Failed to initialize local database. Please refresh the page.",
    );
  }
}

// Get all vehicles
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const db = await initDB();
    return (await db.getAll(VEHICLE_STORE)) as Vehicle[];
  } catch (error) {
    console.error("Failed to get vehicles:", error);
    throw new DatabaseError("Failed to retrieve vehicles. Please try again.");
  }
}

// Get a single vehicle by ID
export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  try {
    const db = await initDB();
    return (await db.get(VEHICLE_STORE, id)) as Vehicle;
  } catch (error) {
    console.error(`Failed to get vehicle with id ${id}:`, error);
    throw new DatabaseError(
      `Failed to retrieve vehicle details. Please try again.`,
    );
  }
}

// Add or update a vehicle
export async function saveVehicle(vehicle: Vehicle) {
  try {
    const db = await initDB();
    const tx = db.transaction([VEHICLE_STORE, SYNC_STORE], "readwrite");

    // Update timestamps
    vehicle.updated_at = new Date();
    vehicle.created_at = vehicle.created_at || new Date();

    // Save to IndexedDB (optimistic update)
    await tx.objectStore(VEHICLE_STORE).put(vehicle);

    // Add to sync queue
    await tx.objectStore(SYNC_STORE).add({
      id: `${vehicle.id}_${Date.now()}`, // Unique ID for the sync operation
      operation: "upsert",
      table: "vehicles",
      data: vehicle,
      timestamp: new Date(),
      syncStatus: "pending",
    });

    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      syncWithSupabase().catch((err) => {
        console.error("Background sync failed:", err);
        // We don't throw here since the local update was successful
      });
    }

    return vehicle;
  } catch (error) {
    console.error("Failed to save vehicle:", error);
    throw new DatabaseError("Failed to save vehicle. Please try again.");
  }
}

// Delete a vehicle
export async function deleteVehicle(id: string) {
  try {
    const db = await initDB();

    // First, get the vehicle to store in sync queue
    const vehicle = await db.get(VEHICLE_STORE, id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }

    const tx = db.transaction([VEHICLE_STORE, SYNC_STORE], "readwrite");

    // Delete from IndexedDB (optimistic delete)
    await tx.objectStore(VEHICLE_STORE).delete(id);

    // Add to sync queue
    await tx.objectStore(SYNC_STORE).add({
      id: `delete_${id}_${Date.now()}`,
      operation: "delete",
      table: "vehicles",
      data: { id },
      timestamp: new Date(),
      syncStatus: "pending",
    });

    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      syncWithSupabase().catch((err) => {
        console.error("Background sync failed:", err);
      });
    }
  } catch (error) {
    console.error(`Failed to delete vehicle with id ${id}:`, error);
    throw new DatabaseError(`Failed to delete vehicle. Please try again.`);
  }
}

// Get services for a vehicle
export async function getVehicleServices(
  vehicleId: string,
): Promise<Service[]> {
  try {
    const db = await initDB();
    const tx = db.transaction(SERVICE_STORE, "readonly");
    const index = tx.store.index("vehicle_id");
    return await index.getAll(vehicleId);
  } catch (error) {
    console.error("Failed to get services:", error);
    throw new Error("Failed to get services");
  }
}

// Add or update a service entry
export async function saveService(service: Service) {
  try {
    const db = await initDB();
    const tx = db.transaction([SERVICE_STORE, SYNC_STORE], "readwrite");

    // Update timestamps
    service.updated_at = new Date();
    service.created_at = service.created_at || new Date();

    // Save to IndexedDB (optimistic update)
    await tx.objectStore(SERVICE_STORE).put(service);

    // Add to sync queue
    await tx.objectStore(SYNC_STORE).add({
      id: `${service.id}_${Date.now()}`,
      operation: "upsert",
      table: "services",
      data: service,
      timestamp: new Date(),
      syncStatus: "pending",
    });

    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      syncWithSupabase().catch((err) => {
        console.error("Background sync failed:", err);
      });
    }

    return service;
  } catch (error) {
    console.error("Failed to save service:", error);
    throw new DatabaseError("Failed to save service record. Please try again.");
  }
}

// Delete a service entry from a vehicle
export async function deleteService(id: string) {
  try {
    const db = await initDB();

    // First, get the service to store in sync queue
    const service = await db.get(SERVICE_STORE, id);
    if (!service) {
      throw new Error(`Service with id ${id} not found`);
    }

    const tx = db.transaction([SERVICE_STORE, SYNC_STORE], "readwrite");

    // Delete from IndexedDB (optimistic delete)
    await tx.objectStore(SERVICE_STORE).delete(id);

    // Add to sync queue
    await tx.objectStore(SYNC_STORE).add({
      id: `delete_${id}_${Date.now()}`,
      operation: "delete",
      table: "services",
      data: { id },
      timestamp: new Date(),
      syncStatus: "pending",
    });

    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      syncWithSupabase().catch((err) => {
        console.error("Background sync failed:", err);
      });
    }
  } catch (error) {
    console.error(`Failed to delete service with id ${id}:`, error);
    throw new DatabaseError(
      `Failed to delete service record. Please try again.`,
    );
  }
}

export async function getTotalServiceStats(): Promise<{
  totalServicesCost: number;
  totalServices: number;
}> {
  try {
    const db = await initDB();
    const tx = db.transaction(SERVICE_STORE, "readonly");
    const allServices: Service[] = await tx.store.getAll();

    return {
      totalServicesCost: allServices.reduce(
        (total, service) => total + service.cost,
        0,
      ),
      totalServices: allServices.length,
    };
  } catch (error) {
    console.error("Failed to get total service stats:", error);
    throw new Error("Failed to get total service stats");
  }
}

// Sync with Supabase
async function syncWithSupabase(maxRetries = 3) {
  if (!navigator.onLine) {
    console.log("Device is offline, skipping sync");
    return;
  }

  try {
    const db = await initDB();
    const queue = await db.getAll(SYNC_STORE);

    if (queue.length === 0) {
      console.log("No items to sync");
      return;
    }

    console.log(`Attempting to sync ${queue.length} items`);

    for (const item of queue) {
      let retries = 0;
      let syncSuccess = false;

      while (!syncSuccess && retries < maxRetries) {
        try {
          let error;
          let serverData;

          // For upserts, check for conflicts first
          if (item.operation === "upsert") {
            // Get the current server version to check for conflicts
            const { data: currentData, error: fetchError } = await supabase
              .from(item.table)
              .select("*")
              .eq("id", item.data.id)
              .single();

            if (fetchError && fetchError.code !== "PGRST116") {
              // PGRST116 is "not found"
              throw fetchError;
            }

            // If server has a newer version, handle conflict
            if (
              currentData &&
              new Date(currentData.updated_at) > new Date(item.data.updated_at)
            ) {
              console.log(
                `Conflict detected for ${item.table} id: ${item.data.id}`,
              );

              // Merge strategy: For simplicity, server wins for most fields
              // but we'll preserve local changes for critical fields
              const mergedData = {
                ...currentData,
                // Keep local changes for these fields if they differ
                ...(item.data.description !== currentData.description
                  ? { description: item.data.description }
                  : {}),
                ...(item.data.cost !== currentData.cost
                  ? { cost: item.data.cost }
                  : {}),
                // Update the timestamp
                updated_at: new Date(),
              };

              // Update local copy with merged data
              const localTx = db.transaction(item.table, "readwrite");
              await localTx.store.put(mergedData);
              await localTx.done;

              // Update server with merged data
              ({ error } = await supabase
                .from(item.table)
                .upsert(mergedData, { onConflict: "id" }));

              serverData = mergedData;
            } else {
              // No conflict, proceed with normal upsert
              ({ error, data: serverData } = await supabase
                .from(item.table)
                .upsert(item.data, { onConflict: "id" })
                .select()
                .single());
            }
          } else if (item.operation === "delete") {
            // For deletes, check if the item still exists
            const { data: existsCheck } = await supabase
              .from(item.table)
              .select("id")
              .eq("id", item.data.id)
              .single();

            if (existsCheck) {
              ({ error } = await supabase
                .from(item.table)
                .delete()
                .eq("id", item.data.id));
            } else {
              // Item already deleted on server, consider it a success
              console.log(`Item ${item.data.id} already deleted on server`);
            }
          }

          if (!error) {
            // Update local data with server response if available
            if (serverData && item.operation === "upsert") {
              const localTx = db.transaction(item.table, "readwrite");
              await localTx.store.put(serverData);
              await localTx.done;
            }

            // Remove from sync queue
            const tx = db.transaction([SYNC_STORE], "readwrite");
            await tx.objectStore(SYNC_STORE).delete(item.id);
            await tx.done;

            syncSuccess = true;
            console.log(
              `Successfully synced ${item.operation} for ${item.table} id: ${item.data.id}`,
            );
          } else {
            throw error;
          }
        } catch (err) {
          retries++;
          console.error(`Sync attempt ${retries}/${maxRetries} failed:`, err);

          if (retries >= maxRetries) {
            console.error(
              `Max retries reached for item ${item.id}, will try again later`,
            );
            // Mark the item with retry information for future attempts
            const tx = db.transaction([SYNC_STORE], "readwrite");
            await tx.objectStore(SYNC_STORE).put({
              ...item,
              retryCount: (item.retryCount || 0) + 1,
              lastRetry: new Date(),
              error: (err as Error).message || "Unknown error",
            });
            await tx.done;
          } else {
            // Exponential backoff before retry
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, retries)),
            );
          }
        }
      }
    }

    // After syncing, refresh local data from server
    await refreshLocalDataFromServer();
  } catch (error) {
    console.error("Sync failed:", error);
    throw new NetworkError(
      "Failed to sync with server. Will retry when connection is available.",
    );
  }
}

// Refresh local data from server with conflict handling
async function refreshLocalDataFromServer() {
  try {
    if (!navigator.onLine) return;

    const vehicles = await getVehiclesFromSupabase();
    const services = await getServicesFromSupabase();

    const db = await initDB();

    // Process vehicles
    for (const serverVehicle of vehicles) {
      const tx = db.transaction(VEHICLE_STORE, "readwrite");
      const localVehicle = await tx.store.get(serverVehicle.id);

      if (
        !localVehicle ||
        new Date(serverVehicle.updated_at) > new Date(localVehicle.updated_at)
      ) {
        // Server has newer data, update local
        await tx.store.put(serverVehicle);
      }
      await tx.done;
    }

    // Process services
    for (const serverService of services) {
      const tx = db.transaction(SERVICE_STORE, "readwrite");
      const localService = await tx.store.get(serverService.id);

      if (
        !localService ||
        new Date(serverService.updated_at) > new Date(localService.updated_at)
      ) {
        // Server has newer data, update local
        await tx.store.put(serverService);
      }
      await tx.done;
    }

    console.log("Local data refreshed from server");
  } catch (error) {
    console.error("Failed to refresh local data:", error);
  }
}

// Connection status management
export function setupConnectionHandlers() {
  let syncInterval: NodeJS.Timeout | null = null;

  function handleOnline() {
    console.log("App is online, syncing data...");
    document.dispatchEvent(
      new CustomEvent("connection-status-change", { detail: { online: true } }),
    );

    // Attempt immediate sync when coming online
    syncWithSupabase()
      .then(() => console.log("Initial sync completed"))
      .catch((err) => console.error("Initial sync failed:", err));

    // Set up periodic sync
    if (!syncInterval) {
      syncInterval = setInterval(
        () => {
          syncWithSupabase().catch((err) =>
            console.error("Periodic sync failed:", err),
          );
        },
        5 * 60 * 1000,
      ); // Sync every 5 minutes
    }
  }

  function handleOffline() {
    console.log("App is offline, local operations only");
    document.dispatchEvent(
      new CustomEvent("connection-status-change", {
        detail: { online: false },
      }),
    );

    // Clear sync interval when offline
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial setup based on current status
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }

    // Clean up function for component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }
}

// Get sync queue status
export async function getSyncStatus() {
  try {
    const db = await initDB();
    const pendingItems = await db.getAll(SYNC_STORE);

    return {
      pendingCount: pendingItems.length,
      lastSyncAttempt:
        pendingItems.length > 0
          ? Math.max(
              ...pendingItems.map((item) =>
                new Date(item.lastRetry || item.timestamp).getTime(),
              ),
            )
          : null,
      hasErrors: pendingItems.some((item) => item.error),
    };
  } catch (error) {
    console.error("Failed to get sync status:", error);
    return { pendingCount: 0, lastSyncAttempt: null, hasErrors: false };
  }
}

// Force sync with server
export async function forceSyncWithServer() {
  try {
    if (!navigator.onLine) {
      throw new NetworkError(
        "Cannot sync while offline. Please check your connection.",
      );
    }

    await syncWithSupabase(5); // Use more retries for manual sync
    return { success: true };
  } catch (error) {
    console.error("Force sync failed:", error);
    throw error;
  }
}

// Initial data load from Supabase
export async function initialLoad() {
  if (navigator.onLine) {
    const vehicles = await getVehiclesFromSupabase();
    const services = await getServicesFromSupabase();

    const db = await initDB();
    const tx = db.transaction([VEHICLE_STORE, SERVICE_STORE], "readwrite");

    for (const vehicle of vehicles) {
      await tx.objectStore(VEHICLE_STORE).put(vehicle);
    }

    for (const service of services) {
      await tx.objectStore(SERVICE_STORE).put(service);
    }

    await tx.done;
  }
}

async function getVehiclesFromSupabase() {
  const { data: vehicles, error } = await supabase.from("vehicles").select("*");

  if (error) throw error;
  return vehicles;
}

async function getServicesFromSupabase() {
  const { data: services, error } = await supabase.from("services").select("*");

  if (error) throw error;
  return services;
}

type PayloadData = {
  id: string;
  [key: string]: any;
};

// Setup real-time sync from Supabase
export function setupRealtimeSync() {
  let subscription: ReturnType<typeof supabase.channel> | undefined;

  function setupChannels() {
    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        async (payload) => {
          try {
            const db = await initDB();
            const tx = db.transaction(VEHICLE_STORE, "readwrite");
            // Check if we have a pending local change for this item
            const id =
              (payload.new as PayloadData)?.id ??
              (payload.old as PayloadData)?.id;
            const syncQueue = await db.getAllFromIndex(
              SYNC_STORE,
              "by-data-id",
              id,
            );
            const hasPendingChanges = syncQueue.length > 0;

            if (hasPendingChanges) {
              console.log(
                `Ignoring server update for vehicle ${id} due to pending local changes`,
              );
              return;
            }

            if (payload.eventType === "DELETE" && payload.old?.id) {
              await tx.store.delete(payload.old.id);
              console.log(
                `Deleted vehicle ${payload.old.id} from local DB based on server event`,
              );
            } else if ((payload.new as PayloadData)?.id) {
              await tx.store.put(payload.new);
              console.log(
                `Updated vehicle ${(payload.new as PayloadData).id} in local DB based on server event`,
              );
            }

            await tx.done;
          } catch (err) {
            console.error("Error handling vehicle realtime update:", err);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        async (payload) => {
          try {
            const db = await initDB();
            const tx = db.transaction(SERVICE_STORE, "readwrite");
            // Check if we have a pending local change for this item
            const id =
              (payload.new as PayloadData)?.id ??
              (payload.old as PayloadData)?.id;
            const syncQueue = await db.getAllFromIndex(
              SYNC_STORE,
              "by-data-id",
              id,
            );
            const hasPendingChanges = syncQueue.length > 0;

            if (hasPendingChanges) {
              console.log(
                `Ignoring server update for service ${id} due to pending local changes`,
              );
              return;
            }

            if (payload.eventType === "DELETE") {
              await tx.store.delete((payload.old as PayloadData).id);
              console.log(
                `Deleted service ${payload.old.id} from local DB based on server event`,
              );
            } else {
              await tx.store.put(payload.new);
              console.log(
                `Updated service ${payload.new.id} in local DB based on server event`,
              );
            }

            await tx.done;
          } catch (err) {
            console.error("Error handling service realtime update:", err);
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
  }

  // Set up connection event handlers
  if (typeof window !== "undefined") {
    window.addEventListener("online", setupChannels);

    // Initial setup if online
    if (navigator.onLine) {
      setupChannels();
    }

    // Return cleanup function
    return () => {
      window.removeEventListener("online", setupChannels);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }
}

// Setup online/offline handling
if (typeof window !== "undefined") {
  // Set up connection handlers
  setupConnectionHandlers();

  // Initialize real-time sync when online
  if (navigator.onLine) {
    setupRealtimeSync();
    initialLoad().catch(console.error);
  }
}
