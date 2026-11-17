/* Beresin — CRM klien */
let cariKlien = '';
VIEWS.klien = id => {
  if (id) return detailKlien(id);
  const q = cariKlien.toLowerCase();
  const data = S.klien.map(k => { const bk = S.booking.filter(b => b.klienId === k.id && aktif(b)); return { k, n: bk.length, nilai: bk.reduce((s, b) => s + dibayar(b), 0), akhir: bk.map(b => b.tanggal).sort().pop() || '' }; })
    .filter(x => !q || [x.k.nama, x.k.wa, x.k.ig].join(' ').toLowerCase().includes(q)).sort((a, b) => b.akhir.localeCompare(a.akhir) || a.k.nama.localeCompare(b.k.nama));
  return `<div class="judul-hal"><div><h1>Klien</h1><p>${S.klien.length} klien tersimpan · profil, riwayat transaksi & catatan</p></div><button class="btn btn-merah" data-act="formKlien">${ik('plus')} Klien</button></div>
  <div class="kartu masuk"><input class="inp" id="cariKlien" type="search" placeholder="Cari nama, WA, IG…" value="${esc(cariKlien)}" style="margin-bottom:10px">
  ${data.length ? data.map(({ k, n, nilai, akhir }) => `<div class="item" data-act="go" data-v="klien/${k.id}"><div class="av">${inisial(k.nama)}</div><div class="tengah"><div class="t1">${esc(k.nama)}</div><div class="t2">${esc(k.wa)}${k.ig ? ' · ' + esc(k.ig) : ''}${akhir ? ' · terakhir ' + tglPendek(akhir) : ''}</div></div><div class="kanan"><b>${rpPendek(nilai)}</b><small class="muted">${n}× booking</small></div></div>`).join('') : kosong('Belum ada klien', 'users')}</div>`;
};
VIEWS.klien_siap = () => { const c = $('#cariKlien'); if (c) { c.oninput = () => { cariKlien = c.value; const pos = c.selectionStart; render().then(() => { const n = $('#cariKlien'); n.focus(); n.setSelectionRange(pos, pos); }); }; } };
function detailKlien(id) {
  const k = S.klien.find(x => x.id === id); if (!k) return kosong('Klien tidak ditemukan', 'users');
  const bk = S.booking.filter(b => b.klienId === id).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const total = bk.filter(aktif).reduce((s, b) => s + dibayar(b), 0), piutang = bk.filter(aktif).reduce((s, b) => s + sisaBayar(b), 0);
  const sewa = S.sewa.filter(s => s.klienId === id);
  return `<div class="judul-hal"><div><a href="#/klien" class="muted" style="text-decoration:none">${ik('back')} Klien</a><h1 style="margin-top:6px">${esc(k.nama)}</h1><p>${esc(k.wa)}${k.ig ? ' · ' + esc(k.ig) : ''}${k.alamat ? ' · ' + esc(k.alamat) : ''}</p></div>
    <div class="aksi-baris"><a class="btn btn-wa" href="${waLink(k.wa, 'Halo ' + k.nama + ' 👋')}" target="_blank" rel="noopener">${ik('wa')} Chat</a><button class="btn" data-act="formKlien" data-v="${k.id}">${ik('edit')} Ubah</button><button class="btn btn-merah" data-act="bookingKlien" data-v="${k.id}">${ik('plus')} Booking</button></div></div>
  <div class="grid g3 masuk"><div class="kartu"><small class="muted">Total transaksi</small><h2 style="margin-top:6px">${rp(total)}</h2></div><div class="kartu"><small class="muted">Jumlah booking</small><h2 style="margin-top:6px">${bk.filter(aktif).length}×</h2></div><div class="kartu"><small class="muted">Belum dibayar</small><h2 style="margin-top:6px;color:${piutang ? 'var(--merah)' : 'inherit'}">${rp(piutang)}</h2></div></div>
  <div class="grid g2" style="margin-top:16px;align-items:start"><div class="kartu"><h3>${ik('cal')} Riwayat booking</h3>${bk.length ? bk.map(b => itemBooking(b, { tgl: 1 })).join('') : kosong('Belum ada booking', 'cal')}
    ${sewa.length ? `<div class="sep"></div><h3 style="font-size:15px">Riwayat sewa</h3>${sewa.map(s => `<div class="item" data-act="formSewa" data-v="${s.id}"><div class="av">${ik('box')}</div><div class="tengah"><div class="t1">${esc(s.items.map(i => i.nama).join(', '))}</div><div class="t2">${tglPendek(s.mulai)}–${tglPendek(s.selesai)} · ${esc(s.status)}</div></div><div class="kanan"><b>${rpPendek(totalSewa(s))}</b></div></div>`).join('')}` : ''}</div>
  <div class="kartu"><h3>${ik('edit')} Catatan khusus</h3><textarea class="inp" id="catatanKlien" style="min-height:140px" placeholder="Preferensi, alergi, ukuran, selera warna…">${esc(k.catatan || '')}</textarea><p class="muted" style="font-size:12px">Tersimpan otomatis.</p></div></div>`;
}
VIEWS.klien_siap_detail = null;
const _klienSiap = VIEWS.klien_siap;
VIEWS.klien_siap = id => { if (!id) return _klienSiap(); const t = $('#catatanKlien'); if (t) t.oninput = () => { S.klien.find(x => x.id === id).catatan = t.value; simpan(); }; };
AKSI.bookingKlien = el => { FB = bookingKosong(); FB.klienId = el.dataset.v; formBooking(); };
AKSI.formKlien = el => {
  const k = S.klien.find(x => x.id === el?.dataset?.v) || {};
  modal(`${kepala(k.id ? 'Ubah klien' : 'Klien baru')}<form class="form" id="formKlien">
    <label class="f"><span>Nama *</span><input name="nama" required value="${esc(k.nama || '')}" autofocus></label>
    <div class="dua"><label class="f"><span>WhatsApp *</span><input name="wa" required inputmode="tel" value="${esc(k.wa || '')}"></label><label class="f"><span>Instagram</span><input name="ig" value="${esc(k.ig || '')}"></label></div>
    <label class="f"><span>Alamat</span><input name="alamat" value="${esc(k.alamat || '')}"></label>
    <label class="f"><span>Catatan</span><textarea name="catatan">${esc(k.catatan || '')}</textarea></label>
    <div class="lembar-kaki">${k.id ? '<button type="button" class="btn btn-hapus" id="hapusKlien">Hapus</button>' : ''}<button type="button" class="btn" data-act="tutup">Batal</button><button class="btn btn-merah">Simpan</button></div></form>`, 'kecil');
  if (k.id) $('#hapusKlien').onclick = () => { if (S.booking.some(b => b.klienId === k.id)) return toast('Klien punya riwayat booking — tidak bisa dihapus'); S.klien = S.klien.filter(x => x.id !== k.id); simpan(); tutup(); ke('klien'); };
  $('#formKlien').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
    if (k.id) Object.assign(S.klien.find(x => x.id === k.id), d); else { const n = { id: uid(), ...d, dibuat: Date.now() }; S.klien.push(n); catat('Klien baru: ' + n.nama, 'users'); }
    simpan(); tutup(); render(); toast('Klien tersimpan'); };
};
