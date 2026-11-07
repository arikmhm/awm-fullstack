# Backlog Issues — Mini E-Commerce & Realtime Dashboard

| | |
|---|---|
| Versi | 1.1 (final) |
| Tanggal | 8 November 2026 |
| Penyusun | Arik |
| Sumber | [GitHub Issues](https://github.com/arikmhm/awm-fullstack/issues) · [Milestones](https://github.com/arikmhm/awm-fullstack/milestones) |

Rincian setiap issue (konteks, ruang lingkup, acceptance criteria, referensi, dependensi) ada di GitHub. Dokumen ini hanya ringkasan dan konvensi kerja.

## 1. Konvensi Kerja
- Commit langsung ke `main`, satu issue bisa terdiri dari beberapa commit.
- Pesan commit memakai [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Commit terakhir sebuah issue menutupnya dengan `Closes #n`, contoh: `feat: keranjang multi-produk (Closes #5)`.
- Bug yang ditemukan selama pengerjaan dicatat sebagai issue baru berlabel `bug`.

## 2. Prioritas & Label
| Label | Arti |
|-------|------|
| `prioritas: must` | Wajib selesai sebelum submission |
| `prioritas: should` | Penting, dikerjakan setelah semua *must* |
| `prioritas: could` | Dikerjakan hanya jika waktu tersisa |
| `area: infra` / `area: db` / `area: pelanggan` / `area: admin` | Bagian sistem yang disentuh |

## 3. Definition of Done
Sebuah issue dianggap selesai jika:
1. Semua acceptance criteria tercentang.
2. `npm run build` lolos.
3. Halaman yang berubah sudah dicek di lebar 375px dan desktop.
4. Sudah ter-deploy di Vercel (branch `main`).
5. Issue tertutup lewat commit `Closes #n`.

## 4. Daftar Issue
Urutan tabel = urutan pengerjaan. Estimasi dengan bantuan AI. Status per 8 November 2026.

| # | Judul | Milestone | Prioritas | Est. | Dependensi | Status |
|---|-------|-----------|-----------|------|------------|--------|
| [#1](https://github.com/arikmhm/awm-fullstack/issues/1) | Setup project Next.js + Supabase & deploy awal ke Vercel | M1 Fondasi | must | 1j | – | ✅ Selesai |
| [#2](https://github.com/arikmhm/awm-fullstack/issues/2) | Skema database, RLS, seed & realtime | M1 Fondasi | must | 1j | #1 | ✅ Selesai |
| [#3](https://github.com/arikmhm/awm-fullstack/issues/3) | Fungsi DB pesanan: `create_order`, `get_order_status`\*, `update_order_status` | M1 Fondasi | must | 1.5j | #2 | ✅ Selesai |
| [#4](https://github.com/arikmhm/awm-fullstack/issues/4) | Katalog produk | M2 Pelanggan | must | 0.5j | #2 | ✅ Selesai |
| [#5](https://github.com/arikmhm/awm-fullstack/issues/5) | Keranjang multi-produk | M2 Pelanggan | must | 1j | #4 | ✅ Selesai |
| [#6](https://github.com/arikmhm/awm-fullstack/issues/6) | Checkout tanpa login & halaman sukses | M2 Pelanggan | must | 1j | #3, #5 | ✅ Selesai |
| [#7](https://github.com/arikmhm/awm-fullstack/issues/7) | Login admin & proteksi halaman berbasis role | M3 Admin | must | 1j | #2 | ✅ Selesai |
| [#8](https://github.com/arikmhm/awm-fullstack/issues/8) | Tabel transaksi: rincian, filter status, ubah status | M3 Admin | must | 1.5j | #3, #7 | ✅ Selesai |
| [#9](https://github.com/arikmhm/awm-fullstack/issues/9) | Ringkasan statistik & grafik penjualan | M3 Admin | must | 1.5j | #7 | ✅ Selesai |
| [#10](https://github.com/arikmhm/awm-fullstack/issues/10) | Dashboard real-time + notifikasi pesanan baru | M3 Admin | must | 0.5j | #8, #9 | ✅ Selesai |
| [#11](https://github.com/arikmhm/awm-fullstack/issues/11) | Lacak pesanan pelanggan | M2 Pelanggan | should | 1j | #3, #6 | ✅ Selesai |
| [#12](https://github.com/arikmhm/awm-fullstack/issues/12) | Tampilan responsif & state loading/kosong/error | M4 Rilis | must | 1j | #4–#11 | ✅ Selesai |
| [#13](https://github.com/arikmhm/awm-fullstack/issues/13) | Verifikasi akhir di URL produksi | M4 Rilis | must | 0.5j | #12 | ✅ Selesai |
| [#14](https://github.com/arikmhm/awm-fullstack/issues/14) | Dokumentasi submission: README, user guide + screenshot, finalisasi docs | M4 Rilis | must | 1j | #13 | ✅ Selesai |
| [#15](https://github.com/arikmhm/awm-fullstack/issues/15) | Kelola produk (tambah, ubah, aktif/nonaktif) | M4 Rilis | could | 1.5j | #7 | Belum dikerjakan |

Total ±15 jam; jalur wajib (tanpa #11 dan #15) ±12.5 jam.

\* `get_order_status(code, phone)` diganti `track_orders(keyword)` di #11, agar pelacakan cukup dengan kode **atau** nomor HP.

**Ringkasan akhir:** 14 dari 15 issue selesai, termasuk semua issue *must* dan *should*. #15 (*could*) belum dikerjakan dan ditandai di PRD §6.3 dan Flowchart §8.

## 5. Keputusan Tambahan dari Penyusunan Backlog
Saat menyusun issue, ditemukan empat hal yang belum tertulis di PRD/ERD. Semuanya dimasukkan ke issue terkait, dan dokumennya diperbarui di issue tersebut:

| Keputusan | Alasan | Issue |
|-----------|--------|-------|
| Fungsi `update_order_status` | Aturan "status hanya maju" dan "batal mengembalikan stok" harus dijamin database dalam satu transaksi, bukan oleh tampilan | #3 |
| Normalisasi nomor HP (`62xxxx`) | `0812…` dan `+62812…` harus dianggap sama, agar pelanggan tidak gagal melacak pesanan hanya karena beda format | #3 |
| Tabel `orders` masuk publication realtime | Tanpa ini Supabase Realtime tidak mengirim perubahan ke dashboard | #2 |
| Fungsi `get_dashboard_stats` | Ringkasan dan grafik dihitung di database agar tetap benar saat data bertambah; pesanan dibatalkan tidak dihitung sebagai omzet | #9 |
