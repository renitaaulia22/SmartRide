# SmartRide — SPK Evaluasi & Rekomendasi Transportasi Online (15 Kriteria)

Sistem web kuesioner interaktif & **Mesin Rekomendasi Sistem Pendukung Keputusan (SPK)** generasi terbaru untuk proyek **SmartRide**. Dirancang dengan antarmuka modern (*Glassmorphism, Stepper Dinamis, Emoji Likert Matrix*) yang berfokus pada 3 platform transportasi online utama di Indonesia: **Gojek**, **Grab**, dan **Maxim** dengan **15 Kriteria Evaluasi Komprehensif**.

Sistem ini terhubung langsung dengan **Google Sheets Cloud Database**, memungkinkan sinkronisasi data antar-perangkat secara *real-time* (responden mengisi di HP, admin memantau langsung di laptop).

---

## 🌟 15 Kriteria Evaluasi SPK Lengkap

1. **`[K1] 💰 Tarif & Keterjangkauan`**: Kewajaran dan transparansi harga sesuai jarak tempuh.
2. **`[K2] ⚡ Kecepatan Penjemputan`**: Respons pesanan dan waktu kedatangan driver yang singkat (<5-8 menit).
3. **`[K3] 🛡️ Keamanan & Tombol Darurat`**: Fitur SOS darurat, live tracking perjalanan, serta verifikasi identitas driver.
4. **`[K4] ✨ Kenyamanan & Kebersihan Armada`**: Kondisi fisik kendaraan, kursi empuk, helm wangi, dan jas hujan prima.
5. **`[K5] 🎁 Promo & Potongan Harga`**: Ketersediaan voucher diskon tarif, cashback e-wallet, dan paket langganan.
6. **`[K6] 📱 Kemudahan & Kecepatan Aplikasi`**: Antarmuka ringan, minim crash/bug, dan responsivitas aplikasi tinggi.
7. **`[K7] 🤝 Sikap & Keramahan Driver`**: Kesopanan, kepatuhan lalu lintas, dan etika berkendara yang aman.
8. **`[K8] 📍 Keakuratan Peta & Rute Navigasi`**: Presisi titik jemput dan rute navigasi peta tanpa salah arah.
9. **`[K9] 🌧️ Ketersediaan di Jam Sibuk & Cuaca Buruk`**: Kemudahan mendapatkan driver saat *rush hour* atau hujan lebat.
10. **`[K10] 💳 Fleksibilitas Metode Pembayaran`**: Kelengkapan opsi pembayaran (GoPay, OVO, QRIS, Kartu Kredit, Tunai).
11. **`[K11] ⚖️ Transparansi Biaya & Kebijakan Batal`**: Tidak ada lonjakan tarif tak wajar (*surge pricing*) dan aturan pembatalan adil.
12. **`[K12] 🎧 Responsivitas Layanan Pelanggan (CS)`**: Kecepatan penanganan keluhan, barang tertinggal, dan pengembalian dana (*refund*).
13. **`[K13] 🏥 Perlindungan Asuransi Perjalanan`**: Polis asuransi kecelakaan diri/jiwa resmi yang terjamin dan jelas.
14. **`[K14] 🗓️ Fitur Booking Terjadwal & Multi-Stop`**: Kemudahan menjadwalkan penjemputan atau memesan rute dengan beberapa titik singgah.
15. **`[K15] ⏱️ Ketepatan Estimasi Waktu Tiba (ETA)`**: Presisi perkiraan durasi perjalanan dan waktu kedatangan driver dengan kondisi lalu lintas riil.

---

## 🚀 Mesin Rekomendasi SPK Otomatis (*Smart Decision Engine*)

- **3 Alternatif Evaluasi:**
  - 🟢 **Gojek:** *Super-App Cepat & Ekosistem Terlengkap* (Unggul pada kecepatan jemput, kepadatan armada jam sibuk/hujan, integrasi GoPay, dan algoritma ETA presisi).
  - 🟢 **Grab:** *Standar Keamanan Korporat & Armada Terstandarisasi* (Unggul pada fitur keamanan SOS terverifikasi, asuransi komprehensif, armada bersih, booking terjadwal, dan CS 24/7).
  - 🟡 **Maxim:** *Juara Tarif Paling Hemat & Ramah Anggaran* (Unggul mutlak pada tarif termurah, rute jarak jauh tanpa lonjakan tarif ekstrem, dan hemat pengeluaran rutin).
- **Layar Hasil & Peringkat Komparasi (Step 3):**
  - **Winner Hero Card:** Menampilkan brand pemenang rekomendasi utama dengan persentase kecocokan (*Match Score*, misal `94% Cocok`), tagline, dan ulasan alasan kesesuaian.
  - **Peringkat Komparasi 3 Alternatif:** Menampilkan perbandingan kesesuaian untuk ketiga aplikasi (🥇 Rekomendasi Utama, 🥈 Alternatif Baik, 🥉 Alternatif Hemat) dengan meteran bar warna khas masing-masing brand.
  - **Tiket Konfirmasi Digital:** Kode tiket unik responden, badge status cloud sync, profil demografi, dan rata-rata skor Likert.

---

## ☁️ Integrasi Google Sheets (Multi-Perangkat HP & Laptop)

Data formulir terhubung langsung secara otomatis ke Google Apps Script Webhook:
- **Pengiriman Otomatis**: Setiap responden menekan tombol submit (di HP maupun laptop), data langsung dikirim via HTTP POST ke spreadsheet.
- **Tarik Data Otomatis**: Saat admin membuka Admin Dashboard di perangkat manapun, sistem otomatis mengambil data terbaru dari Google Sheets via `doGet`.
- **Tombol "Sinkronkan Cloud"**: Admin dapat menekan tombol ini sewaktu-waktu untuk memperbarui data spreadsheet secara instan.

---

## 🔐 Akses Administrator (Dirahasiakan)

Akses Dashboard Admin dikunci dan dilindungi:
- **Username**: `admin`
- **Password**: `smartride123` *(atau `admin`)*
- Informasi kredensial **tidak ditampilkan** pada modal login atau antarmuka umum demi keamanan internal tim.

---

## 💻 Cara Menjalankan

Cukup buka file `index.html` langsung di browser, atau jalankan server lokal:

```powershell
python -m http.server 3000 --directory "C:\Users\A314 RYZEN 5\.gemini\antigravity\scratch\smartride-kuesioner"
```
Akses di: `http://localhost:3000`
