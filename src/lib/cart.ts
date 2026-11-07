"use client";

import { useSyncExternalStore } from "react";

export type CartProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
};
export type CartItem = CartProduct & { qty: number };

const KEY = "cart";
const EMPTY: CartItem[] = [];
let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY; // data rusak / storage diblokir → keranjang kosong
  }
}

function getSnapshot() {
  return (items ??= read());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // mode privat / kuota penuh: keranjang tetap jalan di memori
  }
  listeners.forEach((l) => l());
}

const clamp = (qty: number, stock: number) => Math.min(Math.max(qty, 1), stock);

// Stok ikut diperbarui dari katalog setiap kali produk ditambahkan.
export function addItem(product: CartProduct) {
  if (product.stock <= 0) return;
  const cart = getSnapshot();
  const existing = cart.find((i) => i.id === product.id);
  write(
    existing
      ? cart.map((i) => (i.id === product.id ? { ...product, qty: clamp(i.qty + 1, product.stock) } : i))
      : [...cart, { ...product, qty: 1 }],
  );
}

export function setQty(id: number, qty: number) {
  write(getSnapshot().map((i) => (i.id === id ? { ...i, qty: clamp(qty, i.stock) } : i)));
}

export function removeItem(id: number) {
  write(getSnapshot().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return {
    items: cart,
    count: cart.reduce((n, i) => n + i.qty, 0),
    total: cart.reduce((n, i) => n + i.price * i.qty, 0),
  };
}
