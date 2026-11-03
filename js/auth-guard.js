// Dipasang di setiap halaman yang harus login.
// Halaman disembunyikan sampai status login dipastikan.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const auth = getAuth(initializeApp(firebaseConfig));

onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.replace("/login.html");
    return;
  }
  document.documentElement.style.visibility = "visible";

  const tombol = document.getElementById("btn-keluar");
  if (tombol) {
    tombol.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth).then(() => location.replace("/login.html"));
    });
  }
});
