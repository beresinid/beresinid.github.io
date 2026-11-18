/* Beresin — keuangan, laporan, waktunya nagih, reminder WA */
let bulanUang = hariIni().slice(0, 7), tabUang = 'ringkasan';
const KAT_KELUAR = ['Bahan', 'Transport', 'Tim', 'Promosi', 'Alat', 'Operasional', 'Lainnya'];

VIEWS.keuangan = () => {
  const ym = bulanUang, dari = awalBulan(ym), sampai = akhirBulan(ym);
  const masuk = uangMasuk(dari, sampai), keluar = uangKeluar(dari, sampai);
  const tm = jumlah(masuk), tk = jumlah(keluar), laba = tm - tk;
  const ymL = geserBulan(ym, -1), tmL = jumlah(uangMasuk(awalBulan(ymL), akhirBulan(ymL))), tkL = jumlah(uangKeluar(awalBulan(ymL), akhirBulan(ymL)));
  const persen = (a, b) => b ? `<span class="chip ${a >= b ? 'lunas' : 'belum'}">${a >= b ? '▲' : '▼'} ${Math.abs(Math.round((a - b) / b * 100))}%</span>` : '';
  const enam = [...Array(6)].map((_, i) => { const m = geserBulan(ym, i - 5); return { label: BULAN[Number(m.slice(5)) - 1].slice(0, 3), nilai: jumlah(uangMasuk(awalBulan(m), akhirBulan(m))), ini: m === ym }; });
  const perLayanan = {}; S.bayar.filter(p => p.tanggal >= dari && p.tanggal <= sampai).forEach(p => { const b = bookingDari(p.bookingId); if (!b) return; const t = totalBooking(b) || 1; (b.item || []).forEach(i => { perLayanan[i.nama] = (perLayanan[i.nama] || 0) + p.nominal * (i.harga * (i.qty || 1)) / t; }); });
  const top = Object.entries(perLayanan).sort((a, b) => b[1] - a[1]).slice(0, 6), maksL = Math.max(1, ...top.map(x => x[1]));
  const perKat = {}; keluar.forEach(k => perKat[k.kategori || 'Lainnya'] = (perKat[k.kategori || 'Lainnya'] || 0) + k.nominal);
  const isi = {
    ringkasan: `<div class="grid g2" style="align-items:start;margin-top:16px">
      <div class="kartu"><h3>${ik('chart')} Omzet 6 bulan</h3>${barChart(enam)}</div>
      <div class="kartu"><h3>${ik('star')} Layanan paling menghasilkan</h3>${top.length ? top.map(([n, v]) => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-weight:600"><span>${esc(n)}</span><span class="tnum">${rp(v)}</span></div><div style="height:8px;border-radius:4px;background:var(--bg);margin-top:5px"><div style="height:100%;width:${v / maksL * 100}%;border-radius:4px;background:var(--grad)"></div></div></div>`).join('') : kosong('Belum ada pemasukan bulan ini', 'chart')}</div>
      <div class="kartu"><h3>${ik('out')} Pengeluaran per kategori</h3>${Object.keys(perKat).length ? Object.entries(perKat).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--garis2)"><span>${esc(k)}</span><b class="tnum">${rp(v)}</b></div>`).join('') : kosong('Belum ada pengeluaran', 'out')}</div>
      <div class="kartu"><h3>${ik('wallet')} Posisi tagihan</h3><div style="display:flex;justify-content:space-between;padding:7px 0"><span>Piutang semua booking</span><b class="tnum">${rp(piutangSemua())}</b></div><div style="display:flex;justify-content:space-between;padding:7px 0"><span>Booking belum lunas</span><b>${S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas').length}</b></div><a class="btn btn-kecil" href="#/tagih">${ik('invoice')} Buka Waktunya Nagih</a></div></div>`,
    masuk: `<div class="kartu" style="margin-top:16px">${masuk.length ? masuk.map(m => `<div class="item" ${m.sumber === 'booking' ? `data-act="editBayar" data-v="${m.id}"` : m.sumber === 'sewa' ? `data-act="formSewa" data-v="${m.id}"` : `data-act="go" data-v="kursus/${m.id}"`}><div class="av">${ik('in')}</div><div class="tengah"><div class="t1">${esc(m.nama)}</div><div class="t2">${tglSedang(m.tanggal)} · ${m.sumber}</div></div><div class="kanan"><b style="color:var(--hijau)">+${rp(m.nominal)}</b></div></div>`).join('') : kosong('Belum ada uang masuk', 'in')}</div>`,
    keluar: `<div class="kartu" style="margin-top:16px"><div class="aksi-baris" style="margin-bottom:6px"><button class="btn btn-kecil btn-merah" data-act="formKeluar">${ik('plus')} Pengeluaran</button></div>${keluar.length ? keluar.map(k => `<div class="item" data-act="formKeluar" data-v="${k.id}"><div class="av">${ik('out')}</div><div class="tengah"><div class="t1">${esc(k.nama)}</div><div class="t2">${tglSedang(k.tanggal)} · ${esc(k.kategori)}</div></div><div class="kanan"><b>−${rp(k.nominal)}</b></div></div>`).join('') : kosong('Belum ada pengeluaran', 'out')}</div>`,
  };
  return `<div class="judul-hal"><div><h1>Keuangan</h1><p>Pemasukan & pengeluaran terhitung otomatis dari booking.</p></div>
    <div class="aksi-baris"><button class="btn" data-act="laporanPdf">${ik('print')} Laporan PDF</button><button class="btn" data-act="eksporCsv">${ik('in')} CSV</button><button class="btn btn-merah" data-act="formKeluar">${ik('plus')} Pengeluaran</button></div></div>
  <div class="kal-kepala"><button class="ikon-btn" data-act="bulanUang" data-v="-1">${ik('back')}</button><h3>${namaBulan(ym)}</h3><button class="ikon-btn" data-act="bulanUang" data-v="1">${ik('arrow')}</button></div>
  <div class="hero masuk"><div class="gumpal" style="width:300px;height:300px;background:#E32B2B;right:-80px;top:-140px;opacity:.5"></div>
    <div class="statgrid" style="margin-top:0"><div class="stat"><div class="l">Pemasukan</div><div class="v neon tnum">${rpPendek(tm)}</div><div class="s">${persen(tm, tmL)} vs bulan lalu</div></div>
    <div class="stat"><div class="l">Pengeluaran</div><div class="v tnum">${rpPendek(tk)}</div><div class="s">${persen(tkL, tk)} </div></div>
    <div class="stat"><div class="l">Laba bersih</div><div class="v tnum" style="color:${laba < 0 ? '#ff8a8a' : '#fff'}">${rpPendek(laba)}</div><div class="s">${tm ? Math.round(laba / tm * 100) : 0}% margin</div></div>
    <div class="stat"><div class="l">Transaksi</div><div class="v tnum">${masuk.length + keluar.length}</div><div class="s">${masuk.length} masuk · ${keluar.length} keluar</div></div></div></div>
  <div class="tabs" style="margin-top:16px;display:inline-flex">${[['ringkasan', 'Ringkasan'], ['masuk', 'Pemasukan'], ['keluar', 'Pengeluaran']].map(([k, l]) => `<button class="${tabUang === k ? 'on' : ''}" data-act="tabUang" data-v="${k}">${l}</button>`).join('')}</div>
  ${isi[tabUang]}`;
};
AKSI.bulanUang = el => { bulanUang = geserBulan(bulanUang, Number(el.dataset.v)); render(); };
AKSI.tabUang = el => { tabUang = el.dataset.v; render(); };
AKSI.formKeluar = el => {
  const k = S.keluar.find(x => x.id === el?.dataset?.v) || {};
  modal(`${kepala(k.id ? 'Ubah pengeluaran' : 'Pengeluaran baru')}<form class="form" id="formKeluar">
    <label class="f"><span>Untuk apa? *</span><input name="nama" required value="${esc(k.nama || '')}" placeholder="mis. Beli bulu mata" autofocus></label>
    <div class="dua"><label class="f"><span>Nominal *</span><input name="nominal" inputmode="numeric" required value="${titik(k.nominal)}"></label><label class="f"><span>Tanggal</span><input type="date" name="tanggal" value="${k.tanggal || hariIni()}"></label></div>
    <div class="f"><span>Kategori</span><div class="pilihan" id="katKeluar">${KAT_KELUAR.map(c => `<button type="button" class="${(k.kategori || 'Bahan') === c ? 'on' : ''}" data-act="pilihKat" data-v="${c}">${c}</button>`).join('')}</div></div>
    <div class="lembar-kaki">${k.id ? '<button type="button" class="btn btn-hapus" id="hapusKeluar">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  let kat = k.kategori || 'Bahan'; AKSI.pilihKat = b => { kat = b.dataset.v; $$('#katKeluar button').forEach(x => x.classList.toggle('on', x === b)); };
  if (k.id) $('#hapusKeluar').onclick = () => { S.keluar = S.keluar.filter(x => x.id !== k.id); simpan(); tutup(); render(); };
  $('#formKeluar').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); const r = { ...k, ...d, nominal: angka(d.nominal), kategori: kat, id: k.id || uid() };
    if (k.id) Object.assign(S.keluar.find(x => x.id === k.id), r); else S.keluar.push(r); catat(`Pengeluaran ${r.nama} ${rp(r.nominal)}`, 'out'); simpan(); tutup(); render(); toast('Pengeluaran tersimpan'); };
};
AKSI.eksporCsv = () => {
  const ym = bulanUang, dari = awalBulan(ym), sampai = akhirBulan(ym), q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const rows = [['Tanggal', 'Jenis', 'Keterangan', 'Kategori', 'Masuk', 'Keluar'], ...uangMasuk(dari, sampai).map(m => [m.tanggal, 'Masuk', m.nama, m.sumber, m.nominal, '']), ...uangKeluar(dari, sampai).map(k => [k.tanggal, 'Keluar', k.nama, k.kategori, '', k.nominal])].sort((a, b) => String(a[0]).localeCompare(b[0]));
  unduh(`keuangan-${ym}.csv`, '﻿' + rows.map(r => r.map(q).join(';')).join('\n'), 'text/csv'); toast('CSV diunduh — bisa dibuka di Excel / Google Sheets');
};
AKSI.laporanPdf = () => { location.hash = '#/laporan/' + bulanUang; };
VIEWS.laporan = ym => {
  ym = ym || bulanUang; const dari = awalBulan(ym), sampai = akhirBulan(ym), masuk = uangMasuk(dari, sampai), keluar = uangKeluar(dari, sampai), tm = jumlah(masuk), tk = jumlah(keluar);
  const bk = S.booking.filter(b => aktif(b) && b.tanggal.startsWith(ym));
  return `<div class="no-print aksi-baris" style="justify-content:space-between;margin:14px 0"><a class="btn" href="#/keuangan">${ik('back')} Keuangan</a><button class="btn btn-merah" onclick="print()">${ik('print')} Simpan PDF</button></div>
  <div class="invoice" style="max-width:860px"><div class="kepala"><div><h1>Laporan Keuangan</h1><p class="muted" style="margin:6px 0 0">${esc(S.profil.nama)} · ${namaBulan(ym)}</p></div><img src="img/beresin_logo_terang.svg" alt="beresin" style="height:28px"></div>
  <div class="grid g4" style="margin-top:18px">${[['Pemasukan', tm], ['Pengeluaran', tk], ['Laba bersih', tm - tk], ['Piutang', piutangSemua()]].map(([l, v]) => `<div style="border:1px solid var(--garis);border-radius:14px;padding:12px"><small class="muted">${l}</small><div style="font-family:var(--judul);font-weight:800;font-size:20px">${rp(v)}</div></div>`).join('')}</div>
  <p style="margin-top:16px">${bk.length} booking terjadwal bulan ini, ${bk.filter(b => statusBayar(b) === 'lunas').length} sudah lunas. ${tm >= tk ? 'Bulan ini untung ' + rp(tm - tk) + '.' : 'Bulan ini rugi ' + rp(tk - tm) + '.'}</p>
  <table><thead><tr><th>Tanggal</th><th>Pemasukan</th><th>Jumlah</th></tr></thead><tbody>${masuk.map(m => `<tr><td>${tglPendek(m.tanggal)}</td><td>${esc(m.nama)}</td><td class="tnum">${rp(m.nominal)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">—</td></tr>'}<tr><td></td><td><b>Total pemasukan</b></td><td class="tnum"><b>${rp(tm)}</b></td></tr></tbody></table>
  <table><thead><tr><th>Tanggal</th><th>Pengeluaran</th><th>Jumlah</th></tr></thead><tbody>${keluar.map(k => `<tr><td>${tglPendek(k.tanggal)}</td><td>${esc(k.nama)} <small class="muted">· ${esc(k.kategori)}</small></td><td class="tnum">${rp(k.nominal)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">—</td></tr>'}<tr><td></td><td><b>Total pengeluaran</b></td><td class="tnum"><b>${rp(tk)}</b></td></tr></tbody></table>
  <div class="ringkas"><div class="tot"><span>Laba bersih</span><span class="tnum">${rp(tm - tk)}</span></div></div>
  <p class="muted" style="font-size:12px;margin-top:20px">Dibuat ${tglPanjang(hariIni())} dengan Beresin · by FF Agency</p></div>`;
};

/* ---------- Waktunya nagih ---------- */
VIEWS.tagih = () => {
  const h = hariIni(); const list = S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas').sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const lewat = list.filter(b => b.tanggal <= h), nanti = list.filter(b => b.tanggal > h);
  const baris = b => { const sudah = Object.keys(S.terkirim).some(k => k.startsWith('tagih_wa_' + b.id)); return `<div class="item"><div class="av ${b.tanggal <= h ? 'merah' : ''}">${inisial(klienDari(b.klienId).nama)}</div><div class="tengah" data-act="bukaBooking" data-v="${b.id}"><div class="t1">${esc(klienDari(b.klienId).nama)} ${chipBayar(b)}</div><div class="t2">${tglSedang(b.tanggal)} · ${esc(namaLayanan(b))}${sudah ? ' · sudah ditagih' : ''}</div></div><div class="kanan"><b>${rp(sisaBayar(b))}</b><div class="aksi-baris" style="margin-top:4px"><button class="btn btn-kecil btn-wa" data-act="waTagih" data-v="${b.id}">${ik('wa')} Tagih</button><button class="btn btn-kecil" data-act="formBayar" data-v="${b.id}">Lunas</button></div></div></div>`; };
  return `<div class="judul-hal"><div><h1>Waktunya Nagih</h1><p>Booking ber-DP / belum bayar. Kirim pengingat bayar + invoice dengan satu klik.</p></div></div>
  <div class="grid g2 masuk"><div class="kartu"><small class="muted">Sudah lewat jadwal, belum lunas</small><h2 style="color:var(--merah);margin-top:6px">${rp(lewat.reduce((s, b) => s + sisaBayar(b), 0))}</h2></div><div class="kartu"><small class="muted">Jadwal mendatang, belum lunas</small><h2 style="margin-top:6px">${rp(nanti.reduce((s, b) => s + sisaBayar(b), 0))}</h2></div></div>
  <div class="kartu" style="margin-top:16px"><h3>Prioritas — sudah lewat jadwal</h3>${lewat.length ? lewat.map(baris).join('') : kosong('Tidak ada tagihan yang terlambat 👏', 'check')}</div>
  <div class="kartu"><h3>Mendatang</h3>${nanti.length ? nanti.map(baris).join('') : kosong('Semua jadwal mendatang sudah lunas', 'check')}</div>`;
};

/* ---------- Reminder WA ---------- */
function antrianReminder() {
  const h = hariIni(), r = [];
  (S.setelan.reminder || []).filter(x => x.aktif).forEach(x => S.booking.filter(b => aktif(b) && b.status !== 'selesai' && selisihHari(h, b.tanggal) === Number(x.h)).forEach(b => { if (!S.terkirim['ingat_' + b.id + '_' + h]) r.push({ b, h: x.h }); }));
  S.booking.filter(b => aktif(b) && b.tanggal === h && !S.terkirim['ingat_' + b.id + '_' + h] && !r.find(x => x.b.id === b.id)).forEach(b => r.push({ b, h: 0 }));
  return r;
}
VIEWS.reminder = () => {
  const q = antrianReminder(), h = hariIni();
  const terkirim = S.booking.filter(b => S.terkirim['ingat_' + b.id + '_' + h]);
  return `<div class="judul-hal"><div><h1>Reminder WA</h1><p>Atur kapan pengingat dikirim (H-1, H-3, dll) & isi pesannya.</p></div><button class="btn" data-act="go" data-v="setelan">${ik('edit')} Ubah isi pesan</button></div>
  <div class="grid g2 masuk" style="align-items:start">
   <div class="kartu"><h3>${ik('bell')} Siap dikirim hari ini <span class="chip neon">${q.length}</span></h3>
    ${q.length ? q.map(({ b, h: hx }) => `<div class="item"><div class="av merah">H-${hx}</div><div class="tengah" data-act="bukaBooking" data-v="${b.id}"><div class="t1">${esc(klienDari(b.klienId).nama)}</div><div class="t2">${tglPanjang(b.tanggal)} · ${esc(b.jam || '')}</div></div><button class="btn btn-kecil btn-wa" data-act="kirimIngat" data-v="${b.id}">${ik('wa')} Kirim</button></div>`).join('') : kosong('Tidak ada pengingat untuk dikirim', 'check')}
    ${terkirim.length ? `<div class="sep"></div><small class="muted">Sudah dikirim hari ini: ${esc(terkirim.map(b => klienDari(b.klienId).nama).join(', '))}</small>` : ''}
    <p class="muted" style="font-size:13px;margin-top:14px">Tombol Kirim membuka WhatsApp dengan pesan yang sudah terisi — tinggal tekan kirim. Pengiriman otomatis tanpa sentuh sedang disiapkan.</p></div>
   <div class="kartu"><h3>${ik('clock')} Jadwal pengingat</h3>
    ${S.setelan.reminder.map((r, i) => `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--garis2)"><label class="cek ${r.aktif ? 'ok' : ''}" style="flex:1;border:0;padding:4px 0"><input type="checkbox" data-act="togReminder" data-v="${i}" ${r.aktif ? 'checked' : ''}><span style="text-decoration:none;color:inherit">Kirim <b>H-${r.h}</b> sebelum jadwal</span></label><button class="ikon-btn" data-act="hapusReminder" data-v="${i}">${ik('trash')}</button></div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:12px"><input class="inp" id="hBaru" type="number" min="0" max="30" placeholder="H-berapa? mis. 2" style="max-width:180px"><button class="btn" data-act="tambahReminder">${ik('plus')} Tambah</button></div>
    <div class="sep"></div><small class="muted">Contoh pesan:</small><pre style="white-space:pre-wrap;font-family:var(--teks);background:var(--bg);padding:12px;border-radius:12px;font-size:13px">${esc(S.booking[0] ? isiTemplate('ingat', S.booking.find(aktif) || S.booking[0]) : S.setelan.wa.ingat)}</pre></div>
  </div>`;
};
AKSI.kirimIngat = el => { const b = bookingDari(el.dataset.v), d = selisihHari(hariIni(), b.tanggal); bukaWA(klienDari(b.klienId).wa, isiTemplate('ingat', b, { kapan: d === 0 ? 'hari ini' : d === 1 ? 'besok' : d + ' hari lagi' })); S.terkirim['ingat_' + b.id + '_' + hariIni()] = 1; catat('Reminder WA ke ' + klienDari(b.klienId).nama, 'wa'); simpan(); setTimeout(render, 400); };
AKSI.togReminder = el => { S.setelan.reminder[el.dataset.v].aktif = el.checked; simpan(); render(); };
AKSI.hapusReminder = el => { S.setelan.reminder.splice(Number(el.dataset.v), 1); simpan(); render(); };
AKSI.tambahReminder = () => { const v = Number($('#hBaru').value); if (!(v >= 0)) return; if (!S.setelan.reminder.some(r => r.h === v)) S.setelan.reminder.push({ h: v, aktif: true }); S.setelan.reminder.sort((a, b) => a.h - b.h); simpan(); render(); };
