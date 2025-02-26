import { useState } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { saveVehicle } from "@/utils/db";
import { Vehicle } from "@/types/vehicle";

interface Props {
  vehicle?: Vehicle;
  userId: string;
  onSave: () => void;
}

const VehicleForm: React.FC<Props> = ({ vehicle, userId, onSave }) => {
  const [formData, setFormData] = useState<Vehicle>(
    vehicle || {
      id: "",
      make: "",
      model: "",
      year: 0,
      nickname: "",
      vin: "",
      colour: "",
      registration_number: "",
      purchase_price: 0,
      odometer_reading: 0,
      updated_at: new Date(),
      created_at: new Date(),
      user_id: userId,
    },
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value.trim(), // Ensure numbers are stored correctly
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.make || !formData.model || !formData.year) {
      setError("Make, Model, and Year are required.");
      return;
    }
    if (formData.year < 1900 || formData.year > new Date().getFullYear()) {
      setError("Please enter a valid year.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.id) {
        formData.id = uuidv4();
      }
      await saveVehicle(formData);
    } catch (error) {
      setError(
        "Failed to save vehicle. Please check your internet connection and try again. Error: " +
          error,
      );
    } finally {
      setIsSubmitting(false);
      onSave();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-800 text-center md:text-left">
          {vehicle ? "Edit Vehicle" : "Add Vehicle"}
        </h1>
        <Link href="/vehicles" className="text-primary hover:underline">
          ← Back to Vehicles
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ["NickName", "nickname", "NickName (e.g. Lightning McQueen)", false],
          ["Make", "make", "Make (e.g. Toyota)", true],
          ["Model", "model", "Model (e.g. Corolla)", true],
          ["Year", "year", "Year", true, "number"],
          ["VIN", "vin", "VIN (optional)", false],
          ["Colour", "colour", "Colour (e.g. Blue)", false],
          [
            "Registration Number",
            "registration_number",
            "Registration Number (e.g. ABC-123)",
            false,
          ],
          ["Purchase Date", "purchase_date", "", false, "date"],
          [
            "Purchase Price",
            "purchase_price",
            "Purchase Price",
            false,
            "number",
          ],
          [
            "Odometer Reading",
            "odometer_reading",
            "Odometer Reading",
            false,
            "number",
          ],
        ].map(([label, name, placeholder, required = false, type = "text"]) => (
          <div key={String(name)} className="space-y-2">
            <label className="text-lg font-bold text-neutral-800">
              {label}:
            </label>
            <input
              name={String(name)}
              type={String(type)}
              value={formData[name as keyof Vehicle] as string | number}
              onChange={handleChange}
              placeholder={String(placeholder)}
              className="border border-neutral-600 p-2 w-full rounded-md bg-background text-neutral-800"
              required={Boolean(required)}
            />
          </div>
        ))}
        <div className="space-y-2">
          <label
            className="text-lg font-bold text-neutral-800"
            htmlFor="odometer_unit"
          >
            Select Odometer Unit:
          </label>
          <select
            name="odometer_unit"
            value={formData.odometer_unit}
            onChange={handleChange}
            className="border border-neutral-600 p-2 w-full rounded-md bg-background text-neutral-800"
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
