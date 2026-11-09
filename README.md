# WarungFlow — Personal Warung Sales Tracker

Aplikasi pencatatan penjualan warung pribadi berbasis React, Vite, Tailwind CSS, dan LocalStorage.

## Fitur

- Dashboard ringkas untuk omzet, item, transaksi, dan aktivitas terbaru.
- Mulai dan selesaikan shift penjagaan.
- Input transaksi dengan nama produk bebas, jumlah, harga satuan, dan subtotal otomatis.
- Edit/hapus transaksi pada shift aktif.
- Riwayat shift, pencarian, dan filter tanggal.
- Detail shift dan mode koreksi transaksi untuk shift yang sudah selesai.
- Laporan harian, mingguan, dan bulanan.
- Salin ringkasan, export CSV, dan cetak / simpan sebagai PDF melalui browser.
- Backup dan restore data JSON.
- Nama penjaga dapat diubah melalui tombol profil.
- Responsive layout dengan bottom navigation untuk perangkat mobile.

## Menjalankan aplikasi

Pastikan Node.js versi 18 atau lebih baru sudah terpasang.

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite di terminal.

## Build production

```bash
npm run build
npm run preview
```

Hasil build tersedia di folder `dist/`.

## Penyimpanan data

Semua data disimpan di browser pada LocalStorage dengan key `warungflow.data.v1`. Data tidak dikirim ke server dan tidak otomatis tersinkron antarperangkat atau antarbrowser.

**Penting:** lakukan Backup Data secara berkala dari halaman Riwayat. Menghapus data browser, mengganti browser, atau berpindah perangkat dapat membuat data lokal tidak tersedia. Restore akan mengganti data lokal yang sedang digunakan.

## Export PDF

Di halaman Laporan, pilih periode lalu klik **Export PDF**. Dialog cetak browser akan terbuka; pilih **Save as PDF / Simpan sebagai PDF** sebagai tujuan printer.

## Catatan perhitungan

WarungFlow menghitung omzet kotor dari `jumlah × harga satuan`. Aplikasi tidak menghitung modal, biaya, atau keuntungan bersih.


## PWA / Installasi

WarungFlow sudah dilengkapi Web App Manifest, ikon aplikasi, dan service worker.
Setelah deploy HTTPS selesai, buka situs melalui Chrome Android, lalu gunakan
menu **Install app** atau **Add to Home screen**. Jika sebelumnya pernah dibuka,
tutup tab lama dan refresh situs setelah deployment terbaru aktif.


## Optimasi penggunaan harian

- Aplikasi langsung membuka halaman input penjualan saat dibuka.
- Jika belum ada shift aktif, halaman input menampilkan tombol mulai jaga.
- Dashboard diringkas untuk menonjolkan omzet hari ini, status shift, dan transaksi terbaru.
- Di layar HP, form input ditampilkan sebelum ringkasan shift agar pencatatan lebih cepat.


## Kategori pembayaran & catatan transaksi

Setiap transaksi mendukung status pembayaran **Lunas** atau **Utang**.
Transaksi utang mewajibkan nama pelanggan, sedangkan catatan tambahan bersifat opsional.
Laporan dan export CSV/PDF memisahkan omzet, uang yang diterima, dan nilai yang masih menjadi utang.
Transaksi lama tanpa status pembayaran tetap dibaca sebagai **Lunas** agar data LocalStorage sebelumnya kompatibel.


## PDF export

Tombol Export PDF membuka dialog cetak browser. Pilih **Save as PDF / Simpan sebagai PDF**.
Template cetak menggunakan layout A4 putih, ringkasan omzet, uang diterima, utang, jumlah barang,
rincian per shift, status pembayaran (Lunas/Utang), nama pelanggan yang berutang, dan catatan transaksi.
