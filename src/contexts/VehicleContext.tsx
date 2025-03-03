import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/router";
import {
  deleteService,
  deleteVehicle,
  getVehicle,
  getVehicles,
  getVehicleServices,
  saveService,
  saveVehicle,
} from "@/utils/db";
import { AuthError, DatabaseError, NetworkError } from "@/types/errors";
import { Service } from "@/types/service";
import { Vehicle } from "@/types/vehicle";
import { useAuth } from "./AuthContext";

interface VehicleStats {
  vehicleTotalCost: number;
  vehicleServiceCount: number;
}

interface ServiceStats {
  totalServicesCost: number;
  totalServices: number;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  services: Service[];
  vehicleStats: Record<string, VehicleStats>;
  serviceStats: ServiceStats | null;
  loading: boolean;
  vehiclesLoading: boolean;
  servicesLoading: boolean;
  vehicleLoading: boolean;
  error: string | null;
  fetchVehicles: (force?: boolean) => Promise<boolean>;
  fetchVehicle: (id: string) => Promise<boolean>;
  fetchServices: (vehicleId: string) => Promise<boolean>;
  saveVehicleData: (vehicle: Vehicle) => Promise<boolean>;
  removeVehicle: (id: string) => Promise<boolean>;
  saveServiceData: (service: Service) => Promise<boolean>;
  removeService: (id: string) => Promise<boolean>;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  clearError: () => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicleStats, setVehicleStats] = useState<
    Record<string, VehicleStats>
  >({});
  const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track loading states separately to prevent UI flickering
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // Track data fetch status to prevent duplicate fetches
  const [dataFetched, setDataFetched] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  // Memoize handleError to prevent recreation on every render
  const handleError = useCallback(
    (err: Error | unknown) => {
      if (err instanceof NetworkError) {
        setError(
          "Network connection issue. Please check your internet connection.",
        );
      } else if (err instanceof AuthError) {
        setError("Authentication error. Please sign in again.");
        router.push("/auth");
      } else if (err instanceof DatabaseError) {
        setError("Database operation failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    },
    [router],
  );

  const fetchVehicles = useCallback(
    async (force = false): Promise<boolean> => {
      if (!user) return false;
      if (vehiclesLoading) return false; // Prevent concurrent fetches
      if (dataFetched && !force) return true; // Skip if already fetched and not forced

      try {
        setVehiclesLoading(true);
        clearError();

        const vehiclesData = await getVehicles();

        // Only update state if the data has actually changed
        if (JSON.stringify(vehiclesData) !== JSON.stringify(vehicles)) {
          setVehicles(vehiclesData);
        }

        // Calculate stats for all vehicles
        const vehicleStatsObject: Record<string, VehicleStats> = {};
        let totalCost = 0;
        let totalServiceCount = 0;

        // Use Promise.all to fetch all vehicle services in parallel
        const servicesPromises = vehiclesData.map((vehicle) =>
          getVehicleServices(vehicle.id),
        );
        const allVehicleServices = await Promise.all(servicesPromises);

        // Process all services to calculate stats
        allVehicleServices.forEach((vehicleServices, index) => {
          const vehicleId = vehiclesData[index].id;
          let vehicleTotalCost = 0;

          vehicleServices.forEach((service) => {
            vehicleTotalCost += service.cost || 0;
            totalCost += service.cost || 0;
          });

          vehicleStatsObject[vehicleId] = {
            vehicleTotalCost,
            vehicleServiceCount: vehicleServices.length,
          };

          totalServiceCount += vehicleServices.length;
        });

        // Only update stats if they've changed
        if (
          JSON.stringify(vehicleStatsObject) !== JSON.stringify(vehicleStats)
        ) {
          setVehicleStats(vehicleStatsObject);
        }

        const newServiceStats = {
          totalServicesCost: totalCost,
          totalServices: totalServiceCount,
        };

        if (JSON.stringify(newServiceStats) !== JSON.stringify(serviceStats)) {
          setServiceStats(newServiceStats);
        }

        setDataFetched(true);
        return true;
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
        handleError(err);
        return false;
      } finally {
        setVehiclesLoading(false);
      }
    },
    [
      user,
      vehicles,
      vehicleStats,
      serviceStats,
      vehiclesLoading,
      clearError,
      handleError,
      dataFetched,
    ],
  );

  const fetchVehicle = useCallback(
    async (id: string): Promise<boolean> => {
      if (!id || !user) return false;
      if (vehicleLoading) return false; // Prevent concurrent fetches

      try {
        setVehicleLoading(true);
        clearError();

        const fetchedVehicle = await getVehicle(id);

        // Only update if the vehicle has changed
        if (
          !selectedVehicle ||
          JSON.stringify(fetchedVehicle) !== JSON.stringify(selectedVehicle)
        ) {
          setSelectedVehicle(fetchedVehicle || null);
        }

        return true;
      } catch (err) {
        console.error("Failed to fetch vehicle:", err);
        handleError(err);
        return false;
      } finally {
        setVehicleLoading(false);
      }
    },
    [user, selectedVehicle, vehicleLoading, clearError, handleError],
  );

  const fetchServices = useCallback(
    async (vehicleId: string): Promise<boolean> => {
      if (!vehicleId || !user) return false;
      if (servicesLoading) return false; // Prevent concurrent fetches

      try {
        setServicesLoading(true);
        clearError();

        const fetchedServices = await getVehicleServices(vehicleId);

        // Only update if services have changed
        if (JSON.stringify(fetchedServices) !== JSON.stringify(services)) {
          setServices(fetchedServices);
        }

        return true;
      } catch (err) {
        console.error("Failed to fetch services:", err);
        handleError(err);
        return false;
      } finally {
        setServicesLoading(false);
      }
    },
    [user, services, servicesLoading, clearError, handleError],
  );

  const saveVehicleData = useCallback(
    async (vehicle: Vehicle): Promise<boolean> => {
      try {
        setVehiclesLoading(true);
        clearError();

        await saveVehicle(vehicle);
        await fetchVehicles(true);
        return true;
      } catch (err) {
        console.error("Failed to save vehicle:", err);
        handleError(err);
        return false;
      } finally {
        setVehiclesLoading(false);
      }
    },
    [fetchVehicles, clearError, handleError],
  );

  const removeVehicle = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setVehiclesLoading(true);
        clearError();

        await deleteVehicle(id);
        await fetchVehicles(true);
        return true;
      } catch (err) {
        console.error("Failed to delete vehicle:", err);
        handleError(err);
        return false;
      } finally {
        setVehiclesLoading(false);
      }
    },
    [fetchVehicles, clearError, handleError],
  );

  const saveServiceData = useCallback(
    async (service: Service): Promise<boolean> => {
      try {
        setServicesLoading(true);
        clearError();

        await saveService(service);
        if (selectedVehicle) {
          await fetchServices(selectedVehicle.id);
          await fetchVehicles(true); // Refresh stats
        }
        return true;
      } catch (err) {
        console.error("Failed to save service:", err);
        handleError(err);
        return false;
      } finally {
        setServicesLoading(false);
      }
    },
    [fetchServices, fetchVehicles, selectedVehicle, clearError, handleError],
  );

  const removeService = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setServicesLoading(true);
        clearError();

        await deleteService(id);
        if (selectedVehicle) {
          await fetchServices(selectedVehicle.id);
          await fetchVehicles(true); // Refresh stats
        }
        return true;
      } catch (err) {
        console.error("Failed to delete service:", err);
        handleError(err);
        return false;
      } finally {
        setServicesLoading(false);
      }
    },
    [fetchServices, fetchVehicles, selectedVehicle, clearError, handleError],
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      vehicles,
      selectedVehicle,
      services,
      vehicleStats,
      serviceStats,
      loading: vehiclesLoading || servicesLoading || vehicleLoading,
      vehiclesLoading,
      servicesLoading,
      vehicleLoading,
      error,
      fetchVehicles,
      fetchVehicle,
      fetchServices,
      saveVehicleData,
      removeVehicle,
      saveServiceData,
      removeService,
      setSelectedVehicle,
      clearError,
    }),
    [
      vehicles,
      selectedVehicle,
      services,
      vehicleStats,
      serviceStats,
      vehiclesLoading,
      servicesLoading,
      vehicleLoading,
      error,
      fetchVehicles,
      fetchVehicle,
      fetchServices,
      saveVehicleData,
      removeVehicle,
      saveServiceData,
      removeService,
      clearError,
    ],
  );

  // Fetch vehicles when user changes
  useEffect(() => {
    if (user && !dataFetched) {
      fetchVehicles();
    } else if (!user) {
      // Clear data when user logs out
      setVehicles([]);
      setSelectedVehicle(null);
      setServices([]);
      setVehicleStats({});
      setServiceStats(null);
      setDataFetched(false);
    }
  }, [user, dataFetched, fetchVehicles]);

  // Update vehicle stats when services change
  const updateVehicleStats = useCallback(() => {
    if (services.length > 0) {
      const stats: { [key: string]: VehicleStats } = {};
      services.forEach((service) => {
        if (!stats[service.vehicle_id]) {
          stats[service.vehicle_id] = {
            vehicleTotalCost: 0,
            vehicleServiceCount: 0,
          };
        }
        stats[service.vehicle_id].vehicleTotalCost += service.cost;
        stats[service.vehicle_id].vehicleServiceCount += 1;
      });
      setVehicleStats(stats);
    }
  }, [services]);

  useEffect(() => {
    updateVehicleStats();
  }, [updateVehicleStats]);

  return (
    <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>
  );
}

// Custom hook to use the vehicle context
export function useVehicles() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error("useVehicles must be used within a VehicleProvider");
  }
  return context;
}
