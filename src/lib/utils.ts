export { cn } from "cn"

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

// Contoh: 25000 → "Rp 25.000"
export function formatRupiah(value: number) {
  return rupiah.format(value);
}
