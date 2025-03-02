import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useVehicles } from "@/contexts/VehicleContext";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { getInputClassName, validationRules } from "@/utils/validation";
import {
  AuthError,
  DatabaseError,
  NetworkError,
  ValidationError,
} from "@/types/errors";
import { Vehicle } from "@/types/vehicle";
import ErrorDisplay from "./ErrorDisplay";

interface Props {
  vehicle?: Vehicle;
  userId: string;
  onSave: () => void;
}

const VehicleForm: React.FC<Props> = ({ vehicle, userId, onSave }) => {
  const { saveVehicleData } = useVehicles();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Vehicle>({
    defaultValues: vehicle || {
      id: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      nickname: "",
      vin: "",
      colour: "",
      registration_number: "",
      purchase_price: 0,
      odometer_reading: 0,
      odometer_unit: "miles",
      updated_at: new Date(),
      created_at: new Date(),
      user_id: userId,
    },
  });

  // Format date for the form input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd");
  };

  const onSubmit = async (data: Vehicle) => {
    setIsSubmitting(true);
    try {
      if (!data.id) {
        data.id = uuidv4();
        data.created_at = new Date();
        data.user_id = userId;
      }

      data.updated_at = new Date();

      const success = await saveVehicleData(data);
      if (success) {
        onSave();
      }
    } catch (err) {
      console.error("Failed to save vehicle:", err);
      if (err instanceof NetworkError) {
        setError(
          "Network connection issue. Please check your internet connection.",
        );
      } else if (err instanceof AuthError) {
        setError("Authentication error. Please sign in again.");
      } else if (err instanceof DatabaseError) {
        setError("Failed to save vehicle. Please try again.");
      } else if (err instanceof ValidationError) {
        setError("Invalid vehicle data. Please check your inputs.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        details="There was a problem saving your vehicle data."
        onRetry={() => setError(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 text-center md:text-left">
          {vehicle ? "Edit Vehicle" : "Add Vehicle"}
        </h1>
        <Link href="/vehicles" className="text-primary hover:underline">
          ← Back to Vehicles
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">        

        <div>
          <label
            htmlFor="make"
            className="block text-lg font-bold text-neutral-800"
          >
            Make
          </label>
          <input
            id="make"
            className={getInputClassName(errors.make)}
            placeholder="Make (e.g. Toyota)"
            {...register("make", validationRules.vehicle.make)}
          />
          {errors.make && (
            <p className="text-error text-sm">{errors.make.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="model"
            className="block text-lg font-bold text-neutral-800"
          >
            Model
          </label>
          <input
            id="model"
            className={getInputClassName(errors.model)}
            placeholder="Model (e.g. Corolla)"
            {...register("model", validationRules.vehicle.model)}
          />
          {errors.model && (
            <p className="text-error text-sm">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-lg font-bold text-neutral-800"
          >
            Year
          </label>
          <input
            id="year"
            type="number"
            className={getInputClassName(errors.year)}
            placeholder="Year"
            {...register("year", validationRules.vehicle.year)}
          />
          {errors.year && (
            <p className="text-error text-sm">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="nickname"
            className="block text-lg font-bold text-neutral-800"
          >
            Nickname
          </label>
          <input
            id="nickname"
            className={getInputClassName(errors.nickname)}
            placeholder="NickName (e.g. Lightning McQueen)"
            {...register("nickname")}
          />
        </div>

        <div>
          <label
            htmlFor="vin"
            className="block text-lg font-bold text-neutral-800"
          >
            VIN
          </label>
          <input
            id="vin"
            className={getInputClassName(errors.vin)}
            placeholder="VIN (optional)"
            {...register("vin")}
          />
        </div>

        <div>
          <label
            htmlFor="colour"
            className="block text-lg font-bold text-neutral-800"
          >
            Colour
          </label>
          <input
            id="colour"
            className={getInputClassName(errors.colour)}
            placeholder="Colour (e.g. Blue)"
            {...register("colour")}
          />
        </div>

        <div>
          <label
            htmlFor="registration_number"
            className="block text-lg font-bold text-neutral-800"
          >
            Registration Number
          </label>
          <input
            id="registration_number"
            className={getInputClassName(errors.registration_number)}
            placeholder="Registration Number (e.g. ABC-123)"
            {...register("registration_number")}
          />
        </div>

        <div>
          <label
            htmlFor="purchase_date"
            className="block text-lg font-bold text-neutral-800"
          >
            Purchase Date
          </label>
          <input
            id="purchase_date"
            type="date"
            className={getInputClassName(errors.purchase_date)}
            defaultValue={
              vehicle?.purchase_date
                ? formatDateForInput(vehicle.purchase_date)
                : ""
            }
            {...register("purchase_date", {
              setValueAs: (value) => (value ? new Date(value) : undefined),
            })}
          />
        </div>

        <div>
          <label
            htmlFor="purchase_price"
            className="block text-lg font-bold text-neutral-800"
          >
            Purchase Price
          </label>
          <input
            id="purchase_price"
            type="number"
            className={getInputClassName(errors.purchase_price)}
            placeholder="Purchase Price"
            {...register("purchase_price", { valueAsNumber: true })}
          />
        </div>

        <div>
          <label
            htmlFor="odometer_reading"
            className="block text-lg font-bold text-neutral-800"
          >
            Odometer Reading
          </label>
          <input
            id="odometer_reading"
            type="number"
            className={getInputClassName(errors.odometer_reading)}
            placeholder="Odometer Reading"
            {...register("odometer_reading", { valueAsNumber: true })}
          />
        </div>

        <div>
          <label
            htmlFor="odometer_unit"
            className="block text-lg font-bold text-neutral-800"
          >
            Odometer Unit
          </label>
          <select
            id="odometer_unit"
            className={getInputClassName(errors.odometer_unit)}
            {...register("odometer_unit")}
          >
            <option value="miles">Miles</option>
            <option value="km">Kilometers</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full my-4 rounded-lg text-background-card transition ${
          isSubmitting
            ? "bg-neutral-600 cursor-not-allowed"
            : "bg-primary hover:bg-primary-hover"
        }`}
      >
        {isSubmitting
          ? "Saving..."
          : vehicle
            ? "Update Vehicle"
            : "Add Vehicle"}
      </button>
    </form>
  );
};

export default VehicleForm;
