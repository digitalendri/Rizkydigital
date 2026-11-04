// Fungsi server Vercel: memberi daftar file (katalog) hanya kepada pengguna
// yang login dan punya izin. Link Google Drive asli TIDAK dikirim ke browser.
// Data ada di Firestore, koleksi "files". Field tiap dokumen:
//   judul (string), deskripsi (string, opsional),
//   cover (string https, opsional), preview (array string https, opsional),
//   linkBayar (string https, link.id dsb.),
//   izin ("file" atau "game"), aktif (boolean, opsional), urutan (angka, opsional)
//   link (link Drive asli) boleh tetap disimpan di Firestore untuk arsipmu,
//   tapi tidak pernah dikirim lewat API ini.
const { admin, db, aturCors } = require("./_firebase");

function https(x) {
  return typeof x === "string" && x.startsWith("https://");
}

module.exports = async (req, res) => {
  aturCors(req, res);
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metode tidak diizinkan." });
  }

  const cocok = (req.headers.authorization || "").match(/^Bearer (.+)$/);
  if (!cocok) {
    return res.status(401).json({ error: "Belum login." });
  }

  let klaim;
  try {
    klaim = await admin.auth().verifyIdToken(cocok[1]);
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Sesi tidak valid. Silakan keluar lalu masuk lagi." });
  }

  try {
    const adalahAdmin = klaim.role === "admin";
    const akses = Array.isArray(klaim.akses) ? klaim.akses : [];

    const snap = await db.collection("files").get();
    const hasil = [];

    snap.forEach((doc) => {
      const d = doc.data();
      if (d.aktif === false) return;

      const izin = d.izin === "game" ? "game" : "file";
      if (!adalahAdmin && !akses.includes(izin)) return;

      hasil.push({
        id: doc.id,
        judul: d.judul || doc.id,
        deskripsi: d.deskripsi || "",
        cover: https(d.cover) ? d.cover : "",
        preview: Array.isArray(d.preview)
          ? d.preview.filter(https).slice(0, 20)
          : [],
        linkBayar: https(d.linkBayar) ? d.linkBayar : "",
        izin,
        urutan: typeof d.urutan === "number" ? d.urutan : 9999,
      });
    });

    hasil.sort((a, b) => a.urutan - b.urutan || a.judul.localeCompare(b.judul));
    return res.status(200).json({ files: hasil });
  } catch (err) {
    console.error("files error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
};
