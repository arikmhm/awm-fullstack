"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { NEXT_STATUS, STATUS_CLASS, STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { formatRupiah } from "@/lib/utils";

export type Order = {
  id: string;
  code: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  status: OrderStatus;
  order_items: { id: number; product_name: string; unit_price: number; qty: number; subtotal: number }[];
};

type Filter = OrderStatus | "all";

const FILTER_ITEMS = [
  { value: "all", label: "Semua status" },
  ...(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: "",
  processing: "Proses",
  completed: "Selesaikan",
  cancelled: "Batalkan",
};

// Zona waktu tetap agar hasil server dan browser sama (tanpa hydration mismatch).
const dateFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  // Ambil dari props agar dialog ikut berubah setelah router.refresh().
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <>
      <Select items={FILTER_ITEMS} value={filter} onValueChange={(v) => setFilter((v as Filter) ?? "all")}>
        <SelectTrigger aria-label="Filter status" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_ITEMS.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Tidak ada transaksi.
                </TableCell>
              </TableRow>
            ) : (
              shown.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-medium">{o.code}</TableCell>
                  <TableCell>{dateFormat.format(new Date(o.created_at))}</TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell className="tabular-nums">+{o.customer_phone}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRupiah(o.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedId(o.id)}>
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        {selected && <OrderDetail key={selected.id} order={selected} />}
      </Dialog>
    </>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const submitting = useRef(false); // state baru berlaku setelah render; ref menahan klik beruntun
  const next = NEXT_STATUS[order.status];
  const disabled = busy || refreshing;

  async function changeStatus(status: OrderStatus) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    const { error } = await createClient().rpc("update_order_status", {
      order_id: order.id,
      new_status: status,
    });
    submitting.current = false;
    setBusy(false);
    setConfirmCancel(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${order.code} → ${STATUS_LABEL[status]}`);
    startTransition(() => router.refresh());
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-mono">
          {order.code} <StatusBadge status={order.status} />
        </DialogTitle>
        <DialogDescription>{dateFormat.format(new Date(order.created_at))}</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">Nama</dt>
        <dd>{order.customer_name}</dd>
        <dt className="text-muted-foreground">No. HP</dt>
        <dd className="tabular-nums">+{order.customer_phone}</dd>
        <dt className="text-muted-foreground">Alamat</dt>
        <dd className="whitespace-pre-line">{order.customer_address}</dd>
      </dl>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Barang</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.order_items.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="whitespace-normal">{i.product_name}</TableCell>
              <TableCell className="text-right tabular-nums">{formatRupiah(i.unit_price)}</TableCell>
              <TableCell className="text-right tabular-nums">{i.qty}</TableCell>
              <TableCell className="text-right tabular-nums">{formatRupiah(i.subtotal)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right tabular-nums">{formatRupiah(order.total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {next.length > 0 && (
        <DialogFooter>
          {confirmCancel ? (
            <>
              <p className="text-sm sm:mr-auto sm:self-center">Batalkan pesanan? Stok akan dikembalikan.</p>
              <Button variant="outline" disabled={disabled} onClick={() => setConfirmCancel(false)}>
                Tidak
              </Button>
              <Button variant="destructive" disabled={disabled} onClick={() => changeStatus("cancelled")}>
                Ya, batalkan
              </Button>
            </>
          ) : (
            next.map((s) =>
              s === "cancelled" ? (
                <Button key={s} variant="destructive" disabled={disabled} onClick={() => setConfirmCancel(true)}>
                  {ACTION_LABEL[s]}
                </Button>
              ) : (
                <Button key={s} disabled={disabled} onClick={() => changeStatus(s)}>
                  {ACTION_LABEL[s]}
                </Button>
              ),
            )
          )}
        </DialogFooter>
      )}
    </DialogContent>
  );
}
