/* Beresin — link pendek (disimpan di server lisensi) + customer service */

const KEY_TAUTAN = 'beresin_tautan';
const alamatDasar = () => alamatApp().replace(/index\.html$/, '');
const bisaPendek = () => !!LISENSI_URL && !!bacaLisensi() && !MODE_CONTOH;
async function hashTeks(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].slice(0, 10).map(x => x.toString(16).padStart(2, '0')).join(''); }
async function panggilTautan(data, ms = 9000) {
  const L = bacaLisensi() || {}, ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(LISENSI_URL, { method: 'POST', body: JSON.stringify({ aksi: 'tautan', email: L.email, perangkat: idPerangkat(), token: L.token, ...data }), signal: ac.signal }); return await r.json(); }
  finally { clearTimeout(t); }
}
const bacaSimpanTautan = () => { try { return JSON.parse(localStorage.getItem(KEY_TAUTAN)) || {}; } catch (e) { return {}; } };

/* link booking: alamat/nama-usaha — isinya otomatis diperbarui saat data berubah */
const linkBookingSingkat = () => S.profil.linkSlug && bisaPendek() ? alamatDasar() + S.profil.linkSlug : '';
let unggahBooking = null;
async function perbaruiBooking(paksa = false) {
  if (!bisaPendek() || !S.siap) return null;
  if (unggahBooking) return unggahBooking;
  unggahBooking = (async () => {
    const d = await kode(await dataPublik()), h = await hashTeks(d), mem = bacaSimpanTautan();
    if (!paksa && S.profil.linkSlug && mem.h === h && mem.s === S.profil.linkSlug) return S.profil.linkSlug;
    const j = await panggilTautan({ tipe: 'p', d, slug: S.profil.linkSlug || S.profil.slug || S.profil.nama });
    if (!j || !j.ok) return null;
    localStorage.setItem(KEY_TAUTAN, JSON.stringify({ h, s: j.id }));
    if (S.profil.linkSlug !== j.id) { S.profil.linkSlug = j.id; simpan(); }
    return j.id;
  })().catch(() => null).finally(() => { unggahBooking = null; });
  return unggahBooking;
}
/* dipakai halaman booking: pakai link pendek kalau ada (unggah di belakang), kalau belum → tunggu sekali */
async function linkPublikPendek() {
  if (!bisaPendek()) return null;
  if (S.profil.linkSlug) { perbaruiBooking(); return alamatDasar() + S.profil.linkSlug; }
  const id = await perbaruiBooking(); return id ? alamatDasar() + id : null;
}
/* invoice & ceklist: link pendek sekali jadi (isi tidak berubah) */
async function pendekkan(tipe, kodeStr) {
  if (!bisaPendek()) return null;
  try { const j = await panggilTautan({ tipe, d: kodeStr }); return j && j.ok ? alamatDasar() + j.id : null; } catch (e) { return null; }
}
/* pesan booking dari halaman publik (tanpa lisensi; server cek pemilik link) */
let SLUG_PUB = '';
async function pendekkanImpor(kodeStr) {
  if (!SLUG_PUB || !LISENSI_URL) return null;
  try { const j = await panggilTautan({ tipe: 'm', slug: SLUG_PUB, d: kodeStr }, 6000); return j && j.ok ? alamatDasar() + j.id : null; } catch (e) { return null; }
}
/* buka WA setelah menunggu link: jendela dibuka dulu supaya tidak diblokir browser */
async function bukaWAJanji(no, janjiTeks) {
  const w = window.open('', '_blank');
  if (w) { try { w.document.title = 'Membuka WhatsApp…'; w.document.body.innerHTML = '<p style="font:16px system-ui;padding:24px">Membuka WhatsApp…</p>'; } catch (e) {} }
  const teks = await janjiTeks;
  if (w && !w.closed) w.location.href = waLink(no, teks); else location.href = waLink(no, teks);
}

/* perbarui isi link booking otomatis tiap data berubah (dijeda 20 detik) */
let tTautan = 0;
const simpanSebelumTautan = simpan;
simpan = (...a) => { const r = simpanSebelumTautan(...a); if (S.profil?.linkSlug && bisaPendek()) { clearTimeout(tTautan); tTautan = setTimeout(() => perbaruiBooking(), 20000); } return r; };
setTimeout(() => { if (S.profil?.linkSlug) perbaruiBooking(); }, 8000);

/* ---------- buka link pendek: #/s/<id> (dari 404.html) ---------- */
const CACHE_TAUTAN = {};
let TAUTAN_TIPE = '';
VIEWS.s = async id => {
  id = String(id || '').replace(/^\/+|\/+$/g, '');
  const tipe = /^[icm]\//.test(id) ? id[0] : 'p';
  TAUTAN_TIPE = { p: 'p', i: 'i', c: 'c', m: 'impor' }[tipe];
  let d = CACHE_TAUTAN[id];
  if (!d) {
    $('#view').innerHTML = `<div class="pub" style="padding-top:80px">${kosong('Membuka link…', 'link')}</div>`;
    try { const r = await fetch(LISENSI_URL + '?t=' + encodeURIComponent(id)); const j = await r.json(); if (!j.ok || !j.d) throw 0; d = CACHE_TAUTAN[id] = j.d; }
    catch (e) { TAUTAN_TIPE = ''; return `<div class="pub" style="padding-top:60px">${kosong('Link tidak ditemukan atau koneksi terputus. Coba buka lagi, atau minta link terbaru ke vendor.', 'link')}</div>`; }
  }
  if (tipe === 'p') SLUG_PUB = id;
  return VIEWS[TAUTAN_TIPE](d);
};
VIEWS.s_siap = id => { if (TAUTAN_TIPE) VIEWS[TAUTAN_TIPE + '_siap']?.(CACHE_TAUTAN[String(id || '').replace(/^\/+|\/+$/g, '')]); };

/* ---------- customer service ---------- */
const CS_WA = '62895705390702', CS_TAMPIL = '0895-7053-90702';
function teksCS(topik) {
  const L = bacaLisensi(), v = (document.querySelector('script[src*="core.js"]')?.src.match(/v=(\d+)/) || [])[1] || '-';
  return `Halo CS Beresin, saya butuh bantuan: ${topik}\n\nNama usaha: ${S.profil?.nama || '-'}\nEmail lisensi: ${L?.email || '(belum aktivasi)'}\nVersi aplikasi: v${v}`;
}
const linkCS = topik => `https://wa.me/${CS_WA}?text=${encodeURIComponent(teksCS(topik))}`;
VIEWS.cs = () => `<div class="judul-hal"><div><h1>Customer Service</h1><p>Ada kendala atau pertanyaan? Chat CS Beresin lewat WhatsApp.</p></div></div>
  <div class="grid g2 masuk" style="align-items:start">
   <div class="kartu"><h3>${ik('wa')} WhatsApp CS</h3><p style="font-family:var(--judul);font-size:28px;font-weight:800;margin:4px 0 6px">${CS_TAMPIL}</p>
    <p class="muted" style="font-size:13px;margin:0 0 14px">Pesan otomatis berisi nama usaha & email lisensimu supaya CS bisa langsung bantu.</p>
    <a class="btn btn-wa btn-blok" href="${linkCS('(tulis pertanyaanmu)')}" target="_blank" rel="noopener">${ik('wa')} Chat CS sekarang</a></div>
   <div class="kartu"><h3>${ik('list')} Pilih topik</h3><div class="kartu daftar" style="box-shadow:none;padding:0">${[['Aktivasi / kode tidak masuk', 'lock'], ['Pindah atau tambah perangkat', 'grid'], ['Sinkron & data hilang', 'globe'], ['Link booking / invoice', 'link'], ['Rekap & laporan', 'chart'], ['Poster & pricelist', 'image'], ['Pertanyaan lain', 'alert']].map(([t, i]) => `<a class="item" href="${linkCS(t)}" target="_blank" rel="noopener"><div class="av">${ik(i)}</div><div class="tengah"><div class="t1">${t}</div></div>${ik('wa')}</a>`).join('')}</div>
    <p class="muted" style="font-size:13px;margin:12px 0 0">Panduan lengkap: <a href="landing/panduan/" target="_blank" rel="noopener">buka panduan pembeli</a></p></div>
  </div>`;
