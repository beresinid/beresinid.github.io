/* Beresin — onboarding, beranda, notifikasi, menu lainnya, pencarian */
let mulaiProfesi = 'foto';
VIEWS.mulai = () => `<div style="max-width:680px;margin:20px auto" class="masuk">
  <div class="hero"><div class="gumpal" style="width:300px;height:300px;background:#E32B2B;right:-80px;top:-120px;opacity:.6"></div>
    <img src="img/beresin_logo_putih.svg" alt="beresin" style="height:40px">
    <h1 style="margin-top:22px;font-size:34px">Jadwal beres. Tagihan beres.<br><span style="color:var(--neon)">Kamu tinggal kerja.</span></h1>
    <p class="salam" style="margin-top:10px">Setup 5 menit. Data tersimpan di perangkat ini.</p></div>
  <div class="kartu" style="margin-top:16px"><form class="form" id="formMulai">
    <h3>1. Jenis usaha kamu</h3>
    <div class="pilihan" id="pilihProfesi">${Object.entries(PROFESI).map(([k, p]) => `<button type="button" data-act="pilihProfesi" data-v="${k}" class="${k === mulaiProfesi ? 'on' : ''}">${ik(p.ikon)} ${p.nama}</button>`).join('')}</div>
    <h3 style="margin-top:8px">2. Profil bisnis</h3>
    <label class="f"><span>Nama bisnis *</span><input name="nama" required placeholder="mis. Dina Makeup" autofocus></label>
    <div class="dua"><label class="f"><span>No. WhatsApp bisnis *</span><input name="wa" required inputmode="tel" placeholder="08xx"></label>
    <label class="f"><span>Kota</span><input name="kota" placeholder="Pekanbaru"></label></div>
    <label class="f"><span>Instagram</span><input name="ig" placeholder="@namabisnis"></label>
    <p class="muted" style="margin:0;font-size:13px">Layanan & ceklist awal otomatis diisi sesuai jenis usaha — bisa diubah kapan saja.</p>
    <div class="aksi-baris"><button type="button" class="btn" data-act="isiContoh">Coba pakai data contoh</button><button class="btn btn-merah">Mulai pakai Beresin ${ik('arrow')}</button></div>
  </form></div></div>`;
VIEWS.mulai_siap = () => {};
AKSI.pilihProfesi = el => { mulaiProfesi = el.dataset.v; $$('#pilihProfesi button').forEach(b => b.classList.toggle('on', b === el)); };
document.addEventListener('submit', e => {
  if (e.target.id !== 'formMulai') return; e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  Object.assign(S.profil, { nama: f.nama.trim(), wa: f.wa.trim(), kota: f.kota.trim(), ig: f.ig.trim(), slug: f.nama.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') });
  terapkanProfesi(mulaiProfesi); S.siap = true; catat('Akun Beresin dibuat', 'star'); beriNotif('Selamat datang di Beresin 👋', 'Mulai dari: tambah booking pertama, lalu bagikan link booking kamu.', 'halaman'); simpan(); ke('beranda');
});
AKSI.isiContoh = () => { isiDataContoh(); ke('beranda'); toast('Data contoh dimuat — hapus kapan saja di Setelan'); };

function isiDataContoh() {
  S = dataAwal(); Object.assign(S.profil, { nama: 'Dina Makeup', wa: '081234567890', kota: 'Pekanbaru', ig: '@dinamakeup', slug: 'dinamakeup', bio: 'MUA wedding & wisuda di Pekanbaru. Flawless, tahan lama, ramah kulit sensitif.', alamat: 'Jl. Sudirman No. 10, Pekanbaru', rekening: 'BCA 1234567890 a.n. Dina' });
  terapkanProfesi('mua'); S.siap = true;
  const nm = ['Putri Ananda', 'Hendra Wijaya', 'Mega Lestari', 'Fajar Nugroho', 'Intan Permata', 'Yoga Pratama', 'Salsa Amelia', 'Rina Oktaviani'];
  S.klien = nm.map((n, i) => ({ id: uid(), nama: n, wa: '0812' + String(7000000 + i * 1371).padStart(8, '0'), ig: '@' + n.split(' ')[0].toLowerCase(), alamat: '', catatan: i === 0 ? 'Kulit sensitif, pakai produk hypoallergenic' : '', dibuat: Date.now() - i * 864e5 * 9 }));
  S.tim = [{ id: uid(), nama: 'Ayu', peran: 'Asisten MUA', wa: '0813', izin: ['jadwal', 'ceklist'] }, { id: uid(), nama: 'Rara', peran: 'Hijab stylist', wa: '0814', izin: ['jadwal'] }];
  const L = S.layanan, h = hariIni(); let no = 0;
  const plan = [[-20, 0, 0, 'selesai', 'lunas'], [-12, 1, 2, 'selesai', 'lunas'], [-6, 2, 3, 'selesai', 'dp'], [-3, 3, 2, 'selesai', 'lunas'], [-1, 4, 4, 'selesai', 'belum'], [0, 5, 2, 'konfirmasi', 'dp'], [0, 6, 0, 'konfirmasi', 'lunas'], [1, 7, 1, 'konfirmasi', 'dp'], [3, 0, 3, 'konfirmasi', 'belum'], [6, 1, 0, 'baru', 'belum'], [9, 2, 1, 'konfirmasi', 'dp'], [14, 3, 4, 'baru', 'belum']];
  plan.forEach(([d, ki, li, st, by], i) => {
    const l = L[li % L.length]; const b = { id: uid(), no: ++no, klienId: S.klien[ki].id, item: [{ layananId: l.id, nama: l.nama, harga: l.harga, qty: li === 4 ? 3 : 1 }], tambahan: [], diskon: i % 4 === 0 ? 50000 : 0, jarakKm: 14, biayaJalan: hitungJalan(14), tanggal: tambahHari(h, d), jam: ['05:00', '08:00', '13:00', '16:00'][i % 4], jamSelesai: '', lokasi: ['Gedung Serbaguna', 'Rumah mempelai, Panam', 'Hotel Pangeran', 'Kampus UNRI'][i % 4], status: st, catatan: '', tim: i % 2 ? [S.tim[0].id] : [], ceklist: [], sumber: i === 9 ? 'link' : 'manual', dibuat: Date.now() - (20 - d) * 36e5 };
    S.booking.push(b);
    const t = totalBooking(b), dp = Math.round(t * .3 / 1000) * 1000;
    if (by !== 'belum') S.bayar.push({ id: uid(), bookingId: b.id, tanggal: tambahHari(h, Math.min(0, d - 7)), nominal: dp, jenis: 'dp', metode: 'Transfer', ket: '' });
    if (by === 'lunas') S.bayar.push({ id: uid(), bookingId: b.id, tanggal: tambahHari(h, Math.min(0, d)), nominal: t - dp, jenis: 'pelunasan', metode: 'Transfer', ket: '' });
  });
  S.keluar = [['Beli foundation & bedak', 'Bahan', 650000, -15], ['Bensin', 'Transport', 150000, -6], ['Fee asisten Ayu', 'Tim', 300000, -3], ['Iklan IG', 'Promosi', 200000, -10], ['Bulu mata 10 pasang', 'Bahan', 180000, -2]].map(([nama, kategori, nominal, d]) => ({ id: uid(), tanggal: tambahHari(h, d), nama, kategori, nominal }));
  S.sewaItem = [{ id: uid(), nama: 'Ring light 18"', stok: 3, harga: 50000, satuan: 'hari' }, { id: uid(), nama: 'Kebaya akad (putih)', stok: 2, harga: 250000, satuan: 'hari' }, { id: uid(), nama: 'Koper makeup', stok: 1, harga: 75000, satuan: 'hari' }];
  S.sewa = [{ id: uid(), klienId: S.klien[2].id, items: [{ itemId: S.sewaItem[1].id, nama: S.sewaItem[1].nama, qty: 1, harga: 250000 }], mulai: tambahHari(h, -1), selesai: tambahHari(h, 1), status: 'keluar', denda: 0, bayar: [{ tanggal: tambahHari(h, -1), nominal: 400000 }], catatan: 'Jaminan KTP' }];
  S.kursus = [{ id: uid(), judul: 'Kelas Makeup Pemula', harga: 750000, deskripsi: 'Dari dasar skincare prep sampai makeup wisuda.', materi: [{ judul: 'Kenali jenis kulit & prep' }, { judul: 'Base makeup flawless' }, { judul: 'Alis & mata' }, { judul: 'Praktik makeup wisuda' }], peserta: [{ id: uid(), nama: 'Salsa Amelia', wa: '0812', progress: 4, lulus: true, tglDaftar: tambahHari(h, -25), tglLulus: tambahHari(h, -4), noSert: 'CERT-2026-0001', bayar: 750000 }, { id: uid(), nama: 'Rina Oktaviani', wa: '0813', progress: 2, lulus: false, tglDaftar: tambahHari(h, -8), bayar: 750000 }] }];
  catat('Data contoh dimuat', 'star'); beriNotif('Booking baru dari link 🎉', 'Yoga Pratama booking lewat halaman publik kamu.', 'jadwal'); simpan();
}

VIEWS.beranda = () => {
  const h = hariIni(), ym = h.slice(0, 7), jam = new Date().getHours();
  const salam = jam < 4 ? 'Selamat malam' : jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
  const masukBln = jumlah(uangMasuk(awalBulan(ym), akhirBulan(ym)));
  const bookingBln = S.booking.filter(b => aktif(b) && b.tanggal.startsWith(ym)).length;
  const hariIniList = S.booking.filter(b => aktif(b) && b.tanggal === h).sort((a, b) => (a.jam || '').localeCompare(b.jam || ''));
  const besok = S.booking.filter(b => aktif(b) && b.tanggal > h && b.tanggal <= tambahHari(h, 7)).sort((a, b) => (a.tanggal + a.jam).localeCompare(b.tanggal + b.jam));
  const tagih = S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas' && b.tanggal <= h);
  const baru = S.booking.filter(b => b.status === 'baru');
  const tujuh = [...Array(7)].map((_, i) => { const t = tambahHari(h, i - 6); return { label: HARI[keTgl(t).getDay()].slice(0, 3), nilai: jumlah(uangMasuk(t, t)), ini: t === h }; });
  const tot7 = jumlah(tujuh, x => x.nilai), sebelum = jumlah(uangMasuk(tambahHari(h, -13), tambahHari(h, -7)));
  const naik = sebelum ? Math.round((tot7 - sebelum) / sebelum * 100) : 0;
  return `<div class="masuk">
  <div class="hero" style="margin-top:12px"><div class="gumpal" style="width:340px;height:340px;background:#E32B2B;right:-90px;top:-150px;opacity:.55"></div><div class="gumpal" style="width:260px;height:260px;background:#761A1A;left:-80px;bottom:-140px;opacity:.6"></div>
    <div class="salam">${salam}, ${esc(S.profil.nama)} 👋</div>
    <h1>${hariIniList.length ? `Hari ini ada <span style="color:var(--neon)">${hariIniList.length} jadwal</span>` : 'Hari ini belum ada jadwal'}</h1>
    <div class="statgrid">
      <div class="stat"><div class="l">Omzet ${BULAN[new Date().getMonth()]}</div><div class="v neon tnum">${rpPendek(masukBln)}</div><div class="s">uang masuk bulan ini</div></div>
      <div class="stat"><div class="l">Booking</div><div class="v tnum">${bookingBln}</div><div class="s">jadwal bulan ini</div></div>
      <div class="stat"><div class="l">Klien</div><div class="v tnum">${S.klien.length}</div><div class="s">tersimpan di CRM</div></div>
      <div class="stat"><div class="l">Piutang</div><div class="v tnum">${rpPendek(piutangSemua())}</div><div class="s">belum dibayar klien</div></div>
    </div></div>
  <div class="aksi-cepat">
    <button data-act="bookingBaru"><span>${ik('plus')}</span>Booking</button>
    <button data-act="go" data-v="halaman"><span>${ik('link')}</span>Link booking</button>
    <button data-act="go" data-v="tagih"><span>${ik('invoice')}</span>Tagih</button>
    <button data-act="go" data-v="reminder"><span>${ik('wa')}</span>Reminder</button>
  </div>
  <div class="beranda-grid">
    <section class="kartu area-tindakan" aria-labelledby="hTindakan"><div class="kk"><h3 id="hTindakan">Perlu tindakan</h3>${(baru.length + tagih.length + antrianReminder().length) ? `<span class="chip belum">${baru.length + tagih.length + antrianReminder().length}</span>` : ''}</div>
        ${baru.length ? `<div class="item" data-act="go" data-v="jadwal"><div class="av merah">${baru.length}</div><div class="tengah"><div class="t1">Booking baru belum dikonfirmasi</div><div class="t2">Cek & kirim konfirmasi WA</div></div>${ik('arrow')}</div>` : ''}
        ${tagih.length ? `<div class="item" data-act="go" data-v="tagih"><div class="av">${tagih.length}</div><div class="tengah"><div class="t1">Waktunya nagih</div><div class="t2">${rp(tagih.reduce((s, b) => s + sisaBayar(b), 0))} belum lunas</div></div>${ik('arrow')}</div>` : ''}
        ${(() => { const r = antrianReminder().length; return r ? `<div class="item" data-act="go" data-v="reminder"><div class="av">${r}</div><div class="tengah"><div class="t1">Reminder WA siap dikirim</div><div class="t2">Klien dengan jadwal sebentar lagi</div></div>${ik('arrow')}</div>` : ''; })()}
        ${S.sewa.filter(s => s.status === 'keluar' && s.selesai < h).length ? `<div class="item" data-act="go" data-v="sewa"><div class="av">${ik('box')}</div><div class="tengah"><div class="t1">Sewa lewat tanggal kembali</div><div class="t2">Cek barang & denda</div></div>${ik('arrow')}</div>` : ''}
        ${!baru.length && !tagih.length && !antrianReminder().length ? kosong('Semua beres ✅', 'check') : ''}
    </section>
    <section class="kartu area-jadwal" aria-labelledby="hJadwal"><div class="kk"><h3 id="hJadwal">Jadwal hari ini</h3><a href="#/jadwal" class="link-kk">Kalender ${ik('arrow')}</a></div>
      ${hariIniList.length ? hariIniList.map(b => itemBooking(b)).join('') : kosong('Tidak ada jadwal hari ini. Santai dulu ☕', 'cal')}
      ${besok.length ? `<div class="kk sub"><h4>7 hari ke depan</h4>${besok.length > 4 ? `<a href="#/jadwal" class="link-kk">Lihat semua (${besok.length}) ${ik('arrow')}</a>` : ''}</div>${besok.slice(0, 4).map(b => itemBooking(b, { tgl: 1 })).join('')}` : ''}
    </section>
    <section class="kartu area-omzet" aria-labelledby="hOmzet"><div class="kk"><h3 id="hOmzet">Omzet 7 hari</h3><span class="chip ${naik >= 0 ? 'lunas' : 'belum'}" title="dibanding 7 hari sebelumnya">${naik >= 0 ? '▲' : '▼'} ${Math.abs(naik)}%</span></div>
      <div class="angka-besar tnum">${rp(tot7)}</div><p class="muted kecil">dibanding ${rp(sebelum)} minggu lalu</p>${barChart(tujuh)}
    </section>
  </div></div>`;
};

VIEWS.notif = () => {
  const ada = S.notif.length; S.notif.forEach(n => n.baca = true); simpan();
  return `<div class="judul-hal"><div><h1>Notifikasi</h1><p>Booking baru, reminder & tagihan — semua di sini.</p></div>${ada ? '<button class="btn" data-act="hapusNotif">Bersihkan</button>' : ''}</div>
  <div class="kartu">${ada ? S.notif.map(n => `<div class="item" data-act="go" data-v="${esc(n.link || 'beranda')}"><div class="av merah">${ik('bell')}</div><div class="tengah"><div class="t1">${esc(n.judul)}</div><div class="t2" style="white-space:normal">${esc(n.isi)}</div></div><div class="kanan"><small class="muted">${jamTgl(n.t)}</small></div></div>`).join('') : kosong('Belum ada notifikasi', 'bell')}</div>`;
};
AKSI.hapusNotif = () => { S.notif = []; simpan(); render(); };

const MENU_LAIN = [
  ['Pelanggan & tagihan', [['klien', 'Klien', 'users', 'CRM & riwayat transaksi'], ['tagih', 'Waktunya Nagih', 'invoice', 'DP & pelunasan yang belum masuk'], ['reminder', 'Reminder WA', 'wa', 'Pengingat H-1 & H-3']]],
  ['Operasional', [['radar', 'Radar Okupansi', 'radar', 'Kepadatan jadwal per bulan'], ['ceklist', 'Ceklist', 'list', 'Perlengkapan tiap sesi'], ['sewa', 'Penyewaan', 'box', 'Stok & sewa alat'], ['tim', 'Tim', 'team', 'Anggota & hak akses']]],
  ['Jualan', [['halaman', 'Halaman Booking', 'globe', 'Link publik + landing page'], ['layanan', 'Layanan', 'tag', 'Harga & durasi'], ['pricelist', 'Pricelist', 'image', 'Poster harga siap share'], ['kursus', 'Kursus', 'award', 'Kelas & sertifikat']]],
  ['Akun', [['profesi', 'Jenis Usaha', 'briefcase', 'Modul khusus per profesi'], ['notif', 'Notifikasi', 'bell', 'Booking baru & pengingat'], ['log', 'Log Aktivitas', 'log', 'Riwayat perubahan'], ['setelan', 'Setelan', 'gear', 'Profil, WA, backup'], ['langganan', 'Lisensi', 'gift', 'Sekali bayar, selamanya']]],
];
VIEWS.lainnya = () => `<div class="judul-hal"><div><h1>Semua fitur</h1><p>${esc(S.profil.nama)} · ${esc((PROFESI[S.profil.profesi] || PROFESI.lain).nama)}</p></div></div>
  <div class="menu-grup masuk">${MENU_LAIN.map(([g, isi]) => `<section><h2 class="label-grup">${g}</h2><div class="kartu daftar">${isi.map(([v, n, i, s]) => `<a class="item" href="#/${v}"><div class="av">${ik(i)}</div><div class="tengah"><div class="t1">${n}</div><div class="t2">${s}</div></div>${ik('arrow')}</a>`).join('')}</div></section>`).join('')}</div>`;

AKSI.menuTambah = () => modal(`${kepala('Tambah baru')}<div class="menu-tambah">
  <button data-act="bookingBaru"><span>${ik('cal')}</span>Booking</button>
  <button data-act="formBayar"><span>${ik('in')}</span>Pembayaran</button>
  <button data-act="formKeluar"><span>${ik('out')}</span>Pengeluaran</button>
  <button data-act="formKlien"><span>${ik('users')}</span>Klien</button>
  <button data-act="formSewa"><span>${ik('box')}</span>Sewa alat</button>
  <button data-act="formLayanan"><span>${ik('tag')}</span>Layanan</button></div>`, 'kecil');

/* pencarian */
VIEWS.cari = q => {
  q = (q || '').toLowerCase().trim(); if (!q) return kosong('Ketik untuk mencari', 'search');
  const kl = S.klien.filter(k => [k.nama, k.wa, k.ig].join(' ').toLowerCase().includes(q));
  const bk = S.booking.filter(b => [klienDari(b.klienId).nama, namaLayanan(b), b.lokasi, noInvoice(b)].join(' ').toLowerCase().includes(q));
  return `<div class="judul-hal"><div><h1>Hasil “${esc(q)}”</h1><p>${kl.length} klien · ${bk.length} booking</p></div></div>
  <div class="grid g2"><div class="kartu"><h3>Klien</h3>${kl.map(k => `<div class="item" data-act="go" data-v="klien/${k.id}"><div class="av">${inisial(k.nama)}</div><div class="tengah"><div class="t1">${esc(k.nama)}</div><div class="t2">${esc(k.wa)} ${esc(k.ig || '')}</div></div></div>`).join('') || kosong('Tidak ada', 'users')}</div>
  <div class="kartu"><h3>Booking & invoice</h3>${bk.map(b => itemBooking(b, { tgl: 1 })).join('') || kosong('Tidak ada', 'cal')}</div></div>`;
};
let cariT;
document.addEventListener('input', e => { if (e.target.id !== 'cariAtas') return; clearTimeout(cariT); cariT = setTimeout(() => ke('cari', e.target.value), 250); });

/* ---------- Jenis usaha: modul khusus per profesi ---------- */
const durasiTeks = m => m >= 60 ? (m / 60 % 1 ? (m / 60).toFixed(1).replace('.', ',') : m / 60) + ' jam' : m + ' mnt';
VIEWS.profesi = () => {
  const ini = PROFESI[S.profil.profesi] ? S.profil.profesi : 'lain', P = PROFESI[ini];
  return `<div class="judul-hal"><div><a href="#/lainnya" class="muted" style="text-decoration:none">${ik('back')} Semua fitur</a><h1 style="margin-top:6px">Jenis usaha</h1><p>Beresin menyesuaikan contoh layanan, ceklist, dan modul unggulan dengan bisnismu. ${Object.keys(PROFESI).length - 1} pilihan vendor pernikahan & acara — bisa diganti kapan saja.</p></div></div>
  <div class="masuk">
  <section class="kartu profesi-aktif"><div class="pa-kepala"><span class="pa-ikon">${ik(P.ikon)}</span><div><small class="muted">Dipakai sekarang · ${P.grup}</small><h2>${P.nama}</h2></div></div>
    <h4 class="label-grup" style="margin:18px 0 4px">Modul unggulan untukmu</h4>
    ${P.modul.map(([v, l]) => `<a class="item" href="#/${v}"><div class="av">${ik((MENU_LAIN.flatMap(g => g[1]).find(m => m[0] === v) || [, , v === 'booking' ? 'cal' : v === 'keuangan' ? 'wallet' : 'star'])[2])}</div><div class="tengah"><div class="t1">${l}</div></div>${ik('arrow')}</a>`).join('')}
  </section>
  ${GRUP_PROFESI.map(g => { const isi = Object.entries(PROFESI).filter(([, p]) => p.grup === g); return isi.length ? `<section style="margin-top:24px"><h2 class="label-grup">${g}</h2><div class="profesi-grid">${isi.map(([k, p]) => `<button class="profesi-kartu ${k === ini ? 'on' : ''}" data-act="lihatProfesi" data-v="${k}"><span>${ik(p.ikon)}</span><div><b>${p.nama}</b><small>${esc(p.layanan.slice(0, 2).map(l => l[0]).join(' · '))}</small></div>${k === ini ? '<em class="chip neon">Aktif</em>' : ik('arrow')}</button>`).join('')}</div></section>` : ''; }).join('')}
  </div>`;
};
AKSI.lihatProfesi = el => {
  const k = el.dataset.v, p = PROFESI[k], ada = new Set(S.layanan.map(l => l.nama.toLowerCase()));
  const baru = p.layanan.filter(l => !ada.has(l[0].toLowerCase()));
  modal(`${kepala(p.nama, p.grup)}
    <h4 class="label-grup" style="margin:0 0 6px">Contoh layanan & harga</h4>
    <div class="kartu daftar" style="padding:0 14px">${p.layanan.map(([n, kat, h, d]) => `<div class="item" style="cursor:default"><div class="tengah"><div class="t1">${esc(n)}</div><div class="t2">${kat} · ${durasiTeks(d)}</div></div><div class="kanan"><b>${rp(h)}</b></div></div>`).join('')}</div>
    <h4 class="label-grup" style="margin:18px 0 6px">Modul unggulan</h4>
    <div class="pilihan">${p.modul.map(m => `<span class="chip">${ik('check')} ${m[1]}</span>`).join('')}</div>
    <h4 class="label-grup" style="margin:18px 0 6px">Ceklist awal</h4>
    <div class="pilihan">${p.ceklist.map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div>
    <form id="formProfesi" class="form" style="margin-top:18px">
      ${baru.length ? `<label class="cek"><input type="checkbox" name="layanan" checked><span>Tambahkan ${baru.length} contoh layanan ke daftar layananmu (harga bisa diubah)</span></label>` : ''}
      <div class="lembar-kaki"><button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah" ${k === S.profil.profesi ? 'disabled' : ''}>${k === S.profil.profesi ? 'Sedang dipakai' : 'Pakai jenis usaha ini'}</button></div></form>`, 'kecil');
  $('#formProfesi').onsubmit = e => {
    e.preventDefault(); const f = new FormData(e.target);
    S.profil.profesi = k;
    if (f.get('layanan')) baru.forEach(([nama, kategori, harga, durasi]) => S.layanan.push({ id: uid(), nama, kategori, harga, durasi, ket: '', tampil: true }));
    if (!S.ceklist.some(c => c.nama === 'Perlengkapan wajib ' + p.nama)) S.ceklist.push({ id: uid(), nama: 'Perlengkapan wajib ' + p.nama, items: p.ceklist });
    catat('Jenis usaha diganti: ' + p.nama, 'briefcase'); simpan(); tutup(); render(); toast('Sekarang: ' + p.nama);
  };
};
