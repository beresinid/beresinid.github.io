/* Beresin — halaman booking publik, landing page pribadi, impor booking, ceklist klien */
const WARNA_TEMA = ['#E32B2B', '#0D0D0D', '#1E6FD9', '#1E9E5A', '#C2185B', '#8E44AD', '#E67E22'];

async function dataPublik() {
  const h = hariIni(), sibuk = {};
  S.booking.filter(b => aktif(b) && b.tanggal >= h && b.tanggal <= tambahHari(h, 120)).forEach(b => sibuk[b.tanggal] = (sibuk[b.tanggal] || 0) + 1);
  return { v: 1, n: S.profil.nama, pr: S.profil.profesi, w: S.profil.wa, ig: S.profil.ig, kt: S.profil.kota, al: S.profil.alamat, bio: S.profil.bio, hero: S.profil.hero, wr: S.profil.warna, g: (S.profil.galeri || []).slice(0, 3),
    l: S.layanan.filter(l => l.tampil !== false).map(l => [l.id, l.nama, l.harga, l.durasi, l.kategori, l.ket]), s: sibuk, cap: Number(S.setelan.kapasitasHarian) || 1, dp: S.setelan.dpPersen, km: [S.setelan.gratisKm, S.setelan.biayaPerKm], dibuat: h };
}
async function linkPublik() { return alamatApp() + '#/p/' + await kode(await dataPublik()); }

VIEWS.halaman = async () => {
  const link = await linkPublik(), p = S.profil;
  return `<div class="judul-hal"><div><h1>Halaman Booking</h1><p>Landing page + form booking pribadi. Sebar di bio IG, WA, story — klien pilih tanggal kosong & booking sendiri.</p></div>
    <div class="aksi-baris"><a class="btn" href="${esc(link)}" target="_blank" rel="noopener">${ik('globe')} Lihat halaman</a><button class="btn btn-merah" data-act="salinV" data-v="${esc(link)}">${ik('copy')} Salin link</button></div></div>
  <div class="grid g2 masuk" style="align-items:start">
   <div class="kartu"><h3>${ik('link')} Link kamu</h3><textarea class="inp" readonly style="min-height:90px;font-size:12px" onclick="this.select()">${esc(link)}</textarea>
     <div class="aksi-baris" style="justify-content:flex-start;margin-top:10px"><a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('Booking jadwal ' + p.nama + ' langsung di sini 👇\n' + link)}">${ik('wa')} Bagikan</a><button class="btn" data-act="bagikanLink">${ik('share')} Bagikan…</button></div>
     <p class="muted" style="font-size:13px;margin-top:12px">ℹ️ Link ini berisi jadwal penuh <b>per hari ini</b>. Kalau jadwal berubah banyak, salin ulang link supaya tanggal yang penuh ikut ter-update. Booking yang masuk dikirim ke WA kamu, lalu tinggal ketuk link “Masukkan ke Beresin”.</p></div>
   <div class="kartu"><h3>${ik('edit')} Tampilan halaman</h3><form class="form" id="formHalaman">
     <label class="f"><span>Judul besar</span><input name="hero" value="${esc(p.hero || '')}" placeholder="Jadwal kosong? Booking langsung di sini."></label>
     <label class="f"><span>Tentang bisnis</span><textarea name="bio" placeholder="Ceritakan keunggulanmu">${esc(p.bio || '')}</textarea></label>
     <div class="dua"><label class="f"><span>Kota</span><input name="kota" value="${esc(p.kota || '')}"></label><label class="f"><span>Instagram</span><input name="ig" value="${esc(p.ig || '')}"></label></div>
     <label class="f"><span>Alamat / area layanan</span><input name="alamat" value="${esc(p.alamat || '')}"></label>
     <div class="f"><span>Warna tema</span><div class="pilihan">${WARNA_TEMA.map(w => `<button type="button" data-act="pilihWarna" data-v="${w}" class="${p.warna === w ? 'on' : ''}" style="width:40px;height:40px;padding:0;background:${w};border:3px solid ${p.warna === w ? 'var(--neon)' : 'transparent'}" aria-label="${w}"></button>`).join('')}</div></div>
     <label class="f"><span>Maksimal booking per hari</span><input name="kapasitasHarian" type="number" min="1" value="${S.setelan.kapasitasHarian}"><small>Tanggal dengan jumlah booking segini tampil “penuh”.</small></label>
     <div class="f"><span>Galeri (maks 3 foto — dikecilkan supaya link tetap pendek)</span><div class="pub-galeri" style="grid-template-columns:repeat(3,1fr);max-width:300px">${(p.galeri || []).map((g, i) => `<div style="position:relative"><img src="${g}" alt=""><button type="button" class="ikon-btn" data-act="hapusGaleri" data-v="${i}" style="position:absolute;top:-6px;right:-6px;background:#fff;width:26px;height:26px">${ik('x')}</button></div>`).join('')}</div><button type="button" class="btn btn-kecil" data-act="tambahGaleri" style="justify-self:start">${ik('image')} Tambah foto</button></div>
     <div class="aksi-baris"><button class="btn btn-merah">Simpan tampilan</button></div></form>
     <p class="muted" style="font-size:13px">Layanan yang tampil diatur di <a href="#/layanan">Layanan & Harga</a>.</p></div>
  </div>`;
};
VIEWS.halaman_siap = () => { const f = $('#formHalaman'); if (!f) return; f.onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f)); S.setelan.kapasitasHarian = Number(d.kapasitasHarian) || 1; delete d.kapasitasHarian; Object.assign(S.profil, d); catat('Ubah halaman booking', 'globe'); simpan(); render(); toast('Tampilan tersimpan — salin ulang link'); }; };
AKSI.pilihWarna = el => { S.profil.warna = el.dataset.v; simpan(); render(); };
AKSI.hapusGaleri = el => { S.profil.galeri.splice(Number(el.dataset.v), 1); simpan(); render(); };
AKSI.tambahGaleri = () => { const inp = $('#fileGambar'); inp.onchange = async () => { for (const f of [...inp.files].slice(0, 3 - (S.profil.galeri || []).length)) S.profil.galeri.push(await kecilkan(f, 200)); inp.value = ''; simpan(); render(); }; inp.click(); };
AKSI.bagikanLink = async () => { const link = await linkPublik(); if (navigator.share) navigator.share({ title: S.profil.nama, text: 'Booking jadwal ' + S.profil.nama, url: link }).catch(() => {}); else salin(link); };
function kecilkan(file, maks) { return new Promise(res => { const img = new Image(); img.onload = () => { const s = Math.min(1, maks / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .6)); URL.revokeObjectURL(img.src); }; img.src = URL.createObjectURL(file); }); }

/* ---------- halaman publik (dilihat klien) ---------- */
let PUB = null, pubPilih = { layanan: [], tanggal: '', bulan: '' };
VIEWS.p = async k => {
  try { PUB = await urai(k); } catch (e) { return `<div class="pub" style="padding-top:60px">${kosong('Link booking tidak valid. Minta link terbaru ke vendor.', 'link')}</div>`; }
  const d = PUB; if (!pubPilih.bulan) pubPilih.bulan = hariIni().slice(0, 7);
  const prof = PROFESI[d.pr] || PROFESI.lain, kat = [...new Set(d.l.map(l => l[4] || 'Layanan'))];
  const total = pubPilih.layanan.reduce((s, id) => s + (d.l.find(l => l[0] === id)?.[2] || 0), 0);
  return `<div class="pub"><div class="pub-hero" style="background:#0D0D0D"><div class="gumpal" style="width:320px;height:320px;background:${esc(d.wr)};right:-80px;top:-120px"></div><div class="gumpal" style="width:240px;height:240px;background:${esc(d.wr)};left:-90px;bottom:-140px;opacity:.4"></div>
    <div class="ava" style="background:${esc(d.wr)}">${inisial(d.n)}</div><span class="chip" style="background:rgba(255,255,255,.12);color:#fff">${ik(prof.ikon)} ${esc(prof.nama)}${d.kt ? ' · ' + esc(d.kt) : ''}</span>
    <h1 style="margin-top:12px">${esc(d.n)}</h1><p style="font-size:18px;color:#fff;font-weight:600">${esc(d.hero || '')}</p>${d.bio ? `<p>${esc(d.bio)}</p>` : ''}
    <div class="aksi-baris" style="justify-content:flex-start;margin-top:16px"><a class="btn btn-wa" href="${waLink(d.w, 'Halo ' + d.n + ', saya mau tanya jadwal 🙏')}" target="_blank" rel="noopener">${ik('wa')} Chat</a>${d.ig ? `<a class="btn" style="background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.2)" href="https://instagram.com/${esc(d.ig.replace('@', ''))}" target="_blank" rel="noopener">${esc(d.ig)}</a>` : ''}</div></div>
   ${d.g?.length ? `<div class="pub-galeri">${d.g.map(g => `<img src="${g}" alt="Portofolio ${esc(d.n)}" loading="lazy">`).join('')}</div>` : ''}
   <div class="kartu" style="margin-top:18px"><h3>1. Pilih layanan</h3>${kat.map(kt => `<small class="muted" style="font-weight:700">${esc(kt)}</small><div class="layanan-pub" style="margin:6px 0 12px">${d.l.filter(l => (l[4] || 'Layanan') === kt).map(l => `<button type="button" class="${pubPilih.layanan.includes(l[0]) ? 'on' : ''}" data-act="pubLayanan" data-v="${l[0]}"><span><b>${esc(l[1])}</b><br><small class="muted">${l[3] ? '± ' + (l[3] >= 60 ? Math.round(l[3] / 6) / 10 + ' jam' : l[3] + ' menit') : ''}${l[5] ? ' · ' + esc(l[5]) : ''}</small></span><b>${rp(l[2])}</b></button>`).join('')}</div>`).join('')}</div>
   <div class="kartu"><div class="kal-kepala"><button class="ikon-btn" data-act="pubBulan" data-v="-1">${ik('back')}</button><h3>2. Pilih tanggal · ${namaBulan(pubPilih.bulan)}</h3><button class="ikon-btn" data-act="pubBulan" data-v="1">${ik('arrow')}</button></div>
     ${kalender(pubPilih.bulan, pubPilih.tanggal, t => { const n = d.s[t] || 0; if (t < hariIni()) return { mati: true, kelas: 'lain' }; if (n >= d.cap) return { mati: true, kelas: 'penuh', judul: 'Penuh' }; return n ? { kelas: 'ada', judul: 'Sisa ' + (d.cap - n) + ' slot' } : {}; }, 'pubTanggal')}
     <p class="muted" style="font-size:12px;margin:10px 0 0">⬜ kosong · 🟨 tinggal sedikit · <s>coret</s> penuh</p></div>
   <div class="kartu"><h3>3. Data kamu</h3><form class="form" id="formPub">
     <div class="dua"><label class="f"><span>Nama *</span><input name="nama" required></label><label class="f"><span>No. WhatsApp *</span><input name="wa" required inputmode="tel"></label></div>
     <div class="dua"><label class="f"><span>Jam mulai</span><input name="jam" type="time"></label><label class="f"><span>Instagram</span><input name="ig"></label></div>
     <label class="f"><span>Lokasi acara</span><input name="lokasi" placeholder="Alamat / gedung"></label>
     <label class="f"><span>Catatan</span><textarea name="catatan" placeholder="Tema, jumlah orang, dll."></textarea></label>
     <div class="total-box" style="background:#0D0D0D"><div><span>Tanggal</span><span>${pubPilih.tanggal ? tglPanjang(pubPilih.tanggal) : 'belum dipilih'}</span></div><div><span>Layanan</span><span>${pubPilih.layanan.length} dipilih</span></div><div class="besar"><span>Estimasi</span><b>${rp(total)}</b></div><div><span>DP ${d.dp}% untuk mengunci jadwal</span><span>${rp(Math.round(total * d.dp / 100 / 1000) * 1000)}</span></div></div>
     <button class="btn btn-wa btn-blok" style="padding:14px">${ik('wa')} Kirim booking via WhatsApp</button>
     <p class="muted" style="font-size:12px;margin:0;text-align:center">Booking dikonfirmasi oleh ${esc(d.n)} lewat WhatsApp. Biaya perjalanan di luar ${d.km[0]} km dihitung terpisah.</p></form></div>
   <div class="kaki-pub">Halaman booking dibuat dengan <img src="img/beresin_logo_terang.svg" alt="beresin"> · by FF Agency</div></div>`;
};
VIEWS.p_siap = () => { const f = $('#formPub'); if (!f) return; f.onsubmit = async e => { e.preventDefault();
  if (!pubPilih.layanan.length) return toast('Pilih layanan dulu'); if (!pubPilih.tanggal) return toast('Pilih tanggal dulu');
  const x = Object.fromEntries(new FormData(f)), d = PUB, lay = pubPilih.layanan.map(id => d.l.find(l => l[0] === id)).filter(Boolean);
  const req = { n: x.nama, w: x.wa, ig: x.ig, t: pubPilih.tanggal, j: x.jam, lk: x.lokasi, c: x.catatan, l: lay.map(l => [l[0], l[1], l[2]]), at: Date.now() };
  const imp = alamatApp() + '#/impor/' + await kode(req);
  const teks = `Halo ${d.n}, saya mau booking 🙏\n\nNama: ${x.nama}\nWA: ${x.wa}\nLayanan: ${lay.map(l => l[1]).join(', ')}\nTanggal: ${tglPanjang(pubPilih.tanggal)}${x.jam ? ' · ' + x.jam : ''}\nLokasi: ${x.lokasi || '-'}\nCatatan: ${x.catatan || '-'}\nEstimasi: ${rp(lay.reduce((s, l) => s + l[2], 0))}\n\n➡️ Masukkan ke Beresin: ${imp}`;
  bukaWA(d.w, teks); toast('WhatsApp dibuka — tekan kirim ya'); }; };
AKSI.pubLayanan = el => { const i = pubPilih.layanan.indexOf(el.dataset.v); i >= 0 ? pubPilih.layanan.splice(i, 1) : pubPilih.layanan.push(el.dataset.v); simpanIsianPub(); render().then(pulihIsianPub); };
AKSI.pubTanggal = el => { pubPilih.tanggal = el.dataset.v; simpanIsianPub(); render().then(pulihIsianPub); };
AKSI.pubBulan = el => { pubPilih.bulan = geserBulan(pubPilih.bulan, Number(el.dataset.v)); simpanIsianPub(); render().then(pulihIsianPub); };
let isianPub = {}, gulirPub = 0;
function simpanIsianPub() { gulirPub = scrollY; const f = $('#formPub'); if (f) isianPub = Object.fromEntries(new FormData(f)); }
function pulihIsianPub() { const f = $('#formPub'); if (f) Object.entries(isianPub).forEach(([k, v]) => { if (f[k]) f[k].value = v; }); scrollTo(0, gulirPub); }

/* ---------- vendor: impor booking dari link ---------- */
VIEWS.impor = async k => {
  let r; try { r = await urai(k); } catch (e) { return kosong('Kode booking rusak.', 'link'); }
  if (!S.siap) return kosong('Buka link ini di perangkat yang sudah login Beresin.', 'lock', '<a class="btn" href="#/beranda">Ke Beresin</a>');
  const sudah = S.booking.find(b => b.imporAt === r.at);
  return `<div class="judul-hal"><div><h1>Booking masuk dari link</h1><p>Periksa lalu masukkan ke jadwal.</p></div></div>
  <div class="kartu masuk" style="max-width:640px">${sudah ? `<p>✅ Booking ini sudah dimasukkan.</p><a class="btn btn-hitam" href="#/booking/${sudah.id}">Buka booking</a>` : `
    <div class="form" style="gap:10px"><div><span class="muted">Klien</span><br><b>${esc(r.n)}</b> · ${esc(r.w)} ${r.ig ? '· ' + esc(r.ig) : ''}</div>
    <div><span class="muted">Layanan</span><br>${r.l.map(l => `<b>${esc(l[1])}</b> ${rp(l[2])}`).join('<br>')}</div>
    <div><span class="muted">Tanggal</span><br><b>${tglPanjang(r.t)}</b> ${r.j ? '· ' + esc(r.j) : ''}</div><div><span class="muted">Lokasi</span><br>${esc(r.lk || '—')}</div>${r.c ? `<div><span class="muted">Catatan</span><br>${esc(r.c)}</div>` : ''}
    ${S.booking.filter(b => aktif(b) && b.tanggal === r.t).length ? `<span class="chip dp">⚠ Sudah ada ${S.booking.filter(b => aktif(b) && b.tanggal === r.t).length} jadwal di tanggal ini</span>` : ''}</div>
    <div class="aksi-baris" style="margin-top:16px"><a class="btn" href="#/beranda">Abaikan</a><button class="btn btn-merah" data-act="imporBooking" data-v="${esc(k)}">${ik('check')} Masukkan ke jadwal</button></div>`}</div>`;
};
AKSI.imporBooking = async el => {
  const r = await urai(el.dataset.v);
  let kl = S.klien.find(k => waNo(k.wa) === waNo(r.w)); if (!kl) { kl = { id: uid(), nama: r.n, wa: r.w, ig: r.ig || '', alamat: '', catatan: '', dibuat: Date.now() }; S.klien.push(kl); }
  const b = { id: uid(), no: Math.max(0, ...S.booking.map(x => x.no || 0)) + 1, klienId: kl.id, item: r.l.map(([id, nama, harga]) => ({ layananId: S.layanan.find(l => l.id === id) ? id : '', nama, harga, qty: 1 })), tambahan: [], diskon: 0, jarakKm: 0, biayaJalan: 0, tanggal: r.t, jam: r.j || '', jamSelesai: '', lokasi: r.lk || '', status: 'baru', catatan: r.c || '', tim: [], ceklist: S.ceklist[0] ? S.ceklist[0].items.map(nama => ({ nama, ok: false })) : [], sumber: 'link', imporAt: r.at, dibuat: Date.now() };
  S.booking.push(b); catat('Booking dari link: ' + kl.nama, 'link'); beriNotif('Booking baru dari link 🎉', `${kl.nama} · ${namaLayanan(b)} · ${tglPanjang(b.tanggal)}`, 'booking/' + b.id); simpan(); ke('booking', b.id); toast('Masuk ke jadwal — kirim konfirmasi ke klien');
};

/* ---------- ceklist (dilihat klien) ---------- */
VIEWS.c = async k => {
  let d; try { d = await urai(k); } catch (e) { return kosong('Link ceklist rusak.', 'list'); }
  const ok = d.c.filter(x => x[1]).length;
  return `<div class="pub" style="padding-top:24px"><div class="kartu"><span class="chip hitam">${esc(d.b)}</span><h1 style="margin-top:12px;font-size:28px">Persiapan perlengkapan</h1><p class="muted">Untuk ${esc(d.k)} · ${esc(d.l)} · ${tglPanjang(d.t)}</p>
    <div style="height:10px;border-radius:5px;background:var(--bg);margin:16px 0"><div style="height:100%;width:${d.c.length ? ok / d.c.length * 100 : 0}%;border-radius:5px;background:var(--grad)"></div></div><b>${ok} dari ${d.c.length} siap</b>
    <div class="form" style="margin-top:14px">${d.c.map(([n, o]) => `<div class="cek ${o ? 'ok' : ''}">${o ? ik('check') : ik('clock')}<span>${esc(n)}</span></div>`).join('')}</div></div>
    <div class="kaki-pub">Dipantau dengan <img src="img/beresin_logo_terang.svg" alt="beresin"></div></div>`;
};
