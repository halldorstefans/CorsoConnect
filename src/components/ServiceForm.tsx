import { useState } from "react";
import { Service } from "@/types/service";

interface ServiceFormProps {
  service?: Service;
  onSave: (service: Service) => void;
  onCancel?: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSave,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Service>(
    service || {
      id: "",
      vehicle_id: "",
      date: new Date(),
      description: "",
      cost: 0,
      odometer_reading: 0,
      service_type: "repair",
      updated_at: new Date(),
      created_at: new Date(),
      user_id: "",
    },
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.cost < 0) {
      setError("Please enter a positive number.");
      return;
    }
    setError(null);

    try {
      onSave(formData);
    } catch (err) {
      setError("Failed to save service. Please try again.");
      console.error("Service save error:", err);
    }
  };

  if (error)
    return (
      <div className="text-center text-error mt-10">
        <p>{error}</p>
        <p className="text-sm text-neutral-800">
          Whoa! What happened there? Check your network connection or try again
          later.
        </p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit}>
      <h2
        id="service-form-title"
        className="text-xl font-bold text-neutral-800 mb-4"
      >
        {service ? "Edit Service Record" : "Add Service Record"}
      </h2>

      {error && (
        <p className="text-error" role="alert">
          {error}
        </p>
      )}
      <div>
        <label
          htmlFor="date"
          className="block text-lg font-bold text-neutral-800"
        >
          Date:
        </label>
        <input
          id="date"
          type="date"
          name="date"
          value={new Date(formData.date).toISOString().split("T")[0]}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-lg font-bold text-neutral-800"
        >
          Description:
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <div>
        <label
          htmlFor="cost"
          className="block text-lg font-bold text-neutral-800"
        >
          Cost:
        </label>
        <input
          id="cost"
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <div>
        <label
          htmlFor="service_type"
          className="block text-lg font-bold text-neutral-800"
        >
          Service Type:
        </label>
        <select
          id="service_type"
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        >
          <option value="repair">Repair</option>
          <option value="maintenance">Maintenance</option>
          <option value="restoration">Restoration</option>
          <option value="modification">Modification</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="odometer_reading"
          className="block text-lg font-bold text-neutral-800"
        >
          Odometer Reading:
        </label>
        <input
          id="odometer_reading"
          type="number"
          name="odometer_reading"
          value={formData.odometer_reading}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 p-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover transition flex-1 p-2 rounded-lg text-background-card transition"
        >
          {service ? "Save Service" : "Add Service"}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
