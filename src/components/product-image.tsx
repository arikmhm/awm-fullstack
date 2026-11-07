"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

// <img> biasa, bukan next/image: link gambar bebas diisi admin (#15), jadi remotePatterns tidak bisa dibatasi.
export function ProductImage({ src, alt }: { src: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground"
      >
        <ImageOff className="size-8" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      className="aspect-square w-full object-cover"
    />
  );
}
