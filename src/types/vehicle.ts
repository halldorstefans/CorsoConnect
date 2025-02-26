export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  vin?: string;
  colour?: string;
  registration_number?: string;
  purchase_date?: Date; // ISO string format
  purchase_price?: number;
  odometer_reading?: number;
  odometer_unit?: "miles" | "km";
  notes?: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}
