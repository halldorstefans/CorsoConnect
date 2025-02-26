import { useState } from "react";
import { Service } from "@/types/service";

interface ServiceFormProps {
  service?: Service;
  onSave: (service: Service) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave }) => {
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

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    onSave(formData);
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
      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Date:
        </label>
        <input
          type="date"
          name="date"
          value={new Date(formData.date).toISOString().split("T")[0]}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Description:
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Cost:
        </label>
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          className="border border-neutral-600 p-2 w-full rounded-md bg-background-card text-neutral-800"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-background-card w-full my-4 rounded-lg hover:bg-primary-hover transition"
      >
        {service ? "Save Service" : "Add Service"}
      </button>
    </form>
  );
};

export default ServiceForm;
