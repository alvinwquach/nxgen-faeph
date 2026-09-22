import type { Database } from "@/integrations/supabase/types";

export type MemberRow = Database["public"]["Tables"]["members"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type InventoryRow = Database["public"]["Tables"]["inventory"]["Row"];
export type TabRow = Database["public"]["Tables"]["tabs"]["Row"];
export type SaleRow = Database["public"]["Tables"]["sales"]["Row"];
export type ActivityRow = Database["public"]["Tables"]["activity_log"]["Row"];
export type CafeStationRow = Database["public"]["Tables"]["cafe_stations"]["Row"];
export type CafeBookingRow = Database["public"]["Tables"]["cafe_bookings"]["Row"];
export type CafeBookingSlotRow = Database["public"]["Tables"]["cafe_booking_slots"]["Row"];

export type CafeBookingWithStation = CafeBookingRow & {
  cafe_stations: Pick<CafeStationRow, "name" | "code" | "station_type"> | null;
};

export type CafeAdminBooking = CafeBookingWithStation & {
  members: Pick<MemberRow, "name" | "email" | "phone"> | null;
};

export interface TabItem {
  name: string;
  qty: number;
  price: number;
  amount: number;
}

export interface BookingResult {
  ref: string;
  courtId: string;
  date: string;
  startHour: number;
  hours: number;
  amount: number;
}

export interface AdminData {
  inventory: InventoryRow[];
  members: MemberRow[];
  openTabs: TabRow[];
  settledTabs: TabRow[];
  todaySales: SaleRow[];
  activity: ActivityRow[];
  recentBookings: BookingRow[];
}
