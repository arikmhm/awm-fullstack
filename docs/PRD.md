# PRD — Mini E-Commerce & Realtime Dashboard

| | |
|---|---|
| Versi | 1.0 (final) |
| Tanggal | 8 November 2026 |
| Penyusun | Arik |
| Status | Final, sesuai aplikasi yang ter-deploy di https://awm-fullstack.vercel.app |

## 1. Latar Belakang
Usaha kecil sering menerima pesanan lewat chat, sehingga pencatatan manual, rawan salah hitung, dan pemilik usaha sulit melihat penjualan secara langsung. Mini E-Commerce adalah web pemesanan sederhana: pelanggan bisa memesan tanpa membuat akun, dan admin bisa memantau setiap transaksi yang masuk secara real-time.

## 2. Tujuan
1. Pelanggan dapat memesan satu atau lebih produk dalam sekali transaksi tanpa login.
2. Admin melihat pesanan baru seketika (tanpa refresh) beserta ringkasan dan grafik penjualan.
3. Pelanggan dapat memantau status pesanannya sendiri.

## 3. Pengguna

| Peran | Deskripsi | Akses |
|-------|-----------|-------|
| Pelanggan (Guest) | Pembeli umum, tidak punya akun | Katalog, keranjang, checkout, lacak pesanan |
| Admin | Pemilik/pengelola toko | Dashboard, data transaksi, ubah status pesanan, kelola produk & stok\* (wajib login) |

\* Kelola produk belum diimplementasikan, direncanakan di [issue #15](https://github.com/arikmhm/awm-fullstack/issues/15).

## 4. Ruang Lingkup

**Termasuk (In Scope)**
- Katalog produk dengan harga dan stok.
- Keranjang multi-produk dengan pengaturan jumlah (quantity).
- Checkout tanpa login (nama, nomor HP, alamat).
- Kode pesanan unik setelah checkout.
- Halaman lacak pesanan (kode pesanan atau nomor HP).
- Login admin dan dashboard terproteksi.
- Dashboard real-time: tabel transaksi, ringkasan statistik, grafik penjualan.
- Pengelolaan status pesanan oleh admin.
- Tampilan responsif (HP dan desktop).
- Kelola produk oleh admin: tambah, ubah (nama, harga, stok, link gambar), aktifkan/nonaktifkan. *(Belum diimplementasikan, lihat §6.3.)*

**Tidak Termasuk (Out of Scope)**
- Akun/registrasi pelanggan.
- Pembayaran online (payment gateway).
- Ongkos kirim dan integrasi kurir.
- Upload gambar produk (gambar cukup berupa link).
- Hapus permanen produk (diganti dengan menonaktifkan, agar riwayat pesanan tetap utuh).

## 5. User Stories

| ID | Sebagai | Saya ingin | Agar |
|----|---------|------------|------|
| US-01 | Pelanggan | melihat daftar produk beserta harga dan stok | tahu apa yang bisa dibeli |
| US-02 | Pelanggan | memasukkan beberapa produk ke keranjang dan mengatur jumlahnya | bisa membeli banyak barang sekaligus |
| US-03 | Pelanggan | checkout hanya dengan mengisi nama, nomor HP, dan alamat | tidak perlu repot membuat akun |
| US-04 | Pelanggan | mendapat kode pesanan setelah checkout | bisa mengecek pesanan nanti |
| US-05 | Pelanggan | melihat status pesanan dengan kode pesanan atau nomor HP | tahu pesanan sudah sampai tahap mana |
| US-06 | Admin | login ke dashboard | data penjualan hanya bisa dilihat oleh saya |
| US-07 | Admin | melihat pesanan baru muncul otomatis | bisa segera memproses tanpa refresh |
| US-08 | Admin | melihat ringkasan dan grafik penjualan | memahami performa toko |
| US-09 | Admin | melihat rincian barang di setiap pesanan | tahu apa yang harus disiapkan |
| US-10 | Admin | mengubah status pesanan | pelanggan tahu perkembangan pesanannya |
| US-11\* | Admin | menambah produk dan mengubah harga atau stoknya | katalog selalu sesuai kondisi toko |
| US-12\* | Admin | menonaktifkan produk yang tidak dijual lagi | produk hilang dari katalog tanpa merusak riwayat pesanan |

\* Belum diimplementasikan (§6.3).

## 6. Kebutuhan Fungsional

### 6.1 Sisi Pelanggan
| ID | Kebutuhan |
|----|-----------|
| FR-01 | Sistem menampilkan katalog produk aktif: gambar, nama, harga, stok. Produk dengan stok habis ditandai dan tidak bisa ditambahkan. |
| FR-02 | Pelanggan dapat menambah, mengurangi, dan menghapus produk di keranjang. Jumlah tidak boleh melebihi stok. Isi keranjang tersimpan di browser sehingga tidak hilang saat halaman dimuat ulang. |
| FR-03 | Keranjang menampilkan subtotal per produk dan total keseluruhan. |
| FR-04 | Form checkout: nama (wajib), nomor HP (wajib, angka), alamat (wajib). Nomor HP disimpan dalam format `62xxxx`, sehingga `0812…`, `+62812…`, dan `62812…` dianggap nomor yang sama. |
| FR-05 | **Harga dan total dihitung ulang oleh server** dari data produk, bukan dari data yang dikirim browser. |
| FR-06 | Saat checkout, server memeriksa stok, menyimpan pesanan beserta rinciannya, dan mengurangi stok dalam satu proses utuh (jika salah satu gagal, semuanya dibatalkan). |
| FR-07 | Setelah berhasil, pelanggan melihat halaman sukses berisi kode pesanan, ringkasan, dan tautan untuk melacak pesanan. |
| FR-08 | Halaman lacak pesanan: pelanggan cukup memasukkan kode pesanan **atau** nomor HP. Hasilnya berupa daftar pesanan (kode → satu pesanan, nomor HP → semua pesanan dengan nomor itu, maksimal 20 terbaru) berisi kode, waktu, status, dan total; pesanan diklik untuk melihat rincian barang. Nama, alamat, dan nomor HP tidak ditampilkan. Nomor HP dicocokkan setelah dinormalisasi (lihat FR-04), jadi beda format penulisan tidak membuat pesanan gagal ditemukan. |
| FR-09 | Status di halaman lacak pesanan tidak diperbarui otomatis: pelanggan melihat status terbaru dengan mencari lagi atau memuat ulang halaman. |

### 6.2 Sisi Admin
| ID | Kebutuhan |
|----|-----------|
| FR-10 | Admin login dengan email dan password. Halaman admin hanya bisa diakses oleh akun dengan role admin; akun tanpa role admin otomatis dikeluarkan dengan pesan "Akun bukan admin". |
| FR-11 | Kartu ringkasan: total omzet, jumlah pesanan, jumlah barang terjual, jumlah pesanan menunggu diproses. |
| FR-12 | Grafik omzet per hari dan grafik produk terlaris. |
| FR-13 | Tabel transaksi: kode, waktu, nama pelanggan, nomor HP, total, status; dapat dibuka untuk melihat rincian barang dan alamat. |
| FR-14 | Tabel dapat difilter berdasarkan status. |
| FR-15 | Admin dapat mengubah status pesanan. |
| FR-16 | Pesanan baru dan perubahan data muncul otomatis di dashboard tanpa refresh, disertai notifikasi singkat. |
| FR-17 | Admin dapat logout. |

### 6.3 Kelola Produk (Admin)
> **Belum diimplementasikan.** Fitur ini berprioritas *could* dan direncanakan di [issue #15](https://github.com/arikmhm/awm-fullstack/issues/15). Database sudah siap (kolom `is_active` dan aturan RLS admin tambah/ubah produk), tetapi halaman admin belum dibuat. Untuk sementara produk diubah lewat Supabase Table Editor. FR-22 sudah berlaku karena harga disalin ke `order_items` saat checkout.

| ID | Kebutuhan |
|----|-----------|
| FR-18 | Admin melihat daftar semua produk (aktif dan nonaktif) beserta harga dan stok. |
| FR-19 | Admin dapat menambah produk: nama, harga, stok, link gambar (opsional). |
| FR-20 | Admin dapat mengubah nama, harga, stok, dan link gambar. Harga dan stok tidak boleh negatif. |
| FR-21 | Admin dapat menonaktifkan/mengaktifkan produk. Produk nonaktif tidak tampil di katalog dan tidak bisa dipesan. |
| FR-22 | Perubahan harga tidak mengubah pesanan lama, karena harga saat transaksi disimpan di rincian pesanan. |

### 6.4 Alur Status Pesanan
```
Menunggu (pending) → Diproses (processing) → Selesai (completed)
        └────────────────┴──────────────→ Dibatalkan (cancelled)
```
- Status hanya bisa maju; pesanan yang sudah selesai atau dibatalkan tidak bisa diubah lagi.
- Pesanan yang dibatalkan mengembalikan stok produk.

## 7. Kebutuhan Non-Fungsional
| ID | Kebutuhan |
|----|-----------|
| NFR-01 | Responsif: nyaman dipakai di layar HP (lebar 375px) dan desktop. |
| NFR-02 | Keamanan: data pesanan hanya bisa dibaca admin; pelanggan hanya bisa melihat pesanan lewat kode pesanan atau nomor HP, tanpa nama, alamat, dan nomor HP (FR-08). |
| NFR-03 | Real-time: pesanan baru tampil di dashboard dalam hitungan detik. |
| NFR-04 | Integritas data: tidak ada pesanan yang melebihi stok, termasuk saat dua orang membeli bersamaan. |
| NFR-05 | Dapat diakses publik melalui URL hasil deploy. |

## 8. Teknologi
| Bagian | Pilihan | Alasan |
|--------|---------|--------|
| Frontend & server | Next.js (TypeScript) | Satu proyek untuk tampilan dan logika server; mudah di-deploy ke Vercel |
| Tampilan | Tailwind CSS + shadcn/ui | Komponen siap pakai, cepat, dan konsisten |
| Grafik | shadcn Chart (Recharts) | Menyatu dengan komponen UI |
| Database, Auth, Realtime | Supabase | Database Postgres, login admin, dan update real-time dalam satu layanan |
| Akses data | supabase-js + fungsi database (tanpa ORM) | Keamanan dijaga aturan RLS di database dan transaksi berjalan di fungsi Postgres; ORM justru akan melewati RLS |
| Gambar produk | Link gambar (`image_url`) | Tanpa image storage; bisa dipindah ke Supabase Storage nanti tanpa mengubah struktur tabel |
| Hosting | Vercel | Deploy otomatis dari GitHub, gratis |
| AI Tool | Claude Code | Membantu analisis, desain, dan penulisan kode |

## 9. Kriteria Keberhasilan
- Pelanggan bisa menyelesaikan pesanan berisi 2+ produk tanpa login dalam waktu kurang dari 1 menit.
- Pesanan baru muncul di dashboard admin tanpa refresh.
- Ringkasan dan grafik sesuai dengan data transaksi.
- Halaman admin menolak akses tanpa login.
- Mengubah harga dari sisi browser tidak memengaruhi total yang tersimpan.
- Aplikasi berjalan di URL publik Vercel.

## 10. Asumsi & Batasan
- Hanya ada satu toko dan satu akun admin (akun dibuat langsung di Supabase, role diberikan lewat tabel `user_roles`).
- Pembayaran dianggap dilakukan di luar sistem (transfer/COD); status diperbarui manual oleh admin.
- Mata uang Rupiah, tanpa pajak dan ongkos kirim.
- Data produk awal diisi sebagai contoh (seed).
