"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { cn, formatRupiah } from "@/lib/utils";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
};

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  // null = dialog tertutup, "new" = tambah, number = ubah produk dengan id itu.
  const [editing, setEditing] = useState<"new" | number | null>(null);
  const editProduct = typeof editing === "number" ? products.find((p) => p.id === editing) : undefined;

  async function toggleActive(p: Product) {
    setBusyId(p.id);
    const { error } = await createClient().from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${p.name} ${p.is_active ? "dinonaktifkan" : "diaktifkan"}`);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <Button onClick={() => setEditing("new")}>
        <Plus /> Tambah produk
      </Button>

      <div className="mt-4 rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">
                <span className="sr-only">Gambar</span>
              </TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className={cn("w-10 overflow-hidden rounded-md", !p.is_active && "opacity-50")}>
                      <ProductImage src={p.image_url} alt={p.name} />
                    </div>
                  </TableCell>
                  <TableCell className={cn("font-medium", !p.is_active && "text-muted-foreground")}>{p.name}</TableCell>
                  <TableCell className={cn("text-right tabular-nums", !p.is_active && "text-muted-foreground")}>
                    {formatRupiah(p.price)}
                  </TableCell>
                  <TableCell className={cn("text-right tabular-nums", !p.is_active && "text-muted-foreground")}>
                    {p.stock}
                  </TableCell>
                  <TableCell>
                    {p.is_active ? <Badge>Aktif</Badge> : <Badge variant="outline">Nonaktif</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(p.id)}>
                        Ubah
                      </Button>
                      <Button
                        variant={p.is_active ? "destructive" : "secondary"}
                        size="sm"
                        disabled={busyId === p.id || refreshing}
                        onClick={() => toggleActive(p)}
                      >
                        {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        {editing !== null && (
          <ProductForm
            key={editing}
            product={editProduct}
            onSaved={() => {
              setEditing(null);
              startTransition(() => router.refresh());
            }}
          />
        )}
      </Dialog>
    </>
  );
}

function ProductForm({ product, onSaved }: { product?: Product; onSaved: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const price = Number(form.get("price"));
    const stock = Number(form.get("stock"));
    const imageUrl = String(form.get("image_url") ?? "").trim();

    // Penjaga terakhir tetap check constraint price/stock >= 0 di database.
    if (!name) return setError("Nama wajib diisi");
    if (!Number.isInteger(price) || price < 0) return setError("Harga harus bilangan bulat ≥ 0");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stok harus bilangan bulat ≥ 0");

    setBusy(true);
    setError(null);
    const values = { name, price, stock, image_url: imageUrl || null };
    const products = createClient().from("products");
    const { error } = product ? await products.update(values).eq("id", product.id) : await products.insert(values);
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    toast.success(product ? `${name} diperbarui` : `${name} ditambahkan`);
    onSaved();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{product ? "Ubah produk" : "Tambah produk"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nama</Label>
          <Input id="name" name="name" required defaultValue={product?.name} disabled={busy} className="h-10" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              required
              defaultValue={product?.price}
              disabled={busy}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              required
              defaultValue={product?.stock}
              disabled={busy}
              className="h-10"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image_url">Link gambar (opsional)</Label>
          <Input
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://…"
            defaultValue={product?.image_url ?? ""}
            disabled={busy}
            className="h-10"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
