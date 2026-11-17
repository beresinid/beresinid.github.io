/* Beresin — layanan, pricelist, radar, ceklist, sewa, tim, kursus, log, setelan, langganan */

/* ---------- Layanan & harga ---------- */
VIEWS.layanan = () => {
  const kat = [...new Set(S.layanan.map(l => l.kategori || 'Lainnya'))];
  return `<div class="judul-hal"><div><h1>Layanan & Harga</h1><p>Dipakai di form booking, halaman publik & poster pricelist.</p></div><div class="aksi-baris"><a class="btn" href="#/pricelist">${ik('image')} Buat poster</a><button class="btn btn-merah" data-act="formLayanan">${ik('plus')} Layanan</button></div></div>
  ${kat.map(k => `<div class="kartu masuk"><h3>${esc(k)}</h3>${S.layanan.filter(l => (l.kategori || 'Lainnya') === k).map(l => `<div class="item" data-act="formLayanan" data-v="${l.id}"><div class="av">${ik('tag')}</div><div class="tengah"><div class="t1">${esc(l.nama)} ${l.tampil === false ? '<span class="chip">disembunyikan</span>' : ''}</div><div class="t2">${l.durasi ? '± ' + l.durasi + ' menit' : ''}${l.ket ? ' · ' + esc(l.ket) : ''}</div></div><div class="kanan"><b>${rp(l.harga)}</b></div></div>`).join('')}</div>`).join('') || `<div class="kartu">${kosong('Belum ada layanan', 'tag')}</div>`}`;
};
AKSI.formLayanan = el => {
  const l = S.layanan.find(x => x.id === el?.dataset?.v) || { tampil: true };
  modal(`${kepala(l.id ? 'Ubah layanan' : 'Layanan baru')}<form class="form" id="formLayanan">
    <label class="f"><span>Nama layanan *</span><input name="nama" required value="${esc(l.nama || '')}" autofocus></label>
    <div class="dua"><label class="f"><span>Harga *</span><input name="harga" inputmode="numeric" required value="${titik(l.harga)}"></label><label class="f"><span>Durasi (menit)</span><input name="durasi" type="number" min="0" value="${l.durasi || ''}"></label></div>
    <label class="f"><span>Kategori</span><input name="kategori" list="dlKat" value="${esc(l.kategori || '')}" placeholder="Wedding, Event, Reguler…"><datalist id="dlKat">${[...new Set(S.layanan.map(x => x.kategori))].map(k => `<option value="${esc(k)}">`).join('')}</datalist></label>
    <label class="f"><span>Keterangan singkat</span><input name="ket" value="${esc(l.ket || '')}" placeholder="mis. termasuk bulu mata"></label>
    <label class="cek"><input type="checkbox" name="tampil" ${l.tampil !== false ? 'checked' : ''}><span style="text-decoration:none;color:inherit">Tampilkan di halaman booking & pricelist</span></label>
    <div class="lembar-kaki">${l.id ? '<button type="button" class="btn btn-hapus" id="hapusLayanan">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  if (l.id) $('#hapusLayanan').onclick = () => { S.layanan = S.layanan.filter(x => x.id !== l.id); simpan(); tutup(); render(); };
  $('#formLayanan').onsubmit = e => { e.preventDefault(); const f = e.target; const r = { ...l, nama: f.nama.value.trim(), harga: angka(f.harga.value), durasi: Number(f.durasi.value) || 0, kategori: f.kategori.value.trim() || 'Lainnya', ket: f.ket.value.trim(), tampil: f.tampil.checked };
    if (l.id) Object.assign(S.layanan.find(x => x.id === l.id), r); else S.layanan.push({ ...r, id: uid() }); catat('Layanan: ' + r.nama, 'tag'); simpan(); tutup(); render(); };
};

/* ---------- Poster pricelist (canvas) ---------- */
let gayaPoster = 'gelap';
VIEWS.pricelist = () => `<div class="judul-hal"><div><h1>Poster Pricelist</h1><p>Desain siap posting, langsung dari data layananmu.</p></div><div class="aksi-baris"><div class="tabs">${[['gelap', 'Gelap'], ['terang', 'Terang'], ['merah', 'Merah']].map(([k, l]) => `<button class="${gayaPoster === k ? 'on' : ''}" data-act="gayaPoster" data-v="${k}">${l}</button>`).join('')}</div><button class="btn btn-merah" data-act="unduhPoster">${ik('share')} Bagikan / unduh</button></div></div>
  <div class="kartu masuk" style="display:flex;justify-content:center"><canvas id="poster" width="1080" height="1350" style="width:min(100%,460px);border-radius:16px;box-shadow:var(--bayang)"></canvas></div>`;
VIEWS.pricelist_siap = () => gambarPoster($('#poster'));
AKSI.gayaPoster = el => { gayaPoster = el.dataset.v; render(); };
AKSI.unduhPoster = () => bagikanGambar($('#poster'), 'pricelist-' + (S.profil.slug || 'beresin') + '.png', 'Pricelist ' + S.profil.nama);
async function gambarPoster(c) {
  await muatFontKanvas(); const x = c.getContext('2d'), W = 1080, H = 1350;
  const tema = { gelap: ['#0D0D0D', '#fff', '#E3EF26', 'rgba(255,255,255,.08)', '#aaa'], terang: ['#F4F4F4', '#0D0D0D', '#E32B2B', '#fff', '#6b6b6b'], merah: ['#B32222', '#fff', '#E3EF26', 'rgba(0,0,0,.18)', '#ffd6d6'] }[gayaPoster];
  x.fillStyle = tema[0]; x.fillRect(0, 0, W, H);
  if (gayaPoster !== 'terang') { const g = x.createRadialGradient(W - 120, 120, 10, W - 120, 120, 520); g.addColorStop(0, gayaPoster === 'merah' ? 'rgba(255,120,120,.6)' : 'rgba(227,43,43,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
  x.fillStyle = 'rgba(227,43,43,1)'; const lbl = 'PRICELIST'; x.font = '800 30px OSO'; const lw = x.measureText(lbl).width + 44; rr(x, 80, 80, lw, 56, 14); x.fillStyle = gayaPoster === 'merah' ? '#0D0D0D' : '#E32B2B'; x.fill(); x.fillStyle = '#fff'; x.fillText(lbl, 102, 119);
  x.fillStyle = tema[1]; x.font = '800 84px OSO'; tulisMuat(x, S.profil.nama || 'Bisnis Kamu', 80, 250, W - 160, 84);
  x.font = '600 30px Inter'; x.fillStyle = tema[4]; x.fillText((PROFESI[S.profil.profesi] || PROFESI.lain).nama + (S.profil.kota ? ' · ' + S.profil.kota : ''), 80, 305);
  const L = S.layanan.filter(l => l.tampil !== false).slice(0, 9); let y = 380; const tinggi = Math.min(96, (1110 - y) / Math.max(1, L.length));
  L.forEach(l => { x.fillStyle = tema[3]; rr(x, 80, y, W - 160, tinggi - 14, 20); x.fill(); x.fillStyle = tema[1]; x.font = `700 ${Math.min(34, tinggi * .36)}px OSO`; tulisMuat(x, l.nama, 110, y + (tinggi - 14) / 2 + 11, W - 520, Math.min(34, tinggi * .36));
    x.fillStyle = tema[2]; x.font = `800 ${Math.min(38, tinggi * .4)}px OSO`; x.textAlign = 'right'; x.fillText(rp(l.harga), W - 110, y + (tinggi - 14) / 2 + 13); x.textAlign = 'left'; y += tinggi; });
  x.fillStyle = tema[4]; x.font = '600 28px Inter'; x.fillText('Booking & tanya jadwal:', 80, 1190); x.fillStyle = tema[1]; x.font = '800 40px OSO'; x.fillText('WA ' + (S.profil.wa || '-') + (S.profil.ig ? '  ·  ' + S.profil.ig : ''), 80, 1245);
  x.fillStyle = tema[4]; x.font = '600 22px Inter'; x.fillText('Dibuat dengan Beresin', 80, 1300);
}
function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function tulisMuat(x, t, a, b, maks, ukuran) { let s = ukuran; const font = x.font; while (x.measureText(t).width > maks && s > 16) { s -= 2; x.font = font.replace(/\d+px/, s + 'px'); } x.fillText(t, a, b); }

/* ---------- Radar okupansi ---------- */
let bulanRadar = hariIni().slice(0, 7);
VIEWS.radar = () => {
  const ym = bulanRadar, cap = Number(S.setelan.kapasitasHarian) || 1, per = {};
  S.booking.filter(aktif).forEach(b => per[b.tanggal] = (per[b.tanggal] || 0) + 1);
  const hariBln = Number(akhirBulan(ym).slice(8)), terisi = Object.keys(per).filter(t => t.startsWith(ym));
  const total = terisi.reduce((s, t) => s + per[t], 0), persen = Math.round(total / (hariBln * cap) * 100);
  const perHari = [0, 0, 0, 0, 0, 0, 0]; S.booking.filter(aktif).forEach(b => perHari[keTgl(b.tanggal).getDay()]++);
  const sibuk = [...Array(6)].map((_, i) => { const m = geserBulan(ym, i - 2); return { label: BULAN[Number(m.slice(5)) - 1].slice(0, 3), nilai: S.booking.filter(b => aktif(b) && b.tanggal.startsWith(m)).length, ini: m === ym }; });
  const warna = n => !n ? '' : n >= cap ? 'background:#E32B2B;color:#fff' : `background:rgba(227,43,43,${.15 + .5 * n / cap})`;
  return `<div class="judul-hal"><div><h1>Radar Okupansi</h1><p>Kepadatan jadwal — tahu kapan perlu ambil asisten atau libur.</p></div></div>
  <div class="grid g2 masuk" style="align-items:start"><div class="kartu"><div class="kal-kepala"><button class="ikon-btn" data-act="bulanRadar" data-v="-1">${ik('back')}</button><h3>${namaBulan(ym)}</h3><button class="ikon-btn" data-act="bulanRadar" data-v="1">${ik('arrow')}</button></div>
    ${kalender(ym, '', t => ({ gaya: warna(per[t] || 0), judul: (per[t] || 0) + ' booking' }), 'radarHari')}
    <p class="muted" style="font-size:12px;margin-top:10px">Makin merah = makin padat. Merah penuh = ${cap} booking (kapasitas harian, ubah di Halaman Booking).</p></div>
   <div><div class="kartu"><small class="muted">Tingkat okupansi ${namaBulan(ym)}</small><h2 style="font-size:40px;margin-top:4px">${persen}%</h2><div style="height:10px;border-radius:5px;background:var(--bg);margin-top:8px"><div style="height:100%;width:${Math.min(100, persen)}%;border-radius:5px;background:var(--grad)"></div></div><p class="muted" style="margin:10px 0 0">${total} booking di ${terisi.length} hari dari ${hariBln} hari. ${persen >= 70 ? '🔥 Sangat padat — pertimbangkan tambah asisten.' : persen >= 40 ? 'Cukup ramai.' : 'Masih banyak slot kosong — saatnya promosi.'}</p></div>
   <div class="kartu"><h3>Hari paling ramai</h3>${barChart(perHari.map((n, i) => ({ label: HARI[i].slice(0, 3), nilai: n })).slice(1).concat([{ label: 'Min', nilai: perHari[0] }])).replace(/Rp /g, '')}</div>
   <div class="kartu"><h3>Tren jumlah booking</h3>${barChart(sibuk)}</div></div></div>`;
};
AKSI.bulanRadar = el => { bulanRadar = geserBulan(bulanRadar, Number(el.dataset.v)); render(); };
AKSI.radarHari = el => { hariPilih = el.dataset.v; bulanJadwal = hariPilih.slice(0, 7); ke('jadwal'); };

/* ---------- Ceklist template ---------- */
VIEWS.ceklist = () => `<div class="judul-hal"><div><h1>Ceklist Perlengkapan</h1><p>Template barang wajib per sesi. Otomatis dipasang di booking baru; klien bisa pantau lewat link.</p></div><button class="btn btn-merah" data-act="formCeklist">${ik('plus')} Template</button></div>
  <div class="grid g2 masuk">${S.ceklist.map((c, i) => `<div class="kartu"><h3 style="justify-content:space-between">${esc(c.nama)} ${i === 0 ? '<span class="chip neon">default</span>' : ''}</h3>${c.items.map(n => `<div class="cek" style="margin-bottom:6px">${ik('check')}<span style="text-decoration:none;color:inherit">${esc(n)}</span></div>`).join('')}<div class="aksi-baris" style="margin-top:10px">${i ? `<button class="btn btn-kecil" data-act="jadikanDefault" data-v="${c.id}">Jadikan default</button>` : ''}<button class="btn btn-kecil" data-act="formCeklist" data-v="${c.id}">${ik('edit')} Ubah</button></div></div>`).join('') || `<div class="kartu">${kosong('Belum ada template', 'list')}</div>`}</div>
  ${(() => { const bk = S.booking.filter(b => aktif(b) && b.tanggal >= hariIni() && (b.ceklist || []).length).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 8); return bk.length ? `<div class="kartu" style="margin-top:16px"><h3>Status persiapan sesi mendatang</h3>${bk.map(b => { const ok = b.ceklist.filter(c => c.ok).length; return `<div class="item" data-act="bukaBooking" data-v="${b.id}"><div class="av ${ok === b.ceklist.length ? '' : 'merah'}">${ok}/${b.ceklist.length}</div><div class="tengah"><div class="t1">${esc(klienDari(b.klienId).nama)}</div><div class="t2">${tglPanjang(b.tanggal)}</div></div>${ok === b.ceklist.length ? '<span class="chip lunas">Siap</span>' : '<span class="chip dp">Belum lengkap</span>'}</div>`; }).join('')}</div>` : ''; })()}`;
AKSI.jadikanDefault = el => { const i = S.ceklist.findIndex(c => c.id === el.dataset.v); S.ceklist.unshift(S.ceklist.splice(i, 1)[0]); simpan(); render(); };
AKSI.formCeklist = el => {
  const c = S.ceklist.find(x => x.id === el?.dataset?.v) || { nama: '', items: [] };
  modal(`${kepala(c.id ? 'Ubah template' : 'Template baru')}<form class="form" id="formCek"><label class="f"><span>Nama template *</span><input name="nama" required value="${esc(c.nama)}" placeholder="mis. Wedding outdoor"></label>
    <label class="f"><span>Daftar barang (satu per baris)</span><textarea name="items" style="min-height:200px">${esc(c.items.join('\n'))}</textarea></label>
    <div class="lembar-kaki">${c.id ? '<button type="button" class="btn btn-hapus" id="hapusCek">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  if (c.id) $('#hapusCek').onclick = () => { S.ceklist = S.ceklist.filter(x => x.id !== c.id); simpan(); tutup(); render(); };
  $('#formCek').onsubmit = e => { e.preventDefault(); const r = { nama: e.target.nama.value.trim(), items: e.target.items.value.split('\n').map(s => s.trim()).filter(Boolean) };
    if (c.id) Object.assign(S.ceklist.find(x => x.id === c.id), r); else S.ceklist.push({ id: uid(), ...r }); simpan(); tutup(); render(); };
};

/* ---------- Penyewaan alat ---------- */
VIEWS.sewa = () => {
  const h = hariIni(), aktifS = S.sewa.filter(s => s.status !== 'kembali' && s.status !== 'batal').sort((a, b) => a.selesai.localeCompare(b.selesai)), selesai = S.sewa.filter(s => s.status === 'kembali').slice(-10).reverse();
  const baris = s => { const telat = s.status === 'keluar' && s.selesai < h; const sisa = totalSewa(s) - dibayarSewa(s); return `<div class="item" data-act="formSewa" data-v="${s.id}"><div class="av ${telat ? 'merah' : ''}">${ik('box')}</div><div class="tengah"><div class="t1">${esc(klienDari(s.klienId).nama)} · ${esc(s.items.map(i => (i.qty > 1 ? i.qty + '× ' : '') + i.nama).join(', '))}</div><div class="t2">${tglPendek(s.mulai)} – ${tglPendek(s.selesai)} (${lamaSewa(s)} hari)${telat ? ' · <b style="color:var(--merah)">telat ' + selisihHari(s.selesai, h) + ' hari</b>' : ''}</div></div><div class="kanan"><b>${rp(totalSewa(s))}</b><span class="chip ${s.status === 'kembali' ? 'lunas' : s.status === 'keluar' ? 'dp' : ''}">${{ dipesan: 'Dipesan', keluar: 'Keluar', kembali: 'Kembali' }[s.status]}</span>${sisa > 0 ? `<br><small style="color:var(--merah)">piutang ${rpPendek(sisa)}</small>` : ''}</div></div>`; };
  return `<div class="judul-hal"><div><h1>Penyewaan Alat</h1><p>Stok item, keluar/kembali, durasi, piutang & invoice sewa.</p></div><div class="aksi-baris"><button class="btn" data-act="formItem">${ik('plus')} Item</button><button class="btn btn-merah" data-act="formSewa">${ik('plus')} Sewa baru</button></div></div>
  <div class="grid g2 masuk" style="align-items:start"><div class="kartu"><h3>Sedang disewa / dipesan</h3>${aktifS.length ? aktifS.map(baris).join('') : kosong('Tidak ada sewa aktif', 'box')}${selesai.length ? `<div class="sep"></div><h3 style="font-size:15px">Sudah kembali</h3>${selesai.map(baris).join('')}` : ''}</div>
  <div class="kartu"><h3>Stok item hari ini</h3>${S.sewaItem.length ? S.sewaItem.map(i => { const dp = stokDipakai(i.id, h); return `<div class="item" data-act="formItem" data-v="${i.id}"><div class="av">${i.stok - dp}</div><div class="tengah"><div class="t1">${esc(i.nama)}</div><div class="t2">${rp(i.harga)}/${esc(i.satuan || 'hari')} · stok ${i.stok}</div></div><div class="kanan">${dp ? `<span class="chip dp">${dp} keluar</span>` : '<span class="chip lunas">tersedia</span>'}</div></div>`; }).join('') : kosong('Belum ada item sewa', 'box')}</div></div>`;
};
AKSI.formItem = el => {
  const i = S.sewaItem.find(x => x.id === el?.dataset?.v) || {};
  modal(`${kepala(i.id ? 'Ubah item' : 'Item sewa baru')}<form class="form" id="formItem"><label class="f"><span>Nama item *</span><input name="nama" required value="${esc(i.nama || '')}"></label>
    <div class="tiga"><label class="f"><span>Stok</span><input name="stok" type="number" min="0" value="${i.stok ?? 1}"></label><label class="f"><span>Harga sewa</span><input name="harga" inputmode="numeric" value="${titik(i.harga)}"></label><label class="f"><span>Per</span><input name="satuan" value="${esc(i.satuan || 'hari')}"></label></div>
    <div class="lembar-kaki">${i.id ? '<button type="button" class="btn btn-hapus" id="hapusItem">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  if (i.id) $('#hapusItem').onclick = () => { S.sewaItem = S.sewaItem.filter(x => x.id !== i.id); simpan(); tutup(); render(); };
  $('#formItem').onsubmit = e => { e.preventDefault(); const f = e.target, r = { nama: f.nama.value.trim(), stok: Number(f.stok.value) || 0, harga: angka(f.harga.value), satuan: f.satuan.value.trim() || 'hari' };
    if (i.id) Object.assign(S.sewaItem.find(x => x.id === i.id), r); else S.sewaItem.push({ id: uid(), ...r }); simpan(); tutup(); render(); };
};
let FS = null;
AKSI.formSewa = el => { const s = S.sewa.find(x => x.id === el?.dataset?.v); FS = s ? JSON.parse(JSON.stringify(s)) : { klienId: '', items: [], mulai: hariIni(), selesai: tambahHari(hariIni(), 1), status: 'dipesan', denda: 0, bayar: [], catatan: '' }; formSewa(); };
function formSewa() {
  const s = FS;
  if (!S.sewaItem.length) return modal(`${kepala('Sewa baru')}${kosong('Tambah item sewa dulu.', 'box', '<button class="btn btn-merah" data-act="formItem">Tambah item</button>')}`, 'kecil');
  modal(`${kepala(s.id ? 'Ubah sewa' : 'Sewa baru')}<form class="form" id="formSewa">
    <label class="f"><span>Penyewa *</span><select name="klienId" required><option value="">Pilih klien…</option>${S.klien.map(k => `<option value="${k.id}" ${k.id === s.klienId ? 'selected' : ''}>${esc(k.nama)}</option>`).join('')}</select><small><a href="#" data-act="formKlien">+ klien baru</a></small></label>
    <div class="dua"><label class="f"><span>Mulai</span><input type="date" name="mulai" value="${s.mulai}"></label><label class="f"><span>Kembali</span><input type="date" name="selesai" value="${s.selesai}"></label></div>
    <div class="f"><span>Item</span><div class="pilihan">${S.sewaItem.map(i => { const ada = s.items.find(x => x.itemId === i.id); const sisa = i.stok - stokDipakai(i.id, s.mulai, s.id); return `<button type="button" class="${ada ? 'on' : ''}" data-act="fsItem" data-v="${i.id}" ${!ada && sisa <= 0 ? 'disabled style="opacity:.4"' : ''}>${esc(i.nama)}<small>${rp(i.harga)}/${esc(i.satuan)} · sisa ${sisa}</small></button>`; }).join('')}</div></div>
    ${s.items.map((i, n) => `<div class="baris-item" style="grid-template-columns:1fr 70px 130px"><span>${esc(i.nama)}</span><input class="inp" type="number" min="1" value="${i.qty}" data-fs="qty" data-n="${n}"><input class="inp" inputmode="numeric" value="${titik(i.harga)}" data-fs="harga" data-n="${n}"></div>`).join('')}
    <div class="dua"><label class="f"><span>Status</span><select name="status">${[['dipesan', 'Dipesan'], ['keluar', 'Keluar (dibawa penyewa)'], ['kembali', 'Sudah kembali'], ['batal', 'Batal']].map(([k, l]) => `<option value="${k}" ${s.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label class="f"><span>Denda / biaya lain</span><input name="denda" inputmode="numeric" value="${titik(s.denda)}"></label></div>
    <label class="f"><span>Bayar sekarang</span><input name="bayarBaru" inputmode="numeric" placeholder="0"><small>Sudah dibayar: ${rp(dibayarSewa(s))}</small></label>
    <label class="f"><span>Catatan (jaminan, kondisi barang)</span><input name="catatan" value="${esc(s.catatan || '')}"></label>
    <div class="total-box"><div><span>${lamaSewa(s)} hari</span><span></span></div><div class="besar"><span>Total sewa</span><b>${rp(totalSewa(s))}</b></div><div><span>Sisa</span><span>${rp(totalSewa(s) - dibayarSewa(s))}</span></div></div>
    <div class="lembar-kaki">${s.id ? `<button type="button" class="btn" data-act="waSewa">${ik('wa')} Kirim rincian</button><button type="button" class="btn btn-hapus" id="hapusSewa">Hapus</button>` : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'lebar');
  const f = $('#formSewa');
  f.oninput = e => { const t = e.target; if (t.dataset.fs) { s.items[t.dataset.n][t.dataset.fs] = t.dataset.fs === 'qty' ? Math.max(1, Number(t.value) || 1) : angka(t.value); } else bacaFS(f); };
  f.onchange = e => { if (['mulai', 'selesai'].includes(e.target.name)) { bacaFS(f); formSewa(); } };
  if (s.id) $('#hapusSewa').onclick = () => { S.sewa = S.sewa.filter(x => x.id !== s.id); simpan(); tutup(); render(); };
  f.onsubmit = e => { e.preventDefault(); bacaFS(f); if (!s.klienId) return toast('Pilih penyewa'); if (!s.items.length) return toast('Pilih item');
    const by = angka(f.bayarBaru.value); if (by) s.bayar.push({ tanggal: hariIni(), nominal: by });
    if (s.id) Object.assign(S.sewa.find(x => x.id === s.id), s); else { s.id = uid(); S.sewa.push(s); } catat(`Sewa ${klienDari(s.klienId).nama} (${s.status})`, 'box'); simpan(); tutup(); render(); toast('Sewa tersimpan'); };
}
function bacaFS(f) { Object.assign(FS, { klienId: f.klienId.value, mulai: f.mulai.value, selesai: f.selesai.value < f.mulai.value ? f.mulai.value : f.selesai.value, status: f.status.value, denda: angka(f.denda.value), catatan: f.catatan.value }); }
AKSI.fsItem = el => { bacaFS($('#formSewa')); const i = S.sewaItem.find(x => x.id === el.dataset.v), n = FS.items.findIndex(x => x.itemId === i.id); n >= 0 ? FS.items.splice(n, 1) : FS.items.push({ itemId: i.id, nama: i.nama, qty: 1, harga: i.harga }); formSewa(); };
AKSI.waSewa = () => { const s = FS, k = klienDari(s.klienId); bukaWA(k.wa, `Halo ${k.nama}, rincian sewa dari ${S.profil.nama}:\n${s.items.map(i => `• ${i.qty}× ${i.nama} @${rp(i.harga)}`).join('\n')}\nTanggal: ${tglSedang(s.mulai)} – ${tglSedang(s.selesai)} (${lamaSewa(s)} hari)${s.denda ? '\nDenda/biaya lain: ' + rp(s.denda) : ''}\nTotal: ${rp(totalSewa(s))}\nSudah dibayar: ${rp(dibayarSewa(s))}\nSisa: ${rp(totalSewa(s) - dibayarSewa(s))}${S.profil.rekening ? '\n\nPembayaran: ' + S.profil.rekening : ''}`); };

/* ---------- Tim ---------- */
const IZIN = [['jadwal', 'Lihat & ubah jadwal'], ['keuangan', 'Lihat keuangan'], ['klien', 'Kelola klien'], ['ceklist', 'Centang ceklist'], ['setelan', 'Ubah setelan']];
VIEWS.tim = () => `<div class="judul-hal"><div><h1>Tim</h1><p>Anggota, peran & izin akses. Tugaskan ke booking & lihat jadwal masing-masing.</p></div><button class="btn btn-merah" data-act="formTim">${ik('plus')} Anggota</button></div>
  <div class="grid g2 masuk">${S.tim.map(t => { const tugas = S.booking.filter(b => aktif(b) && b.tanggal >= hariIni() && (b.tim || []).includes(t.id)).sort((a, b) => a.tanggal.localeCompare(b.tanggal)); return `<div class="kartu"><div class="item" data-act="formTim" data-v="${t.id}" style="border:0"><div class="av merah">${inisial(t.nama)}</div><div class="tengah"><div class="t1">${esc(t.nama)}</div><div class="t2">${esc(t.peran)} · ${esc(t.wa || '')}</div></div>${ik('edit')}</div>
    <div class="pilihan" style="margin:6px 0 10px">${(t.izin || []).map(i => `<span class="chip">${esc((IZIN.find(x => x[0] === i) || [, i])[1])}</span>`).join('')}</div>
    <small class="muted">${tugas.length} tugas mendatang</small>${tugas.slice(0, 3).map(b => itemBooking(b, { tgl: 1 })).join('')}
    ${tugas.length ? `<button class="btn btn-kecil btn-wa" data-act="waJadwalTim" data-v="${t.id}" style="margin-top:8px">${ik('wa')} Kirim jadwal ke ${esc(t.nama)}</button>` : ''}</div>`; }).join('') || `<div class="kartu">${kosong('Belum ada anggota tim', 'team')}</div>`}</div>`;
AKSI.formTim = el => {
  const t = S.tim.find(x => x.id === el?.dataset?.v) || { izin: ['jadwal'] };
  modal(`${kepala(t.id ? 'Ubah anggota' : 'Anggota baru')}<form class="form" id="formTim"><div class="dua"><label class="f"><span>Nama *</span><input name="nama" required value="${esc(t.nama || '')}"></label><label class="f"><span>Peran</span><input name="peran" value="${esc(t.peran || '')}" placeholder="Asisten, editor…"></label></div>
    <label class="f"><span>WhatsApp</span><input name="wa" value="${esc(t.wa || '')}"></label>
    <div class="f"><span>Izin akses</span>${IZIN.map(([k, l]) => `<label class="cek"><input type="checkbox" name="izin" value="${k}" ${t.izin.includes(k) ? 'checked' : ''}><span style="text-decoration:none;color:inherit">${l}</span></label>`).join('')}<small>Izin dipakai saat login multi-akun (paket Pro). Saat ini semua data ada di perangkat pemilik.</small></div>
    <div class="lembar-kaki">${t.id ? '<button type="button" class="btn btn-hapus" id="hapusTim">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  if (t.id) $('#hapusTim').onclick = () => { S.tim = S.tim.filter(x => x.id !== t.id); simpan(); tutup(); render(); };
  $('#formTim').onsubmit = e => { e.preventDefault(); const f = e.target, r = { nama: f.nama.value.trim(), peran: f.peran.value.trim(), wa: f.wa.value.trim(), izin: $$('#formTim [name=izin]:checked').map(x => x.value) };
    if (t.id) Object.assign(S.tim.find(x => x.id === t.id), r); else S.tim.push({ id: uid(), ...r }); catat('Tim: ' + r.nama, 'team'); simpan(); tutup(); render(); };
};
AKSI.waJadwalTim = el => { const t = S.tim.find(x => x.id === el.dataset.v); const tugas = S.booking.filter(b => aktif(b) && b.tanggal >= hariIni() && (b.tim || []).includes(t.id)).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  bukaWA(t.wa, `Halo ${t.nama}, jadwal kamu dari ${S.profil.nama}:\n\n${tugas.map(b => `📅 ${tglPanjang(b.tanggal)} ${b.jam || ''}\n👤 ${klienDari(b.klienId).nama} — ${namaLayanan(b)}\n📍 ${b.lokasi || '-'}`).join('\n\n')}`); };

/* ---------- Kursus & sertifikat ---------- */
VIEWS.kursus = id => {
  if (id) return detailKursus(id);
  return `<div class="judul-hal"><div><h1>Kursus & Sertifikat</h1><p>Jual kelas, materi berurutan, sertifikat kelulusan otomatis ke WA peserta.</p></div><button class="btn btn-merah" data-act="formKursus">${ik('plus')} Kursus</button></div>
  <div class="grid g2 masuk">${S.kursus.map(k => `<div class="kartu" data-act="go" data-v="kursus/${k.id}" style="cursor:pointer"><span class="chip hitam">${k.materi.length} materi</span><h3 style="margin-top:10px">${esc(k.judul)}</h3><p class="muted" style="margin:0 0 10px">${esc(k.deskripsi || '')}</p><div style="display:flex;justify-content:space-between"><b>${rp(k.harga)}</b><span>${k.peserta.length} peserta · ${k.peserta.filter(p => p.lulus).length} lulus</span></div></div>`).join('') || `<div class="kartu">${kosong('Belum ada kursus', 'award')}</div>`}</div>`;
};
function detailKursus(id) {
  const k = S.kursus.find(x => x.id === id); if (!k) return kosong('Kursus tidak ditemukan', 'award');
  return `<div class="judul-hal"><div><a href="#/kursus" class="muted" style="text-decoration:none">${ik('back')} Kursus</a><h1 style="margin-top:6px">${esc(k.judul)}</h1><p>${rp(k.harga)} · ${k.peserta.length} peserta</p></div><div class="aksi-baris"><button class="btn" data-act="formKursus" data-v="${k.id}">${ik('edit')} Ubah</button><button class="btn btn-merah" data-act="formPeserta" data-v="${k.id}">${ik('plus')} Peserta</button></div></div>
  <div class="grid g2 masuk" style="align-items:start"><div class="kartu"><h3>${ik('book')} Materi (terkunci berurutan)</h3>${k.materi.map((m, i) => `<div class="item" style="cursor:default"><div class="av ${i === 0 ? 'merah' : ''}">${i + 1}</div><div class="tengah"><div class="t1">${esc(m.judul)}</div><div class="t2">${i === 0 ? 'Terbuka' : 'Terbuka setelah materi ' + i + ' selesai'}</div></div>${i ? ik('lock') : ''}</div>`).join('')}</div>
  <div class="kartu"><h3>${ik('users')} Peserta</h3>${k.peserta.map(p => `<div class="item" style="cursor:default"><div class="av ${p.lulus ? 'merah' : ''}">${p.lulus ? ik('award') : inisial(p.nama)}</div><div class="tengah"><div class="t1">${esc(p.nama)}</div><div class="t2">${p.lulus ? 'Lulus ' + tglPendek(p.tglLulus) + ' · ' + esc(p.noSert) : `Materi ${p.progress}/${k.materi.length}`}</div>
    <div style="height:6px;border-radius:3px;background:var(--bg);margin-top:6px"><div style="height:100%;width:${p.progress / Math.max(1, k.materi.length) * 100}%;background:var(--grad);border-radius:3px"></div></div></div>
    <div class="kanan aksi-baris">${!p.lulus ? `<button class="btn btn-kecil" data-act="majuPeserta" data-v="${k.id}|${p.id}">+1 materi</button>` : `<button class="btn btn-kecil btn-hitam" data-act="sertifikat" data-v="${k.id}|${p.id}">${ik('award')} Sertifikat</button>`}</div></div>`).join('') || kosong('Belum ada peserta', 'users')}</div></div>`;
}
AKSI.formKursus = el => {
  const k = S.kursus.find(x => x.id === el?.dataset?.v) || { materi: [], peserta: [] };
  modal(`${kepala(k.id ? 'Ubah kursus' : 'Kursus baru')}<form class="form" id="formKursus"><label class="f"><span>Judul kursus *</span><input name="judul" required value="${esc(k.judul || '')}"></label>
    <div class="dua"><label class="f"><span>Harga</span><input name="harga" inputmode="numeric" value="${titik(k.harga)}"></label></div>
    <label class="f"><span>Deskripsi</span><textarea name="deskripsi">${esc(k.deskripsi || '')}</textarea></label>
    <label class="f"><span>Materi berurutan (satu per baris)</span><textarea name="materi" style="min-height:140px">${esc(k.materi.map(m => m.judul).join('\n'))}</textarea></label>
    <div class="lembar-kaki">${k.id ? '<button type="button" class="btn btn-hapus" id="hapusKursus">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  if (k.id) $('#hapusKursus').onclick = () => { S.kursus = S.kursus.filter(x => x.id !== k.id); simpan(); tutup(); ke('kursus'); };
  $('#formKursus').onsubmit = e => { e.preventDefault(); const f = e.target, r = { judul: f.judul.value.trim(), harga: angka(f.harga.value), deskripsi: f.deskripsi.value.trim(), materi: f.materi.value.split('\n').map(s => s.trim()).filter(Boolean).map(judul => ({ judul })) };
    if (k.id) Object.assign(S.kursus.find(x => x.id === k.id), r); else S.kursus.push({ id: uid(), ...r, peserta: [] }); simpan(); tutup(); render(); };
};
AKSI.formPeserta = el => { const k = S.kursus.find(x => x.id === el.dataset.v);
  modal(`${kepala('Peserta baru', esc(k.judul))}<form class="form" id="formPeserta"><label class="f"><span>Nama *</span><input name="nama" required autofocus></label><div class="dua"><label class="f"><span>WhatsApp</span><input name="wa"></label><label class="f"><span>Sudah bayar</span><input name="bayar" inputmode="numeric" value="${titik(k.harga)}"></label></div>
  <div class="lembar-kaki"><button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  $('#formPeserta').onsubmit = e => { e.preventDefault(); const f = e.target; k.peserta.push({ id: uid(), nama: f.nama.value.trim(), wa: f.wa.value.trim(), bayar: angka(f.bayar.value), progress: 0, lulus: false, tglDaftar: hariIni() }); catat('Peserta kursus: ' + f.nama.value, 'award'); simpan(); tutup(); render(); }; };
AKSI.majuPeserta = el => { const [kid, pid] = el.dataset.v.split('|'); const k = S.kursus.find(x => x.id === kid), p = k.peserta.find(x => x.id === pid);
  p.progress = Math.min(k.materi.length, p.progress + 1);
  if (p.progress >= k.materi.length) { p.lulus = true; p.tglLulus = hariIni(); const n = S.kursus.flatMap(x => x.peserta).filter(x => x.noSert).length + 1; p.noSert = 'CERT-' + hariIni().slice(0, 4) + '-' + String(n).padStart(4, '0'); beriNotif('Peserta lulus 🎓 ' + p.nama, k.judul + ' — kirim sertifikat.', 'kursus/' + k.id); toast(p.nama + ' lulus! Sertifikat siap'); }
  simpan(); render(); };
AKSI.sertifikat = async el => { const [kid, pid] = el.dataset.v.split('|'); const k = S.kursus.find(x => x.id === kid), p = k.peserta.find(x => x.id === pid);
  modal(`${kepala('Sertifikat kelulusan', esc(p.nama))}<canvas id="cvSert" width="1600" height="1130" style="width:100%;border-radius:12px;border:1px solid var(--garis)"></canvas><div class="lembar-kaki"><button class="btn" id="unduhSert">${ik('share')} Bagikan / unduh</button>${p.wa ? `<button class="btn btn-wa" id="waSert">${ik('wa')} Kirim ke WA</button>` : ''}</div>`, 'lebar');
  await gambarSertifikat($('#cvSert'), k, p);
  $('#unduhSert').onclick = () => bagikanGambar($('#cvSert'), `sertifikat-${p.nama.replace(/\s+/g, '-')}.png`, 'Sertifikat ' + k.judul);
  if (p.wa) $('#waSert').onclick = async () => { await bagikanGambar($('#cvSert'), `sertifikat-${p.nama.replace(/\s+/g, '-')}.png`); bukaWA(p.wa, `Selamat ${p.nama}! 🎓 Kamu sudah menyelesaikan kelas "${k.judul}" dari ${S.profil.nama}. Sertifikat no. ${p.noSert} terlampir.`); };
};
async function gambarSertifikat(c, k, p) {
  await muatFontKanvas(); const x = c.getContext('2d'), W = 1600, H = 1130;
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#0D0D0D'; x.fillRect(0, 0, W, 18); const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#E32B2B'); g.addColorStop(1, '#761A1A'); x.fillStyle = g; x.fillRect(0, H - 18, W, 18);
  x.strokeStyle = '#E4E4E4'; x.lineWidth = 3; x.strokeRect(60, 70, W - 120, H - 140);
  x.textAlign = 'center'; x.fillStyle = '#E32B2B'; x.font = '800 30px OSO'; x.fillText('SERTIFIKAT KELULUSAN', W / 2, 220);
  x.fillStyle = '#6b6b6b'; x.font = '400 30px Inter'; x.fillText('Diberikan kepada', W / 2, 320);
  x.fillStyle = '#0D0D0D'; x.font = '800 96px OSO'; tulisMuat(x, p.nama, W / 2, 440, W - 300, 96);
  x.fillStyle = '#6b6b6b'; x.font = '400 30px Inter'; x.fillText('telah menyelesaikan kelas', W / 2, 530);
  x.fillStyle = '#0D0D0D'; x.font = '800 52px OSO'; tulisMuat(x, '“' + k.judul + '”', W / 2, 610, W - 300, 52);
  x.fillStyle = '#6b6b6b'; x.font = '400 26px Inter'; x.fillText(`${k.materi.length} materi · lulus ${tglPanjang(p.tglLulus)}`, W / 2, 670);
  x.fillStyle = '#0D0D0D'; x.font = '800 34px OSO'; x.fillText(S.profil.nama, W / 2, 860); x.fillRect(W / 2 - 180, 880, 360, 3);
  x.fillStyle = '#6b6b6b'; x.font = '600 22px Inter'; x.fillText('Penyelenggara', W / 2, 915);
  x.textAlign = 'left'; x.font = '600 22px Inter'; x.fillText('No. ' + p.noSert, 110, H - 110); x.textAlign = 'right'; x.fillText('Diterbitkan dengan Beresin', W - 110, H - 110); x.textAlign = 'left';
}

/* ---------- Log aktivitas ---------- */
VIEWS.log = () => `<div class="judul-hal"><div><h1>Log Aktivitas</h1><p>Semua perubahan akun & tim tercatat untuk keamanan dan audit.</p></div></div>
  <div class="kartu masuk">${S.log.length ? S.log.slice(0, 200).map(l => `<div class="item" style="cursor:default"><div class="av">${ik(l.ikon || 'dot')}</div><div class="tengah"><div class="t1" style="white-space:normal">${esc(l.teks)}</div><div class="t2">${esc(l.oleh)} · ${jamTgl(l.t)}</div></div></div>`).join('') : kosong('Belum ada aktivitas', 'log')}</div>`;

/* ---------- Setelan ---------- */
VIEWS.setelan = () => {
  const p = S.profil, st = S.setelan;
  return `<div class="judul-hal"><div><h1>Profil & Setelan</h1><p>Data bisnis, aturan DP & perjalanan, template WA, backup.</p></div></div>
  <form class="grid g2 masuk" id="formSetelan" style="align-items:start">
   <div class="kartu"><h3>${ik('briefcase')} Profil bisnis</h3><div class="form">
     <label class="f"><span>Nama bisnis</span><input name="p.nama" value="${esc(p.nama)}"></label>
     <label class="f"><span>Jenis usaha</span><select name="p.profesi">${Object.entries(PROFESI).map(([k, v]) => `<option value="${k}" ${p.profesi === k ? 'selected' : ''}>${v.nama}</option>`).join('')}</select></label>
     <div class="dua"><label class="f"><span>WhatsApp</span><input name="p.wa" value="${esc(p.wa)}"></label><label class="f"><span>Instagram</span><input name="p.ig" value="${esc(p.ig)}"></label></div>
     <label class="f"><span>Alamat</span><input name="p.alamat" value="${esc(p.alamat)}"></label>
     <label class="f"><span>Rekening pembayaran (tampil di invoice)</span><input name="p.rekening" value="${esc(p.rekening)}" placeholder="BCA 123… a.n. …"></label>
     <label class="f"><span>Nama kamu di perangkat ini (untuk log)</span><input name="s.namaPerangkat" value="${esc(st.namaPerangkat)}"></label></div></div>
   <div class="kartu"><h3>${ik('wallet')} Pembayaran & perjalanan</h3><div class="form">
     <label class="f"><span>DP default (%)</span><input name="s.dpPersen" type="number" min="0" max="100" value="${st.dpPersen}"></label>
     <div class="dua"><label class="f"><span>Gratis jarak (km)</span><input name="s.gratisKm" type="number" min="0" value="${st.gratisKm}"></label><label class="f"><span>Biaya per km</span><input name="s.biayaPerKm" inputmode="numeric" value="${titik(st.biayaPerKm)}"></label></div>
     <p class="muted" style="font-size:13px;margin:0">Contoh: 25 km → ${rp(hitungJalan(25))} otomatis muncul saat mencatat booking.</p></div>
     <div class="sep"></div><h3>${ik('star')} Data</h3><div class="aksi-baris" style="justify-content:flex-start"><button type="button" class="btn" data-act="backup">${ik('in')} Backup (.json)</button><button type="button" class="btn" data-act="pulih">${ik('out')} Pulihkan</button><button type="button" class="btn btn-hapus" data-act="resetData">${ik('trash')} Hapus semua data</button></div>
     <p class="muted" style="font-size:13px">Semua data tersimpan di perangkat ini. Backup rutin & simpan di Google Drive.</p></div>
   <div class="kartu" style="grid-column:1/-1"><h3>${ik('wa')} Template pesan WhatsApp</h3><p class="muted" style="margin-top:-6px;font-size:13px">Kata kunci: {nama} {bisnis} {layanan} {tanggal} {jam} {lokasi} {total} {dibayar} {sisa} {link} {kapan} {ig}</p>
     <div class="grid g2">${[['konfirmasi', 'Konfirmasi booking'], ['ingat', 'Pengingat jadwal'], ['tagih', 'Tagih sisa pembayaran'], ['invoice', 'Kirim invoice'], ['terimakasih', 'Terima kasih / minta ulasan']].map(([k, l]) => `<label class="f"><span>${l}</span><textarea name="w.${k}" style="min-height:130px">${esc(st.wa[k] || TEMPLATE_WA[k])}</textarea></label>`).join('')}</div>
     <div class="aksi-baris" style="margin-top:12px"><button class="btn btn-merah">${ik('check')} Simpan setelan</button></div></div>
  </form>`;
};
VIEWS.setelan_siap = () => { const f = $('#formSetelan'); if (!f) return; f.onsubmit = e => { e.preventDefault();
  new FormData(f).forEach((v, k) => { const [a, b] = k.split('.'); if (a === 'p') S.profil[b] = v; else if (a === 's') S.setelan[b] = ['dpPersen', 'gratisKm'].includes(b) ? Number(v) || 0 : b === 'biayaPerKm' ? angka(v) : v; else if (a === 'w') S.setelan.wa[b] = v; });
  catat('Ubah setelan', 'gear'); simpan(); toast('Setelan tersimpan'); }; };
AKSI.backup = () => { unduh(`backup-beresin-${(S.profil.slug || 'data')}-${hariIni()}.json`, JSON.stringify(S, null, 1), 'application/json'); toast('Backup diunduh'); };
AKSI.pulih = () => { const inp = $('#filePulih'); inp.onchange = async () => { try { const d = JSON.parse(await inp.files[0].text()); if (!d.versi) throw 0; konfirmasi('Data di perangkat ini akan diganti isi backup.', () => { S = Object.assign(dataAwal(), d); simpan(); ke('beranda'); toast('Data dipulihkan'); }, 'Pulihkan'); } catch (e) { toast('File backup tidak valid'); } inp.value = ''; }; inp.click(); };
AKSI.resetData = () => konfirmasi('Semua data Beresin di perangkat ini dihapus permanen. Backup dulu kalau perlu.', () => { localStorage.removeItem(KEY); S = dataAwal(); ke('beranda'); });

/* ---------- Langganan & referral ---------- */
VIEWS.langganan = () => {
  const kodeRef = 'BRS-' + (S.profil.slug || 'saya').slice(0, 8).toUpperCase();
  return `<div class="judul-hal"><div><h1>Langganan</h1><p>Promo: gratis 1 tahun untuk pendaftar awal.</p></div><span class="chip neon">Paket kamu: Gratis (promo)</span></div>
  <div class="grid g3 masuk"><div class="paket"><span class="chip neon" style="justify-self:start">PROMO</span><div class="harga">Rp 0</div><small class="muted">Semua fitur inti, 1 tahun</small><ul><li>Dashboard & kalender</li><li>Reminder WA (1 klik)</li><li>E-invoice digital</li><li>Halaman booking publik</li><li>Laporan keuangan & CRM</li><li>Radar okupansi</li></ul></div>
    <div class="paket"><span class="chip" style="justify-self:start">PRO · TAHUNAN</span><div class="harga">Rp 20rb<small style="font-size:15px">/bln</small></div><small class="muted">Ditagih Rp 240.000/tahun</small><ul><li>Semua fitur promo</li><li>Tanpa watermark</li><li>Manajemen tim & izin</li><li>Sinkron banyak perangkat</li><li>Reminder WA tanpa sentuh</li><li>Support prioritas</li></ul></div>
    <div class="paket unggul"><span class="chip neon" style="justify-self:start">BULANAN</span><div class="harga">Rp 30rb<small style="font-size:15px">/bln</small></div><small style="color:#aaa">Cancel kapan saja</small><ul><li>Semua fitur Pro</li><li>Tanpa kontrak</li><li>Data tetap aman</li></ul><a class="btn btn-neon" target="_blank" rel="noopener" href="https://wa.me/628159845675?text=${encodeURIComponent('Halo FF Agency, saya mau upgrade Beresin ke Pro (' + S.profil.nama + ')')}">Upgrade via WA</a></div></div>
  <div class="kartu" style="margin-top:16px"><h3>${ik('gift')} Referral VIP</h3><p>Ajak rekan sesama vendor. Setiap yang daftar & berlangganan pakai kodemu, kamu dapat <b>+30 hari gratis</b>.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="chip hitam" style="font-size:18px;padding:10px 16px">${kodeRef}</span><button class="btn" data-act="salinV" data-v="${kodeRef}">${ik('copy')} Salin kode</button><a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Aku pakai Beresin buat ngatur jadwal, invoice & reminder WA klien — gratis 1 tahun! Daftar pakai kode ${kodeRef} ya 🙌`)}">${ik('wa')} Ajak teman</a></div></div>`;
};
