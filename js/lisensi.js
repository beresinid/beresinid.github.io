/* Beresin — lisensi: tanpa aktivasi = mode contoh (data contoh, tidak tersimpan).
   LISENSI_URL = URL web app Apps Script (server/Code.gs). Kosong = penguncian mati. */
const LISENSI_URL = 'https://script.google.com/macros/s/AKfycbxzPGz37Xf1dcpqxdRc7ZN838MBoXbhWwdlJQXICu6UihujN6-RkxypC6f89nV87QmQ/exec';
const LINK_BELI = 'https://lynk.id/ffagency/oznqk7yjwqoe';   // link produk Beresin di Lynk.id; kosong = beli lewat WhatsApp
const KEY_LIS = 'beresin_lisensi', KEY_DEV = 'beresin_perangkat';

function idPerangkat() {
  let id = localStorage.getItem(KEY_DEV);
  if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : uid() + uid()).replace(/-/g, '').slice(0, 24); localStorage.setItem(KEY_DEV, id); }
  return id;
}
function bacaLisensi() { try { return JSON.parse(localStorage.getItem(KEY_LIS)) || null; } catch (e) { return null; } }
const linkBeli = () => LINK_BELI || 'https://wa.me/628159845675?text=' + encodeURIComponent('Halo FF Agency, saya mau beli Beresin (lifetime)');
async function panggilLisensi(data) {
  const r = await fetch(LISENSI_URL, { method: 'POST', body: JSON.stringify(data) });
  return r.json();
}

const MODE_CONTOH = !!LISENSI_URL && !bacaLisensi();

if (MODE_CONTOH) {
  // data asli (kalau ada) tidak disentuh; yang dipakai data contoh di memori saja
  const simpanAsli = simpan;
  let terakhirTegur = 0, diam = true, aksiUser = 0;
  ['click', 'submit', 'change'].forEach(ev => document.addEventListener(ev, () => { aksiUser = Date.now(); }, true));
  simpan = () => { if (diam || Date.now() - aksiUser > 1500) return; if (Date.now() - terakhirTegur > 4000) { terakhirTegur = Date.now(); toast('Mode contoh · perubahan tidak disimpan'); } };
  isiDataContoh(); diam = false;
  window.__simpanAsli = simpanAsli;
  document.body.classList.add('mode-contoh');
  document.body.insertAdjacentHTML('afterbegin', `<div class="pita-contoh" role="status"><span><b>Mode contoh</b> · data tidak tersimpan</span><a href="#/aktivasi" class="btn btn-neon">Aktifkan Beresin</a></div>`);
} else if (LISENSI_URL && navigator.onLine) {
  // cek di belakang: lisensi dicabut / perangkat dihapus → kembali ke mode contoh
  const L = bacaLisensi();
  panggilLisensi({ aksi: 'cek', email: L.email, perangkat: idPerangkat(), token: L.token })
    .then(j => { if (j && j.ok === false) { localStorage.removeItem(KEY_LIS); location.reload(); } })
    .catch(() => {});
}

VIEWS.aktivasi = () => {
  const L = bacaLisensi();
  if (!LISENSI_URL || L) return `<div class="judul-hal"><div><h1>Aktivasi</h1><p>${L ? 'Beresin sudah aktif di perangkat ini.' : 'Penguncian lisensi belum dinyalakan.'}</p></div></div>
    <div class="kartu">${L ? `<p>Terdaftar atas <b>${esc(L.email)}</b>.</p>` : ''}<a class="btn" href="#/beranda">Ke beranda</a></div>`;
  return `<div class="judul-hal"><div><h1>Aktifkan Beresin</h1><p>Masukkan email yang kamu pakai saat membeli dan kode 6 digit dari email pembelian.</p></div></div>
  <div class="grid g2 masuk">
    <form class="kartu" id="formAktivasi" style="display:grid;gap:14px">
      <label class="f"><span>Email pembelian</span><input class="inp" name="email" type="email" autocomplete="email" inputmode="email" required placeholder="nama@email.com"></label>
      <label class="f"><span>Kode aktivasi</span><input class="inp" name="kode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="6 digit" style="font-size:22px;letter-spacing:.3em;font-weight:700"></label>
      <p class="muted" id="pesanAktivasi" role="alert" style="margin:0;min-height:1.2em"></p>
      <button class="btn btn-merah" type="submit">${ik('check')} Aktifkan</button>
      <button class="btn" type="button" data-act="kirimUlangKode">${ik('mail')} Kirim ulang kode ke email</button>
    </form>
    <div class="kartu"><h3>Belum punya kode?</h3><p>Kode dikirim otomatis ke email kamu setelah pembayaran berhasil. Cek juga folder Spam atau Promosi.</p>
      <a class="btn btn-neon" target="_blank" rel="noopener" href="${linkBeli()}">${ik('gift')} Beli Beresin</a>
      <p class="muted" style="font-size:13px;margin-top:12px">Sambil menunggu, kamu bisa menjelajah aplikasi dengan data contoh.</p>
      <a class="btn" href="landing/panduan/" target="_blank" rel="noopener" style="margin-top:6px">${ik('list')} Panduan lengkap</a></div>
  </div>`;
};
VIEWS.aktivasi_siap = () => {
  const f = document.getElementById('formAktivasi'); if (!f) return;
  const pesan = t => { document.getElementById('pesanAktivasi').textContent = t; };
  f.onsubmit = async e => {
    e.preventDefault(); const tombol = f.querySelector('[type=submit]'); tombol.disabled = true; pesan('Memeriksa…');
    try {
      const j = await panggilLisensi({ aksi: 'aktivasi', email: f.email.value, kode: f.kode.value, perangkat: idPerangkat() });
      if (!j.ok) { pesan(j.pesan || 'Aktivasi gagal.'); tombol.disabled = false; return; }
      localStorage.setItem(KEY_LIS, JSON.stringify({ email: j.email, token: j.token, waktu: Date.now() }));
      pesan('Berhasil! Beresin aktif di perangkat ini.');
      setTimeout(() => { location.hash = '#/beranda'; location.reload(); }, 900);
    } catch (x) { pesan('Tidak bisa terhubung. Periksa internet lalu coba lagi.'); tombol.disabled = false; }
  };
};
AKSI.kirimUlangKode = async () => {
  const f = document.getElementById('formAktivasi'), email = f.email.value.trim();
  const pesan = document.getElementById('pesanAktivasi');
  if (!email) { pesan.textContent = 'Isi email pembelian dulu.'; f.email.focus(); return; }
  pesan.textContent = 'Mengirim…';
  try { const j = await panggilLisensi({ aksi: 'kirimUlang', email }); pesan.textContent = j.pesan || 'Terkirim.'; }
  catch (x) { pesan.textContent = 'Tidak bisa terhubung. Periksa internet lalu coba lagi.'; }
};
