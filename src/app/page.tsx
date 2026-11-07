import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Placeholder walking skeleton; diganti katalog produk di #4.
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="secondary">Segera hadir</Badge>
          <CardTitle className="text-2xl">Mini E-Commerce</CardTitle>
          <CardDescription>
            Pesan tanpa login, pantau pesanan secara real-time.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
