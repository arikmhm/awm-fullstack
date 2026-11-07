# Log Prompt AI — Mini E-Commerce & Realtime Dashboard

|         |                           |
| ------- | ------------------------- |
| AI Tool | Claude Code (Claude Opus) |
| Tanggal | 6–8 November 2026         |

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
> - membutuhkan orm atau tidak?
> - membutuhkan image storage atau tidak?
> - membutuhkan untuk pengelolaan produk dan stok atau tidak?
> - kira kira architecturenya nanti seperti apa termasuk system designya seperti apa?

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

Hasil: role admin disimpan di `app_metadata` Supabase Auth, bagian yang tidak bisa diubah oleh user sendiri. Aturan keamanan database hanya mengizinkan akun dengan role admin membaca data pesanan. _(Keputusan ini direvisi di prompt 15.)_

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
- Sebelum membuat apa pun, AI mendiskusikan empat keputusan: issue ditulis di GitHub Issues sekaligus diringkas di `docs/ISSUES.md`, commit langsung ke `main`, kelola produk diberi prioritas _could_, dan bahasa Indonesia.
- Setelah rencana disetujui, dibuat 15 issue di GitHub dalam 4 milestone. Setiap issue berisi konteks, ruang lingkup, acceptance criteria, referensi ke PRD/ERD/flowchart, dependensi, dan estimasi. Ringkasan, konvensi commit, dan Definition of Done ditulis di `docs/ISSUES.md`.

## Tahap 7 — Setup Project (Issue #1)

**17. Memulai issue #1 di sesi terpisah**

> saya ingin mulai mengerjakan issue #1 tapi di sesi yan beda, gimana cara bukanya?

Hasil: AI membuka sesi Claude Code baru khusus untuk issue #1 dengan bekal ringkas (konteks, ruang lingkup, kriteria selesai, dan konvensi kerja), sehingga percakapan perencanaan dan implementasi tidak tercampur. Setup besar (`create-next-app`, shadcn, paket Supabase) dijalankan satu tahap demi satu tahap dengan persetujuan di setiap tahap.

**18. Mengkritisi hasil scaffold**

> kenapa ngga makai src aja dan terkait proxy.ts itu gimana?

Hasil:

- Kode aplikasi dipindah ke folder `src/` agar terpisah dari file konfigurasi di root. Tidak ada beda fungsi, hanya kerapian, dan biayanya murah karena dilakukan sebelum ada kode lain.
- `proxy.ts` adalah nama baru `middleware.ts` di Next.js 16. Untuk Supabase, file ini memperbarui token login di cookie dan menghadang halaman `/admin`. Karena login admin baru dikerjakan di issue #7, pembuatannya ditunda ke sana.

## Tahap 8 — Skema Database (Issue #2)

**19. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #2 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 2

Hasil: AI membaca issue #2 di GitHub, ERD, dan PRD, lalu menyusun rencana per langkah: isi migration (tabel, constraint, index, trigger, `is_admin()`, RLS, realtime), seed produk, cara menjalankan, dan tabel uji untuk setiap acceptance criteria. Tidak ada file yang dibuat sebelum rencana disetujui.

**20. Memilih cara menjalankan migration**

> kalau makai connection string DB saja apakah tidak bisa?

Hasil: AI awalnya menawarkan SQL Editor atau Supabase CLI. Dengan connection string (Session pooler, format URI) dan `psql` yang sudah terpasang, migration bisa dijalankan tanpa menambah tool baru, dan AI bisa langsung menguji RLS sebagai anon, user tanpa role, dan admin di dalam transaksi yang di-rollback. Semua acceptance criteria lolos, lalu dicek ulang lewat REST API dengan publishable key.

**21. Mengkritisi istilah di rencana**

> app_role (admin).
> ini maksudny apa? bukankah di database makenya user_role?

Hasil: `user_roles` adalah tabel (akun + role-nya), sedangkan `app_role` adalah tipe enum untuk kolom `user_roles.role` yang membatasi nilai role yang sah, sama seperti `order_status` untuk `orders.status`. Penjelasan ini ditambahkan ke rencana sebelum disetujui.

## Tahap 9 — Fungsi DB Pesanan (Issue #3)

**22. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #3 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 3

Hasil: AI membaca issue #3, migration #2, ERD, PRD, dan Flowchart, lalu menyusun rencana: satu migration baru berisi `normalize_phone`, `create_order`, `get_order_status`, dan `update_order_status`, aturan hak akses per role, cara uji untuk setiap acceptance criteria, dan bagian dokumen yang perlu diperbarui. Tidak ada file yang dibuat sebelum rencana disetujui.

**23. Memberi izin akses database**

> Ya, jalankan

Hasil: Saat AI pertama kali mencoba menjalankan migration ke Supabase, pemeriksa izin otomatis Claude Code menolaknya karena tindakan itu mengubah database bersama. AI tidak mencari jalan pintas. Ia menyelesaikan pekerjaan yang tidak butuh database (dokumen, skrip uji, `npm run build`), lalu meminta izin secara eksplisit. Setelah diizinkan, migration dijalankan dan semua acceptance criteria diuji: uji logika dalam transaksi yang di-rollback, dan uji dua checkout bersamaan dengan data uji yang dihapus otomatis. Semuanya lolos.

## Tahap 10 — Katalog Produk (Issue #4)

**24. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #4 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 4

Hasil: AI membaca issue #4, skema & seed produk, PRD FR-01, Flowchart §2, dan dokumentasi caching Next.js 16 (karena `cacheComponents` aktif). Rencananya: helper `formatRupiah`, komponen gambar dengan fallback, dan grid produk di dalam `<Suspense>` tanpa cache agar stok selalu segar, plus filter `is_active` eksplisit karena admin yang login bisa membaca produk nonaktif. Setelah disetujui, saat dicek di lebar 375px teks tombol ternyata meluap, sehingga tombol dibuat boleh dua baris. Build lolos, tampilan dicek di 375px dan desktop, lalu dicek ulang di URL produksi.

## Tahap 11 — Keranjang Multi-Produk (Issue #5)

**25. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #5 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 5

Hasil: AI membaca issue #5, halaman katalog dari #4, komponen `Sheet` yang sudah ada, PRD FR-02/FR-03/US-02, dan Flowchart §2. Rencananya: keranjang disimpan di `localStorage` lewat `useSyncExternalStore` bawaan React (tanpa library tambahan), qty dibatasi stok, panel keranjang memakai `Sheet` dengan badge jumlah item di header, dan harga di keranjang hanya untuk tampilan karena total dihitung ulang server di #6. Setelah disetujui, saat dicek di lebar 375px panel ternyata hanya selebar 3/4 layar sehingga subtotal terpotong, lalu panel dibuat selebar layar di HP. Lint dan build lolos, semua acceptance criteria dicek di 375px dan desktop.

## Tahap 12 — Checkout & Halaman Sukses (Issue #6)

**26. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #6 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 6

Hasil: AI membaca issue #6, fungsi `create_order` dari #3, keranjang dari #5, PRD FR-04–FR-07, dan Flowchart §2. Karena `create_order` hanya mengembalikan kode dan total, AI menanyakan cara menampilkan ringkasan di halaman sukses; dipilih route `/checkout/success` dengan ringkasan disimpan di `sessionStorage`. Rencananya: form dengan validasi per field, hanya `product_id + qty` yang dikirim, tombol dikunci saat proses agar tidak ada pesanan ganda, dan error server (mis. stok tidak cukup) ditampilkan lalu kembali ke katalog. Setelah disetujui, saat diuji di lebar 375px tombol di halaman sukses ternyata gepeng dan tombol outline kehilangan garis tepi, lalu keduanya diperbaiki. Lint dan build lolos, semua acceptance criteria dicek di 375px dan desktop, termasuk klik ganda yang terbukti hanya membuat satu pesanan.

## Tahap 13 — Login Admin & Proteksi Role (Issue #7)

**27. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #7 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 7

Hasil: AI membaca issue #7, fungsi `is_admin()` dan RLS dari #2, client Supabase yang sudah ada, PRD FR-10/FR-17/US-06, Flowchart §5, dan dokumentasi Next.js 16 (di versi ini `middleware.ts` sudah diganti `proxy.ts`). Rencananya: `proxy.ts` menjaga `/admin/*` (belum login diarahkan ke login, bukan admin otomatis logout), Server Action untuk login dan logout, halaman login, dashboard sementara dengan tombol logout, dan langkah membuat akun admin lewat SQL dicatat di README. Setelah disetujui, form login dibungkus `<Suspense>` karena `cacheComponents` aktif. Build dan lint lolos. Redirect `/admin`, pesan password salah, dan tampilan 375px dicek di browser. AI tidak login memakai akun sungguhan karena password akan dikirim ke Supabase Auth yang di-hosting, jadi uji login dilakukan manual.

**28. Melaporkan hasil uji login manual**

> saya sudah melakukan pengecekan login:
>
> * email benar pw benar ->dashboard
> * email benar pw salah ->Email atau password salah
> * email salah pw benar ->Email atau password salah
> * email salah pw salah ->Email atau password salah
> * email benar pw benar tapi bukan admin ->Akun bukan admin

Hasil: AI mencocokkan hasil uji dengan acceptance criteria: AC1–AC3 lolos, dan pesan yang sama untuk email salah maupun password salah memang disengaja agar email terdaftar tidak bisa ditebak. AI menunjukkan bahwa AC4 (logout) belum tercakup dan memberi langkah ujinya. Setelah logout terkonfirmasi, commit di-push, issue #7 tertutup otomatis, dan deploy Vercel dicek: `/admin` di produksi mengarah ke halaman login.

## Tahap 14 — Tabel Transaksi Admin (Issue #8)

**29. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #8 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 8

Hasil: AI membaca issue #8, fungsi `update_order_status` dari #3, RLS `orders`/`order_items` dari #2, PRD FR-13–FR-15/US-09/US-10/§6.4, dan Flowchart §7. Karena semua aturan status dan pengembalian stok sudah dijamin database, rencananya murni UI tanpa migration baru: query pesanan beserta rinciannya di Server Component, tabel memakai komponen shadcn yang sudah terpasang, filter status di klien, dialog detail berisi alamat dan rincian barang, serta tombol ubah status yang hanya muncul untuk transisi sah dengan konfirmasi sebelum membatalkan. Setelah disetujui, log dev server menunjukkan error `Date.now()` saat `/admin` dirender dengan sesi admin (Cache Components), lalu diperbaiki dengan `await connection()` sebelum query. Lint dan build lolos. Di browser, dua pesanan uji baru dipakai agar pesanan yang ada tidak berubah: satu dibawa sampai Selesai (tombol ubah status hilang), satu dibatalkan dan stok produknya terbukti kembali di database. Filter tiap status dan tampilan 375px serta desktop juga dicek.

## Tahap 15 — Ringkasan Statistik & Grafik Penjualan (Issue #9)

**30. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #9 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 9

Hasil: AI membaca issue #9, migration #2/#3, halaman admin dari #8, PRD FR-11/FR-12/US-08, dan ERD §4–§5. Rencananya menyebut tiga keputusan yang perlu disetujui: "jumlah pesanan" menghitung semua status agar sama dengan jumlah baris di tabel transaksi (pesanan dibatalkan tetap tidak dihitung di omzet, barang terjual, dan grafik), hari dikelompokkan dalam zona Asia/Jakarta dengan hari tanpa penjualan tetap bernilai 0, dan grafik memakai shadcn Chart (menambah `recharts`). Setelah disetujui, AI mengerjakan dulu bagian yang tidak butuh database (komponen, halaman, ERD, lint, build), lalu meminta izin sebelum menjalankan migration.

**31. Mengizinkan migration dijalankan**

> Ya, jalankan

Hasil: Migration dijalankan, lalu keempat acceptance criteria diuji dalam transaksi yang di-rollback: angka fungsi sama dengan hitungan langsung dari tabel, pesanan yang dibatalkan mengembalikan omzet ke nilai semula, data kosong menghasilkan angka 0 dan grafik 7 hari bernilai 0, serta anon (juga lewat REST API) dan user tanpa role admin ditolak. Karena login admin di browser berarti mengirim password ke Supabase Auth yang di-hosting, tampilan dicek lewat halaman pratinjau sementara berisi angka hasil uji di lebar 375px dan desktop, lalu halaman itu dihapus sebelum commit. Saat dicek, grafik sempat terlihat kosong; ternyata tangkapan layar diambil saat animasi batang belum selesai, bukan bug. Commit di-push, issue #9 tertutup otomatis, dan deploy Vercel berhasil.

## Tahap 16 — Dashboard Real-time & Notifikasi Pesanan Baru (Issue #10)

**32. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #10 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 10

Hasil: AI membaca issue #10, halaman admin dan tabel transaksi dari #8, ringkasan dari #9, migration #2, dan Flowchart §6. Karena tabel `orders` sudah masuk publication realtime dan data dashboard sudah diambil di Server Component, rencananya cukup satu komponen klien kecil: berlangganan perubahan `orders`, menampilkan toast saat ada pesanan baru, dan memanggil `router.refresh()` agar ringkasan, grafik, dan tabel diambil ulang. Saat rencana ditinjau, AI diminta menjelaskan dari mana ia tahu publication realtime sudah aktif. Jawabannya dari file migration, sehingga rencana ditambah langkah cek langsung di database live sebelum menulis kode. Saat diuji di browser, dashboard awalnya tidak berubah: langganan terdaftar sebelum token admin terpasang sehingga tercatat sebagai `anon` dan semua event disaring RLS. AI memperbaikinya dengan memasang token sesi sebelum subscribe. Setelah itu keempat acceptance criteria lolos dengan dua tab: pesanan baru muncul beserta toast, kartu dan grafik ikut berubah, pembatalan dari tab admin lain ikut tampil, dan jumlah langganan di database tetap satu per tab saat berpindah halaman. Dua pesanan uji dibatalkan agar stok kembali. Commit di-push dan issue #10 tertutup otomatis.

## Tahap 17 — Lacak Pesanan Pelanggan (Issue #11)

**33. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #11 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 11

Hasil: AI membaca issue #11, fungsi `get_order_status` dari #3, halaman sukses dari #6 (yang sudah menautkan ke `/track?code=`), PRD FR-08/FR-09/US-05, dan Flowchart §4. Karena fungsi database sudah siap, rencana awalnya cukup dua file baru tanpa migration: halaman `/track` dan komponen form kode + nomor HP dengan polling 10 detik. Saat rencana ditinjau, AI diminta menjelaskan kenapa pelacakan harus memakai kode dan nomor HP sekaligus. AI menjelaskan alasannya (privasi dan aturan di PRD FR-08) beserta untung-rugi tiap pilihan, lalu meminta keputusan.

**34. Memilih pencarian dengan kode atau nomor HP**

> kode maupun no Hp menampilkan daftar dulu, walaupun kode menampilkan hasil 1 (seharusnya), nanti baru diklik untuk melihat detailnya

Hasil: Rencana diubah: `get_order_status(code, phone)` diganti fungsi baru `track_orders(keyword)`. Keyword berawalan `ORD-` dicari sebagai kode, selain itu sebagai nomor HP yang dinormalisasi. Hasilnya berupa daftar pesanan (tanpa nama, alamat, dan nomor HP), dan pesanan diklik untuk membuka dialog rincian. PRD, ERD, Flowchart, dan isi issue #11 di GitHub ikut masuk rencana untuk diperbarui.

**35. Meninjau rencana: polling, catatan risiko, dan jumlah hasil kode**

> kenapa harus polling? apakah memang dibutuhkan polling? kenapa ngga cukup dari pelanggannya yang melakukan refresh saja?
> seharusnya aman dan tidak perlu dicatat resikonya. Karena data order tidak terlalu bahaya
> sebenarnya kalau ini tidak harus 1, tapi hasilnya seharusnya akan selalu 1, karena setiap order kodenya berbeda, begitu bukan?

Hasil: AI menjelaskan bahwa polling secara teknis tidak wajib. Polling ada di rencana karena diminta PRD FR-09 dan dua acceptance criteria issue #11, sehingga menghapusnya berarti mengubah keduanya. AI lalu menawarkan tiga pilihan: polling, tombol "Perbarui", atau refresh manual. Catatan risiko dihapus dari rencana. AI juga membenarkan bahwa pencarian dengan kode selalu menghasilkan tepat satu pesanan (atau nol), karena kolom `orders.code` bersifat `unique` dan `create_order` membuat kode baru jika terjadi bentrok.

**36. Memilih refresh manual**

> Refresh manual saja

Hasil: Rencana final disetujui. Migration `track_orders` (beserta index `customer_phone`) dijalankan, lalu diuji sebagai `anon`: kode menghasilkan 1 pesanan; nomor HP format `0…`, `+62 …-…`, dan `62…` menghasilkan daftar yang sama; input salah, kosong, atau null menghasilkan `[]`; `get_order_status` sudah terhapus. Pencarian dari `?code=` dijalankan di server sehingga muat ulang halaman selalu menampilkan status terbaru, sedangkan nomor HP tidak dimasukkan ke URL. Tabel rincian barang di dialog admin diekstrak menjadi komponen bersama agar dipakai juga oleh halaman lacak. Saat diuji di browser ditemukan dua masalah: error `Date.now()` saat prerender (diperbaiki dengan `await connection()` seperti di `/admin`) dan fokus keyboard hilang karena input di-disable saat mencari (sekarang hanya tombol yang di-disable). Satu pesanan uji diubah ke Diproses lalu Dibatalkan; keduanya terlihat setelah halaman dimuat ulang, dan stok kembali seperti semula. PRD FR-08/FR-09/US-05, ERD §4–§5, Flowchart §4/§7, dan isi issue #11 diperbarui. Commit di-push, issue #11 tertutup otomatis, dan deploy Vercel berhasil.

## Tahap 18 — Tampilan Responsif & State Loading/Kosong/Error (Issue #12)

**37. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #12 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 12

Hasil: AI membaca issue #12, PRD NFR-01, semua halaman, dan komponen dari #4–#11, lalu membandingkan ruang lingkup dengan kondisi saat ini. Ternyata state loading (skeleton), state kosong, pesan gagal memuat, serta format Rupiah dan tanggal `id-ID` sudah ada. Yang kurang hanya halaman 404 dan error boundary. Rencana disetujui: dibuat `not-found.tsx` dan `error.tsx` (di versi Next ini prop-nya `retry`, bukan `reset`). Setelah itu semua halaman diaudit di 375px dan desktop, termasuk keranjang, dialog rincian pesanan, dan dashboard admin. Tidak ada scroll horizontal; tabel transaksi di-scroll di dalam kotaknya sendiri. Saat audit ditemukan error `Date.now()` saat prerender di katalog, yang diperbaiki dengan `await connection()` seperti di `/track` dan `/admin`. Error boundary diuji dengan rute sementara yang melempar error, lalu rute itu dihapus. Saat jaringan dimatikan di local, katalog menampilkan "Gagal memuat produk", bukan halaman putih. Link Produk di header admin ditunda ke issue #15. Build lolos, commit di-push, dan issue #12 tertutup otomatis.

## Tahap 19 — Verifikasi Akhir di URL Produksi (Issue #13)

**38. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #13 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 13

Hasil: AI membaca issue #13, PRD §9, dan acceptance criteria #3, lalu meminta dua keputusan: data uji di database produksi ditandai `UJI-13`, dibatalkan, lalu dihapus; admin login sendiri di browser pane karena AI tidak mengetik password di situs produksi. Setelah rencana disetujui, semua kriteria PRD §9 lolos di produksi. Checkout 2 produk tanpa login selesai sekitar 36 detik. Pesanan baru muncul di dashboard yang sudah terbuka tanpa refresh. Ringkasan dan grafik sama dengan query SQL. `/admin` tanpa sesi diarahkan ke `/admin/login`. Harga palsu dari klien diabaikan. Semua halaman bisa diakses di URL Vercel. Uji kritis #3 dijalankan dengan `psql` di dalam transaksi yang di-rollback: stok kurang, stok habis, dan produk nonaktif ditolak; transisi status tidak sah ditolak; pembatalan mengembalikan stok; non-admin dan anon tidak bisa mengubah status. Uji stok bersamaan memakai dua request paralel ke REST API produksi untuk stok terakhir: satu berhasil, satu ditolak, dan stok tidak minus. Kriteria "kode benar + HP salah" diganti uji `track_orders`, karena sejak #11 pelacakan memakai kode atau HP: format `08…`, `62…`, dan `+62…` memberi hasil yang sama, sedangkan kode atau HP salah memberi `[]`. Tidak ada error di console; yang muncul hanya warning font preload bawaan Next.js. Di 375px tidak ada scroll horizontal. Tidak ditemukan bug baru. Kedua pesanan uji dibatalkan lewat dashboard dan fungsi admin, lalu dihapus atas persetujuan user, dan stok kembali sama seperti awal.

## Tahap 20 — Dokumentasi Submission (Issue #14)

**39. Meminta rencana sebelum eksekusi**

> saya ingin melanjutkan issue #14 cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue 14

Hasil: AI membaca issue #14, README, dan PRD/ERD/Flowchart, lalu menemukan tiga hal: README masih template `create-next-app`, ketiga dokumen masih berstatus draft, dan fitur Kelola Produk (#15) sudah tertulis di dokumen padahal belum dibuat. Database produksi juga masih berisi 15 pesanan uji. Rencana 8 tahap disusun dengan keputusan: #15 ditandai "belum diimplementasikan" di PRD, ERD, dan Flowchart, bukan dikerjakan dulu.

**40. Memilih cara screenshot dan mereset data**

> menurutmu lebih baik Ai lewat chrome atau browser claude?
>
> misal sekarang di hapus dulu semua data transaksinya gimana? disetting ke migrasi seperti diawal, sebelum ada co co?

Hasil: AI menjelaskan bahwa screenshot dari browser pane Claude hanya masuk ke percakapan dan tidak bisa disimpan sebagai file, sehingga dipilih Chrome yang dikendalikan lewat DevTools Protocol (script Node kecil di luar repo, tanpa dependency baru). Setelah dikonfirmasi, 15 pesanan uji dihapus dan stok dikembalikan ke nilai `seed.sql` dalam satu transaksi. Pesanan contoh dengan data wajar dibuat lewat `create_order`, dan statusnya diubah lewat `update_order_status` sebagai admin, sehingga aturan transisi status tetap diperiksa database. Satu pesanan dibuat lewat checkout sungguhan untuk screenshot halaman sukses. Admin login sendiri di jendela Chrome karena AI tidak mengetik password di situs produksi. Saat mengambil screenshot, klik otomatis sempat mengenai tombol Batalkan, tetapi dialog konfirmasi "Batalkan pesanan? Stok akan dikembalikan." mencegah pembatalan, dan status pesanan dicek ulang di database. 13 screenshot (desktop dan 375px) disimpan di `docs/screenshots/`.

**41. Meninjau gambar produk**

> kondisi gambar produk saat ini masih belum sesuai, menurutmu gimana? apakah perlu saya sesuaikan?

Hasil: AI setuju gambar perlu diganti, karena `picsum.photos` memberi foto acak yang tidak sesuai nama produk dan akan terlihat di semua screenshot. AI mencari kandidat di Unsplash (hanya foto gratis, tanpa logo merek mencolok) dan menampilkannya untuk disetujui. Celana Chino disebut sebagai pilihan paling lemah karena berupa foto model. Setelah disetujui, link diganti di `seed.sql` dan di database produksi. Kode tidak perlu diubah karena `ProductImage` memakai `<img>` biasa. Setelah itu README ditulis ulang (menjalankan dari nol, arsitektur, akun admin, deploy), `USER_GUIDE.md` dibuat untuk pelanggan dan admin, dan PRD/ERD/Flowchart/ISSUES difinalkan. Flowchart §1 diperbaiki karena masih menulis "cek status berkala", padahal sejak #11 pelanggan cukup mencari ulang atau memuat ulang halaman. Klaim di ERD bahwa pendaftaran publik dimatikan dicek ke endpoint settings Supabase Auth. Semua tautan dicek (link relatif ada file-nya, link eksternal 200), 10 diagram Mermaid berhasil di-render, dan `npm run build` lolos.
