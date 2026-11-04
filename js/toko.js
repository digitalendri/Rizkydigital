// Fungsi bersama untuk index.html dan detail.html (skrip biasa, bukan module).
var API = "https://rizkydigital.vercel.app";

// Link Google Drive -> gambar (file gambar harus dibagikan "Anyone with the link").
function ubahGambar(url, lebar) {
  if (!url) return "";
  var m = url.match(/\/file\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
  if (m && url.indexOf("drive.google.com") !== -1) {
    return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w" + (lebar || 600);
  }
  return url;
}

function punya(klaim, izin) {
  var akses = Array.isArray(klaim.akses) ? klaim.akses : [];
  return klaim.role === "admin" || akses.indexOf(izin) !== -1;
}

function linkAman(url) {
  return typeof url === "string" && url.indexOf("https://") === 0;
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

  a.appendChild(cover);
  a.appendChild(isi);
  return a;
}

async function ambilFile() {
  var token = await window.webku.user.getIdToken();
  var res = await fetch(API + "/api/files", {
    headers: { Authorization: "Bearer " + token },
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal memuat daftar file.");
  return data.files;
}

async function ambilGame() {
  var res = await fetch("games/daftar.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Gagal memuat daftar game.");
  return res.json();
}
