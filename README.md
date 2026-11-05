# Webku

Katalog publik berisi demo game dan file. Tombol beli/unduh mengarah ke Lynk.id.
Dihosting di Firebase Hosting, kodenya di GitHub, dan setiap commit ke `main` otomatis ter-deploy.

## Struktur

```
index.html          beranda: kartu Game dan File
detail.html         halaman detail satu produk (galeri preview + tombol)
produk.json         DAFTAR PRODUK (satu-satunya yang perlu diedit untuk menambah produk)
css/                style.css, kartu.css, detail.css
js/toko.js          fungsi bersama
games/<nama>/       file demo tiap game (harus ada index.html)
img/                gambar cover dan preview (opsional)
firebase.json       pengaturan Firebase Hosting
.github/workflows/  deploy otomatis
```

## Menambah produk

Buka `produk.json`, salin satu blok `{ ... }`, lalu ubah isinya:

| Field | Isi |
|---|---|
| `id` | nama pendek tanpa spasi, huruf kecil, unik (contoh `mewarnai-hewan`) |
| `tipe` | `"game"` atau `"file"` |
| `judul`, `deskripsi` | teks yang tampil |
| `cover` | gambar sampul: `"img/nama.webp"` atau link `https://...` (boleh dikosongkan) |
| `preview` | daftar gambar preview, contoh `["img/a.webp", "img/b.webp"]` |
| `harga` | teks harga, contoh `"Rp 25.000"` (boleh dikosongkan) |
| `linkBayar` | link produk di Lynk.id (`https://lynk.id/...`) |
| `link` | khusus game: alamat demo, contoh `"games/tebak-angka/index.html"` |
| `urutan` | angka urutan tampil, makin kecil makin atas (opsional) |
| `aktif` | isi `false` untuk menyembunyikan tanpa menghapus (opsional) |

Link Google Drive aslinya sengaja **tidak** disimpan di sini. Simpan hanya di dalam produk Lynk.id.

## Menambah demo game

1. Taruh file game di `games/<nama>/` (harus ada `index.html`).
2. Tambah entri `tipe: "game"` di `produk.json` dengan `link` ke `games/<nama>/index.html`.
