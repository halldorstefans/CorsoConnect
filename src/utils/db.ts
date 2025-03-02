import { openDB } from "idb";
import { createClient } from "@/utils/supabase/component";
import { Service } from "@/types/service";
import { Vehicle } from "@/types/vehicle";

const DB_NAME = "engineer_a_car";
const DB_VERSION = 1;
const VEHICLE_STORE = "vehicles";
const SERVICE_STORE = "services";
const SYNC_STORE = "syncQueue";

const supabase = createClient();

// Initialize IndexedDB
const initDB = async () => {
  try {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create vehicles store
        if (!db.objectStoreNames.contains(VEHICLE_STORE)) {
          const vehicleStore = db.createObjectStore(VEHICLE_STORE, {
            keyPath: "id",
          });
          vehicleStore.createIndex("updated_at", "updated_at");
        }

        // Create services store
        if (!db.objectStoreNames.contains(SERVICE_STORE)) {
          const serviceStore = db.createObjectStore(SERVICE_STORE, {
            keyPath: "id",
          });
          serviceStore.createIndex("vehicle_id", "vehicle_id");
          serviceStore.createIndex("date", "date");
          serviceStore.createIndex("updated_at", "updated_at");
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw new Error("Database initialization failed");
  }
};

// Get all vehicles
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const db = await initDB();
    return (await db.getAll(VEHICLE_STORE)) as Vehicle[];
  } catch (error) {
    console.error("Failed to get vehicles:", error);
    throw new Error("Failed to get vehicles");
  }
}

// Get a single vehicle by ID
export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  try {
    const db = await initDB();
    return (await db.get(VEHICLE_STORE, id)) as Vehicle;
  } catch (error) {
    console.error(`Failed to get vehicle with id ${id}:`, error);
    throw new Error(`Failed to get vehicle with id ${id}`);
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

    // Save to IndexedDB
    await tx.objectStore(VEHICLE_STORE).put(vehicle);

    // Add to sync queue
    await tx.objectStore(SYNC_STORE).add({
      operation: "upsert",
      table: "vehicles",
      data: vehicle,
      timestamp: new Date(),
    });

    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      await syncWithSupabase();
    }
  } catch (error) {
    console.error("Failed to save vehicle:", error);
    throw new Error("Failed to save vehicle");
  }
}

// Delete a vehicle
export async function deleteVehicle(id: string) {
  try {
    const db = await initDB();
    const tx = db.transaction([VEHICLE_STORE, SYNC_STORE], "readwrite");

    await tx.objectStore(VEHICLE_STORE).delete(id);
    await tx.objectStore(SYNC_STORE).add({
      operation: "delete",
      table: "vehicles",
      data: { id },
      timestamp: new Date(),
    });

    await tx.done;

    if (navigator.onLine) {
      await syncWithSupabase();
    }
  } catch (error) {
    console.error(`Failed to delete vehicle with id ${id}:`, error);
    throw new Error(`Failed to delete vehicle with id ${id}`);
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

    // Save to IndexedDB
    await tx.objectStore(SERVICE_STORE).put(service);

    // Add to sync queue
    await tx.objectStore(SYNC_STORE).add({
      operation: "upsert",
      table: "services",
      data: service,
      timestamp: new Date(),
    });

    await tx.done;

    // Try to sync immediately if online
    if (navigator.onLine) {
      await syncWithSupabase();
    }
  } catch (error) {
    console.error("Failed to save a service:", error);
    throw new Error("Failed to save a service");
  }
}

// Delete a service entry from a vehicle
export async function deleteService(serviceId: string) {
  try {
    const db = await initDB();
    const tx = db.transaction([SERVICE_STORE, SYNC_STORE], "readwrite");

    await tx.objectStore(SERVICE_STORE).delete(serviceId);
    await tx.objectStore(SYNC_STORE).add({
      operation: "delete",
      table: "services",
      data: { serviceId },
      timestamp: new Date(),
    });

    await tx.done;

    if (navigator.onLine) {
      await syncWithSupabase();
    }
  } catch (error) {
    console.error("Failed to remove service:", error);
    throw new Error("Failed to remove service");
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
async function syncWithSupabase() {
  const db = await initDB();
  const queue = await db.getAll(SYNC_STORE);

  for (const item of queue) {
    try {
      let error;
      if (item.operation === "upsert") {
        ({ error } = await supabase
          .from(item.table)
          .upsert(item.data, { onConflict: "id" }));
      } else if (item.operation === "delete") {
        ({ error } = await supabase
          .from(item.table)
          .delete()
          .eq("id", item.data.id));
      }

      if (!error) {
        const tx = db.transaction([SYNC_STORE], "readwrite");
        await tx.objectStore(SYNC_STORE).delete(item.id);
        await tx.done;
      }
    } catch (error) {
      console.error("Sync failed for item:", item, error);
    }
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

// Setup real-time sync from Supabase
export function setupRealtimeSync() {
  supabase
    .channel("vehicles")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vehicles" },
      async (payload) => {
        const db = await initDB();
        const tx = db.transaction(VEHICLE_STORE, "readwrite");

        if (payload.eventType === "DELETE") {
          await tx.store.delete(payload.old.id);
        } else {
          await tx.store.put(payload.new);
        }

        await tx.done;
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "services" },
      async (payload) => {
        const db = await initDB();
        const tx = db.transaction(SERVICE_STORE, "readwrite");

        if (payload.eventType === "DELETE") {
          await tx.store.delete(payload.old.id);
        } else {
          await tx.store.put(payload.new);
        }

        await tx.done;
      },
    )
    .subscribe();
}

// Setup online/offline handling
if (typeof window !== "undefined") {
  window.addEventListener("online", syncWithSupabase);

  // Initialize real-time sync when online
  if (navigator.onLine) {
    setupRealtimeSync();
    initialLoad().catch(console.error);
  }
}
