// Bagian bersama untuk semua fungsi: koneksi Firebase dan izin CORS.
// Nama berawalan "_" membuat Vercel tidak menjadikannya alamat publik.
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

// Alamat web yang boleh memanggil fungsi dari browser.
const ORIGIN_DIIZINKAN = [
  "https://rizkydigital.web.app",
  "https://rizkydigital.firebaseapp.com",
  "https://rizkydigital.vercel.app",
];

function aturCors(req, res) {
  const origin = req.headers.origin;
  if (ORIGIN_DIIZINKAN.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}

module.exports = { admin, db: admin.firestore(), aturCors };
