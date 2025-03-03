import Link from "next/link";
import { Plus } from "lucide-react";
import Layout from "@/components/Layout";
import VehicleList from "@/components/VehicleList";

export default function Vehicles() {
  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-800">My Vehicles</h1>
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/"
              className="text-primary hover:underline"
              aria-label="Back to Dashboard"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/vehicles/add"
              className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-hover transition flex items-center"
              aria-label="Add a new vehicle"
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" /> Add Vehicle
            </Link>
          </div>
        </div>
        <VehicleList />
      </div>
    </Layout>
  );
}
