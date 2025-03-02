import { useState } from "react";
import { useForm } from "react-hook-form";
import { getInputClassName, validationRules } from "@/utils/validation";
import { Service } from "@/types/service";

interface ServiceFormProps {
  service?: Service;
  onSave: (service: Service) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave }) => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Service>({
    defaultValues: service || {
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
  });

  const onSubmit = (data: Service) => {
    setError(null);
    try {
      onSave(data);
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Date:
        </label>
        <input
          type="date"
          className={getInputClassName(errors.date)}
          {...register("date", validationRules.service.date)}
        />
        {errors.date && (
          <p className="text-error text-sm">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Description:
        </label>
        <textarea
          className={getInputClassName(errors.description)}
          {...register("description", validationRules.service.description)}
        />
        {errors.description && (
          <p className="text-error text-sm">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Cost:
        </label>
        <input
          type="number"
          step="0.01"
          className={getInputClassName(errors.cost)}
          {...register("cost", validationRules.service.cost)}
        />
        {errors.cost && (
          <p className="text-error text-sm">{errors.cost.message}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Service Type:
        </label>
        <select
          className={getInputClassName(errors.service_type)}
          {...register("service_type", validationRules.service.service_type)}
        >
          <option value="maintenance">Maintenance</option>
          <option value="repair">Repair</option>
          <option value="restoration">Restoration</option>
          <option value="modification">Modification</option>
        </select>
        {errors.service_type && (
          <p className="text-error text-sm">{errors.service_type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-lg font-bold text-neutral-800">
          Odometer Reading:
        </label>
        <input
          type="number"
          className={`border p-2 w-full rounded-md bg-background-card text-neutral-800 ${errors.odometer_reading ? "border-error" : "border-neutral-600"}`}
          {...register(
            "odometer_reading",
            validationRules.service.odometer_reading,
          )}
        />
        {errors.odometer_reading && (
          <p className="text-error text-sm">
            {errors.odometer_reading.message}
          </p>
        )}
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
