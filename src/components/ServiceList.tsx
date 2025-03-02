import { useState } from "react";
import { Trash2, Wrench } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { formatDate } from "@/utils/dateUtils";
import { deleteService, saveService } from "@/utils/db";
import { Service } from "@/types/service";
import { Vehicle } from "@/types/vehicle";
import Modal from "./Modal";
import ServiceForm from "./ServiceForm";

interface ServiceHistoryProps {
  userId: string;
  vehicle: Vehicle;
  services: Service[];
  onSave: () => void;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({
  userId,
  vehicle,
  services,
  onSave,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(
    null,
  );

  const handleAddService = async (service: Service) => {
    if (!vehicle) return;
    try {
      if (!service.id) {
        service.id = uuidv4();
        service.vehicle_id = vehicle.id;
        service.user_id = userId;
      }

      await saveService(service);

      onSave();
      setShowForm(false);
      setService(null);
    } catch (error) {
      console.error("Failed to add service:", error);
    }
  };

  const handleAdd = async (service: Service) => {
    setService(service);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      onSave();
    } catch (error) {
      console.error("Failed to remove service:", error);
    }
  };

  const openModal = (id: string) => {
    setServiceIdToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setServiceIdToDelete(null);
  };

  const confirmDelete = () => {
    if (serviceIdToDelete) {
      handleDelete(serviceIdToDelete);
      closeModal();
    }
  };

  return (
    <div className="bg-background-card p-6 mt-4 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 text-center md:text-left">
          Service History
        </h2>
        {showForm ? (
          <button
            onClick={() => setShowForm(false)}
            className="text-primary hover:underline"
          >
            ← Back to Service
          </button>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-background rounded-lg hover:bg-primary-hover transition"
          >
            + Add Service
          </button>
        )}
      </div>
      {showForm && service ? (
        <ServiceForm service={service} onSave={handleAddService} />
      ) : showForm && !service ? (
        <ServiceForm onSave={handleAddService} />
      ) : services.length === 0 ? (
        <p className="text-neutral-800">No service history available.</p>
      ) : (
        <ul className="space-y-2">
          {services
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((service) => (
              <li
                key={service.id}
                className="bg-background shadow-md p-4 rounded-lg flex flex-col border border-neutral-600 text-neutral-800"
              >
                <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
                  {service.description.substring(0, 30)}
                  {service.description.length > 30 ? <span>...</span> : null}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <p>
                    <strong>Date:</strong> {formatDate(service.date)}
                  </p>
                  <p>
                    <strong>Cost:</strong> ${service.cost.toFixed(2)}
                  </p>
                  <div className="flex justify-end items-center">
                    <button
                      onClick={() => handleAdd(service)}
                      className="text-primary hover:underline flex items-center px-2"
                    >
                      <Wrench className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => openModal(service.id)}
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
        <p>Are you sure you want to delete this service?</p>
      </Modal>
    </div>
  );
};

export default ServiceHistory;
