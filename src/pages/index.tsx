import { useEffect } from "react";
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
    clearError,
  } = useVehicles();

  useEffect(() => {
    if (user && vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [user, vehicles, selectedVehicle, setSelectedVehicle]);

  if (error) {
    return (
      <Layout>
        <ErrorDisplay
          message={error}
          details="There was a problem loading your data."
          onRetry={() => {
            clearError();
            fetchVehicles(true);
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {!user ? (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              Welcome to Corso Connect
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Track your vehicle maintenance, service history, and expenses all
              in one place.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                href="/auth"
                className="bg-primary text-background px-6 py-3 rounded-lg hover:bg-primary-hover transition text-lg font-semibold"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="bg-neutral-200 text-neutral-800 px-6 py-3 rounded-lg hover:bg-neutral-300 transition text-lg font-semibold"
              >
                Learn More
              </a>
            </div>
            <div className="relative h-64 sm:h-96 rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/Corso_Connect_Logo.jpg"
                alt="Car maintenance"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        ) : loading ? (
          <div
            className="flex justify-center items-center h-64"
            role="status"
            aria-live="polite"
          >
            <div
              className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"
              aria-hidden="true"
            ></div>
            <span className="sr-only">Loading dashboard...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-10 bg-background-card rounded-lg shadow-md">
            <CarIcon
              className="w-16 h-16 mx-auto text-neutral-400"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold text-neutral-800 mt-4">
              No Vehicles Yet
            </h2>
            <p className="text-neutral-600 mt-2">
              Add your first vehicle to start tracking maintenance and service
              history.
            </p>
            <Link
              href="/vehicles/new"
              className="inline-block mt-4 bg-primary text-background px-6 py-2 rounded-lg hover:bg-primary-hover transition"
            >
              Add Your First Vehicle
            </Link>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-neutral-800">
                  Dashboard
                </h1>
                <div className="hidden md:flex space-x-6 items-center">
                  <Link
                    href="/vehicles/new"
                    className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
                    aria-label="Add a new vehicle"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" aria-hidden="true" /> Add
                    Vehicle
                  </Link>
                  <Link
                    href="/vehicles"
                    className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg hover:bg-neutral-300 transition flex items-center"
                    aria-label="View all vehicles"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" aria-hidden="true" /> View
                    All Vehicles
                  </Link>
                </div>
              </div>
              <div className="bg-background-card p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  Overall Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-primary p-4 rounded-lg text-center text-background flex flex-col items-center">
                    <CarIcon
                      className="w-6 h-6 mb-2"
                      aria-hidden="true"
                      aria-label="Total Vehicles"
                    />
                    <p className="text-xl font-bold">{vehicles.length}</p>
                    <p className="text-background">Total Vehicles</p>
                  </div>
                  <div className="bg-amber-600 p-4 rounded-lg text-center text-background flex flex-col items-center">
                    <DollarSignIcon
                      className="w-6 h-6 mb-2"
                      aria-hidden="true"
                      aria-label="Total Service Cost"
                    />
                    <p className="text-xl font-bold">
                      ${serviceStats?.totalServicesCost.toFixed(2)}
                    </p>
                    <p className="text-background">Total Service Cost</p>
                  </div>
                  <div className="bg-green-700 p-4 rounded-lg text-center text-background flex flex-col items-center">
                    <WrenchIcon
                      className="w-6 h-6 mb-2"
                      aria-hidden="true"
                      aria-label="Total Services"
                    />
                    <p className="text-xl font-bold">
                      {serviceStats?.totalServices}
                    </p>
                    <p className="text-background">Total Services</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-card p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  Vehicle Stats:
                </h2>
                <div className="flex flex-wrap gap-4 mb-6 px-2">
                  <select
                    value={selectedVehicle?.id || ""}
                    onChange={(e) => {
                      const vehicle = vehicles.find(
                        (v) => v.id === e.target.value,
                      );
                      if (vehicle) {
                        setSelectedVehicle(vehicle);
                      }
                    }}
                    className="border border-neutral-300 rounded-md p-2 bg-background text-neutral-800"
                    aria-label="Select vehicle"
                  >
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-amber-600 p-4 rounded-lg text-center text-background flex flex-col items-center">
                  <DollarSignIcon
                    className="w-6 h-6 mb-2"
                    aria-hidden="true"
                    aria-label="Total Service Cost"
                  />
                  <p className="text-xl font-bold">
                    $
                    {selectedVehicle && vehicleStats[selectedVehicle.id]
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
                    aria-hidden="true"
                    aria-label="Total Services"
                  />
                  <p className="text-xl font-bold">
                    {selectedVehicle && vehicleStats[selectedVehicle.id]
                      ? vehicleStats[selectedVehicle.id]?.vehicleServiceCount
                      : 0}
                  </p>
                  <p className="text-background">Total Services</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
