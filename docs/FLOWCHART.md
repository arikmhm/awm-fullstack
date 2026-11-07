# Flowchart — Mini E-Commerce & Realtime Dashboard

| | |
|---|---|
| Versi | 1.1 (final) |
| Tanggal | 8 November 2026 |
| Penyusun | Arik |
| Acuan | PRD.md, ERD.md |
| Status | Final, sesuai aplikasi yang ter-deploy |

Dokumen ini menggambarkan alur sistem dari sisi pelanggan, database, dan admin.

## 1. Gambaran Umum

```mermaid
flowchart LR
    P([Pelanggan]) --> K[Katalog produk]
    K --> C[Keranjang]
    C --> CO[Checkout]
    CO --> DB[(Database Supabase)]
    DB --> S[Halaman sukses + kode pesanan]
    S --> T[Lacak pesanan]
    T -. cari / muat ulang untuk status terbaru .-> DB

    A([Admin]) --> L[Login]
    L --> D[Dashboard]
    DB -. realtime: pesanan baru / berubah .-> D
    D --> US[Ubah status pesanan]
    D --> KP[Kelola produk]
    US --> DB
    KP --> DB
```

## 2. Alur Pelanggan: Belanja sampai Checkout

```mermaid
flowchart TD
    A([Buka website]) --> B[Lihat katalog produk aktif]
    B --> C{Stok produk > 0?}
    C -- Tidak --> C1[Tombol tambah dinonaktifkan, label 'Stok habis']
    C -- Ya --> D[Tambah ke keranjang]
    D --> E[Atur jumlah: tambah / kurang / hapus]
    E --> F{Jumlah melebihi stok?}
    F -- Ya --> F1[Jumlah dibatasi sesuai stok]
    F1 --> E
    F -- Tidak --> G{Belanja lagi?}
    G -- Ya --> B
    G -- Tidak --> H[Buka checkout]
    H --> I[Isi nama, nomor HP, alamat]
    I --> J{Form valid?}
    J -- Tidak --> J1[Tampilkan pesan kesalahan di form]
    J1 --> I
    J -- Ya --> K[Kirim pesanan: hanya ID produk + jumlah]
    K --> L[[Proses create_order di database, lihat bagian 3]]
    L --> M{Berhasil?}
    M -- Tidak --> M1[Tampilkan alasan, misal stok tidak cukup]
    M1 --> E
    M -- Ya --> N[Kosongkan keranjang]
    N --> O[Halaman sukses: kode pesanan, ringkasan, tautan lacak]
    O --> P([Selesai])
```

Keranjang disimpan di browser pelanggan, sehingga tidak hilang saat halaman dimuat ulang.

## 3. Proses `create_order` di Database

Seluruh langkah berjalan dalam **satu transaksi**. Jika satu langkah gagal, semua perubahan dibatalkan.

```mermaid
flowchart TD
    A([Terima: nama, HP, alamat, daftar produk + jumlah]) --> A2[Normalisasi HP ke format 62xxxx]
    A2 --> B{Data pelanggan lengkap dan HP valid?}
    B -- Tidak --> X[Batalkan transaksi, kirim pesan kesalahan]
    B -- Ya --> C{Daftar produk kosong?}
    C -- Ya --> X
    C -- Tidak --> D[Ambil produk berikutnya dan kunci barisnya]
    D --> E{Produk ada dan aktif?}
    E -- Tidak --> X
    E -- Ya --> F{Jumlah > 0 dan stok cukup?}
    F -- Tidak --> X
    F -- Ya --> G[Ambil harga dari tabel products]
    G --> H{Masih ada produk lain?}
    H -- Ya --> D
    H -- Tidak --> I[Buat kode pesanan unik]
    I --> J[Simpan ke orders dengan status pending]
    J --> K[Simpan rincian ke order_items: salinan nama + harga]
    K --> L[Kurangi stok setiap produk]
    L --> M[Hitung total dari seluruh subtotal]
    M --> N[Simpan transaksi]
    N --> O([Kirim kode pesanan ke pelanggan])
```

**Mengapa baris produk dikunci?** Jika dua pelanggan membeli stok terakhir pada detik yang sama, pelanggan kedua harus menunggu sampai transaksi pertama selesai. Setelah itu ia melihat stok sudah 0 dan pesanannya ditolak. Dengan begitu stok tidak pernah minus (PRD NFR-04).

## 4. Alur Lacak Pesanan

```mermaid
flowchart TD
    A([Buka halaman lacak]) --> B{Datang dari tautan halaman sukses?}
    B -- Ya --> C[Kode pesanan terisi dan langsung dicari]
    B -- Tidak --> D[Isi kode pesanan atau nomor HP]
    D --> F[Panggil track_orders keyword]
    C --> F
    F --> G{Ada pesanan yang cocok?}
    G -- Tidak --> H[Tampilkan 'Pesanan tidak ditemukan']
    H --> D
    G -- Ya --> I[Tampilkan daftar: kode, waktu, status, total]
    I --> J[Klik salah satu pesanan]
    J --> K([Tampilkan rincian barang dan total])
```

Kode pesanan selalu menghasilkan satu pesanan karena kode bersifat unik; nomor HP bisa menghasilkan beberapa pesanan. Status tidak diperbarui otomatis: pelanggan mencari lagi atau memuat ulang halaman untuk melihat status terbaru.

## 5. Alur Login & Akses Admin

```mermaid
flowchart TD
    A([Buka halaman /admin]) --> B{Sudah login?}
    B -- Tidak --> L[Halaman login admin]
    B -- Ya --> R{Role admin di user_roles?}
    R -- Ya --> D([Tampilkan dashboard])
    R -- Tidak --> X[Logout otomatis + pesan 'Akun bukan admin']
    X --> L
    L --> E[Isi email dan password]
    E --> F[Kirim ke Supabase Auth]
    F --> G{Email dan password benar?}
    G -- Tidak --> H[Tampilkan 'Email atau password salah']
    H --> E
    G -- Ya --> R
```

Pemeriksaan role memakai fungsi database `is_admin()` dan dilakukan di dua tempat: di aplikasi (sebelum halaman admin dibuka) dan di database melalui RLS (sebelum data dikirim). Jadi walaupun pemeriksaan di aplikasi terlewati, data pesanan tetap tidak bisa dibaca.

## 6. Alur Dashboard Real-time

```mermaid
sequenceDiagram
    actor Pelanggan
    actor Admin
    participant App as Aplikasi Web
    participant DB as Supabase (Database + Realtime)

    Admin->>App: Buka dashboard
    App->>DB: Ambil ringkasan, data grafik, dan daftar pesanan
    DB-->>App: Data (hanya untuk role admin)
    App-->>Admin: Tampilkan kartu ringkasan, grafik, tabel
    App->>DB: Berlangganan perubahan tabel orders

    Pelanggan->>DB: create_order
    DB-->>Pelanggan: Kode pesanan
    DB-)App: Notifikasi: ada pesanan baru
    App->>DB: Ambil ulang ringkasan, grafik, dan daftar pesanan
    DB-->>App: Data terbaru
    App-->>Admin: Dashboard diperbarui + notifikasi singkat "Pesanan baru"
```

Admin tidak perlu memuat ulang halaman. Perubahan status oleh admin lain juga muncul dengan cara yang sama.

## 7. Alur Status Pesanan

```mermaid
stateDiagram-v2
    [*] --> pending: Pelanggan checkout
    pending --> processing: Admin memproses
    pending --> cancelled: Admin membatalkan
    processing --> completed: Admin menyelesaikan
    processing --> cancelled: Admin membatalkan
    completed --> [*]
    cancelled --> [*]

    note right of cancelled
        Stok setiap produk
        dikembalikan
    end note
```

Status hanya bisa maju. Pesanan yang sudah selesai atau dibatalkan tidak bisa diubah lagi. Aturan ini dijalankan oleh fungsi database `update_order_status` (hanya untuk admin), bukan oleh tampilan, sehingga tetap berlaku walaupun request dikirim langsung ke database.

```mermaid
flowchart TD
    A([Admin pilih status baru]) --> B{Perpindahan status sah?}
    B -- Tidak --> X[Tolak + pesan kesalahan]
    B -- Ya --> C{Status baru = dibatalkan?}
    C -- Ya --> C2{Admin konfirmasi pembatalan?}
    C2 -- Tidak --> Z([Status tidak berubah])
    C2 -- Ya --> D[Kembalikan stok sesuai rincian pesanan]
    C -- Tidak --> E[Ubah status]
    D --> E
    E --> F[Simpan dalam satu transaksi]
    F --> G([Dashboard ikut berubah; halaman lacak berubah saat pelanggan mencari lagi])
```

## 8. Alur Kelola Produk

Halaman `/admin/products` ([issue #15](https://github.com/arikmhm/awm-fullstack/issues/15)). Tombol Tambah dan Ubah membuka form di dialog; tombol Aktifkan/Nonaktifkan langsung menyimpan.

```mermaid
flowchart TD
    A([Admin buka Kelola Produk]) --> B[Daftar semua produk: aktif dan nonaktif]
    B --> C{Pilih aksi}
    C -- Tambah --> D[Form kosong]
    C -- Ubah --> E[Form berisi data produk]
    C -- Aktif / nonaktif --> F[Balik status is_active]
    D --> G[Isi nama, harga, stok, link gambar]
    E --> G
    G --> H{Nama terisi, harga dan stok >= 0?}
    H -- Tidak --> I[Tampilkan pesan kesalahan]
    I --> G
    H -- Ya --> J[Simpan ke tabel products]
    F --> J
    J --> K([Daftar diperbarui, katalog pelanggan ikut berubah])
```

Perubahan harga hanya berlaku untuk pesanan baru. Pesanan lama tetap memakai harga yang tersimpan di `order_items`.
