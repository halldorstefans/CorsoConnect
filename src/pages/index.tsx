import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthError, User } from "@supabase/supabase-js";
import {
  CarIcon,
  DollarSignIcon,
  EyeIcon,
  PlusIcon,
  RefreshCwIcon,
  WrenchIcon,
} from "lucide-react";
import Layout from "@/components/Layout";
import { getVehicles, getVehicleServices } from "@/utils/db";
import { createClient } from "@/utils/supabase/component";
import { Vehicle } from "@/types/vehicle";

interface ServiceStats {
  totalServicesCost: number;
  totalServices: number;
}

interface VehicleStats {
  vehicleTotalCost: number;
  vehicleServiceCount: number;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatsMap, setServiceStatsMap] = useState<ServiceStats | null>(
    null,
  );
  const [vehicleStats, setVehicleStats] = useState<
    Record<string, VehicleStats>
  >({});

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      try {
        if (!supabase.auth)
          throw new Error("Supabase client is not initialized");

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.error("Session error:", sessionError);
          return null;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          console.error("Get user error:", error);
          return null;
        }

        return data.user;
      } catch (error) {
        console.error("Failed to get user:", error);
        return null;
      }
    };

    const checkAuth = async () => {
      try {
        const fetchedUser = await getUser();
        if (isMounted) {
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        if (isMounted) {
          setError("Authentication failed. Please try again.");
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchVehicleData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setVehiclesLoading(true);
      setServicesLoading(true);
      setError(null);

      const vehiclesData = await getVehicles();

      setVehicles(vehiclesData);

      // Fetch service data for all vehicles efficiently
      const vehicleStatsObject: Record<string, VehicleStats> = {};
      let totalCost = 0;
      let totalServiceCount = 0;

      // Use Promise.all to fetch all vehicle services in parallel
      const servicesPromises = vehiclesData.map((vehicle) =>
        getVehicleServices(vehicle.id),
      );
      const allVehicleServices = await Promise.all(servicesPromises);

      // Process the results
      vehiclesData.forEach((vehicle, index) => {
        const services = allVehicleServices[index];
        const vehicleTotalCost = services.reduce(
          (sum, service) => sum + service.cost,
          0,
        );
        const vehicleServiceCount = services.length;

        vehicleStatsObject[vehicle.id] = {
          vehicleTotalCost,
          vehicleServiceCount,
        };

        totalCost += vehicleTotalCost;
        totalServiceCount += vehicleServiceCount;
      });

      setServiceStatsMap({
        totalServicesCost: totalCost,
        totalServices: totalServiceCount,
      });
      setServicesLoading(false);

      setVehicleStats(vehicleStatsObject);
      if (vehiclesData.length > 0) {
        setSelectedVehicle(vehiclesData[0]);
      } else {
        setSelectedVehicle(null);
      }
      setVehiclesLoading(false);

      return true;
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (error instanceof Error && error.name === "NetworkError") {
        setError("Network error. Please check your internet connection.");
      } else if (error instanceof Error && error.name === "AuthError") {
        setError("Authentication error. Please log in again.");
        router.push("/auth");
      } else {
        setError(
          `Failed to load data: ${(error as Error)?.message || "Unknown error"}`,
        );
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, [user]); // State setters are stable and don't need to be dependencies

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (isMounted) {
        await fetchVehicleData();
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicle = vehicles.find((v) => v.id === e.target.value) || null;
    setSelectedVehicle(vehicle);
  };

  const refreshData = useCallback(async () => {
    await fetchVehicleData();
  }, [fetchVehicleData]);

  if (error)
    return (
      <div className="text-center mt-10">
        <p className="text-error mb-4">{error}</p>
        <button
          onClick={refreshData}
          aria-label="Refresh data"
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          <RefreshCwIcon className="w-5 h-5" />
          Refresh
        </button>
      </div>
    );

  if (loading && !user)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );

  if (!loading && !user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary">
        <h1 className="text-center text-3xl font-bold mb-2">
          Welcome to Corso Connect!
        </h1>
        <Image
          src="/images/Corso_Connect_Logo.png"
          alt="Corso Connect Logo"
          width="500"
          height="500"
          className="mb-2"
        />

        <h2 className="text-center text-xl font-semibold mb-4">
          Your car&apos;s history and data, connected.
        </h2>
        <p className="text-center mb-6">
          Corso Connect is your go-to platform for monitoring your cars
          maintenance history, services, and data.
        </p>
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition"
          onClick={() => (window.location.href = "/auth")}
        >
          Get Started
        </button>
      </div>
    );

  return (
    <Layout>
      <div className="bg-white p-6 shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Dashboard</h1>
            <p className="text-neutral-800 mt-2">Welcome, {user?.email} 👋</p>
          </div>
          {/* Quick Actions */}
          <div className="flex gap-4 mt-6">
            <Link
              href="/vehicles"
              className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
            >
              <EyeIcon className="w-4 h-4 mr-1" aria-label="View Vehicles" />{" "}
              View Vehicles
            </Link>
            <Link
              href="/vehicles/add"
              className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" aria-label="Add Vehicle" /> Add
              Vehicle
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        {!servicesLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
              <CarIcon className="w-6 h-6 mb-2" aria-label="Total Vehicles" />
              <p className="text-xl font-bold">{vehicles.length}</p>
              <p className="text-background">Total Vehicles</p>
            </div>
            <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
              <DollarSignIcon
                className="w-6 h-6 mb-2"
                aria-label="Total Service Cost"
              />
              <p className="text-xl font-bold">
                ${serviceStatsMap?.totalServicesCost.toFixed(2)}
              </p>
              <p className="text-background">Total Service Cost</p>
            </div>
            <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
              <WrenchIcon
                className="w-6 h-6 mb-2"
                aria-label="Total Services"
              />
              <p className="text-xl font-bold">
                {serviceStatsMap?.totalServices}
              </p>
              <p className="text-background">Total Services</p>
            </div>
          </div>
        )}

        {/* Vehicle Selection */}
        {!vehiclesLoading && (
          <div className="mt-4">
            <label className="block text-lg font-bold text-neutral-800 mb-2">
              Select Vehicle:
            </label>
            {vehicles.length === 0 ? (
              <p className="text-neutral-500 italic">
                No vehicles available. Add a vehicle to get started.
              </p>
            ) : (
              <select
                id="vehicle-select"
                value={selectedVehicle?.id || ""}
                onChange={handleVehicleChange}
                className="border border-neutral-400 p-2 w-full rounded-md bg-background text-neutral-800"
                aria-label="Select a vehicle"
              >
                <option value=""> Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year}) -{" "}
                    {vehicle.nickname}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {!vehiclesLoading && selectedVehicle && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
                <DollarSignIcon
                  className="w-6 h-6 mb-2"
                  aria-label="Total Service Cost"
                />
                <p className="text-xl font-bold">
                  $
                  {vehicleStats[selectedVehicle.id]
                    ? vehicleStats[
                        selectedVehicle.id
                      ]?.vehicleTotalCost.toFixed(2)
                    : "0.00"}
                </p>
                <p className="text-background">Total Service Cost</p>
              </div>
              <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
                <WrenchIcon
                  className="w-6 h-6 mb-2"
                  aria-label="Total Services"
                />
                <p className="text-xl font-bold">
                  {vehicleStats[selectedVehicle.id]
                    ? vehicleStats[selectedVehicle.id]?.vehicleServiceCount
                    : 0}
                </p>
                <p className="text-background">Total Services</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
