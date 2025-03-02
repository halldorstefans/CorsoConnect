import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles } from "@/contexts/VehicleContext";
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

  useEffect(() => {
    if (id && typeof id === "string" && user) {
      if (!selectedVehicle || selectedVehicle.id !== id) {
        fetchVehicle(id);
      }

      if (
        services.length === 0 ||
        (services.length > 0 && services[0].vehicle_id !== id)
      ) {
        fetchServices(id);
      }

      setInitialLoadDone(true);
    }
  }, [id, user, selectedVehicle, services, fetchVehicle, fetchServices]);

  const handleSave = () => {
    setShowForm(false);
    if (id && typeof id === "string") {
      fetchVehicle(id);
      fetchServices(id);
    }
  };

  if ((vehicleLoading || servicesLoading) && !initialLoadDone) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorDisplay
          message={error}
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
    <Layout>
      <div>
        <div className="bg-background-card p-6 shadow-lg rounded-lg">
          {selectedVehicle && !showForm && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-neutral-800 text-center md:text-left">
                  Vehicle Details
                </h1>
                <Link href="/vehicles" className="text-primary hover:underline">
                  ← Back to Vehicles
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800">
                    {selectedVehicle.make} {selectedVehicle.model} (
                    {selectedVehicle.year})
                  </h2>
                </div>
                {selectedVehicle.nickname && (
                  <div>
                    <label className="text-lg font-semibold text-neutral-800">
                      Nickname:
                    </label>
                    <p className="text-neutral-600">
                      {selectedVehicle.nickname}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  {selectedVehicle.registration_number && (
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        Registration:
                      </label>
                      <p className="text-neutral-600">
                        {selectedVehicle.registration_number}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  {selectedVehicle.vin && (
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        VIN:
                      </label>
                      <p className="text-neutral-600">{selectedVehicle.vin}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  {selectedVehicle.colour && (
                    <div>
                      <label className="text-lg font-semibold text-neutral-800">
                        Color:
                      </label>
                      <p className="text-neutral-600">
                        {selectedVehicle.colour}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  {selectedVehicle.purchase_price !== undefined &&
                    selectedVehicle.purchase_price !== null &&
                    selectedVehicle.purchase_price !== 0 && (
                      <div>
                        <label className="text-lg font-semibold text-neutral-800">
                          Purchase Price:
                        </label>
                        <p className="text-neutral-600">
                          ${selectedVehicle.purchase_price.toFixed(2)}
                        </p>
                      </div>
                    )}
                </div>
                <div className="flex justify-between">
                  {selectedVehicle.odometer_reading !== undefined &&
                    selectedVehicle.odometer_reading !== null &&
                    selectedVehicle.odometer_reading !== 0 && (
                      <div>
                        <label className="text-lg font-semibold text-neutral-800">
                          Odometer:
                        </label>
                        <p className="text-neutral-600">
                          {selectedVehicle.odometer_reading}{" "}
                          {selectedVehicle.odometer_unit || "miles"}
                        </p>
                      </div>
                    )}
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary text-background w-full my-4 rounded-lg hover:bg-primary-hover transition p-2"
              >
                Edit Vehicle
              </button>
            </div>
          )}
          {showForm && selectedVehicle && user && (
            <VehicleForm
              vehicle={selectedVehicle}
              userId={user.id}
              onSave={handleSave}
            />
          )}
        </div>

        {servicesLoading && initialLoadDone && (
          <div className="text-center py-4">
            <div className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-primary"></div>
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
