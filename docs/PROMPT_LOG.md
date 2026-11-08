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

## Pola Prompt per Issue (Tahap 8–21)

Mulai issue #2, setiap issue dibuka dengan prompt yang sama; hanya nomor issue (`n`) yang berbeda. AI harus menunjukkan rencana dulu dan baru boleh mengubah kode setelah rencana disetujui:

> saya ingin melanjutkan issue #n cek pada @docs/ISSUES.md dan pada github, sebelum melakukan eksekusi, saya ingin melihat tahapan yang akan kamu lakukan terlebih dahulu.
> tampilkan outputnya secara ringkas dan rapi serta terstruktur.
>
> note: jangan lakukan perubahan/generate kode atau apapun, sebelum saya setujui rencana implementasi issue n

Di bawah ini prompt tersebut ditulis singkat sebagai **Pola per issue (n = …)**.

## Tahap 8 — Skema Database (Issue #2)

**19. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 2)**

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

Prompt: **Pola per issue (n = 3)**

Hasil: AI membaca issue #3, migration #2, ERD, PRD, dan Flowchart, lalu menyusun rencana: satu migration baru berisi `normalize_phone`, `create_order`, `get_order_status`, dan `update_order_status`, aturan hak akses per role, cara uji untuk setiap acceptance criteria, dan bagian dokumen yang perlu diperbarui. Tidak ada file yang dibuat sebelum rencana disetujui.

**23. Memberi izin akses database**

> Ya, jalankan

Hasil: Saat AI pertama kali mencoba menjalankan migration ke Supabase, pemeriksa izin otomatis Claude Code menolaknya karena tindakan itu mengubah database bersama. AI tidak mencari jalan pintas. Ia menyelesaikan pekerjaan yang tidak butuh database (dokumen, skrip uji, `npm run build`), lalu meminta izin secara eksplisit. Setelah diizinkan, migration dijalankan dan semua acceptance criteria diuji: uji logika dalam transaksi yang di-rollback, dan uji dua checkout bersamaan dengan data uji yang dihapus otomatis. Semuanya lolos.

## Tahap 10 — Katalog Produk (Issue #4)

**24. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 4)**

Hasil: AI membaca issue #4, skema & seed produk, PRD FR-01, Flowchart §2, dan dokumentasi caching Next.js 16 (karena `cacheComponents` aktif). Rencananya: helper `formatRupiah`, komponen gambar dengan fallback, dan grid produk di dalam `<Suspense>` tanpa cache agar stok selalu segar, plus filter `is_active` eksplisit karena admin yang login bisa membaca produk nonaktif. Setelah disetujui, saat dicek di lebar 375px teks tombol ternyata meluap, sehingga tombol dibuat boleh dua baris. Build lolos, tampilan dicek di 375px dan desktop, lalu dicek ulang di URL produksi.

## Tahap 11 — Keranjang Multi-Produk (Issue #5)

**25. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 5)**

Hasil: AI membaca issue #5, halaman katalog dari #4, komponen `Sheet` yang sudah ada, PRD FR-02/FR-03/US-02, dan Flowchart §2. Rencananya: keranjang disimpan di `localStorage` lewat `useSyncExternalStore` bawaan React (tanpa library tambahan), qty dibatasi stok, panel keranjang memakai `Sheet` dengan badge jumlah item di header, dan harga di keranjang hanya untuk tampilan karena total dihitung ulang server di #6. Setelah disetujui, saat dicek di lebar 375px panel ternyata hanya selebar 3/4 layar sehingga subtotal terpotong, lalu panel dibuat selebar layar di HP. Lint dan build lolos, semua acceptance criteria dicek di 375px dan desktop.

## Tahap 12 — Checkout & Halaman Sukses (Issue #6)

**26. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 6)**

Hasil: AI membaca issue #6, fungsi `create_order` dari #3, keranjang dari #5, PRD FR-04–FR-07, dan Flowchart §2. Karena `create_order` hanya mengembalikan kode dan total, AI menanyakan cara menampilkan ringkasan di halaman sukses; dipilih route `/checkout/success` dengan ringkasan disimpan di `sessionStorage`. Rencananya: form dengan validasi per field, hanya `product_id + qty` yang dikirim, tombol dikunci saat proses agar tidak ada pesanan ganda, dan error server (mis. stok tidak cukup) ditampilkan lalu kembali ke katalog. Setelah disetujui, saat diuji di lebar 375px tombol di halaman sukses ternyata gepeng dan tombol outline kehilangan garis tepi, lalu keduanya diperbaiki. Lint dan build lolos, semua acceptance criteria dicek di 375px dan desktop, termasuk klik ganda yang terbukti hanya membuat satu pesanan.

## Tahap 13 — Login Admin & Proteksi Role (Issue #7)

**27. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 7)**

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

Prompt: **Pola per issue (n = 8)**

Hasil:
- Rencananya murni UI tanpa migration baru, karena aturan status dan pengembalian stok sudah dijamin `update_order_status`: tabel shadcn, filter status di klien, dialog detail (alamat + rincian barang), dan tombol ubah status yang hanya muncul untuk transisi sah, dengan konfirmasi sebelum membatalkan.
- Masalah: error `Date.now()` saat `/admin` dirender dengan sesi admin (Cache Components). Diperbaiki dengan `await connection()` sebelum query.
- Uji di browser memakai dua pesanan uji baru: satu dibawa sampai Selesai (tombol ubah status hilang), satu dibatalkan dan stoknya terbukti kembali di database. Filter tiap status serta tampilan 375px dan desktop dicek. Lint dan build lolos.

## Tahap 15 — Ringkasan Statistik & Grafik Penjualan (Issue #9)

**30. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 9)**

Hasil:
- Tiga keputusan diajukan untuk disetujui: "jumlah pesanan" menghitung semua status agar sama dengan jumlah baris tabel transaksi (pesanan dibatalkan tetap tidak dihitung di omzet, barang terjual, dan grafik); hari dikelompokkan dalam zona Asia/Jakarta dengan hari kosong bernilai 0; grafik memakai shadcn Chart (menambah `recharts`).
- Bagian yang tidak butuh database (komponen, halaman, ERD, lint, build) dikerjakan dulu, lalu AI meminta izin sebelum menjalankan migration.

**31. Mengizinkan migration dijalankan**

> Ya, jalankan

Hasil:
- Migration dijalankan, lalu keempat acceptance criteria diuji dalam transaksi yang di-rollback: angka fungsi sama dengan hitungan langsung dari tabel, pembatalan mengembalikan omzet, data kosong menghasilkan 0, dan anon serta user tanpa role admin ditolak.
- Karena AI tidak login dengan password sungguhan, tampilan dicek lewat halaman pratinjau sementara di 375px dan desktop. Halaman itu dihapus sebelum commit.
- Grafik sempat terlihat kosong, ternyata karena tangkapan layar diambil sebelum animasi selesai, bukan bug. Commit di-push, issue #9 tertutup, dan deploy Vercel berhasil.

## Tahap 16 — Dashboard Real-time & Notifikasi Pesanan Baru (Issue #10)

**32. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 10)**

Hasil:
- Rencananya cukup satu komponen klien: berlangganan perubahan `orders`, menampilkan toast untuk pesanan baru, dan memanggil `router.refresh()` agar ringkasan, grafik, dan tabel diambil ulang.
- Saat rencana ditinjau, AI diminta menjelaskan dari mana ia tahu publication realtime sudah aktif. Jawabannya dari file migration, sehingga ditambahkan langkah cek langsung di database live.
- Masalah: dashboard awalnya tidak berubah karena langganan terdaftar sebagai `anon` sebelum token admin terpasang, sehingga semua event disaring RLS. Diperbaiki dengan memasang token sesi sebelum subscribe.
- Uji dengan dua tab: pesanan baru muncul beserta toast, kartu dan grafik ikut berubah, pembatalan dari tab lain ikut tampil, dan jumlah langganan tetap satu per tab. Pesanan uji dibatalkan, lalu issue #10 tertutup.

## Tahap 17 — Lacak Pesanan Pelanggan (Issue #11)

**33. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 11)**

Hasil:
- Rencana awal: halaman `/track` dan form kode + nomor HP dengan polling 10 detik, tanpa migration.
- Saat rencana ditinjau, AI diminta menjelaskan kenapa pelacakan harus memakai kode dan nomor HP sekaligus. AI menjelaskan alasannya (privasi, PRD FR-08) beserta untung-rugi tiap pilihan, lalu meminta keputusan.

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

Hasil:
- Migration `track_orders` (beserta index `customer_phone`) dijalankan dan diuji sebagai `anon`: kode menghasilkan 1 pesanan; nomor HP format `0…`, `+62 …-…`, dan `62…` menghasilkan daftar yang sama; input salah atau kosong menghasilkan `[]`; `get_order_status` sudah terhapus.
- Pencarian dari `?code=` dijalankan di server sehingga muat ulang selalu menampilkan status terbaru, sedangkan nomor HP tidak dimasukkan ke URL. Tabel rincian barang dijadikan komponen bersama untuk admin dan halaman lacak.
- Masalah: error `Date.now()` saat prerender (diperbaiki dengan `await connection()`) dan fokus keyboard hilang karena input di-disable saat mencari (sekarang hanya tombol yang di-disable).
- PRD, ERD, Flowchart, dan issue #11 diperbarui. Issue #11 tertutup dan deploy Vercel berhasil.

## Tahap 18 — Tampilan Responsif & State Loading/Kosong/Error (Issue #12)

**37. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 12)**

Hasil:
- Hasil pemeriksaan: state loading, kosong, gagal memuat, serta format Rupiah dan tanggal sudah ada. Yang kurang hanya halaman 404 dan error boundary, lalu dibuat `not-found.tsx` dan `error.tsx` (di versi Next ini prop-nya `retry`, bukan `reset`).
- Semua halaman diaudit di 375px dan desktop: tidak ada scroll horizontal, dan tabel di-scroll di dalam kotaknya sendiri. Error `Date.now()` di katalog diperbaiki dengan `await connection()`.
- Error boundary diuji dengan rute sementara yang kemudian dihapus. Saat jaringan dimatikan, katalog menampilkan "Gagal memuat produk". Link Produk di header admin ditunda ke #15. Issue #12 tertutup.

## Tahap 19 — Verifikasi Akhir di URL Produksi (Issue #13)

**38. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 13)**

Hasil:
- Dua keputusan diminta: data uji di produksi ditandai `UJI-13`, dibatalkan, lalu dihapus; admin login sendiri karena AI tidak mengetik password di situs produksi.
- Semua kriteria PRD §9 lolos di produksi: checkout 2 produk tanpa login sekitar 36 detik, pesanan baru muncul tanpa refresh, ringkasan sama dengan query SQL, `/admin` tanpa sesi diarahkan ke login, dan harga palsu dari klien diabaikan.
- Uji kritis dengan `psql` (transaksi di-rollback): stok kurang, stok habis, produk nonaktif, dan transisi status tidak sah ditolak; pembatalan mengembalikan stok; non-admin dan anon tidak bisa mengubah status. Dua request paralel untuk stok terakhir: satu berhasil, satu ditolak, dan stok tidak minus.
- Tidak ada bug baru. Pesanan uji dibatalkan lalu dihapus atas persetujuan user, dan stok kembali seperti awal.

## Tahap 20 — Dokumentasi Submission (Issue #14)

**39. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 14)**

Hasil:
- Temuan: README masih template `create-next-app`, PRD/ERD/Flowchart masih draft, Kelola Produk (#15) sudah tertulis padahal belum dibuat, dan database produksi masih berisi 15 pesanan uji.
- Rencana 8 tahap disusun, dengan keputusan #15 ditandai "belum diimplementasikan" di dokumen, bukan dikerjakan dulu.

**40. Memilih cara screenshot dan mereset data**

> menurutmu lebih baik Ai lewat chrome atau browser claude?
>
> misal sekarang di hapus dulu semua data transaksinya gimana? disetting ke migrasi seperti diawal, sebelum ada co co?

Hasil:
- Screenshot diambil lewat Chrome yang dikendalikan DevTools Protocol (script Node kecil di luar repo), karena screenshot browser pane Claude tidak bisa disimpan sebagai file.
- 15 pesanan uji dihapus dan stok dikembalikan ke nilai `seed.sql` dalam satu transaksi. Pesanan contoh dibuat lewat `create_order` dan statusnya diubah lewat `update_order_status`, sehingga aturan database tetap berlaku.
- Admin login sendiri. Klik otomatis sempat mengenai tombol Batalkan, tetapi dialog konfirmasi mencegah pembatalan, dan status dicek ulang di database.
- 13 screenshot (desktop dan 375px) disimpan di `docs/screenshots/`.

**41. Meninjau gambar produk**

> kondisi gambar produk saat ini masih belum sesuai, menurutmu gimana? apakah perlu saya sesuaikan?

Hasil:
- Foto acak dari `picsum.photos` diganti foto Unsplash yang sesuai nama produk (gratis, tanpa logo merek mencolok). Kandidat ditunjukkan dulu untuk disetujui, lalu link diganti di `seed.sql` dan di database produksi.
- README ditulis ulang, `USER_GUIDE.md` dibuat, dan PRD/ERD/Flowchart/ISSUES difinalkan. Flowchart §1 yang masih menulis "cek status berkala" diperbaiki.
- Pengecekan: klaim pendaftaran publik dimatikan dicek ke Supabase Auth, semua tautan valid, 10 diagram Mermaid berhasil di-render, dan `npm run build` lolos.

## Tahap 21 — Kelola Produk (Issue #15)

**42. Meminta rencana sebelum eksekusi**

Prompt: **Pola per issue (n = 15)**

Hasil:
- Database ternyata sudah siap (check harga dan stok ≥ 0, RLS admin, `create_order` menolak produk nonaktif, harga disalin ke `order_items`), sehingga tidak perlu migration baru.
- Dibuat halaman `/admin/products` dan `products-table.tsx` dengan pola yang sama seperti tabel transaksi, serta link **Produk** di header dashboard.
- Uji: produk baru langsung tampil di katalog, harga negatif ditolak form, dan produk nonaktif hilang dari katalog dengan checkout-nya ditolak database. Tombol **Ubah** pada baris nonaktif yang terlihat mati diperbaiki.
- Dicek di 375px dan desktop. Produk uji disisakan nonaktif sebagai contoh ("Jaket Denim Klasik"). Tanda "belum diimplementasikan" dihapus dari dokumen, User Guide mendapat bagian B6, serta lint dan build lolos.
