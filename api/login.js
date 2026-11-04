// Fungsi server Vercel: menukar kode undangan dengan token login Firebase.
// Kode disimpan di Firestore, koleksi "codes", ID dokumen = kodenya.
// Field dokumen: active (boolean), label (string), role ("admin" / "tamu"),
// akses (array, isi "game" dan/atau "file", dipakai untuk role "tamu"),
// maxUses (angka, opsional), expiresAt (timestamp, opsional).
const { admin, db, aturCors } = require("./_firebase");

const FieldValue = admin.firestore.FieldValue;

const MAX_GAGAL = 10; // gagal maksimal per IP
const JENDELA = 60 * 60 * 1000; // dalam 1 jam
const AKSES_VALID = ["game", "file"];

async function terlaluBanyak(ref) {
  const snap = await ref.get();
  if (!snap.exists) return false;
  const d = snap.data();
  if (Date.now() - d.start > JENDELA) return false;
  return d.count >= MAX_GAGAL;
}

async function catatGagal(ref) {
  const snap = await ref.get();
  const sekarang = Date.now();
  if (!snap.exists || sekarang - snap.data().start > JENDELA) {
    await ref.set({ count: 1, start: sekarang });
  } else {
    await ref.update({ count: FieldValue.increment(1) });
  }
}

// Menentukan peran dan izin dari dokumen kode.
// Tanpa role "admin", izin hanya yang tertulis di field akses (bawaan: kosong).
function tentukanIzin(d) {
  if (d.role === "admin") {
    return { role: "admin", akses: AKSES_VALID.slice() };
  }
  const akses = Array.isArray(d.akses)
    ? d.akses.filter((x) => AKSES_VALID.includes(x))
    : [];
  return { role: "tamu", akses };
}

module.exports = async (req, res) => {
  aturCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const attemptRef = db
    .collection("attempts")
    .doc(ip.replace(/[^a-zA-Z0-9]/g, "_"));

  try {
    if (await terlaluBanyak(attemptRef)) {
      return res
        .status(429)
        .json({ error: "Terlalu banyak percobaan. Coba lagi nanti." });
    }

    const kode = String((req.body && req.body.code) || "")
      .trim()
      .toUpperCase();

    // Kode hanya boleh huruf, angka, dan tanda hubung.
    if (!/^[A-Z0-9-]{4,40}$/.test(kode)) {
      await catatGagal(attemptRef);
      return res.status(401).json({ error: "Kode tidak valid." });
    }

    const kodeRef = db.collection("codes").doc(kode);

    const hasil = await db.runTransaction(async (tx) => {
      const snap = await tx.get(kodeRef);
      if (!snap.exists) return null;
      const d = snap.data();

      if (d.active === false) return null;
      if (
        d.expiresAt &&
        typeof d.expiresAt.toMillis === "function" &&
        d.expiresAt.toMillis() < Date.now()
      ) {
        return null;
      }
      if (d.maxUses && (d.uses || 0) >= d.maxUses) return null;

      tx.update(kodeRef, {
        uses: FieldValue.increment(1),
        lastUsed: FieldValue.serverTimestamp(),
      });
      return d;
    });

    if (!hasil) {
      await catatGagal(attemptRef);
      return res.status(401).json({ error: "Kode tidak valid." });
    }

    const izin = tentukanIzin(hasil);
    const token = await admin
      .auth()
      .createCustomToken("kode_" + kode.toLowerCase(), {
        label: hasil.label || "",
        role: izin.role,
        akses: izin.akses,
      });

    await attemptRef.delete().catch(() => {});
    return res.status(200).json({ token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
};
