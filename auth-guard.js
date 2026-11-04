// Dipasang di setiap halaman yang harus login.
// - Halaman disembunyikan sampai status login dipastikan.
// - <meta name="butuh" content="game"> : halaman hanya untuk yang punya izin itu
//   (isi beberapa izin dipisah spasi = cukup salah satu).
// - Elemen dengan atribut data-izin="game" disembunyikan bila izinnya tidak ada.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const auth = getAuth(initializeApp(firebaseConfig));

function daftar(teks) {
  return (teks || "").split(/\s+/).filter(Boolean);
}

function boleh(klaim, dibutuhkan) {
  if (!dibutuhkan.length) return true;
  if (klaim.role === "admin") return true;
  const akses = Array.isArray(klaim.akses) ? klaim.akses : [];
  return dibutuhkan.some((x) => akses.includes(x));
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("/login.html");
    return;
  }

  let klaim = {};
  try {
    klaim = (await user.getIdTokenResult()).claims;
  } catch (err) {
    klaim = {};
  }

  const meta = document.querySelector('meta[name="butuh"]');
  if (!boleh(klaim, daftar(meta && meta.content))) {
    location.replace("/index.html");
    return;
  }

  document.querySelectorAll("[data-izin]").forEach((el) => {
    if (!boleh(klaim, daftar(el.getAttribute("data-izin")))) {
      el.style.display = "none";
    }
  });

  const tanpaIzin = document.getElementById("tanpa-izin");
  if (tanpaIzin) {
    const punya =
      klaim.role === "admin" ||
      (Array.isArray(klaim.akses) && klaim.akses.length > 0);
    tanpaIzin.hidden = punya;
  }

  const tombol = document.getElementById("btn-keluar");
  if (tombol) {
    tombol.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth).then(() => location.replace("/login.html"));
    });
  }

  window.webku = { auth, user, klaim };
  window.dispatchEvent(new Event("webku-siap"));
  document.documentElement.style.visibility = "visible";
});
