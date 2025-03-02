import { useState } from "react";
import Link from "next/link";
import { useVehicles } from "@/contexts/VehicleContext";
import { Car, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import ErrorDisplay from "./ErrorDisplay";
import Modal from "./Modal";

const VehicleList = () => {
  const { vehicles, loading, error, removeVehicle, fetchVehicles } =
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
    } else {
      console.error("No vehicle selected");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchVehicles} />;
  }

  return (
    <div className="max-w-auto mx-auto">
      {vehicles.length === 0 ? (
        <p className="text-neutral-800 text-center">No vehicles found.</p>
      ) : (
        <ul className="space-y-2">
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="bg-background shadow-md p-4 rounded-lg flex flex-col border border-neutral-600 text-neutral-800"
            >
              <h3 className="text-lg font-semibold text-neutral-800">
                {vehicle.make} {vehicle.model} ({vehicle.year}) :{" "}
                {vehicle.nickname}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <p className="text-neutral-800 text-sm">
                  <strong>Registration number:</strong>{" "}
                  {vehicle.registration_number}
                </p>
                {vehicle.purchase_date && (
                  <p className="text-sm text-neutral-600">
                    Purchased: {formatDate(vehicle.purchase_date)}
                  </p>
                )}
                <div className="flex justify-end items-center">
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="text-primary hover:text-primary-hover flex items-center px-2"
                  >
                    <Car className="w-4 h-4 mr-1" /> See Details
                  </Link>
                  <button
                    onClick={() => openModal(vehicle.id)}
                    className="text-error hover:text-red-700 flex items-center px-2"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
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
      </Modal>
    </div>
  );
};

export default VehicleList;
