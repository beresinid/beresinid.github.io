/**
 * Beresin — server lisensi (Google Apps Script, akun vamos.shott18)
 *
 * Alur:
 *  1. Pembeli checkout di Lynk.id → Lynk mengirim webhook ke URL web app ini (?k=RAHASIA_WEBHOOK)
 *  2. Server mencatat pembeli di Sheet "Pembeli" dan MENGIRIM KODE AKTIVASI 6 digit ke email pembeli
 *  3. Pembeli buka aplikasi → menu Aktivasi → isi email + kode → perangkat itu aktif
 *  4. Tiap aplikasi dibuka (kalau online) → cek apakah lisensi masih aktif
 *
 * Pasang (sekali): lihat PANDUAN_LISENSI.md
 */

const LINK_APP = 'https://vamosshott18-cloud.github.io/beresin/';
const MAKS_PERANGKAT_DEFAULT = 2;
const KOLOM = ['email', 'nama', 'order_id', 'waktu', 'kode', 'maks_perangkat', 'perangkat', 'status', 'catatan'];

/* ---------- setup ---------- */
function setup() {
  const p = PropertiesService.getScriptProperties();
  let id = p.getProperty('SHEET_ID'), ss;
  // script dibuat dari dalam Sheet (Ekstensi → Apps Script), jadi Sheet ini yang dipakai
  if (id) ss = SpreadsheetApp.openById(id);
  else { ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Beresin Lisensi'); p.setProperty('SHEET_ID', ss.getId()); }
  let sh = ss.getSheetByName('Pembeli') || ss.insertSheet('Pembeli');
  sh.getRange(1, 1, 1, KOLOM.length).setValues([KOLOM]).setFontWeight('bold');
  sh.setFrozenRows(1);
  const log = ss.getSheetByName('Log Webhook') || ss.insertSheet('Log Webhook');
  log.getRange(1, 1, 1, 3).setValues([['waktu', 'diproses', 'isi mentah']]).setFontWeight('bold');
  const awal = ss.getSheetByName('Sheet1'); if (awal && ss.getSheets().length > 2) ss.deleteSheet(awal);
  if (!p.getProperty('RAHASIA')) p.setProperty('RAHASIA', Utilities.getUuid() + Utilities.getUuid());
  if (!p.getProperty('RAHASIA_WEBHOOK')) p.setProperty('RAHASIA_WEBHOOK', Utilities.getUuid().replace(/-/g, ''));
  Logger.log('Sheet: ' + ss.getUrl());
  Logger.log('Tambahkan di belakang URL web app untuk webhook Lynk:  ?k=' + p.getProperty('RAHASIA_WEBHOOK'));
}

function sheet_(nama) { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getSheetByName(nama); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function bersih_(e) { return String(e || '').trim().toLowerCase(); }

function cariBaris_(email) {
  const sh = sheet_('Pembeli'), data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) if (bersih_(data[i][0]) === email) {
    const o = {}; KOLOM.forEach((k, j) => o[k] = data[i][j]); o.baris = i + 1; return o;
  }
  return null;
}
function tulis_(baris, kolom, nilai) { sheet_('Pembeli').getRange(baris, KOLOM.indexOf(kolom) + 1).setValue(nilai); }

/* ---------- pembeli + email kode ---------- */
function kodeBaru_() { return String(Math.floor(100000 + Math.random() * 900000)); }

function tambahPembeli(email, nama, orderId, catatan) {
  email = bersih_(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Email tidak valid: ' + email);
  let r = cariBaris_(email);
  if (!r) {
    sheet_('Pembeli').appendRow([email, nama || '', orderId || '', new Date(), kodeBaru_(), MAKS_PERANGKAT_DEFAULT, '', 'aktif', catatan || '']);
    r = cariBaris_(email);
  }
  kirimKode_(r);
  return r;
}

function kirimKode_(r) {
  const nama = String(r.nama || '').split(' ')[0] || 'Kak';
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0D0D0D">
    <h2 style="margin:0 0 8px">Terima kasih sudah membeli Beresin, ${nama}! 🎉</h2>
    <p>Ini kode aktivasi kamu:</p>
    <p style="font-size:34px;font-weight:800;letter-spacing:8px;background:#E3EF26;display:inline-block;padding:10px 18px;border-radius:12px;margin:4px 0 16px">${r.kode}</p>
    <p><b>Cara aktivasi:</b></p>
    <ol><li>Buka <a href="${LINK_APP}">${LINK_APP}</a> di HP atau laptop</li>
    <li>Tekan <b>Aktifkan Beresin</b></li>
    <li>Masukkan email ini (<b>${r.email}</b>) dan kode di atas</li></ol>
    <p>Satu pembelian bisa dipakai di <b>${r.maks_perangkat || MAKS_PERANGKAT_DEFAULT} perangkat</b>. Simpan email ini ya.</p>
    <p><a href="${LINK_APP}landing/panduan/" style="display:inline-block;background:#0D0D0D;color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:10px">Baca panduan lengkap</a><br><span style="font-size:13px;color:#5E5E5E">Pasang di HP, setup awal, link booking, pakai di 2 perangkat, dan rekap bulanan.</span></p>
    <p style="color:#5E5E5E;font-size:13px">Butuh bantuan? Balas email ini atau chat WhatsApp FF Agency.</p></div>`;
  MailApp.sendEmail({ to: r.email, subject: 'Kode aktivasi Beresin kamu: ' + r.kode, htmlBody: html, name: 'Beresin by FF Agency' });
}

/* ---------- webhook Lynk ---------- */
function semuaNilai_(o, jalur, out) {
  if (o && typeof o === 'object') Object.keys(o).forEach(k => semuaNilai_(o[k], (jalur ? jalur + '.' : '') + k, out));
  else out.push([jalur.toLowerCase(), o]);
  return out;
}
function ambil_(pasangan, kataKunci, uji) {
  for (const kk of kataKunci) for (const [j, v] of pasangan) if (j.indexOf(kk) >= 0 && v !== null && v !== '' && (!uji || uji(String(v)))) return String(v);
  return '';
}

function orderSudahAda_(order) {
  const kol = KOLOM.indexOf('order_id') + 1, sh = sheet_('Pembeli'), n = sh.getLastRow();
  if (n < 2) return false;
  return sh.getRange(2, kol, n - 1, 1).getValues().some(([v]) => String(v) === String(order));
}

function prosesWebhook_(isi) {
  let d; try { d = JSON.parse(isi); } catch (e) { return 'bukan JSON'; }
  const p = semuaNilai_(d, '', []);
  const status = ambil_(p, ['status', 'message_action', 'event']).toLowerCase();
  if (/pending|unpaid|expired|fail|cancel|refund|gagal|batal/.test(status)) return 'dilewati: status ' + status;
  const email = ambil_(p, ['customer.email', 'buyer.email', 'email'], v => /@/.test(v)) ||
                (p.find(([, v]) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v))) || [])[1];
  if (!email) return 'email tidak ditemukan';
  // hanya produk Beresin (akun Lynk yang sama bisa menjual produk lain)
  const judul = p.filter(([j]) => /items\.\d+\.(title|name)$/.test(j)).map(([, v]) => String(v));
  if (judul.length && !judul.some(t => /beresin/i.test(t))) return 'dilewati: produk lain (' + judul.join(', ') + ')';
  const nama = ambil_(p, ['customer.name', 'buyer.name', 'customer_name', 'name']);
  const order = ambil_(p, ['refid', 'ref_id', 'order_id', 'invoice', 'transaction', 'message_id']);
  // Lynk mengirim ulang kalau balasan dianggap gagal (Apps Script selalu 302) → order yang sama tidak diproses dua kali
  if (order && orderSudahAda_(order)) return 'dobel (sudah diproses): ' + order;
  tambahPembeli(email, nama, order, 'Lynk' + (status ? ' · ' + status : ''));
  return 'ok: ' + bersih_(email);
}

/* ---------- web app ---------- */
function doGet(e) {
  const t = (e && e.parameter && e.parameter.t) || '';
  if (t) { try { return json_(bacaTautan_(t)); } catch (x) { return json_({ ok: false }); } }
  return json_({ ok: true, layanan: 'Beresin lisensi' });
}

function doPost(e) {
  const isi = (e.postData && e.postData.contents) || '';
  let m = {}; try { m = JSON.parse(isi); } catch (x) {}
  if (!m.aksi) {
    // webhook dari Lynk
    const kunci = PropertiesService.getScriptProperties().getProperty('RAHASIA_WEBHOOK');
    if ((e.parameter || {}).k !== kunci) return json_({ ok: false });
    let hasil; try { hasil = prosesWebhook_(isi); } catch (x) { hasil = 'error: ' + x.message; }
    sheet_('Log Webhook').appendRow([new Date(), hasil, isi.slice(0, 45000)]);
    return json_({ ok: true });
  }
  try {
    if (m.aksi === 'aktivasi') return json_(aktivasi_(m));
    if (m.aksi === 'cek') return json_(cek_(m));
    if (m.aksi === 'kirimUlang') return json_(kirimUlang_(m));
    if (m.aksi === 'ambilData') return json_(ambilData_(m));
    if (m.aksi === 'simpanData') return json_(simpanData_(m));
    if (m.aksi === 'daftarCadangan') return json_(daftarCadangan_(m));
    if (m.aksi === 'ambilCadangan') return json_(ambilCadangan_(m));
    if (m.aksi === 'kirimRekap') return json_(kirimRekap_(m));
    if (m.aksi === 'tautan') return json_(tautan_(m));
  } catch (x) { return json_({ ok: false, pesan: 'Server sedang bermasalah, coba lagi.' }); }
  return json_({ ok: false });
}

function token_(email, perangkat) {
  const sig = Utilities.computeHmacSha256Signature(email + '|' + perangkat, PropertiesService.getScriptProperties().getProperty('RAHASIA'));
  return Utilities.base64EncodeWebSafe(sig);
}
function daftarPerangkat_(r) { return String(r.perangkat || '').split(',').map(s => s.trim()).filter(Boolean); }

function aktivasi_(m) {
  const email = bersih_(m.email), kode = String(m.kode || '').replace(/\D/g, ''), dev = String(m.perangkat || '').slice(0, 64);
  if (!email || !kode || !dev) return { ok: false, pesan: 'Lengkapi email dan kode.' };
  const c = CacheService.getScriptCache(), kunciGagal = 'gagal_' + email, gagal = +(c.get(kunciGagal) || 0);
  if (gagal >= 5) return { ok: false, pesan: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' };
  const r = cariBaris_(email);
  if (!r || String(r.kode) !== kode) { c.put(kunciGagal, String(gagal + 1), 900); return { ok: false, pesan: 'Email atau kode tidak cocok.' }; }
  if (String(r.status).toLowerCase() !== 'aktif') return { ok: false, pesan: 'Lisensi ini sedang tidak aktif. Hubungi FF Agency.' };
  const lst = daftarPerangkat_(r), maks = +r.maks_perangkat || MAKS_PERANGKAT_DEFAULT;
  if (lst.indexOf(dev) < 0) {
    if (lst.length >= maks) return { ok: false, pesan: `Lisensi ini sudah dipakai di ${maks} perangkat. Hubungi FF Agency untuk menambah atau memindahkan perangkat.` };
    lst.push(dev); tulis_(r.baris, 'perangkat', lst.join(', '));
  }
  c.remove(kunciGagal);
  return { ok: true, email, token: token_(email, dev), nama: r.nama || '' };
}

function cek_(m) {
  const email = bersih_(m.email), dev = String(m.perangkat || '');
  if (!email || m.token !== token_(email, dev)) return { ok: false, alasan: 'token' };
  const r = cariBaris_(email);
  if (!r || String(r.status).toLowerCase() !== 'aktif' || daftarPerangkat_(r).indexOf(dev) < 0) return { ok: false, alasan: 'dicabut' };
  return { ok: true };
}

function kirimUlang_(m) {
  const email = bersih_(m.email), c = CacheService.getScriptCache();
  if (email && !c.get('ulang_' + email)) {
    c.put('ulang_' + email, '1', 120);
    const r = cariBaris_(email);
    if (r && String(r.status).toLowerCase() === 'aktif') kirimKode_(r);
  }
  // jawaban sama untuk semua email, supaya daftar pembeli tidak bisa ditebak
  return { ok: true, pesan: 'Kalau email ini terdaftar sebagai pembeli, kodenya sudah dikirim ulang. Cek juga folder Spam.' };
}

/* ---------- menu di Sheet (untuk penjualan manual, mis. lewat WA) ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Beresin')
    .addItem('Tambah pembeli + kirim kode…', 'menuTambah')
    .addItem('Kirim ulang kode ke baris terpilih', 'menuKirimUlang')
    .addToUi();
}
function menuTambah() {
  const ui = SpreadsheetApp.getUi();
  const a = ui.prompt('Email pembeli'); if (a.getSelectedButton() !== ui.Button.OK) return;
  const b = ui.prompt('Nama pembeli (boleh kosong)');
  tambahPembeli(a.getResponseText(), b.getResponseText(), '', 'manual');
  ui.alert('Kode aktivasi sudah dikirim ke ' + a.getResponseText());
}
function menuKirimUlang() {
  const sh = SpreadsheetApp.getActiveSheet(), baris = sh.getActiveRange().getRow();
  if (sh.getName() !== 'Pembeli' || baris < 2) return SpreadsheetApp.getUi().alert('Pilih baris pembeli dulu.');
  const r = cariBaris_(bersih_(sh.getRange(baris, 1).getValue()));
  if (!r) return; kirimKode_(r); SpreadsheetApp.getUi().alert('Kode dikirim ulang ke ' + r.email);
}

/* tes webhook tanpa Lynk: jalankan dari editor (ganti emailnya dulu) */
function tesWebhook() {
  Logger.log(prosesWebhook_(JSON.stringify({ event: 'payment.received', data: { status: 'SUCCESS', ref_id: 'TES-001', customer: { name: 'Tes Pembeli', email: 'GANTI@email.com' } } })));
}

/* ---------- sinkron data (cloud) ----------
 * Data tiap pembeli = 1 file JSON di folder Drive "Beresin Data" (akun ini).
 * Nama file = hash email (bukan email asli). Cadangan harian disimpan 14 hari di subfolder "Cadangan".
 * Klien mengirim rev terakhir yang dia tahu; kalau beda dengan server → konflik, klien menggabungkan lalu kirim ulang.
 */
const MAKS_CADANGAN = 14;
const MAKS_UKURAN = 20 * 1024 * 1024;

function folder_(kunci, nama, induk) {
  const p = PropertiesService.getScriptProperties(), id = p.getProperty(kunci);
  if (id) try { return DriveApp.getFolderById(id); } catch (e) {}
  const f = induk ? induk.createFolder(nama) : DriveApp.createFolder(nama);
  p.setProperty(kunci, f.getId()); return f;
}
const folderData_ = () => folder_('FOLDER_DATA', 'Beresin Data');
const folderCadangan_ = () => folder_('FOLDER_CADANGAN', 'Cadangan', folderData_());

function namaFile_(email) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email + '|' + PropertiesService.getScriptProperties().getProperty('RAHASIA'));
  return b.map(x => ('0' + (x & 255).toString(16)).slice(-2)).join('').slice(0, 32);
}
function izin_(m) { const c = cek_(m); return c.ok ? bersih_(m.email) : null; }
function fileData_(nama) { const it = folderData_().getFilesByName(nama + '.json'); return it.hasNext() ? it.next() : null; }
function bacaFile_(f) { try { return JSON.parse(f.getBlob().getDataAsString()); } catch (e) { return null; } }
const tglWIB_ = t => Utilities.formatDate(new Date(t), 'Asia/Jakarta', 'yyyy-MM-dd');

function ambilData_(m) {
  const email = izin_(m); if (!email) return { ok: false, alasan: 'izin' };
  const f = fileData_(namaFile_(email)); if (!f) return { ok: true, rev: 0, data: null };
  const isi = bacaFile_(f); if (!isi) return { ok: true, rev: 0, data: null };
  if (Number(m.rev) === isi.rev) return { ok: true, rev: isi.rev, waktu: isi.waktu, sama: true };
  return { ok: true, rev: isi.rev, waktu: isi.waktu, data: isi.data };
}

function simpanData_(m) {
  const email = izin_(m); if (!email) return { ok: false, alasan: 'izin' };
  if (!m.data || typeof m.data !== 'object' || !m.data.versi) return { ok: false, pesan: 'Data tidak valid.' };
  const teksData = JSON.stringify(m.data);
  if (teksData.length > MAKS_UKURAN) return { ok: false, pesan: 'Data terlalu besar untuk disinkron (maks 20 MB). Kurangi foto galeri.' };
  const kunci = LockService.getScriptLock(); kunci.waitLock(20000);
  try {
    const nama = namaFile_(email), f = fileData_(nama), lama = f ? bacaFile_(f) : null, rev = lama ? lama.rev : 0;
    if (Number(m.rev || 0) !== rev) return { ok: false, konflik: true, rev, waktu: lama && lama.waktu, data: lama && lama.data };
    // cadangan: salinan pertama tiap hari
    if (lama && tglWIB_(lama.waktu) !== tglWIB_(Date.now())) {
      const fc = folderCadangan_(), namaC = nama + '_' + tglWIB_(lama.waktu) + '.json';
      if (!fc.getFilesByName(namaC).hasNext()) fc.createFile(namaC, JSON.stringify(lama), 'application/json');
      const semua = []; const it = fc.searchFiles(`title contains '${nama}_'`); while (it.hasNext()) semua.push(it.next());
      semua.sort((a, b) => b.getName().localeCompare(a.getName())).slice(MAKS_CADANGAN).forEach(x => x.setTrashed(true));
    }
    const baru = { rev: rev + 1, waktu: Date.now(), perangkat: String(m.perangkat || '').slice(0, 64), data: m.data };
    const teks = JSON.stringify(baru);
    if (f) f.setContent(teks); else folderData_().createFile(nama + '.json', teks, 'application/json');
    return { ok: true, rev: baru.rev, waktu: baru.waktu };
  } finally { kunci.releaseLock(); }
}

function daftarCadangan_(m) {
  const email = izin_(m); if (!email) return { ok: false, alasan: 'izin' };
  const nama = namaFile_(email), out = [], it = folderCadangan_().searchFiles(`title contains '${nama}_'`);
  while (it.hasNext()) { const f = it.next(); out.push({ tanggal: f.getName().slice(nama.length + 1, nama.length + 11), ukuran: f.getSize() }); }
  out.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return { ok: true, cadangan: out };
}

function ambilCadangan_(m) {
  const email = izin_(m); if (!email) return { ok: false, alasan: 'izin' };
  const tgl = String(m.tanggal || ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(tgl)) return { ok: false, pesan: 'Tanggal tidak valid.' };
  const it = folderCadangan_().getFilesByName(namaFile_(email) + '_' + tgl + '.json');
  if (!it.hasNext()) return { ok: false, pesan: 'Cadangan tidak ditemukan.' };
  const isi = bacaFile_(it.next()); return isi ? { ok: true, data: isi.data, waktu: isi.waktu } : { ok: false, pesan: 'Cadangan rusak.' };
}

/* ---------- kirim rekap ke email pembeli (tombol "Kirim ke email saya") ----------
 * Hanya ke email lisensi itu sendiri (dicek lewat token perangkat), maks 10x per hari per email.
 * Lampiran dikirim dari aplikasi: PDF detail, Excel, cadangan .json. */
function kirimRekap_(m) {
  if (!cek_(m).ok) return { ok: false, pesan: 'Perangkat ini belum aktif. Aktifkan Beresin dulu.' };
  const email = bersih_(m.email), c = CacheService.getScriptCache(), kunci = 'rekap_' + email + '_' + tglWIB_(Date.now()), n = +(c.get(kunci) || 0);
  if (n >= 10) return { ok: false, pesan: 'Batas 10 kiriman per hari tercapai. Coba lagi besok.' };
  if (MailApp.getRemainingDailyQuota() < 15) return { ok: false, pesan: 'Server email sedang penuh hari ini. Coba lagi besok, atau unduh PDF/Excel langsung di halaman Laporan.' };
  const bulan = String(m.bulan || '').replace(/[^0-9-]/g, '').slice(0, 7), judul = String(m.judul || 'Rekap Beresin').slice(0, 120);
  const html = String(m.html || '').slice(0, 400000), lamp = [];
  // lampiran dibuat di aplikasi (PDF detail, Excel, cadangan .json); total dibatasi ±18 MB
  let total = 0;
  (Array.isArray(m.lampiran) ? m.lampiran : []).slice(0, 5).forEach(l => {
    const b64 = String(l.b64 || ''); total += b64.length; if (!b64 || total > 24e6) return;
    const nama = String(l.nama || 'lampiran').replace(/[^\w.\-]+/g, '_').slice(0, 100), tipe = /^(application|text)\/[\w.+-]+$/.test(l.tipe) ? l.tipe : 'application/octet-stream';
    lamp.push(Utilities.newBlob(Utilities.base64Decode(b64), tipe, nama));
  });
  MailApp.sendEmail({
    to: email, name: 'Beresin', subject: judul, attachments: lamp,
    htmlBody: html + '<p style="font-family:Arial,sans-serif;font-size:12px;color:#777;margin-top:24px">Lampiran: laporan PDF detail, Excel (bisa difilter per klien/layanan/status) dan file cadangan .json (bisa dipulihkan di Beresin &rarr; Setelan &rarr; Pulihkan).<br>Dikirim dari Beresin &middot; by FF Agency</p>',
  });
  c.put(kunci, String(n + 1), 21600);
  return { ok: true, pesan: 'Terkirim ke ' + email + '. Cek juga folder Spam/Promosi.' };
}


/* ================= LINK PENDEK ================= */
// booking: <app>/<nama-usaha>  ·  invoice: <app>/i/<id>  ·  ceklist: <app>/c/<id>  ·  pesan booking: <app>/m/<id>
// isi link (data terkode dari aplikasi) disimpan sebagai file teks di Drive: Beresin Data/Beresin Tautan
const folderTautan_ = () => folder_('FOLDER_TAUTAN', 'Beresin Tautan', folderData_());
const SLUG_DILARANG = ['i', 'c', 'm', 's', 'p', 'landing', 'js', 'img', 'fonts', 'server', 'index', 'app', 'sw', 'manifest', 'beresin', 'admin', 'api', 'www', 'panduan', 'cs', 'lisensi', 'ffagency'];
function slugBersih_(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30).replace(/-+$/, ''); }
function hashPendek_(t) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t)).replace(/[^A-Za-z0-9]/g, '').slice(0, 7); }
function fileTautan_(nama) { const it = folderTautan_().getFilesByName(nama + '.txt'); return it.hasNext() ? it.next() : null; }
function tulisTautan_(nama, isi, timpa) {
  const c0 = CacheService.getScriptCache(); if (!timpa && c0.get('t_' + nama)) return;
  const f = fileTautan_(nama);
  if (f) { if (!timpa) return; f.setContent(isi); } else folderTautan_().createFile(nama + '.txt', isi, MimeType.PLAIN_TEXT);
  const c = CacheService.getScriptCache(); if (isi.length < 90000) c.put('t_' + nama, isi, 21600); else c.remove('t_' + nama);
}
function bacaTautan_(t) {
  const m = String(t).match(/^(?:([icm])\/)?([A-Za-z0-9-]{1,40})$/); if (!m) return { ok: false };
  const nama = m[1] ? m[1] + '_' + m[2] : 'p_' + m[2].toLowerCase();
  const c = CacheService.getScriptCache(), ada = c.get('t_' + nama); if (ada) return { ok: true, d: ada };
  const f = fileTautan_(nama); if (!f) return { ok: false };
  const isi = f.getBlob().getDataAsString(); if (isi.length < 90000) c.put('t_' + nama, isi, 21600);
  return { ok: true, d: isi };
}
// cek lisensi dengan cache 10 menit (link invoice dibuat sering, cek Sheet lambat)
function izinCepat_(m) {
  const c = CacheService.getScriptCache(), k = 'iz_' + hashPendek_(bersih_(m.email) + '|' + m.perangkat + '|' + m.token);
  if (c.get(k)) return bersih_(m.email);
  const email = izin_(m); if (email) c.put(k, '1', 600); return email;
}
function tautan_(m) {
  const tipe = String(m.tipe || ''), d = String(m.d || '');
  if (!/^[zp][A-Za-z0-9_-]+$/.test(d)) return { ok: false, pesan: 'Isi link tidak valid.' };
  const P = PropertiesService.getScriptProperties();
  if (tipe === 'm') {                       // dari halaman booking publik (klien vendor, tanpa lisensi)
    const slug = slugBersih_(m.slug); if (!slug || !P.getProperty('slug_' + slug) || d.length > 8000) return { ok: false };
    const c = CacheService.getScriptCache(), k = 'mh_' + slug + '_' + tglWIB_(Date.now()), n = +(c.get(k) || 0);
    if (n >= 100) return { ok: false }; c.put(k, String(n + 1), 86400);
    const id = hashPendek_('m|' + d); tulisTautan_('m_' + id, d, false); return { ok: true, id: 'm/' + id };
  }
  const email = izinCepat_(m); if (!email) return { ok: false, alasan: 'izin' };
  if (d.length > 3000000) return { ok: false, pesan: 'Isi link terlalu besar. Kurangi foto galeri.' };
  const pemilik = namaFile_(email);
  if (tipe === 'p') {
    const kunci = LockService.getScriptLock(); kunci.waitLock(15000);
    try {
      let dasar = slugBersih_(m.slug) || 'vendor'; if (dasar.length < 3 || SLUG_DILARANG.indexOf(dasar) >= 0) dasar = dasar + '-official';
      let slug = dasar, n = 2, punya;
      while ((punya = P.getProperty('slug_' + slug)) && punya !== pemilik) slug = dasar + n++;
      P.setProperty('slug_' + slug, pemilik); tulisTautan_('p_' + slug, d, true);
      return { ok: true, id: slug };
    } finally { kunci.releaseLock(); }
  }
  if (tipe === 'i' || tipe === 'c') { const id = hashPendek_(pemilik + '|' + d); tulisTautan_(tipe + '_' + id, d, false); return { ok: true, id: tipe + '/' + id }; }
  return { ok: false };
}
