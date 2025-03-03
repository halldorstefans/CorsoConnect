import { useState } from "react";
import Link from "next/link";
import { useVehicles } from "@/contexts/VehicleContext";
import { Car, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { Vehicle } from "@/types/vehicle";
import ErrorDisplay from "./ErrorDisplay";
import Modal from "./Modal";

const VehicleList = () => {
  const { vehicles, loading, error, removeVehicle, fetchVehicles, clearError } =
    useVehicles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const openModal = (id: string) => {
    setVehicleToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setVehicleToDelete(null);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      await removeVehicle(vehicleToDelete);
      closeModal();
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-64"
        role="status"
        aria-live="polite"
      >
        <div
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"
          aria-hidden="true"
        ></div>
        <span className="sr-only">Loading vehicles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        details="There was a problem loading your vehicles."
        onRetry={() => {
          clearError();
          fetchVehicles(true);
        }}
      />
    );
  }

  return (
    <div>
      {vehicles.length === 0 ? (
        <div className="text-center py-10 bg-background-card rounded-lg shadow-md">
          <Car
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
            href="/vehicles/add"
            className="inline-block mt-4 bg-primary text-background px-6 py-2 rounded-lg hover:bg-primary-hover transition"
          >
            Add Your First Vehicle
          </Link>
        </div>
      ) : (
        <ul className="space-y-4" aria-label="Vehicle list">
          {vehicles.map((vehicle: Vehicle) => (
            <li
              key={vehicle.id}
              className="bg-background-card p-4 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-1">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="text-xl font-bold text-primary hover:text-primary-hover transition"
                  >
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Link>
                  <div className="text-neutral-600 mt-1">
                    {vehicle.registration_number && (
                      <span className="mr-4">
                        Registration Number: {vehicle.registration_number}
                      </span>
                    )}
                    {vehicle.purchase_date && (
                      <span>
                        Purchased: {formatDate(vehicle.purchase_date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end items-center space-x-2">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
                    aria-label={`View details for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  >
                    <Car className="w-4 h-4 mr-1" aria-hidden="true" /> Details
                  </Link>
                  <button
                    onClick={() => openModal(vehicle.id)}
                    className="bg-error text-background px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                    aria-label={`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />{" "}
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this vehicle?</p>
        <p className="text-sm text-neutral-600 mt-2">
          This will also delete all service records associated with this
          vehicle.
        </p>
      </Modal>
    </div>
  );
};

export default VehicleList;
