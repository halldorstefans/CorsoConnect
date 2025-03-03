import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles } from "@/contexts/VehicleContext";
import { Wrench } from "lucide-react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Layout from "@/components/Layout";
import ServiceHistory from "@/components/ServiceList";
import VehicleForm from "@/components/VehicleForm";

const VehicleDetails = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    selectedVehicle,
    services,
    vehicleLoading,
    servicesLoading,
    error,
    fetchVehicle,
    fetchServices,
    clearError,
  } = useVehicles();

  const { id } = router.query;
  const [showForm, setShowForm] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Memoize the fetch conditions to prevent unnecessary re-renders
  const shouldFetchData = useCallback(() => {
    if (!id || typeof id !== "string" || !user || initialLoadDone) return false;

    const shouldFetchVehicle = !selectedVehicle || selectedVehicle.id !== id;
    const shouldFetchServices =
      !services.length || services[0].vehicle_id !== id;

    return { shouldFetchVehicle, shouldFetchServices };
  }, [id, user, initialLoadDone, selectedVehicle, services]);

  useEffect(() => {
    const fetchConditions = shouldFetchData();

    if (fetchConditions) {
      if (fetchConditions.shouldFetchVehicle) {
        fetchVehicle(id as string);
      }

      if (fetchConditions.shouldFetchServices) {
        fetchServices(id as string);
      }

      setInitialLoadDone(true);
    }
  }, [id, user, shouldFetchData, fetchVehicle, fetchServices]);

  // Reset initialLoadDone when id changes
  useEffect(() => {
    setInitialLoadDone(false);
  }, [id]);

  const handleSave = () => {
    if (id && typeof id === "string") {
      fetchVehicle(id);
      fetchServices(id);
      setShowForm(false);
    }
  };

  if (error) {
    return (
      <Layout title="Vehicle Details" requireAuth>
        <ErrorDisplay
          message={error}
          details="There was a problem loading the vehicle details."
          onRetry={() => {
            clearError();
            if (id && typeof id === "string") {
              fetchVehicle(id);
              fetchServices(id);
            }
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout
      title={
        selectedVehicle
          ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
          : "Vehicle Details"
      }
      requireAuth
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-800">
          {selectedVehicle
            ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
            : "Vehicle Details"}
        </h1>
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            href="/vehicles"
            className="text-primary hover:underline"
            aria-label="Back to Vehicles"
          >
            ← Back to Vehicles
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-background-card p-6 rounded-lg shadow-lg">
          {vehicleLoading && !selectedVehicle ? (
            <div
              className="flex justify-center items-center h-64"
              role="status"
              aria-live="polite"
            >
              <div
                className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"
                aria-hidden="true"
              ></div>
              <span className="sr-only">Loading vehicle details...</span>
            </div>
          ) : !selectedVehicle ? (
            <p className="text-center text-neutral-600">Vehicle not found.</p>
          ) : (
            <div>
              {!showForm ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        License Plate:
                      </label>
                      <p className="text-neutral-600">
                        {selectedVehicle.registration_number}
                      </p>
                    </div>
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        VIN:
                      </label>
                      <p className="text-neutral-600">{selectedVehicle.vin}</p>
                    </div>
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        Purchase Date:
                      </label>
                      <p className="text-neutral-600">
                        {selectedVehicle.purchase_date
                          ? new Date(
                              selectedVehicle.purchase_date,
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        Purchase Price:
                      </label>
                      <p className="text-neutral-600">
                        ${selectedVehicle.purchase_price?.toFixed(2) || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        Odometer:
                      </label>
                      <p className="text-neutral-600">
                        {selectedVehicle.odometer_reading}{" "}
                        {selectedVehicle.odometer_unit || "miles"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() => setShowForm(true)}
                      disabled={vehicleLoading || showForm}
                      className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
                      aria-label="Edit vehicle details"
                    >
                      <Wrench className="w-4 h-4 mr-1" aria-hidden="true" />{" "}
                      Edit Vehicle
                    </button>
                  </div>
                </div>
              ) : (
                user && (
                <VehicleForm
                  vehicle={selectedVehicle}
                  userId={user.id}
                  onSave={handleSave}
                  onCancel={() => setShowForm(false)}
                />
                )
              )}
            </div>
          )}
        </div>

        {/* Show a loading indicator for services that doesn't replace content */}
        {servicesLoading && initialLoadDone && (
          <div className="text-center py-4" role="status" aria-live="polite">
            <div
              className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-primary"
              aria-hidden="true"
            ></div>
            <span className="ml-2">Updating services...</span>
          </div>
        )}

        {selectedVehicle && user && (
          <ServiceHistory
            userId={user.id}
            vehicle={selectedVehicle}
            services={services}
            onSave={handleSave}
          />
        )}
      </div>
    </Layout>
  );
};

export default VehicleDetails;
