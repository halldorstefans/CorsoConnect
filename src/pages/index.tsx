import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles } from "@/contexts/VehicleContext";
import {
  CarIcon,
  DollarSignIcon,
  EyeIcon,
  PlusIcon,
  WrenchIcon,
} from "lucide-react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Layout from "@/components/Layout";

export default function Home() {
  const { user } = useAuth();
  const {
    vehicles,
    selectedVehicle,
    vehicleStats,
    serviceStats,
    loading,
    error,
    fetchVehicles,
    setSelectedVehicle,
  } = useVehicles();

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicle = vehicles.find((v) => v.id === e.target.value) || null;
    setSelectedVehicle(vehicle);
  };

  if (error) {
    return (
      <Layout>
        <ErrorDisplay message={error} onRetry={fetchVehicles} />
      </Layout>
    );
  }

  if (loading && !user)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );

  // If not logged in, show welcome screen
  if (!loading && !user)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-4xl font-bold mb-4 text-neutral-800">
          Welcome to Corso Connect
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

        {/* Overall Stats */}
        {!loading && serviceStats && (
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
                ${serviceStats.totalServicesCost.toFixed(2)}
              </p>
              <p className="text-background">Total Service Cost</p>
            </div>
            <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
              <WrenchIcon
                className="w-6 h-6 mb-2"
                aria-label="Total Services"
              />
              <p className="text-xl font-bold">{serviceStats.totalServices}</p>
              <p className="text-background">Total Services</p>
            </div>
          </div>
        )}

        {/* Vehicle Selection */}
        {!loading && selectedVehicle && (
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

        {!loading && selectedVehicle && (
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
