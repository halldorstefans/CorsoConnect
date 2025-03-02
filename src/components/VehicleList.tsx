import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Trash2 } from "lucide-react";
import { deleteVehicle, getVehicles } from "@/utils/db";
import { AuthError, DatabaseError, NetworkError } from "@/types/errors";
import { Vehicle } from "@/types/vehicle";
import ErrorDisplay from "./ErrorDisplay";
import Modal from "./Modal";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      if (err instanceof NetworkError) {
        setError(
          "Network connection issue. Please check your internet connection.",
        );
      } else if (err instanceof AuthError) {
        setError("Authentication error. Please sign in again.");
      } else if (err instanceof DatabaseError) {
        setError("Failed to load vehicles. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle(id);
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      if (err instanceof NetworkError) {
        setError(
          "Network connection issue. Vehicle will be deleted when you're back online.",
        );
      } else if (err instanceof AuthError) {
        setError("Authentication error. Please sign in again.");
      } else {
        setError("Failed to delete vehicle. Please try again.");
      }
    }
  };

  const openModal = (id: string) => {
    setVehicleToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setVehicleToDelete(null);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      handleDelete(vehicleToDelete);
      closeModal();
    } else {
      console.error("No vehicle selected");
    }
  };

  return (
    <div className="max-w-auto mx-auto">
      {error ? (
        <ErrorDisplay message={error} onRetry={fetchVehicles} />
      ) : loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : vehicles.length === 0 ? (
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
