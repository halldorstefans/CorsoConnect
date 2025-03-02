import { useState } from "react";
import { useVehicles } from "@/contexts/VehicleContext";
import { Trash2, Wrench } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { formatDate } from "@/utils/dateUtils";
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
  const { saveServiceData, removeService, servicesLoading } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddService = async (service: Service) => {
    if (!vehicle) return;
    try {
      setIsSubmitting(true);

      if (!service.id) {
        service.id = uuidv4();
        service.vehicle_id = vehicle.id;
        service.user_id = userId;
      }

      await saveServiceData(service);
      onSave();
      setShowForm(false);
      setService(null);
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = (service: Service) => {
    setService(service);
    setShowForm(true);
  };

  const openModal = (id: string) => {
    setServiceIdToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setServiceIdToDelete(null);
  };

  const confirmDelete = async () => {
    if (serviceIdToDelete) {
      setIsSubmitting(true);
      try {
        await removeService(serviceIdToDelete);
        onSave();
      } finally {
        setIsSubmitting(false);
        closeModal();
      }
    }
  };

  return (
    <div className="mt-6 bg-background-card p-6 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 text-center md:text-left">
          Service History
        </h2>
        <button
          onClick={() => {
            setService(null);
            setShowForm(true);
          }}
          className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
          disabled={isSubmitting || servicesLoading}
        >
          <Wrench className="w-4 h-4 mr-1" /> Add Service
        </button>
      </div>

      {showForm ? (
        <ServiceForm service={service || undefined} onSave={handleAddService} />
      ) : (
        <>
          {servicesLoading && (
            <div className="text-center py-4">
              <div className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-primary"></div>
              <span className="ml-2">Loading services...</span>
            </div>
          )}

          {!servicesLoading && services.length === 0 ? (
            <p className="text-neutral-600 text-center py-4">
              No service records found for this vehicle.
            </p>
          ) : (
            <div className="space-y-4">
              {services
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((service) => (
                  <div
                    key={service.id}
                    className="border border-neutral-300 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-neutral-800">
                          {service.description}
                        </h3>
                        <div className="text-sm text-neutral-600">
                          {formatDate(service.date)} | {service.service_type} |
                          ${service.cost.toFixed(2)}
                        </div>
                        {service.odometer_reading &&
                          service.odometer_reading > 0 && (
                            <div className="text-sm text-neutral-600">
                              Odometer: {service.odometer_reading}{" "}
                              {vehicle.odometer_unit || "miles"}
                            </div>
                          )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-primary hover:text-primary-hover"
                          disabled={isSubmitting || servicesLoading}
                        >
                          <Wrench className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => openModal(service.id)}
                          className="text-error hover:text-red-700"
                          disabled={isSubmitting || servicesLoading}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this service record?</p>
      </Modal>
    </div>
  );
};

export default ServiceHistory;
