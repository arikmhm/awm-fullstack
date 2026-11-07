# Log Prompt AI — Mini E-Commerce & Realtime Dashboard

| | |
|---|---|
| AI Tool | Claude Code (Claude Opus) |
| Tanggal | 6–7 November 2026 |

Dokumen ini mencatat prompt yang saya berikan ke AI beserta hasilnya, diurutkan sesuai alur pengerjaan. Prompt ditulis apa adanya. Prompt yang hanya berupa persetujuan singkat ("setuju", "boleh") tidak dicantumkan, karena hasilnya sudah tercakup di prompt sebelumnya.

## Tahap 1 — Analisis Soal & Rencana

**1. Memahami soal**
> saya mendapatkan skilltest seperti yang saya lampirkan pada pdf, tolong pahami secara mendalam, analisis serta laporkan ke saya

Hasil: AI menguraikan kebutuhan wajib dan bonus, hal tersirat (harga harus dihitung server, keamanan data pesanan, stok), lalu mengusulkan stack Next.js + Supabase + Vercel beserta rencana kerja.

**2. Mempercepat pembuatan tampilan**
> tambah shadcn gimana biar cepet? atau tidak perlu?

Hasil: shadcn/ui ditambahkan ke stack, termasuk komponen grafiknya, sehingga tidak perlu membuat komponen tabel, form, dan grafik dari nol.

**3. Membandingkan opsi real-time dan biaya**
> opsi selain supabase apa untuk realtime? dan apakah yang kamu rekomendasikan semua itu free?

Hasil: perbandingan Supabase Realtime, Firebase, Convex, Pusher/Ably, dan polling. Supabase dipilih karena database, login, dan real-time ada dalam satu layanan gratis. Seluruh stack dipastikan memakai paket gratis.

**4. Menambah fitur lacak pesanan**
> setuju, dan userpun harusnya bisa lihat statusnya

Hasil: fitur lacak pesanan ditambahkan. Pelanggan memasukkan kode pesanan dan nomor HP untuk melihat status pesanannya.

**5. Mengubah alur kerja: rancang dulu**
> ulangi, jangan langsung semuanya, saya ingin susun dokumen dokumennya terlebih dahulu sebelum setup project

Hasil: pengerjaan diubah menjadi bertahap. PRD, ERD, dan flowchart disusun dan direview satu per satu sebelum project dibuat.

## Tahap 2 — PRD

**6. Revisi PRD dan pertanyaan arsitektur**
> beberapa hal yang perlu saya tanyakan:
>
> * membutuhkan orm atau tidak?
> * membutuhkan image storage atau tidak?
> * membutuhkan untuk pengelolaan produk dan stok atau tidak?
> * kira kira architecturenya nanti seperti apa termasuk system designya seperti apa?

Hasil:
- Tanpa ORM. Akses data memakai supabase-js dan fungsi database, agar aturan keamanan (RLS) di database tetap berlaku.
- Tanpa image storage. Gambar produk cukup berupa link.
- Fitur kelola produk dan stok dimasukkan ke ruang lingkup.
- Penjelasan arsitektur: browser → Next.js → Supabase (database, login, real-time), di-deploy ke Vercel.

## Tahap 3 — ERD

**7. Membuat ERD**
> lanjut ke ERD makai mermaid saja

Hasil: ERD dalam format Mermaid dengan tiga tabel (`products`, `orders`, `order_items`), kamus data, keputusan desain, index, dan hak akses data.

**8. Menanyakan penyimpanan data admin**
> saya ingin diskusi, kenapa tidak menyimpan atau ada table user? admin disimpan dimana?

Hasil: penjelasan bahwa akun admin disimpan dan dikelola Supabase Auth, sehingga tidak perlu tabel user sendiri.

**9. Menambahkan role admin**
> apakah tidak bisa diberi tambahan untuk role? apakah harus membuat sendiri?

Hasil: role admin disimpan di `app_metadata` Supabase Auth, bagian yang tidak bisa diubah oleh user sendiri. Aturan keamanan database hanya mengizinkan akun dengan role admin membaca data pesanan. *(Keputusan ini direvisi di prompt 15.)*

## Tahap 4 — Flowchart

**10. Membuat flowchart**
> Lanjut flowchart

Hasil: 8 bagian diagram alur, mulai dari belanja, checkout, proses pesanan di database, lacak pesanan, login admin, dashboard real-time, status pesanan, hingga kelola produk.

## Tahap 5 — Review Ulang Keputusan Real-time & Auth

**11. Menguji ulang pilihan Supabase**
> nah walaupun sudah ada beberapa keputusan didalam file .md saya mau tetepa memastikan lagi, apakah memang harus menggunakan supabase realtime? apakah tidak ada opsi lainnya? kemudian soal auth kenapa harus makai supabase juga? kenapa tidak memakai ntah better atau next auth mungkin?

Hasil: soal tidak mewajibkan Supabase. Opsi real-time dibandingkan (Supabase Realtime, polling, Pusher/Ably, SSE, Socket.io). Better Auth/NextAuth bisa dipakai, tetapi browser tidak akan punya token Supabase, sehingga real-time pada tabel `orders` diblokir RLS kecuali data dibuka publik atau dibuat token sendiri. Supabase Realtime + Supabase Auth dipertahankan, dengan polling sebagai cadangan.

**12. Memahami batasan serverless**
> bukankah supabase dan vercel jug sama sama serverless?

Hasil: keduanya "serverless" dari sisi pengguna (tidak mengurus server), tetapi berbeda cara kerja. Vercel Functions hidup per request lalu mati, sehingga tidak bisa menahan koneksi WebSocket. Supabase Realtime adalah server yang selalu hidup dan dikelola Supabase. Keputusan real-time final.

**13. Cara kerja auth dan pemisahan role**
> oke siap, keputusan terkait realtime saya sudah oke dengan penjelasan tersebut. sekarang lanjut saya mau diskusi untuk authentikasi dan authorization, disini kan kita menggunakan auth dari supabase, itu sebenarnya cara kerjanya seperti apa? dan apakah bisa memisahkan role dari user, sehingga batasan user yang bisa akses admin bukan hanya yang terdaftar di supabase tapi yang memilikirole tertentu saja

Hasil: penjelasan alur login Supabase (password dicek, keluar access token JWT + refresh token di cookie, token dibawa ke database dan diperiksa RLS). Pemeriksaan dibuat dua lapis: di Next.js untuk mengarahkan user, dan di RLS sebagai pengaman sebenarnya. Tiga cara menyimpan role dibandingkan: `app_metadata`, tabel sendiri, dan Custom Access Token Hook.

**14. Meminta penilaian yang objektif**
> coba lebih objektif lagi bukan karena itu sudah saya pilih, tpai pilihan yang memang sesuai dengan kasus saya

Hasil: penilaian ulang berdasarkan kondisi kasus (1 admin, deadline 2 hari, ERD ikut dinilai). Tabel role sendiri lebih cocok daripada `app_metadata`: pencabutan role langsung berlaku dan relasinya terlihat di ERD, dengan biaya satu tabel dan satu fungsi.

**15. Menentukan bentuk tabel role**
> berarti nambah table admin? kenapa tidak user role atau apa? jadi nanti tingal liat user id x rolenya apa, kenapa ngga gitu? ayo diskusikan secara kritis dan objektif

Hasil: empat bentuk dibandingkan (`admins`, `user_roles` satu role, `user_roles` banyak role, kolom role di `profiles`). Dipilih `user_roles` dengan satu role per akun: mudah dipahami, siap untuk role tambahan tanpa mengubah tabel, dan terpisah dari data profil agar user tidak bisa menjadikan dirinya admin. ERD, flowchart login, dan PRD diperbarui.

## Tahap 6 — Backlog Issues

**16. Menyusun issues dari soal dan dokumen**
> kamu seorang ahli dalam management project, implementasi project, bisa menerapkan best practice dalam pengerjaan project dengan profesional, efektif dan optimal.
> terdapat pdf untuk skilltest yang saya lampirkan, baca, pahami dan analisis secara mendalam dengan baik.
> Selain itu saya sudah memiliki beberapa dokumen .md yang berada di project ini, lakukan hal yang sama.
> tujuan saya untuk menyusun rencana/langkah/issues terkait project yang akan saya kerjakan. Tolong bantu buatkan issues yang baik dan benar, serta mengikuti best practice, efektif dan optimal.
> Saya ingin diskusi dulu, jangan generate apapun tanpa persetujuan saya.

Hasil:
- AI menganalisis ulang soal dan keempat dokumen, lalu menemukan empat hal yang belum tertulis: fungsi `update_order_status` (status hanya maju, batal mengembalikan stok), normalisasi nomor HP, aktivasi realtime untuk tabel `orders`, dan fungsi `get_dashboard_stats`.
- Sebelum membuat apa pun, AI mendiskusikan empat keputusan: issue ditulis di GitHub Issues sekaligus diringkas di `docs/ISSUES.md`, commit langsung ke `main`, kelola produk diberi prioritas *could*, dan bahasa Indonesia.
- Setelah rencana disetujui, dibuat 15 issue di GitHub dalam 4 milestone. Setiap issue berisi konteks, ruang lingkup, acceptance criteria, referensi ke PRD/ERD/flowchart, dependensi, dan estimasi. Ringkasan, konvensi commit, dan Definition of Done ditulis di `docs/ISSUES.md`.
