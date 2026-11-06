// Fungsi bersama untuk index.html dan detail.html (skrip biasa, bukan module).
// Semua data katalog dibaca dari produk.json. Tidak ada login dan tidak ada server.

// Link Google Drive -> gambar (file gambar harus dibagikan "Anyone with the link").
// Alamat lain hanya diterima kalau diawali https:// atau berupa folder img/ di web ini.
function ubahGambar(url, lebar) {
  if (!url || typeof url !== "string") return "";
  var m = url.match(/\/file\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
  if (m && url.indexOf("drive.google.com") !== -1) {
    return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w" + (lebar || 600);
  }
  if (url.indexOf("https://") === 0 || /^img\/[\w\-\/.]+$/.test(url)) return url;
  return "";
}

function linkAman(url) {
  return typeof url === "string" && url.indexOf("https://") === 0;
}

// Demo game boleh berupa halaman di folder games/ atau alamat https.
function linkDemo(url) {
  return (
    typeof url === "string" &&
    (url.indexOf("https://") === 0 || /^games\/[\w\-\/.]+$/.test(url))
  );
}

function pasangGambar(wadah, url, lebar) {
  var src = ubahGambar(url, lebar);
  if (!src) return null;
  var img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  img.referrerPolicy = "no-referrer";
  img.onerror = function () { img.remove(); };
  img.src = src;
  wadah.appendChild(img);
  return img;
}

function buatKotak(item, href) {
  var a = document.createElement("a");
  a.className = "kotak";
  a.href = href;

  var cover = document.createElement("div");
  cover.className = "cover";
  cover.textContent = (item.judul || "?").trim().charAt(0).toUpperCase();
  pasangGambar(cover, item.cover, 600);

  var isi = document.createElement("div");
  isi.className = "isi";
  var judul = document.createElement("strong");
  judul.textContent = item.judul;
  isi.appendChild(judul);
  if (item.deskripsi) {
    var meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.deskripsi;
    isi.appendChild(meta);
  }
  if (item.harga) {
    var harga = document.createElement("div");
    harga.className = "harga";
    harga.textContent = item.harga;
    isi.appendChild(harga);
  }

  a.appendChild(cover);
  a.appendChild(isi);
  return a;
}

async function ambilProduk() {
  var res = await fetch("/produk.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Gagal memuat daftar produk.");
  var data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter(function (p) { return p && p.id && p.aktif !== false; })
    .sort(function (a, b) {
      var ua = typeof a.urutan === "number" ? a.urutan : 9999;
      var ub = typeof b.urutan === "number" ? b.urutan : 9999;
      return ua - ub || String(a.judul).localeCompare(String(b.judul));
    });
}

async function ambilTools() {
  return (await ambilProduk()).filter(function (p) { return p.tipe === "tools"; });
}
async function ambilGame() {
  return (await ambilProduk()).filter(function (p) { return p.tipe === "game"; });
}

async function ambilFile() {
  return (await ambilProduk()).filter(function (p) { return p.tipe !== "game" && p.tipe !== "tools"; });
}
