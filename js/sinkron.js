/* Beresin — sinkron cloud (butuh lisensi aktif). Data tetap disimpan di perangkat dulu (offline jalan),
   lalu dikirim ke server ±2 dtk setelah berubah. Perangkat lain menarik tiap dibuka / tiap 60 dtk.
   Kalau dua perangkat mengubah bersamaan → digabung 3 arah (pakai salinan terakhir yang sama-sama diketahui). */
const KEY_SY = 'beresin_sinkron', KEY_DASAR = 'beresin_sinkron_dasar';
const SY = (() => { try { return Object.assign({ rev: 0, kotor: false, terakhir: 0, galat: '' }, JSON.parse(localStorage.getItem(KEY_SY))); } catch (e) { return { rev: 0, kotor: false, terakhir: 0, galat: '' }; } })();
const simpanSY = () => { try { localStorage.setItem(KEY_SY, JSON.stringify(SY)); } catch (e) {} };
const bisaSinkron = () => !!LISENSI_URL && !MODE_CONTOH && !!bacaLisensi();
let sedangSinkron = false, timerDorong = 0, ubahKe = 0, perluRender = false;

function bacaDasar() { try { return JSON.parse(localStorage.getItem(KEY_DASAR)); } catch (e) { return null; } }
function simpanDasar(d) { try { localStorage.setItem(KEY_DASAR, JSON.stringify(d)); } catch (e) { localStorage.removeItem(KEY_DASAR); } }

/* ---------- gabung 3 arah ---------- */
const sama = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const objekBiasa = x => x && typeof x === 'object' && !Array.isArray(x);
const pakaiId = a => Array.isArray(a) && a.length > 0 && a.every(x => objekBiasa(x) && x.id);
function gabung3(b, l, s) {
  if (sama(l, s)) return l;
  if (b !== undefined && sama(l, b)) return s;   // hanya server yang berubah
  if (b !== undefined && sama(s, b)) return l;   // hanya perangkat ini yang berubah
  if ((pakaiId(l) || !l?.length) && (pakaiId(s) || !s?.length) && Array.isArray(l) && Array.isArray(s)) {
    const peta = a => new Map((a || []).map(x => [x.id, x]));
    const mb = peta(Array.isArray(b) ? b : []), ml = peta(l), ms = peta(s), hasil = [];
    s.forEach(x => { if (!ml.has(x.id) && (!mb.has(x.id) || !sama(mb.get(x.id), x))) hasil.push(x); }); // baru / diubah di perangkat lain (walau dihapus di sini)
    l.forEach(x => {
      if (!ms.has(x.id)) { if (!mb.has(x.id) || !sama(mb.get(x.id), x)) hasil.push(x); return; } // dihapus di sana, kecuali diubah di sini
      hasil.push(gabung3(mb.get(x.id), x, ms.get(x.id)));
    });
    return hasil;  // dihapus di satu sisi & tidak diubah di sisi lain = ikut terhapus
  }
  if (objekBiasa(l) && objekBiasa(s)) {
    const o = {}, bb = objekBiasa(b) ? b : {};
    new Set([...Object.keys(l), ...Object.keys(s)]).forEach(k => {
      if (!(k in l)) { if (!(k in bb)) o[k] = s[k]; return; }
      if (!(k in s)) { if (!(k in bb) || !sama(bb[k], l[k])) o[k] = l[k]; return; }
      o[k] = gabung3(objekBiasa(b) ? bb[k] : undefined, l[k], s[k]);
    });
    return o;
  }
  return l;  // sama-sama berubah, bukan daftar/objek → perangkat ini menang
}

/* ---------- status ---------- */
function statusSinkron() {
  if (!LISENSI_URL) return { kelas: '', teks: 'Sinkron cloud belum dinyalakan', ikon: 'lock' };
  if (!bisaSinkron()) return { kelas: '', teks: 'Aktifkan Beresin untuk menyalakan sinkron cloud', ikon: 'lock' };
  if (!navigator.onLine) return { kelas: 'dp', teks: 'Offline · tersimpan di perangkat, dikirim saat online', ikon: 'alert' };
  if (sedangSinkron) return { kelas: 'neon', teks: 'Menyinkronkan…', ikon: 'clock' };
  if (SY.galat) return { kelas: 'belum', teks: SY.galat, ikon: 'alert' };
  if (SY.kotor) return { kelas: 'dp', teks: 'Ada perubahan yang belum terkirim', ikon: 'clock' };
  return { kelas: 'lunas', teks: SY.terakhir ? 'Tersinkron · ' + jamTgl(SY.terakhir) : 'Siap disinkron', ikon: 'check' };
}
function perbaruiStatus() {
  const el = document.getElementById('statusSinkron'); if (!el) return;
  const st = statusSinkron(); el.className = 'chip ' + st.kelas; el.innerHTML = ik(st.ikon) + ' ' + esc(st.teks);
}

/* ---------- kirim & tarik ---------- */
function minta(aksi, extra = {}) {
  const L = bacaLisensi();
  return panggilLisensi(Object.assign({ aksi, email: L.email, perangkat: idPerangkat(), token: L.token }, extra));
}
function lagiMengisi() { const a = document.activeElement; return !document.getElementById('modal')?.hidden || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)); }
function pasangData(d) {
  S = Object.assign(dataAwal(), d); simpanLokal();
  if (lagiMengisi()) { perluRender = true; toast('Data baru dari perangkat lain masuk'); } else render();
}
let simpanLokal = simpan;  // diganti di bawah kalau sinkron aktif

function tanganiIzin(j) {
  if (j && j.alasan === 'izin') { SY.galat = 'Lisensi perangkat ini tidak berlaku lagi'; simpanSY(); return true; }
  return false;
}

async function dorong() {
  if (!bisaSinkron() || !SY.kotor || sedangSinkron || !navigator.onLine) return perbaruiStatus();
  sedangSinkron = true; perbaruiStatus();
  const ke = ubahKe, kirim = JSON.parse(JSON.stringify(S));
  try {
    const j = await minta('simpanData', { rev: SY.rev, data: kirim });
    if (j.ok) {
      SY.rev = j.rev; SY.terakhir = j.waktu; SY.galat = ''; simpanDasar(kirim);
      if (ubahKe === ke) SY.kotor = false;
    } else if (j.konflik) {
      const gabungan = j.data ? gabung3(bacaDasar() ?? undefined, kirim, j.data) : kirim;
      SY.rev = j.rev; simpanDasar(j.data);
      S = Object.assign(dataAwal(), gabungan); simpanLokal(); SY.kotor = true;
      if (!lagiMengisi()) render(); else perluRender = true;
      sedangSinkron = false; simpanSY(); return dorong();
    } else if (!tanganiIzin(j)) SY.galat = j.pesan || 'Gagal sinkron, dicoba lagi nanti';
  } catch (e) { SY.galat = 'Tidak bisa terhubung, dicoba lagi nanti'; }
  sedangSinkron = false; simpanSY(); perbaruiStatus();
  if (SY.kotor && !SY.galat) jadwalkanDorong();
}
function jadwalkanDorong(ms = 2500) { clearTimeout(timerDorong); timerDorong = setTimeout(dorong, ms); }

async function tarik() {
  if (!bisaSinkron() || sedangSinkron || !navigator.onLine) return perbaruiStatus();
  if (SY.kotor) return dorong();   // konflik ditangani saat kirim
  sedangSinkron = true; perbaruiStatus();
  try {
    const j = await minta('ambilData', { rev: SY.rev });
    if (j.ok) {
      SY.galat = '';
      if (!j.sama && j.data && (j.rev > SY.rev || !S.siap)) {
        if (SY.rev === 0 && S.siap) {         // perangkat ini sudah punya data sebelum sinkron dinyalakan → gabung
          S = Object.assign(dataAwal(), gabung3(undefined, S, j.data)); simpanLokal(); SY.kotor = true; render();
        } else pasangData(j.data);
        simpanDasar(j.data);
      } else if (j.rev === 0 && S.siap) SY.kotor = true;   // server masih kosong → unggah pertama
      SY.rev = j.rev; SY.terakhir = Date.now();
    } else if (!tanganiIzin(j)) SY.galat = j.pesan || 'Gagal sinkron';
  } catch (e) { SY.galat = 'Tidak bisa terhubung, dicoba lagi nanti'; }
  sedangSinkron = false; simpanSY(); perbaruiStatus();
  if (SY.kotor) dorong();
}

if (bisaSinkron()) {
  simpanLokal = simpan;
  simpan = function () { simpanLokal(); ubahKe++; SY.kotor = true; SY.galat = ''; simpanSY(); perbaruiStatus(); jadwalkanDorong(); };
  setTimeout(tarik, 800);
  setInterval(() => { if (document.visibilityState === 'visible') tarik(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tarik(); else if (SY.kotor) dorong(); });
  window.addEventListener('online', () => { SY.galat = ''; tarik(); });
  window.addEventListener('offline', perbaruiStatus);
  window.addEventListener('hashchange', () => { if (perluRender) { perluRender = false; setTimeout(render, 0); } });
  document.addEventListener('focusout', () => setTimeout(() => { if (perluRender && !lagiMengisi()) { perluRender = false; render(); } }, 300));
}

/* ---------- tampilan (kartu di Profil & Setelan) ---------- */
function kartuSinkron() {
  const st = statusSinkron(), on = bisaSinkron();
  return `<div class="sep"></div><h3>${ik('in')} Sinkron cloud</h3>
    <p style="margin:0 0 10px"><span class="chip ${st.kelas}" id="statusSinkron">${ik(st.ikon)} ${esc(st.teks)}</span></p>
    <p class="muted" style="font-size:13px;margin:0 0 10px">${on ? 'Data otomatis tersimpan di cloud dan sama di semua perangkat yang memakai lisensi ini. Cadangan harian disimpan 14 hari.' : 'Setelah aktif, data otomatis tersimpan di cloud dan bisa dibuka di HP & laptop sekaligus.'}</p>
    ${on ? `<div class="aksi-baris" style="justify-content:flex-start"><button type="button" class="btn" data-act="sinkronSekarang">${ik('clock')} Sinkron sekarang</button><button type="button" class="btn" data-act="cadanganCloud">${ik('out')} Pulihkan dari cadangan cloud</button></div>` : ''}`;
}
AKSI.sinkronSekarang = async () => { SY.galat = ''; await tarik(); const st = statusSinkron(); toast(st.teks); };
AKSI.cadanganCloud = async () => {
  if (!navigator.onLine) return toast('Butuh internet untuk membuka cadangan');
  modal(kepala('Cadangan cloud', 'Memuat daftar…') + '<div class="kosong"><p>Memuat…</p></div>');
  try {
    const j = await minta('daftarCadangan');
    const isi = !j.ok ? `<p>${esc(j.pesan || 'Gagal memuat cadangan.')}</p>` : !j.cadangan.length ? kosong('Belum ada cadangan. Cadangan pertama dibuat besok setelah data berubah.', 'clock') :
      `<div class="daftar">${j.cadangan.map(c => `<div class="item" data-act="pulihCloud" data-v="${c.tanggal}"><div class="tengah"><div class="t1">${tglPanjang(c.tanggal)}</div><div class="t2">${Math.max(1, Math.round(c.ukuran / 1024))} KB · keadaan data di akhir hari itu</div></div><div class="kanan">${ik('out')}</div></div>`).join('')}</div>`;
    modal(kepala('Cadangan cloud', 'Pilih tanggal untuk mengembalikan data ke keadaan hari itu.') + isi);
  } catch (e) { modal(kepala('Cadangan cloud') + '<p>Tidak bisa terhubung. Coba lagi.</p>'); }
};
AKSI.pulihCloud = el => konfirmasi(`Data di semua perangkat akan dikembalikan ke keadaan ${tglPanjang(el.dataset.v)}. Perubahan setelah tanggal itu hilang.`, async () => {
  try {
    const j = await minta('ambilCadangan', { tanggal: el.dataset.v });
    if (!j.ok) return toast(j.pesan || 'Gagal memulihkan');
    S = Object.assign(dataAwal(), j.data); catat('Pulihkan cadangan cloud ' + el.dataset.v, 'out'); simpan(); ke('beranda'); toast('Data dipulihkan');
  } catch (e) { toast('Tidak bisa terhubung'); }
}, 'Pulihkan');
