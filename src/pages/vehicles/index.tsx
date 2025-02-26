import Link from "next/link";
import Layout from "@/components/Layout";
import VehicleList from "@/components/VehicleList";

export default function Vehicles() {
  return (
    <Layout>
      <div className="bg-background-card p-6 shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-800">My Vehicles</h1>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="text-primary hover:underline">
              ← Back to Dashboard
            </Link>
            <Link
              href="/vehicles/add"
              className="bg-primary text-neutral-200 px-4 py-2 rounded-lg hover:bg-primary-hover transition"
            >
              + Add Vehicle
            </Link>
          </div>
        </div>
        <VehicleList />
      </div>
    </Layout>
  );
}
