/* Beresin — jadwal, kalender, booking, pembayaran, invoice */
let hariPilih = hariIni(), bulanJadwal = hariIni().slice(0, 7), filterJadwal = 'semua';

VIEWS.jadwal = () => {
  const ym = bulanJadwal, per = {};
  S.booking.filter(aktif).forEach(b => { (per[b.tanggal] ||= []).push(b); });
  const list = (per[hariPilih] || []).sort((a, b) => (a.jam || '').localeCompare(b.jam || ''));
  const semua = S.booking.filter(b => {
    if (filterJadwal === 'baru') return b.status === 'baru';
    if (filterJadwal === 'mendatang') return aktif(b) && b.tanggal >= hariIni();
    if (filterJadwal === 'belum') return aktif(b) && statusBayar(b) !== 'lunas';
    if (filterJadwal === 'batal') return b.status === 'batal';
    return b.tanggal.startsWith(ym);
  }).sort((a, b) => (a.tanggal + a.jam).localeCompare(b.tanggal + b.jam));
  return `<div class="judul-hal"><div><h1>Jadwal & Kalender</h1><p>${S.booking.filter(b => aktif(b) && b.tanggal.startsWith(ym)).length} booking di ${namaBulan(ym)}</p></div>
    <div class="aksi-baris"><button class="btn" data-act="eksporIcs">${ik('cal')} Ekspor ke Google Calendar</button><button class="btn btn-merah" data-act="bookingBaru">${ik('plus')} Booking</button></div></div>
  <div class="grid g2 masuk" style="align-items:start">
    <div class="kartu"><div class="kal-kepala"><button class="ikon-btn" data-act="bulanJadwal" data-v="-1">${ik('back')}</button><h3>${namaBulan(ym)}</h3><button class="ikon-btn" data-act="bulanJadwal" data-v="1">${ik('arrow')}</button></div>
      ${kalender(ym, hariPilih, t => ({ titik: (per[t] || []).length }))}
    </div>
    <div class="kartu"><h3 style="justify-content:space-between">${tglPanjang(hariPilih)}<button class="btn btn-kecil" data-act="bookingBaru" data-v="${hariPilih}">${ik('plus')} di tanggal ini</button></h3>
      ${list.length ? list.map(b => itemBooking(b)).join('') : kosong('Tanggal ini masih kosong', 'cal')}</div>
  </div>
  <div class="kartu" style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><h3 style="margin:0">Daftar booking</h3>
    <div class="tabs">${[['semua', namaBulan(ym)], ['mendatang', 'Mendatang'], ['baru', 'Baru'], ['belum', 'Belum lunas'], ['batal', 'Batal']].map(([k, l]) => `<button class="${filterJadwal === k ? 'on' : ''}" data-act="filterJadwal" data-v="${k}">${l}</button>`).join('')}</div></div>
    ${semua.length ? semua.map(b => itemBooking(b, { tgl: 1 })).join('') : kosong('Tidak ada booking', 'cal')}</div>`;
};
AKSI.bulanJadwal = el => { bulanJadwal = geserBulan(bulanJadwal, Number(el.dataset.v)); render(); };
AKSI.pilihHari = el => { hariPilih = el.dataset.v; bulanJadwal = hariPilih.slice(0, 7); render(); };
AKSI.filterJadwal = el => { filterJadwal = el.dataset.v; render(); };
AKSI.bukaBooking = el => ke('booking', el.dataset.v);

/* ---------- detail booking ---------- */
VIEWS.booking = id => {
  const b = bookingDari(id); if (!b) return kosong('Booking tidak ditemukan', 'cal', '<a class="btn" href="#/jadwal">Ke jadwal</a>');
  const k = klienDari(b.klienId), bayar = bayarDari(b.id).sort((x, y) => x.tanggal.localeCompare(y.tanggal));
  const tim = (b.tim || []).map(t => S.tim.find(x => x.id === t)?.nama).filter(Boolean);
  const cek = b.ceklist || [], ok = cek.filter(c => c.ok).length;
  return `<div class="judul-hal"><div><a href="#/jadwal" class="muted" style="text-decoration:none">${ik('back', '')} Jadwal</a><h1 style="margin-top:6px">${esc(k.nama)}</h1><p>${noInvoice(b)} · ${tglPanjang(b.tanggal)}${b.jam ? ' · ' + esc(b.jam) : ''} ${chipStatus(b)} ${chipBayar(b)} ${b.sumber === 'link' ? '<span class="chip">via link booking</span>' : ''}</p></div>
    <div class="aksi-baris"><button class="btn" data-act="editBooking" data-v="${b.id}">${ik('edit')} Ubah</button>${b.status === 'baru' ? `<button class="btn btn-hitam" data-act="setStatus" data-v="${b.id}|konfirmasi">${ik('check')} Konfirmasi</button>` : ''}${b.status === 'konfirmasi' ? `<button class="btn btn-hitam" data-act="setStatus" data-v="${b.id}|selesai">${ik('check')} Tandai selesai</button>` : ''}</div></div>
  <div class="grid g2 masuk" style="align-items:start">
   <div>
    <div class="kartu"><h3>${ik('invoice')} Rincian & pembayaran</h3>
      ${(b.item || []).map(i => `<div style="display:flex;justify-content:space-between;padding:6px 0"><span>${esc(i.nama)}${Number(i.qty) > 1 ? ` <span class="muted">× ${i.qty}</span>` : ''}</span><b class="tnum">${rp(i.harga * (i.qty || 1))}</b></div>`).join('')}
      ${(b.tambahan || []).map(t => `<div style="display:flex;justify-content:space-between;padding:6px 0"><span>${esc(t.nama)}</span><b class="tnum">${rp(t.harga)}</b></div>`).join('')}
      ${biayaJalan(b) ? `<div style="display:flex;justify-content:space-between;padding:6px 0"><span>Biaya perjalanan${b.jarakKm ? ` <span class="muted">(${b.jarakKm} km)</span>` : ''}</span><b class="tnum">${rp(biayaJalan(b))}</b></div>` : ''}
      ${b.diskon ? `<div style="display:flex;justify-content:space-between;padding:6px 0"><span>Diskon</span><b class="tnum">−${rp(b.diskon)}</b></div>` : ''}
      <div class="total-box" style="margin-top:10px"><div><span>Sudah dibayar</span><span class="tnum">${rp(dibayar(b))}</span></div><div><span>Sisa</span><span class="tnum">${rp(sisaBayar(b))}</span></div><div class="besar"><span>Total</span><b class="tnum">${rp(totalBooking(b))}</b></div></div>
      ${bayar.length ? `<div class="sep"></div>${bayar.map(p => `<div class="item" data-act="editBayar" data-v="${p.id}"><div class="av">${ik('in')}</div><div class="tengah"><div class="t1">${p.jenis === 'dp' ? 'DP' : p.jenis === 'pelunasan' ? 'Pelunasan' : 'Pembayaran'} · ${rp(p.nominal)}</div><div class="t2">${tglSedang(p.tanggal)} · ${esc(p.metode || '')}</div></div></div>`).join('')}` : ''}
      <div class="aksi-baris" style="margin-top:12px;justify-content:flex-start">${statusBayar(b) !== 'lunas' ? `<button class="btn btn-merah" data-act="formBayar" data-v="${b.id}">${ik('in')} Catat ${statusBayar(b) === 'belum' ? 'DP / bayar' : 'pelunasan'}</button>` : '<span class="cap-lunas">LUNAS</span>'}
        <button class="btn" data-act="lihatInvoice" data-v="${b.id}">${ik('invoice')} Invoice</button></div>
    </div>
    <div class="kartu"><h3>${ik('list')} Ceklist perlengkapan <span class="chip">${ok}/${cek.length}</span></h3>
      ${cek.length ? `<div class="form">${cek.map((c, i) => `<label class="cek ${c.ok ? 'ok' : ''}"><input type="checkbox" data-act="centang" data-v="${b.id}|${i}" ${c.ok ? 'checked' : ''}><span>${esc(c.nama)}</span></label>`).join('')}</div>` : '<p class="muted">Belum ada ceklist untuk sesi ini.</p>'}
      <div class="aksi-baris" style="margin-top:12px;justify-content:flex-start"><button class="btn btn-kecil" data-act="pasangCeklist" data-v="${b.id}">${ik('plus')} Pakai template</button>${cek.length ? `<button class="btn btn-kecil" data-act="linkCeklist" data-v="${b.id}">${ik('link')} Link untuk klien</button>` : ''}</div>
    </div>
   </div>
   <div>
    <div class="kartu"><h3>${ik('wa')} Kirim ke klien</h3><div class="grid g2">
      <button class="btn btn-wa" data-act="waBooking" data-v="${b.id}|konfirmasi">${ik('wa')} Konfirmasi</button>
      <button class="btn btn-wa" data-act="waBooking" data-v="${b.id}|ingat">${ik('bell')} Pengingat</button>
      <button class="btn btn-wa" data-act="waInvoice" data-v="${b.id}">${ik('invoice')} Invoice</button>
      ${statusBayar(b) !== 'lunas' ? `<button class="btn btn-wa" data-act="waTagih" data-v="${b.id}">${ik('wallet')} Tagih sisa</button>` : `<button class="btn btn-wa" data-act="waBooking" data-v="${b.id}|terimakasih">${ik('heart')} Terima kasih</button>`}</div></div>
    <div class="kartu"><h3>${ik('pin')} Detail sesi</h3>
      <div class="form" style="gap:10px">
        <div><span class="muted">Klien</span><br><a href="#/klien/${k.id}"><b>${esc(k.nama)}</b></a> · ${esc(k.wa || '')} ${k.ig ? '· ' + esc(k.ig) : ''}</div>
        <div><span class="muted">Waktu</span><br><b>${tglPanjang(b.tanggal)}</b> ${b.jam ? '· ' + esc(b.jam) + (b.jamSelesai ? '–' + esc(b.jamSelesai) : '') : ''}</div>
        <div><span class="muted">Lokasi</span><br><b>${esc(b.lokasi || '—')}</b> ${b.lokasi ? `<a class="btn btn-kecil" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.lokasi)}">${ik('pin')} Maps</a>` : ''}</div>
        <div><span class="muted">Tim bertugas</span><br><b>${tim.length ? esc(tim.join(', ')) : '—'}</b></div>
        ${b.catatan ? `<div><span class="muted">Catatan</span><br>${esc(b.catatan)}</div>` : ''}
      </div>
      <div class="aksi-baris" style="margin-top:14px;justify-content:flex-start"><a class="btn btn-kecil" target="_blank" rel="noopener" href="${linkGcal(b)}">${ik('cal')} Tambah ke Google Calendar</a>
      ${b.status !== 'batal' ? `<button class="btn btn-kecil btn-hapus" data-act="setStatus" data-v="${b.id}|batal">Batalkan</button>` : `<button class="btn btn-kecil" data-act="setStatus" data-v="${b.id}|konfirmasi">Aktifkan lagi</button>`}
      <button class="btn btn-kecil btn-hapus" data-act="hapusBooking" data-v="${b.id}">${ik('trash')} Hapus</button></div>
    </div>
   </div>
  </div>`;
};
AKSI.setStatus = el => { const [id, st] = el.dataset.v.split('|'); const b = bookingDari(id); b.status = st; catat(`Booking ${klienDari(b.klienId).nama} → ${STATUS[st]}`, 'cal'); simpan(); render(); toast('Status: ' + STATUS[st]); };
AKSI.hapusBooking = el => konfirmasi('Booking & semua pembayarannya akan dihapus.', () => { const b = bookingDari(el.dataset.v); S.booking = S.booking.filter(x => x.id !== b.id); S.bayar = S.bayar.filter(p => p.bookingId !== b.id); catat('Hapus booking ' + klienDari(b.klienId).nama, 'trash'); simpan(); ke('jadwal'); });
AKSI.centang = el => { const [id, i] = el.dataset.v.split('|'); const b = bookingDari(id); b.ceklist[i].ok = el.checked; simpan(); el.closest('.cek').classList.toggle('ok', el.checked); };
AKSI.pasangCeklist = el => {
  const b = bookingDari(el.dataset.v);
  modal(`${kepala('Pilih template ceklist')}${S.ceklist.length ? S.ceklist.map(c => `<div class="item" data-act="pakaiCeklist" data-v="${b.id}|${c.id}"><div class="av">${ik('list')}</div><div class="tengah"><div class="t1">${esc(c.nama)}</div><div class="t2">${c.items.length} barang</div></div></div>`).join('') : kosong('Belum ada template', 'list', '<a class="btn" href="#/ceklist" data-act="tutup">Buat template</a>')}`, 'kecil');
};
AKSI.pakaiCeklist = el => { const [bid, cid] = el.dataset.v.split('|'); const b = bookingDari(bid), c = S.ceklist.find(x => x.id === cid); const ada = new Set((b.ceklist || []).map(x => x.nama)); b.ceklist = [...(b.ceklist || []), ...c.items.filter(n => !ada.has(n)).map(nama => ({ nama, ok: false }))]; simpan(); tutup(); render(); };
AKSI.linkCeklist = async el => { const b = bookingDari(el.dataset.v); const k = await kode({ b: S.profil.nama, k: klienDari(b.klienId).nama, t: b.tanggal, l: namaLayanan(b), c: b.ceklist.map(c => [c.nama, c.ok ? 1 : 0]) }); const url = (await pendekkan('c', k)) || alamatApp() + '#/c/' + k; modal(`${kepala('Link ceklist untuk klien', 'Klien bisa memantau persiapan perlengkapan (status saat link dibuat).')}<input class="inp" value="${esc(url)}" readonly onclick="this.select()"><div class="lembar-kaki"><button class="btn" data-act="salinV" data-v="${esc(url)}">${ik('copy')} Salin</button><button class="btn btn-wa" data-act="waTeks" data-v="${esc(klienDari(b.klienId).wa)}" data-t="${esc('Halo ' + klienDari(b.klienId).nama + ', ini status persiapan perlengkapan untuk sesi kamu: ' + url)}">${ik('wa')} Kirim WA</button></div>`, 'kecil'); };

function linkGcal(b) {
  const tgl = b.tanggal.replace(/-/g, ''); let dates;
  if (b.jam) { const [h, m] = b.jam.split(':').map(Number); const mulai = new Date(b.tanggal + 'T' + b.jam); const durasi = (b.item || []).reduce((s, i) => s + (Number(S.layanan.find(l => l.id === i.layananId)?.durasi) || 60), 0) || 60; const akhir = b.jamSelesai ? new Date(b.tanggal + 'T' + b.jamSelesai) : new Date(mulai.getTime() + durasi * 6e4); const f = d => iso(d).replace(/-/g, '') + 'T' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + '00'; dates = f(mulai) + '/' + f(akhir); }
  else dates = tgl + '/' + tambahHari(b.tanggal, 1).replace(/-/g, '');
  const k = klienDari(b.klienId);
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(`${k.nama} — ${namaLayanan(b)}`) + '&dates=' + dates + '&location=' + encodeURIComponent(b.lokasi || '') + '&details=' + encodeURIComponent(`Klien: ${k.nama} (${k.wa})\nTotal: ${rp(totalBooking(b))} · ${LABEL_BAYAR[statusBayar(b)]}\n${b.catatan || ''}\n— Beresin`);
}
AKSI.eksporIcs = () => {
  const f = d => d.replace(/-/g, ''); const baris = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Beresin//ID', 'CALSCALE:GREGORIAN'];
  S.booking.filter(aktif).forEach(b => { const k = klienDari(b.klienId); baris.push('BEGIN:VEVENT', 'UID:' + b.id + '@beresin', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
    b.jam ? 'DTSTART:' + f(b.tanggal) + 'T' + b.jam.replace(':', '') + '00' : 'DTSTART;VALUE=DATE:' + f(b.tanggal), b.jam ? 'DURATION:PT' + ((b.item || []).reduce((s, i) => s + (Number(S.layanan.find(l => l.id === i.layananId)?.durasi) || 60), 0) || 60) + 'M' : 'DTEND;VALUE=DATE:' + f(tambahHari(b.tanggal, 1)),
    'SUMMARY:' + (k.nama + ' — ' + namaLayanan(b)).replace(/[,;]/g, ' '), 'LOCATION:' + (b.lokasi || '').replace(/[,;]/g, ' '), 'DESCRIPTION:' + ('WA ' + k.wa + ' · ' + rp(totalBooking(b)) + ' · ' + LABEL_BAYAR[statusBayar(b)]).replace(/[,;]/g, ' '), 'END:VEVENT'); });
  baris.push('END:VCALENDAR'); unduh('jadwal-beresin.ics', baris.join('\r\n'), 'text/calendar');
  toast('File .ics diunduh — buka di Google Calendar → Impor');
};

/* ---------- WA ---------- */
AKSI.waBooking = el => { const [id, jenis] = el.dataset.v.split('|'); const b = bookingDari(id); const k = klienDari(b.klienId);
  const kapan = selisihHari(hariIni(), b.tanggal); bukaWA(k.wa, isiTemplate(jenis, b, { kapan: kapan === 0 ? 'hari ini' : kapan === 1 ? 'besok' : kapan + ' hari lagi' }));
  S.terkirim[jenis + '_' + id + '_' + hariIni()] = 1; catat(`WA ${jenis} ke ${k.nama}`, 'wa'); simpan(); };
async function linkInvoice(b) { const k = await kodeInvoice(b); return (typeof pendekkan === 'function' && await pendekkan('i', k)) || alamatApp() + '#/i/' + k; }
async function kodeInvoice(b) { const k = klienDari(b.klienId); return await kode({ p: { n: S.profil.nama, w: S.profil.wa, a: S.profil.alamat, r: S.profil.rekening, i: S.profil.ig }, no: noInvoice(b), k: [k.nama, k.wa], t: b.tanggal, j: b.jam, l: b.lokasi, it: (b.item || []).map(i => [i.nama, i.qty || 1, i.harga]), tb: (b.tambahan || []).map(t => [t.nama, t.harga]), bj: biayaJalan(b), km: b.jarakKm || 0, d: b.diskon || 0, by: bayarDari(b.id).map(p => [p.tanggal, p.nominal, p.jenis]), dibuat: hariIni() }); }
AKSI.waInvoice = async el => { const b = bookingDari(el.dataset.v); bukaWAJanji(klienDari(b.klienId).wa, linkInvoice(b).then(link => isiTemplate('invoice', b, { link }))); catat('Kirim invoice ' + noInvoice(b), 'invoice'); simpan(); };
AKSI.waTagih = async el => { const b = bookingDari(el.dataset.v); bukaWAJanji(klienDari(b.klienId).wa, linkInvoice(b).then(link => isiTemplate('tagih', b, { link }))); S.terkirim['tagih_wa_' + b.id + '_' + hariIni()] = 1; catat('Tagih ' + klienDari(b.klienId).nama, 'wallet'); simpan(); render(); };
AKSI.waTeks = el => bukaWA(el.dataset.v, el.dataset.t);
AKSI.salinV = el => salin(el.dataset.v);

/* ---------- form booking ---------- */
let FB = null;
function bookingKosong(tgl) { return { id: '', klienId: '', klienBaru: { nama: '', wa: '', ig: '' }, item: [], tambahan: [], diskon: 0, jarakKm: 0, biayaJalan: 0, tanggal: tgl || hariIni(), jam: '', jamSelesai: '', lokasi: '', status: 'konfirmasi', catatan: '', tim: [], ceklist: [], bayarAwal: 'belum', nominalAwal: 0 }; }
AKSI.bookingBaru = el => { FB = bookingKosong(el?.dataset?.v || (rute.nama === 'jadwal' ? hariPilih : '')); formBooking(); };
AKSI.editBooking = el => { FB = JSON.parse(JSON.stringify(bookingDari(el.dataset.v))); FB.klienBaru = { nama: '', wa: '', ig: '' }; formBooking(); };
function formBooking() {
  const b = FB, baru = !b.id;
  const kat = [...new Set(S.layanan.map(l => l.kategori || 'Lainnya'))];
  const bentrok = S.booking.filter(x => aktif(x) && x.id !== b.id && x.tanggal === b.tanggal);
  modal(`${kepala(baru ? 'Booking baru' : 'Ubah booking', baru ? 'Isi seperlunya — sisanya bisa dilengkapi nanti.' : noInvoice(b))}
  <form class="form" id="formBooking">
    <div class="bagian"><h4><i>1</i> Klien</h4>
      <label class="f"><span>Pilih klien lama</span><select name="klienId"><option value="">+ Klien baru</option>${S.klien.slice().sort((a, c) => a.nama.localeCompare(c.nama)).map(k => `<option value="${k.id}" ${k.id === b.klienId ? 'selected' : ''}>${esc(k.nama)} · ${esc(k.wa)}</option>`).join('')}</select></label>
      <div id="klienBaru" ${b.klienId ? 'hidden' : ''} class="form" style="gap:10px"><div class="dua"><label class="f"><span>Nama klien *</span><input name="kNama" value="${esc(b.klienBaru.nama)}" placeholder="Nama lengkap"></label><label class="f"><span>No. WA *</span><input name="kWa" inputmode="tel" value="${esc(b.klienBaru.wa)}" placeholder="08xx"></label></div>
      <label class="f"><span>Instagram</span><input name="kIg" value="${esc(b.klienBaru.ig)}" placeholder="@"></label></div>
    </div>
    <div class="bagian"><h4><i>2</i> Layanan</h4>
      ${kat.map(kt => `<div><small class="muted" style="font-weight:700">${esc(kt)}</small><div class="pilihan" style="margin-top:6px">${S.layanan.filter(l => (l.kategori || 'Lainnya') === kt).map(l => { const ada = b.item.find(i => i.layananId === l.id); return `<button type="button" class="${ada ? 'on' : ''}" data-act="fbLayanan" data-v="${l.id}">${esc(l.nama)}<small>${rp(l.harga)}${ada && ada.qty > 1 ? ' × ' + ada.qty : ''}</small></button>`; }).join('')}</div></div>`).join('') || '<p class="muted">Belum ada layanan. <a href="#/layanan" data-act="tutup">Tambah layanan</a></p>'}
      ${b.item.length ? `<div class="form" style="gap:8px">${b.item.map((i, n) => `<div class="baris-item"><span style="font-weight:600">${esc(i.nama)}</span><input class="inp" type="number" min="1" value="${i.qty || 1}" data-fb="qty" data-n="${n}" aria-label="Jumlah"><input class="inp" inputmode="numeric" value="${titik(i.harga)}" data-fb="harga" data-n="${n}" aria-label="Harga"><button type="button" class="ikon-btn" data-act="fbHapusItem" data-v="${n}">${ik('x')}</button></div>`).join('')}</div>` : ''}
      ${b.tambahan.map((t, n) => `<div class="baris-item" style="grid-template-columns:1fr 130px 36px"><input class="inp" value="${esc(t.nama)}" placeholder="Tambahan (mis. extra jam)" data-fb="tNama" data-n="${n}"><input class="inp" inputmode="numeric" value="${titik(t.harga)}" placeholder="Rp" data-fb="tHarga" data-n="${n}"><button type="button" class="ikon-btn" data-act="fbHapusTambah" data-v="${n}">${ik('x')}</button></div>`).join('')}
      <button type="button" class="btn btn-kecil" data-act="fbTambahan" style="justify-self:start">${ik('plus')} Biaya tambahan lain</button>
    </div>
    <div class="bagian"><h4><i>3</i> Waktu & lokasi</h4>
      <div class="tiga"><label class="f"><span>Tanggal *</span><input type="date" name="tanggal" value="${b.tanggal}" required></label><label class="f"><span>Jam mulai</span><input type="time" name="jam" value="${esc(b.jam)}"></label><label class="f"><span>Jam selesai</span><input type="time" name="jamSelesai" value="${esc(b.jamSelesai)}"></label></div>
      ${bentrok.length ? `<div class="chip dp" style="justify-self:start">⚠ Sudah ada ${bentrok.length} jadwal di tanggal ini: ${esc(bentrok.map(x => (x.jam || '') + ' ' + klienDari(x.klienId).nama).join(', '))}</div>` : ''}
      <label class="f"><span>Lokasi</span><input name="lokasi" value="${esc(b.lokasi)}" placeholder="Alamat / gedung"></label>
      <div class="dua"><label class="f"><span>Jarak dari basecamp (km)</span><input name="jarakKm" type="number" min="0" step="0.5" value="${b.jarakKm || ''}" placeholder="0"><small>Gratis ${S.setelan.gratisKm} km pertama, lalu ${rp(S.setelan.biayaPerKm)}/km</small></label>
      <label class="f"><span>Biaya perjalanan</span><input name="biayaJalan" inputmode="numeric" value="${titik(b.biayaJalan)}" placeholder="otomatis"></label></div>
    </div>
    <div class="bagian"><h4><i>4</i> Pembayaran & lainnya</h4>
      <div class="dua"><label class="f"><span>Diskon</span><input name="diskon" inputmode="numeric" value="${titik(b.diskon)}" placeholder="0"></label>
      <label class="f"><span>Status</span><select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div>
      ${baru ? `<div class="f"><span>Pembayaran saat ini</span><div class="pilihan">${[['belum', 'Belum bayar'], ['dp', `DP ${S.setelan.dpPersen}%`], ['lunas', 'Lunas']].map(([k, l]) => `<button type="button" class="${b.bayarAwal === k ? 'on' : ''}" data-act="fbBayar" data-v="${k}">${l}</button>`).join('')}</div></div>
      ${b.bayarAwal === 'dp' ? `<label class="f"><span>Nominal DP</span><input name="nominalAwal" inputmode="numeric" value="${titik(b.nominalAwal || Math.round(totalFB() * S.setelan.dpPersen / 100 / 1000) * 1000)}"></label>` : ''}` : ''}
      ${S.tim.length ? `<div class="f"><span>Tim bertugas</span><div class="pilihan">${S.tim.map(t => `<button type="button" class="${b.tim.includes(t.id) ? 'on' : ''}" data-act="fbTim" data-v="${t.id}">${esc(t.nama)}<small>${esc(t.peran)}</small></button>`).join('')}</div></div>` : ''}
      <label class="f"><span>Catatan</span><textarea name="catatan" placeholder="Permintaan khusus, warna tema, dll.">${esc(b.catatan)}</textarea></label>
    </div>
    <div class="total-box"><div><span>Subtotal layanan</span><span id="fbSub">${rp(subtotal(b))}</span></div><div><span>Perjalanan − diskon</span><span id="fbJal">${rp(biayaJalan(b) - (Number(b.diskon) || 0))}</span></div><div class="besar"><span>Total</span><b id="fbTot">${rp(totalFB())}</b></div></div>
    <div class="lembar-kaki"><button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">${ik('check')} ${baru ? 'Simpan booking' : 'Simpan perubahan'}</button></div>
  </form>`, 'lebar');
  const form = $('#formBooking');
  form.klienId.onchange = () => { b.klienId = form.klienId.value; $('#klienBaru').hidden = !!b.klienId; };
  form.oninput = e => { bacaFB(form, e.target); hitungUlangFB(); };
  form.onsubmit = e => { e.preventDefault(); simpanBooking(form); };
}
const totalFB = () => totalBooking(FB);
function bacaFB(form, t) {
  const b = FB;
  if (t?.dataset?.fb) { const n = Number(t.dataset.n); const v = t.dataset.fb; if (v === 'qty') b.item[n].qty = Math.max(1, Number(t.value) || 1); if (v === 'harga') b.item[n].harga = angka(t.value); if (v === 'tNama') b.tambahan[n].nama = t.value; if (v === 'tHarga') b.tambahan[n].harga = angka(t.value); return; }
  if (form.klienId) b.klienId = form.klienId.value;
  b.klienBaru = { nama: form.kNama.value, wa: form.kWa.value, ig: form.kIg.value };
  ['tanggal', 'jam', 'jamSelesai', 'lokasi', 'status', 'catatan'].forEach(k => b[k] = form[k].value);
  b.diskon = angka(form.diskon.value);
  const km = Number(form.jarakKm.value) || 0;
  if (t?.name === 'jarakKm') { b.jarakKm = km; b.biayaJalan = hitungJalan(km); form.biayaJalan.value = titik(b.biayaJalan); } else b.biayaJalan = angka(form.biayaJalan.value);
  b.jarakKm = km; if (form.nominalAwal) b.nominalAwal = angka(form.nominalAwal.value);
}
function hitungUlangFB() { $('#fbSub').textContent = rp(subtotal(FB)); $('#fbJal').textContent = rp(biayaJalan(FB) - (Number(FB.diskon) || 0)); $('#fbTot').textContent = rp(totalFB()); }
const ulangFB = () => { const f = $('#formBooking'); if (f) bacaFB(f); formBooking(); };
AKSI.fbLayanan = el => { const f = $('#formBooking'); bacaFB(f); const l = S.layanan.find(x => x.id === el.dataset.v); const i = FB.item.findIndex(x => x.layananId === l.id); if (i >= 0) FB.item.splice(i, 1); else FB.item.push({ layananId: l.id, nama: l.nama, harga: l.harga, qty: 1 }); formBooking(); };
AKSI.fbHapusItem = el => { bacaFB($('#formBooking')); FB.item.splice(Number(el.dataset.v), 1); formBooking(); };
AKSI.fbTambahan = () => { bacaFB($('#formBooking')); FB.tambahan.push({ nama: '', harga: 0 }); formBooking(); };
AKSI.fbHapusTambah = el => { bacaFB($('#formBooking')); FB.tambahan.splice(Number(el.dataset.v), 1); formBooking(); };
AKSI.fbBayar = el => { bacaFB($('#formBooking')); FB.bayarAwal = el.dataset.v; FB.nominalAwal = 0; formBooking(); };
AKSI.fbTim = el => { bacaFB($('#formBooking')); const i = FB.tim.indexOf(el.dataset.v); i >= 0 ? FB.tim.splice(i, 1) : FB.tim.push(el.dataset.v); formBooking(); };
function simpanBooking(form) {
  bacaFB(form); const b = FB;
  if (!b.klienId) { if (!b.klienBaru.nama.trim() || !b.klienBaru.wa.trim()) return toast('Isi nama & WA klien'); const k = { id: uid(), nama: b.klienBaru.nama.trim(), wa: b.klienBaru.wa.trim(), ig: b.klienBaru.ig.trim(), alamat: '', catatan: '', dibuat: Date.now() }; S.klien.push(k); b.klienId = k.id; catat('Klien baru: ' + k.nama, 'users'); }
  if (!b.item.length && !b.tambahan.length) return toast('Pilih minimal 1 layanan');
  b.tambahan = b.tambahan.filter(t => t.nama.trim() || t.harga);
  const baru = !b.id, bayarAwal = b.bayarAwal, nominal = b.nominalAwal; delete b.klienBaru; delete b.bayarAwal; delete b.nominalAwal;
  if (baru) { b.id = uid(); b.no = (Math.max(0, ...S.booking.map(x => x.no || 0)) + 1); b.dibuat = Date.now(); b.sumber = b.sumber || 'manual'; S.booking.push(b);
    if (!b.ceklist.length && S.ceklist[0]) b.ceklist = S.ceklist[0].items.map(nama => ({ nama, ok: false }));
    if (bayarAwal === 'dp') S.bayar.push({ id: uid(), bookingId: b.id, tanggal: hariIni(), nominal: nominal || Math.round(totalBooking(b) * S.setelan.dpPersen / 100 / 1000) * 1000, jenis: 'dp', metode: 'Transfer', ket: '' });
    if (bayarAwal === 'lunas') S.bayar.push({ id: uid(), bookingId: b.id, tanggal: hariIni(), nominal: totalBooking(b), jenis: 'pelunasan', metode: 'Transfer', ket: '' });
    catat(`Booking baru ${klienDari(b.klienId).nama} · ${tglPendek(b.tanggal)}`, 'cal');
  } else { Object.assign(bookingDari(b.id), b); catat('Ubah booking ' + klienDari(b.klienId).nama, 'edit'); }
  simpan(); tutup(); ke('booking', b.id); toast(baru ? 'Booking tersimpan ✓' : 'Perubahan tersimpan');
}

/* ---------- pembayaran ---------- */
AKSI.formBayar = el => formBayar({ bookingId: el?.dataset?.v || '' });
AKSI.editBayar = el => formBayar(S.bayar.find(p => p.id === el.dataset.v));
function formBayar(p) {
  const baru = !p.id; const opsi = S.booking.filter(b => aktif(b) && (statusBayar(b) !== 'lunas' || b.id === p.bookingId)).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const b0 = bookingDari(p.bookingId);
  modal(`${kepala(baru ? 'Catat pembayaran' : 'Ubah pembayaran', 'DP, pelunasan, atau cicilan dari klien.')}<form class="form" id="formBayar">
    <label class="f"><span>Booking *</span><select name="bookingId" required><option value="">Pilih booking…</option>${opsi.map(b => `<option value="${b.id}" ${b.id === p.bookingId ? 'selected' : ''}>${esc(klienDari(b.klienId).nama)} · ${tglPendek(b.tanggal)} · sisa ${rp(sisaBayar(b))}</option>`).join('')}</select></label>
    <div class="dua"><label class="f"><span>Nominal *</span><input name="nominal" inputmode="numeric" required value="${titik(p.nominal || (b0 ? sisaBayar(b0) : ''))}"></label><label class="f"><span>Tanggal</span><input type="date" name="tanggal" value="${p.tanggal || hariIni()}"></label></div>
    <div class="dua"><label class="f"><span>Jenis</span><select name="jenis">${[['dp', 'DP'], ['pelunasan', 'Pelunasan'], ['cicil', 'Cicilan / lainnya']].map(([k, l]) => `<option value="${k}" ${(p.jenis || (b0 && dibayar(b0) ? 'pelunasan' : 'dp')) === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="f"><span>Metode</span><select name="metode">${['Transfer', 'Tunai', 'QRIS', 'E-wallet'].map(m => `<option ${p.metode === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label></div>
    <label class="f"><span>Keterangan</span><input name="ket" value="${esc(p.ket || '')}"></label>
    <div class="lembar-kaki">${!baru ? '<button type="button" class="btn btn-hapus" id="hapusBayar">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">${ik('check')} Simpan</button></div></form>`, 'kecil');
  const f = $('#formBayar');
  f.bookingId.onchange = () => { const b = bookingDari(f.bookingId.value); if (b && baru) { f.nominal.value = titik(dibayar(b) ? sisaBayar(b) : Math.round(totalBooking(b) * S.setelan.dpPersen / 100 / 1000) * 1000); f.jenis.value = dibayar(b) ? 'pelunasan' : 'dp'; } };
  if (!baru) $('#hapusBayar').onclick = () => { S.bayar = S.bayar.filter(x => x.id !== p.id); catat('Hapus pembayaran ' + rp(p.nominal), 'trash'); simpan(); tutup(); render(); };
  f.onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f)); if (!d.bookingId) return toast('Pilih booking');
    const r = { ...p, ...d, nominal: angka(d.nominal), id: p.id || uid() }; if (!r.nominal) return toast('Isi nominal');
    if (baru) S.bayar.push(r); else Object.assign(S.bayar.find(x => x.id === p.id), r);
    const b = bookingDari(r.bookingId); catat(`Terima ${rp(r.nominal)} dari ${klienDari(b.klienId).nama}`, 'in');
    if (statusBayar(b) === 'lunas') beriNotif('Lunas ✅ ' + klienDari(b.klienId).nama, namaLayanan(b) + ' sudah lunas.', 'booking/' + b.id);
    simpan(); tutup(); render(); toast(statusBayar(b) === 'lunas' ? 'Lunas! 🎉' : 'Pembayaran tercatat'); };
}

/* ---------- invoice ---------- */
AKSI.lihatInvoice = async el => { const b = bookingDari(el.dataset.v); location.hash = '#/i/' + await kodeInvoice(b); };
VIEWS.i = async kodeStr => {
  let d; try { d = await urai(kodeStr); } catch (e) { return kosong('Link invoice rusak atau tidak lengkap.', 'invoice'); }
  const sub = d.it.reduce((s, [, q, h]) => s + q * h, 0) + d.tb.reduce((s, [, h]) => s + h, 0);
  const total = Math.max(0, sub + d.bj - d.d), bayar = d.by.reduce((s, [, n]) => s + n, 0), sisa = Math.max(0, total - bayar);
  const milikSaya = S.siap && S.profil.nama === d.p.n;
  return `<div class="pub" style="padding-top:20px">
   <div class="no-print" style="display:flex;gap:10px;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap">${milikSaya ? `<a class="btn" href="javascript:history.back()">${ik('back')} Kembali</a>` : '<span></span>'}<div class="aksi-baris"><button class="btn" onclick="print()">${ik('print')} Simpan PDF / cetak</button>${milikSaya ? `<button class="btn" data-act="salinV" data-v="${esc(location.href)}">${ik('copy')} Salin link</button>` : `<a class="btn btn-wa" href="${waLink(d.p.w, 'Halo ' + d.p.n + ', saya sudah lihat invoice ' + d.no + '.')}" target="_blank" rel="noopener">${ik('wa')} Hubungi ${esc(d.p.n)}</a>`}</div></div>
   <div class="invoice"><div class="kepala"><div><h1>${esc(d.p.n)}</h1><p class="muted" style="margin:6px 0 0">${esc(d.p.a || '')}<br>WA ${esc(d.p.w)} ${d.p.i ? '· ' + esc(d.p.i) : ''}</p></div>
     <div style="text-align:right"><div class="chip hitam">INVOICE</div><h2 style="margin-top:8px;font-size:20px">${esc(d.no)}</h2><p class="muted" style="margin:4px 0 0">Dibuat ${tglSedang(d.dibuat)}</p></div></div>
     <div class="dua" style="margin-top:18px"><div><small class="muted">Ditagihkan kepada</small><br><b>${esc(d.k[0])}</b><br>${esc(d.k[1])}</div><div><small class="muted">Jadwal</small><br><b>${tglPanjang(d.t)}</b>${d.j ? ' · ' + esc(d.j) : ''}<br>${esc(d.l || '')}</div></div>
     <table><thead><tr><th>Layanan</th><th>Qty</th><th>Jumlah</th></tr></thead><tbody>
       ${d.it.map(([n, q, h]) => `<tr><td>${esc(n)}<br><small class="muted">${rp(h)}</small></td><td>${q}</td><td class="tnum">${rp(q * h)}</td></tr>`).join('')}
       ${d.tb.map(([n, h]) => `<tr><td>${esc(n)}</td><td>1</td><td class="tnum">${rp(h)}</td></tr>`).join('')}
       ${d.bj ? `<tr><td>Biaya perjalanan${d.km ? ` (${d.km} km)` : ''}</td><td>1</td><td class="tnum">${rp(d.bj)}</td></tr>` : ''}</tbody></table>
     <div class="ringkas"><div><span>Subtotal</span><span class="tnum">${rp(sub + d.bj)}</span></div>${d.d ? `<div><span>Diskon</span><span class="tnum">−${rp(d.d)}</span></div>` : ''}<div class="tot"><span>Total</span><span class="tnum">${rp(total)}</span></div>
       ${d.by.map(([t, n, j]) => `<div class="muted"><span>${j === 'dp' ? 'DP' : j === 'pelunasan' ? 'Pelunasan' : 'Bayar'} · ${tglPendek(t)}</span><span class="tnum">−${rp(n)}</span></div>`).join('')}
       <div style="font-weight:800"><span>Sisa tagihan</span><span class="tnum">${rp(sisa)}</span></div></div>
     <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-top:26px;flex-wrap:wrap"><div>${d.p.r ? `<small class="muted">Pembayaran ke</small><br><b>${esc(d.p.r)}</b>` : ''}</div>${sisa === 0 ? '<span class="cap-lunas">LUNAS</span>' : `<span class="chip ${bayar ? 'dp' : 'belum'}" style="font-size:14px">${bayar ? 'Sudah DP' : 'Belum dibayar'}</span>`}</div>
   </div><div class="kaki-pub">Invoice dibuat dengan <img src="img/beresin_logo_terang.svg" alt="beresin"> · by FF Agency</div></div>`;
};
