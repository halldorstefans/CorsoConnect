export interface Service {
  id: string;
  vehicle_id: string;
  date: Date; // ISO string format
  description: string;
  cost: number;
  odometer_reading?: number;
  service_type: "maintenance" | "repair" | "restoration" | "modification";
  // parts_used?: Array<{
  //     name: string;
  //     quantity: number;
  //     cost: number;
  //   }>;
  // tasks?: Array<{
  //     name: string;
  //     done: Boolean;
  //   }>;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}
