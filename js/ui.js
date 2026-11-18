/* Beresin — router, navigasi, komponen bersama */
const VIEWS = {};      // nama -> fungsi(param) => html
const AKSI = {};       // data-act -> fungsi(el, ev)
const NAV = [
  ['Utama'],
  ['beranda', 'Beranda', 'home'], ['jadwal', 'Jadwal & Kalender', 'cal'], ['klien', 'Klien (CRM)', 'users'], ['keuangan', 'Keuangan', 'wallet'],
  ['Kerja'],
  ['tagih', 'Waktunya Nagih', 'invoice'], ['reminder', 'Reminder WA', 'wa'], ['radar', 'Radar Okupansi', 'radar'], ['ceklist', 'Ceklist Perlengkapan', 'list'], ['sewa', 'Penyewaan Alat', 'box'],
  ['Jualan'],
  ['halaman', 'Halaman Booking', 'globe'], ['layanan', 'Layanan & Harga', 'tag'], ['pricelist', 'Poster & Pricelist', 'image'], ['kursus', 'Kursus & Sertifikat', 'award'],
  ['Akun'],
  ['profesi', 'Jenis Usaha', 'briefcase'], ['tim', 'Tim', 'team'], ['log', 'Log Aktivitas', 'log'], ['setelan', 'Profil & Setelan', 'gear'], ['langganan', 'Lisensi', 'gift'], ['cs', 'Customer Service', 'wa'],
];
const NAV_BAWAH = [['beranda', 'Beranda', 'home'], ['jadwal', 'Jadwal', 'cal'], null, ['keuangan', 'Uang', 'wallet'], ['lainnya', 'Lainnya', 'grid']];

let rute = { nama: 'beranda', param: '' };
function bacaRute() { const h = location.hash.replace(/^#\/?/, ''); const [nama, ...p] = h.split('/'); return { nama: nama || 'beranda', param: decodeURIComponent(p.join('/')) }; }
function ke(nama, param = '') { const h = '#/' + nama + (param ? '/' + encodeURIComponent(param) : ''); if (location.hash === h) render(); else location.hash = h; }

function renderNav() {
  const tagihN = S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas' && b.tanggal <= hariIni()).length;
  const aktifNav = n => (rute.nama === n || (n === 'klien' && rute.nama === 'klien') || (n === 'jadwal' && rute.nama === 'booking')) ? 'on' : '';
  $('#navSamping').innerHTML = NAV.map(n => n.length === 1 ? `<div class="grup">${n[0]}</div>` :
    `<a href="#/${n[0]}" class="${aktifNav(n[0])}">${ik(n[2])}${n[1]}${n[0] === 'tagih' && tagihN ? `<span class="jml">${tagihN}</span>` : ''}</a>`).join('');
  const lainOn = !['beranda', 'jadwal', 'keuangan', 'booking'].includes(rute.nama);
  $('#navBawah').innerHTML = NAV_BAWAH.map(n => !n ? `<button class="fab" data-act="menuTambah" aria-label="Tambah">${'<span>' + ik('plus') + '</span>'}</button>` :
    `<a href="#/${n[0]}" class="${(n[0] === 'lainnya' ? lainOn : aktifNav(n[0])) ? 'on' : ''}">${ik(n[2])}${n[1]}</a>`).join('');
  const belum = S.notif.filter(x => !x.baca).length; const bd = $('#badgeNotif'); bd.hidden = !belum; bd.textContent = belum > 9 ? '9+' : belum;
}

async function render() {
  rute = bacaRute();
  const publik = ['p', 'i', 'c', 'impor', 's'].includes(rute.nama), imporS = rute.nama === 's' && /^m\//.test(rute.param);
  document.body.classList.toggle('publik', (publik && rute.nama !== 'impor' && !imporS) || (!publik && !S.siap));
  if (!publik && !S.siap) { $('#view').innerHTML = VIEWS.mulai(); VIEWS.mulai_siap(); return; }
  if (!publik) cekOtomatis();
  const v = VIEWS[rute.nama] || VIEWS.beranda;
  let html;
  try { html = await v(rute.param); } catch (e) { console.error(e); html = `<div class="kartu kosong">${ik('alert')}<p>Halaman ini gagal dibuka.<br><small>${esc(e.message)}</small></p><a class="btn" href="#/beranda">Ke beranda</a></div>`; }
  $('#view').innerHTML = html;
  renderNav();
  VIEWS[rute.nama + '_siap']?.(rute.param);
}

/* ---------- komponen ---------- */
const kosong = (teks, ikon = 'box', tombol = '') => `<div class="kosong">${ik(ikon)}<p>${teks}</p>${tombol}</div>`;
const inisial = n => esc(String(n || '?').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase());
const chipBayar = b => `<span class="chip ${statusBayar(b)}">${LABEL_BAYAR[statusBayar(b)]}</span>`;
const chipStatus = b => b.status === 'batal' ? '<span class="chip batal">Batal</span>' : b.status === 'baru' ? '<span class="chip neon">Baru</span>' : b.status === 'selesai' ? '<span class="chip hitam">Selesai</span>' : '';

function itemBooking(b, opsi = {}) {
  const k = klienDari(b.klienId);
  return `<div class="item" data-act="bukaBooking" data-v="${b.id}">
    <div class="waktu">${opsi.tgl ? `${keTgl(b.tanggal).getDate()}<small>${BULAN[keTgl(b.tanggal).getMonth()].slice(0, 3)}</small>` : `${esc(b.jam || '—')}<small>${b.jamSelesai ? 's/d ' + esc(b.jamSelesai) : 'mulai'}</small>`}</div>
    <div class="tengah"><div class="t1">${esc(k.nama)}</div><div class="t2">${esc(namaLayanan(b))}${b.lokasi ? ' · ' + esc(b.lokasi) : ''}</div></div>
    <div class="kanan"><b>${rpPendek(totalBooking(b))}</b>${chipStatus(b) || chipBayar(b)}</div></div>`;
}

/** kalender bulan; isiHari(tgl) => {kelas, titik, judul} */
function kalender(bulanIso, pilih, isiHari, act = 'pilihHari') {
  const awal = keTgl(bulanIso.slice(0, 7) + '-01'); const mulai = new Date(awal); mulai.setDate(1 - ((awal.getDay() + 6) % 7));
  let h = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(x => `<div class="h">${x}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = new Date(mulai); d.setDate(mulai.getDate() + i); const t = iso(d);
    if (i >= 35 && d.getMonth() !== awal.getMonth()) break;
    const x = isiHari(t) || {};
    h += `<button type="button" class="${d.getMonth() !== awal.getMonth() ? 'lain ' : ''}${t === hariIni() ? 'ini ' : ''}${t === pilih ? 'pilih ' : ''}${x.kelas || ''}" style="${x.gaya || ''}" data-act="${act}" data-v="${t}" title="${esc(x.judul || '')}" ${x.mati ? 'disabled' : ''}>${d.getDate()}${x.titik ? `<span class="titik">${'<i></i>'.repeat(Math.min(3, x.titik))}</span>` : ''}</button>`;
  }
  return `<div class="kal ${isiHari.kelas || ''}">${h}</div>`;
}
const namaBulan = ym => { const [y, m] = ym.split('-').map(Number); return BULAN[m - 1] + ' ' + y; };
const geserBulan = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return iso(d).slice(0, 7); };

function barChart(data) { // [{label, nilai, ini}]
  const maks = Math.max(1, ...data.map(d => d.nilai));
  return `<div class="bar-chart">${data.map(d => `<div class="b ${d.nilai ? '' : 'nol'} ${d.ini ? 'ini' : ''}" title="${esc(d.label)}: ${rp(d.nilai)}"><div class="trk"><em>${d.nilai ? rpPendek(d.nilai).replace('Rp ', '') : ''}</em><i style="height:${Math.max(3, d.nilai / maks * 82)}%"></i></div><small>${esc(d.label)}</small></div>`).join('')}</div>`;
}

/* ---------- pengingat otomatis (dicek tiap render) ---------- */
function cekOtomatis() {
  const hari = hariIni(); let berubah = false;
  (S.setelan.reminder || []).filter(r => r.aktif).forEach(r => {
    S.booking.filter(b => aktif(b) && b.status !== 'selesai' && selisihHari(hari, b.tanggal) === Number(r.h)).forEach(b => {
      const key = 'n_' + b.id + '_h' + r.h + '_' + hari;
      if (!S.terkirim[key]) { S.terkirim[key] = 1; beriNotif(`Reminder H-${r.h}: ${klienDari(b.klienId).nama}`, `${namaLayanan(b)} · ${tglPanjang(b.tanggal)}. Kirim pengingat WA sekarang.`, 'reminder'); berubah = true; }
    });
  });
  S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas' && b.tanggal < hari && b.tanggal >= tambahHari(hari, -60)).forEach(b => {
    const key = 'tagih_' + b.id + '_' + hari.slice(0, 7);
    if (!S.terkirim[key]) { S.terkirim[key] = 1; beriNotif('Waktunya nagih: ' + klienDari(b.klienId).nama, `Sisa ${rp(sisaBayar(b))} untuk ${namaLayanan(b)}.`, 'tagih'); berubah = true; }
  });
  if (berubah) simpan();
}
