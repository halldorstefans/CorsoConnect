import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";
import {
  CarIcon,
  DollarSignIcon,
  EyeIcon,
  PlusIcon,
  WrenchIcon,
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  getTotalServiceStats,
  getVehicles,
  getVehicleServices,
} from "@/utils/db";
import { createClient } from "@/utils/supabase/component";
import { Vehicle } from "@/types/vehicle";

interface VehicleStats {
  totalCost: number;
  totalServices: number;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleStatsMap, setVehicleStatsMap] = useState<
    Map<string, VehicleStats>
  >(new Map());
  const [totalServiceCost, setTotalServiceCost] = useState<number>(0);
  const [totalServices, setTotalServices] = useState<number>(0);

  const getTotalServiceCostPerVehicle = async (vehicleId: string) => {
    const services = await getVehicleServices(vehicleId);
    return services.reduce((total, service) => total + service.cost, 0);
  };

  const getTotalServicesPerVehicle = async (vehicleId: string) => {
    const services = await getVehicleServices(vehicleId);
    return services.length;
  };

  useEffect(() => {
    const fetchData = async () => {
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
        const fetchedUser = await getUser();

        setUser(fetchedUser);
      };

      try {
        checkAuth();

        const vehiclesData = await getVehicles();
        const { totalServiceCost, totalServices } =
          await getTotalServiceStats();
        setTotalServiceCost(totalServiceCost);
        setTotalServices(totalServices);

        // Store stats for each vehicle in a Map
        const vehicleStatsMap = new Map();
        for (const vehicle of vehiclesData) {
          const totalCost = await getTotalServiceCostPerVehicle(vehicle.id);
          const totalServices = await getTotalServicesPerVehicle(vehicle.id);
          vehicleStatsMap.set(vehicle.id, { totalCost, totalServices });
        }
        setVehicleStatsMap(vehicleStatsMap);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(
          "Failed to load data. Please check your internet connection and try again. Error: " +
            error,
        );
        if (!user) {
          router.push("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, user, supabase.auth]);

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const vehicleId = e.target.value;
      const vehicle = vehicles.find((v) => v.id === vehicleId) || null;
      setSelectedVehicle(vehicle);
    } catch (error) {
      console.error("Failed to change vehicle:", error);
      setError("Failed to change vehicle. Please try again.");
    }
  };

  if (error) return <p className="text-center text-error mt-10">{error}</p>;

  if (loading)
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
              <EyeIcon className="w-4 h-4 mr-1" /> View Vehicles
            </Link>
            <Link
              href="/vehicles/add"
              className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Add Vehicle
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
            <CarIcon className="w-6 h-6 mb-2" />
            <p className="text-xl font-bold">{vehicles.length}</p>
            <p className="text-background">Total Vehicles</p>
          </div>
          <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
            <DollarSignIcon className="w-6 h-6 mb-2" />
            <p className="text-xl font-bold">${totalServiceCost.toFixed(2)}</p>
            <p className="text-background">Total Service Cost</p>
          </div>
          <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
            <WrenchIcon className="w-6 h-6 mb-2" />
            <p className="text-xl font-bold">{totalServices}</p>
            <p className="text-background">Total Services</p>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="mt-4">
          <label className="block text-lg font-bold text-neutral-800 mb-2">
            Select Vehicle:
          </label>
          <select
            onChange={handleVehicleChange}
            className="border border-neutral-400 p-2 w-full rounded-md bg-background text-neutral-800"
          >
            <option value=""> Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.year}) -{" "}
                {vehicle.nickname}
              </option>
            ))}
          </select>
        </div>

        {selectedVehicle && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
                <DollarSignIcon className="w-6 h-6 mb-2" />
                <p className="text-xl font-bold">
                  $
                  {vehicleStatsMap
                    .get(selectedVehicle.id)
                    ?.totalCost.toFixed(2)}
                </p>
                <p className="text-background">Total Service Cost</p>
              </div>
              <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
                <WrenchIcon className="w-6 h-6 mb-2" />
                <p className="text-xl font-bold">
                  {vehicleStatsMap.get(selectedVehicle.id)?.totalServices}
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
