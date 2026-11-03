# Webku

Web sederhana berisi game yang bisa dimainkan di browser dan file yang bisa diunduh.
Dihosting di Firebase Hosting, kodenya disimpan di GitHub.

## Struktur

```
webku/
├── firebase.json        konfigurasi Firebase Hosting
├── public/              semua file yang tampil di web
│   ├── index.html
│   ├── games.html
│   ├── files.html
│   ├── css/style.css
│   ├── games/           satu folder per game
│   └── downloads/       file yang bisa diunduh
└── .gitignore
```

## Menjalankan di komputer

Buka folder `public` dengan ekstensi Live Server di VS Code, atau jalankan:

```
npx serve public
```

## Deploy ke Firebase

```
npm install -g firebase-tools
firebase login
firebase init hosting     # pilih proyek Firebase-mu, folder public = public, SPA = No
firebase deploy
```

Webmu akan online di `https://NAMA-PROYEK.web.app`.

## Simpan ke GitHub

```
git init
git add .
git commit -m "Versi awal"
git branch -M main
git remote add origin https://github.com/USERNAME/webku.git
git push -u origin main
```

## Menambah game baru

1. Buat folder `public/games/nama-game/` dan taruh file game di dalamnya (harus ada `index.html`).
2. Salin satu blok `.card` di `public/games.html` dan sesuaikan nama serta link-nya.
3. Untuk tombol unduh, kemas folder game jadi `.zip` dan taruh di `public/downloads/`.
