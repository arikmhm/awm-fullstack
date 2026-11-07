export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
};

// Cermin aturan update_order_status; database tetap penentu akhirnya.
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
