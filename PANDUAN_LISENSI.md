# Panduan lisensi Beresin (Lynk.id → kode aktivasi otomatis ke email)

## Cara kerjanya

1. Pembeli checkout di Lynk.id.
2. Lynk mengirim webhook ke server Beresin (Google Apps Script di akun **vamos.shott18**).
3. Server mencatat pembeli di Sheet **Beresin Lisensi**, lalu langsung mengirim **email berisi kode aktivasi 6 digit** ke email checkout.
4. Pembeli membuka Beresin → **Aktifkan Beresin** → isi email + kode → perangkat itu aktif.

Tanpa kode, aplikasi hanya terbuka dalam **mode contoh** (data Dina Makeup, tidak tersimpan).

---

## A. Pasang server (sekali, ±10 menit, di akun vamos.shott18)

1. Buka **sheets.new**, beri nama **Beresin Lisensi**.
2. Menu **Ekstensi → Apps Script**. Hapus isi editor, lalu tempel seluruh isi file `server/Code.gs`. Simpan (ikon disket).
3. Di atas editor, pilih fungsi **setup** → **Jalankan** → izinkan akses (Google Sheets + kirim email).
   Buka **Log eksekusi**: di situ ada kode `?k=…`. Catat kode itu.
4. **Terapkan → Deployment baru** → jenis **Aplikasi web**
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
   - **Terapkan**, lalu salin URL yang berakhiran `/exec`.
5. Kirim URL `/exec` ke Claude. Claude akan memasangnya ke aplikasi (`LISENSI_URL` di `js/lisensi.js`) dan merilisnya.
   Sejak saat itu aplikasi terkunci: tanpa kode = mode contoh.

## B. Tes tanpa Lynk

1. Di editor Apps Script, buka fungsi **tesWebhook**, ganti `GANTI@email.com` dengan email kamu, lalu **Jalankan**.
2. Email "Kode aktivasi Beresin kamu: ……" seharusnya masuk (cek juga folder Spam).
3. Buka Beresin → **Aktifkan Beresin** → masukkan email + kode itu.

## C. Sambungkan Lynk.id

1. Buat produk digital **Beresin — Lisensi Seumur Hidup** (teksnya ada di bawah).
2. Di Lynk: **Settings → Integrations → Webhooks** → tempel URL `/exec` lalu tambahkan `?k=KODE` dari langkah A3 di belakangnya. Contoh:
   `https://script.google.com/macros/s/AKfy…/exec?k=3f9a…`
   Simpan.
3. Lakukan **1 pembelian tes**, lalu cek tab **Log Webhook** di Sheet:
   - `ok: email@…` → berhasil, email kode sudah terkirim.
   - `email tidak ditemukan`, `dilewati: …`, atau error → salin isi kolom "isi mentah", kirim ke Claude, nanti pembacanya disesuaikan.
     Format data webhook Lynk tidak dijelaskan terbuka, jadi tes ini wajib.
4. Kirim link produk Lynk ke Claude. Tombol beli di landing dan aplikasi akan diarahkan ke situ (`LINK_BELI`).

## D. Kelola pembeli (di Sheet tab "Pembeli")

| Mau apa | Caranya |
|---|---|
| Pembeli minta lebih banyak perangkat | Ubah angka di kolom **maks_perangkat** (default 2) |
| Pembeli ganti HP | Hapus ID lama di kolom **perangkat**, lalu dia aktivasi ulang di HP baru |
| Cabut lisensi (mis. refund) | Ubah **status** jadi `nonaktif`. Saat aplikasinya online, dia kembali ke mode contoh |
| Jual manual lewat WA | Menu **Beresin → Tambah pembeli + kirim kode…** (muncul setelah Sheet dibuka ulang) |
| Pembeli lupa kode | Dia tekan **Kirim ulang kode** di aplikasi, atau kamu pakai menu **Kirim ulang kode ke baris terpilih** |

Batas Gmail biasa: ±100 email per hari.

## E. Sinkron data antar perangkat

Sinkron (Setelan → Sinkron data) hanya jalan kalau `LISENSI_URL` sudah diisi **dan** perangkat sudah diaktivasi. Data dan cadangan disimpan di Google Drive akun vamos.shott18.
Kalau server sudah terpasang tanpa bagian sinkron: tempel ulang seluruh `server/Code.gs`, jalankan **setup** sekali lagi (izin tambahan Google Drive), lalu **Terapkan → Kelola deployment → edit → Versi baru** supaya URL `/exec` tetap sama.

---

## Teks produk Lynk.id

**Judul:** Beresin — Aplikasi Booking & Invoice Vendor Acara (Lisensi Seumur Hidup)

**Harga:** ~~Rp 500.000~~ **Rp 100.000** (promo peluncuran sampai 30 November 2026)

**Deskripsi:**

Jadwal beres. Tagihan beres. Kamu tinggal kerja.

Beresin adalah aplikasi untuk MUA, fotografer, dekorator, WO, catering, dan vendor pernikahan & acara lainnya. Gantikan catatan WA, buku jadwal, dan invoice manual dalam satu aplikasi.

Yang kamu dapat:
- Link booking untuk bio Instagram: klien pilih layanan & tanggal sendiri
- Kalender anti-bentrok: tanggal penuh otomatis tertutup
- Invoice digital DP & pelunasan, status bayar otomatis
- Reminder & tagihan WhatsApp sekali ketuk
- Laporan omzet, laba & piutang (PDF/CSV)
- Template untuk 17 jenis vendor acara
- Sewa alat, kursus & sertifikat, tim, ceklist, poster pricelist

Sekali bayar, pakai selamanya. Tanpa biaya bulanan. Dibuka dari browser HP atau laptop, tanpa download di Play Store.

**Setelah pembayaran:** kode aktivasi dikirim otomatis ke email kamu. Buka https://beresinid.github.io/ → tekan **Aktifkan Beresin** → masukkan email & kode. Satu pembelian bisa dipakai di 2 perangkat.
