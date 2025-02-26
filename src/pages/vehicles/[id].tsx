import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import ServiceHistory from "@/components/ServiceList";
import VehicleForm from "@/components/VehicleForm";
import { getVehicle, getVehicleServices } from "@/utils/db";
import { createClient } from "@/utils/supabase/component";
import { Service } from "@/types/service";
import { Vehicle } from "@/types/vehicle";

const VehicleDetails = () => {
  const router = useRouter();
  const supabase = createClient();

  const { id } = router.query;
  const [userId, setUserId] = useState<string>("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error("Get user error:", error);
        setError("Failed to load user. Please try again.");
      }
      if (data.user) {
        setUserId(data.user.id);
      } else {
        router.push("/auth");
      }
      const fetchedVehicle = await getVehicle(id as string);
      if (fetchedVehicle) {
        setVehicle(fetchedVehicle);
        const fetchedVehicleServices = await getVehicleServices(
          fetchedVehicle.id,
        );
        if (fetchedVehicleServices) {
          setServices(fetchedVehicleServices);
        } else {
          setError("Services not found.");
        }
      } else {
        setError("Vehicle not found.");
      }
    } catch (err) {
      console.error("Error fetching vehicle:", err);
      setError("Failed to load vehicle details. Please try again.");
    } finally {
    }
  }, [id, router, supabase.auth]);

  const handleSave = async () => {
    fetchVehicle();
    setShowForm(false);
  };

  useEffect(() => {
    if (typeof id === "string") {
      fetchVehicle();
    }
  }, [id, fetchVehicle]);

  if (error)
    return (
      <div className="text-center text-error mt-10">
        <p>{error}</p>
        <p className="text-sm text-neutral-600">
          Failed to load data. Please check your network connection or try again
          later.
        </p>
        <button
          onClick={fetchVehicle}
          className="mt-2 px-4 py-2 bg-error text-neutral-600 rounded hover:bg-warning transition"
        >
          Retry
        </button>
      </div>
    );

  return (
    <Layout>
      <div>
        <div className="bg-background-card p-6 shadow-lg rounded-lg">
          {vehicle && !showForm && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-neutral-800 text-center md:text-left">
                  Vehicle Details
                </h1>
                <Link href="/vehicles" className="text-primary hover:underline">
                  ← Back to Vehicles
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Nickname", vehicle.nickname],
                  ["Make", vehicle.make],
                  ["Model", vehicle.model],
                  ["Year", vehicle.year],
                  ["VIN", vehicle.vin],
                  ["Colour", vehicle.colour],
                  ["Registration Number", vehicle.registration_number],
                  ["Purchase Date", vehicle.purchase_date],
                  [
                    "Purchase Price",
                    `${vehicle.purchase_price?.toLocaleString()}`,
                  ],
                  [
                    "Odometer Reading",
                    `${vehicle.odometer_reading} ${vehicle.odometer_unit}`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={
                      label instanceof Date ? label.toLocaleDateString() : label
                    }
                    className="space-y-2"
                  >
                    <label className="text-lg font-bold text-neutral-800">
                      {label instanceof Date
                        ? label.toLocaleDateString()
                        : label}
                    </label>
                    <p className="w-full rounded-md text-neutral-800">
                      {value instanceof Date
                        ? value.toLocaleDateString()
                        : value}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary-hover w-full my-4 rounded-lg text-background transition"
              >
                Edit Vehicle
              </button>
            </div>
          )}
          {showForm && vehicle && (
            <VehicleForm
              vehicle={vehicle}
              userId={userId}
              onSave={handleSave}
            />
          )}
        </div>
        {vehicle && (
          <>
            <ServiceHistory
              userId={userId}
              vehicle={vehicle}
              services={services}
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default VehicleDetails;
