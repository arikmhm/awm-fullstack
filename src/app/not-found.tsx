import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-2 p-4 text-center sm:p-6">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mb-4 text-sm text-muted-foreground">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        Kembali belanja
      </Link>
    </main>
  );
}
