/* Beresin — rekap bulanan detail: PDF (grafik + tabel + rincian) & Excel (banyak sheet, filter, total ikut filter).
   Pola sama dengan ekspor Absensi FotoFauk. Pustaka PDF/Excel baru diunduh saat dibutuhkan. */
const REKAP = (() => {
  const PUSTAKA = {
    pdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'],
    xlsx: ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'],
  };
  const dimuat = {};
  const skrip = src => dimuat[src] ||= new Promise((ok, gagal) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => { delete dimuat[src]; gagal(new Error('Butuh internet untuk membuat file ini')); };
    document.head.appendChild(s);
  });
  const muat = async k => { for (const s of PUSTAKA[k]) await skrip(s); };
  const MERAH = [227, 43, 43], HITAM = [13, 13, 13], HIJAU = [26, 143, 74];
  const rpP = n => rp(n).replace('−', '-');                     // huruf PDF standar tidak punya tanda minus khusus
  const rpK = n => { const a = Math.abs(n), t = a >= 1e9 ? (a / 1e9).toFixed(1) + ' M' : a >= 1e6 ? (a / 1e6).toFixed(1).replace('.0', '') + ' jt' : a >= 1e3 ? Math.round(a / 1e3) + ' rb' : String(Math.round(a)); return (n < 0 ? '-' : '') + t.replace('.', ','); };
  const dicetak = () => new Date().toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const hariSingkat = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const tglH = s => s ? hariSingkat[keTgl(s).getDay()] + ' ' + tglPendek(s) : '—';
  const namaFile = (ym, ext) => ('Rekap_Beresin_' + (S.profil.nama || 'bisnis') + '_' + namaBulan(ym)).replace(/[^\w\-]+/g, '_').replace(/_+/g, '_') + '.' + ext;

  /* ---------- semua angka untuk satu bulan ---------- */
  function data(ym) {
    const dari = awalBulan(ym), sampai = akhirBulan(ym), masuk = uangMasuk(dari, sampai).reverse(), keluar = uangKeluar(dari, sampai).reverse();
    const tm = jumlah(masuk), tk = jumlah(keluar);
    const bk = S.booking.filter(b => aktif(b) && b.tanggal >= dari && b.tanggal <= sampai).sort((a, b) => (a.tanggal + (a.jam || '')).localeCompare(b.tanggal + (b.jam || '')));
    const batal = S.booking.filter(b => b.status === 'batal' && b.tanggal >= dari && b.tanggal <= sampai).length;
    const nilaiBk = jumlah(bk, totalBooking), lunas = bk.filter(b => statusBayar(b) === 'lunas').length;
    const klienBaru = S.klien.filter(k => k.dibuat && iso(new Date(k.dibuat)).startsWith(ym)).length;
    // per layanan (nilai booking bulan ini)
    const pl = {}; bk.forEach(b => (b.item || []).forEach(i => { const n = i.nama || '—', x = pl[n] ||= { nama: n, qty: 0, booking: 0, nilai: 0 }; x.qty += Number(i.qty) || 1; x.booking++; x.nilai += (Number(i.harga) || 0) * (Number(i.qty) || 1); }));
    const perLayanan = Object.values(pl).sort((a, b) => b.nilai - a.nilai);
    // per klien
    const pk = {}; bk.forEach(b => { const k = klienDari(b.klienId), x = pk[b.klienId] ||= { nama: k.nama, wa: k.wa || '', booking: 0, nilai: 0, bayar: 0, sisa: 0 }; x.booking++; x.nilai += totalBooking(b); x.bayar += dibayar(b); x.sisa += sisaBayar(b); });
    const perKlien = Object.values(pk).sort((a, b) => b.nilai - a.nilai);
    // pengeluaran per kategori & pemasukan per sumber
    const kat = {}; keluar.forEach(k => { const x = kat[k.kategori || 'Lainnya'] ||= { nama: k.kategori || 'Lainnya', n: 0, nilai: 0 }; x.n++; x.nilai += k.nominal; });
    const perKategori = Object.values(kat).sort((a, b) => b.nilai - a.nilai);
    const smb = {}; masuk.forEach(m => { const x = smb[m.sumber] ||= { nama: { booking: 'Booking', sewa: 'Sewa alat', kursus: 'Kursus' }[m.sumber] || m.sumber, n: 0, nilai: 0 }; x.n++; x.nilai += m.nominal; });
    const perSumber = Object.values(smb).sort((a, b) => b.nilai - a.nilai);
    // pemasukan per tanggal
    const hariN = Number(sampai.slice(8)), perTgl = [...Array(hariN)].map((_, i) => ({ label: String(i + 1), nilai: 0 }));
    masuk.forEach(m => { perTgl[Number(m.tanggal.slice(8)) - 1].nilai += m.nominal; });
    // booking per hari dalam minggu
    const perHari = hariSingkat.map(h => ({ label: h, nilai: 0 })); bk.forEach(b => perHari[keTgl(b.tanggal).getDay()].nilai++);
    const perHariSen = [...perHari.slice(1), perHari[0]];
    // 6 bulan terakhir
    const enam = [...Array(6)].map((_, i) => { const m = geserBulan(ym, i - 5); return { label: BULAN[Number(m.slice(5)) - 1].slice(0, 3), nilai: jumlah(uangMasuk(awalBulan(m), akhirBulan(m))), keluar: jumlah(uangKeluar(awalBulan(m), akhirBulan(m))) }; });
    const belum = S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas' && sisaBayar(b) > 0).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const terlambat = belum.filter(b => b.tanggal <= hariIni());
    return { ym, dari, sampai, masuk, keluar, tm, tk, laba: tm - tk, bk, batal, nilaiBk, lunas, klienBaru, perLayanan, perKlien, perKategori, perSumber, perTgl, perHariSen, enam, belum, terlambat, piutang: piutangSemua() };
  }

  /* ---------- PDF ---------- */
  async function pdf(ym) {
    await muat('pdf');
    const d = data(ym), doc = new jspdf.jsPDF({ unit: 'mm', format: 'a4' }), W = doc.internal.pageSize.getWidth(), X = 12, LB = W - 24;
    const isiTeks = (t, x, y, o = {}) => { doc.setFont('helvetica', o.b ? 'bold' : 'normal'); doc.setFontSize(o.s || 9); doc.setTextColor(...(o.c || HITAM)); doc.text(String(t), x, y, o.a ? { align: o.a } : undefined); };
    let y = 0;
    const butuh = h => { if (y + h > 280) { doc.addPage(); y = 16; } };
    const judul = t => { butuh(14); isiTeks(t, X, y, { b: 1, s: 11 }); y += 4; };

    // kepala
    doc.setFillColor(...HITAM); doc.rect(0, 0, W, 30, 'F'); doc.setFillColor(...MERAH); doc.rect(0, 30, W, 1.2, 'F');
    isiTeks('Laporan Bulanan', X, 14, { b: 1, s: 16, c: [255, 255, 255] });
    isiTeks(`${S.profil.nama || 'Bisnis kamu'} · ${namaBulan(ym)}`, X, 21, { s: 10, c: [255, 255, 255] });
    isiTeks('beresin', W - X, 14, { b: 1, s: 14, c: [255, 255, 255], a: 'right' });
    isiTeks(`Dicetak ${dicetak()}`, W - X, 21, { s: 8, c: [170, 170, 170], a: 'right' });

    // kotak angka (2 baris x 4)
    const kotak = [[rpP(d.tm), 'pemasukan', HIJAU], [rpP(d.tk), 'pengeluaran'], [rpP(d.laba), 'laba bersih' + (d.tm ? ` · ${Math.round(d.laba / d.tm * 100)}% margin` : ''), d.laba < 0 ? MERAH : null], [rpP(d.piutang), 'piutang (semua jadwal)', d.piutang ? MERAH : null],
      [String(d.bk.length), 'booking bulan ini'], [`${d.lunas}/${d.bk.length}`, 'booking lunas'], [rpP(d.bk.length ? d.nilaiBk / d.bk.length : 0), 'rata-rata per booking'], [String(d.klienBaru), 'klien baru']];
    const kw = (LB - 9) / 4;
    kotak.forEach(([n, t, c], i) => {
      const x = X + (i % 4) * (kw + 3), yy = 37 + Math.floor(i / 4) * 20;
      doc.setFillColor(253, 236, 236); doc.roundedRect(x, yy, kw, 17, 2, 2, 'F');
      isiTeks(n, x + 3.5, yy + 8, { b: 1, s: n.length > 14 ? 10.5 : 12, c: c || HITAM }); isiTeks(t, x + 3.5, yy + 13.5, { s: 7.5, c: [110, 110, 110] });
    });
    y = 86;
    const kalimat = `${d.bk.length} booking terjadwal (${d.lunas} lunas${d.batal ? `, ${d.batal} batal` : ''}). ` + (d.laba >= 0 ? `Bulan ini untung ${rpP(d.laba)}.` : `Bulan ini rugi ${rpP(-d.laba)}.`) + (d.terlambat.length ? ` ${d.terlambat.length} tagihan sudah lewat jadwal belum lunas.` : '');
    isiTeks(kalimat, X, y, { s: 9.5 }); y += 9;

    // grafik batang vertikal
    const kolom = (judulG, arr, x, lebar, tinggi, fmt, warna = MERAH) => {
      isiTeks(judulG, x, y, { b: 1, s: 11 });
      const atas = y + 7, bawah = atas + tinggi, maks = Math.max(1, ...arr.map(a => a.nilai)), n = arr.length, slot = (lebar - 10) / n, bw = Math.min(slot * .62, 12);
      doc.setDrawColor(225); doc.setLineWidth(.2); [0, .5, 1].forEach(f => { const yy = bawah - tinggi * f; doc.line(x + 10, yy, x + lebar, yy); isiTeks(fmt(maks * f), x + 8.5, yy + 1, { s: 6.5, c: [140, 140, 140], a: 'right' }); });
      const iMaks = arr.findIndex(a => a.nilai === maks);
      arr.forEach((a, i) => {
        const h = a.nilai / maks * tinggi, bx = x + 10 + i * slot + (slot - bw) / 2;
        if (h > 0) { doc.setFillColor(...warna); doc.rect(bx, bawah - h, bw, h, 'F'); }
        if (n <= 12 || i % 2 === 0 || i === n - 1) isiTeks(a.label, bx + bw / 2, bawah + 4, { s: 6.5, c: [110, 110, 110], a: 'center' });
        if (i === iMaks && a.nilai > 0) isiTeks((n > 12 ? 'puncak ' : '') + fmt(a.nilai), bx + bw / 2, bawah - h - 1.5, { b: 1, s: 7, a: 'center' });
      });
      return bawah + 10;
    };
    // grafik batang horizontal
    const batang = (judulG, arr, fmt, warna = MERAH) => {
      const rows = arr.slice(0, 8); judul(judulG);
      if (!rows.length) { isiTeks('Belum ada data', X, y + 3, { s: 9, c: [150, 150, 150] }); y += 10; return; }
      const lbl = 46, maks = Math.max(1, ...rows.map(r => r.nilai)), pj = LB - lbl - 42;
      rows.forEach(r => {
        butuh(8); const w = Math.max(.6, r.nilai / maks * pj);
        isiTeks(r.nama.length > 28 ? r.nama.slice(0, 27) + '…' : r.nama, X + lbl - 2, y + 4, { b: 1, s: 8, a: 'right' });
        doc.setFillColor(...warna); doc.rect(X + lbl, y + .8, w, 4.4, 'F');
        isiTeks(fmt(r), X + lbl + w + 2, y + 4, { s: 8 }); y += 7;
      });
      y += 5;
    };
    y = kolom('Pemasukan per tanggal', d.perTgl, X, LB, 38, rpK);
    const sh = (LB - 8) / 2, yAwal = y;
    const y1 = kolom('Omzet 6 bulan terakhir', d.enam.map(e => ({ label: e.label, nilai: e.nilai })), X, sh, 32, rpK);
    y = yAwal; const y2 = kolom('Hari paling ramai (booking)', d.perHariSen, X + sh + 8, sh, 32, v => String(Math.round(v)), HITAM);
    y = Math.max(y1, y2);
    batang('Nilai booking per layanan', d.perLayanan, r => `${rpP(r.nilai)} · ${r.qty}x`);
    batang('Pengeluaran per kategori', d.perKategori, r => `${rpP(r.nilai)} · ${r.n} transaksi`, HITAM);

    // tabel
    const gaya = { styles: { fontSize: 8.5, cellPadding: 2, textColor: 20 }, headStyles: { fillColor: HITAM, textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [246, 246, 243] }, margin: { left: X, right: X } };
    const tabel = (judulT, head, body, total, kanan = [], o = {}) => {
      judul(judulT);
      const isi = body.length ? body : [[{ content: 'Tidak ada', colSpan: head.length, styles: { textColor: 150 } }]];
      doc.autoTable({ ...gaya, styles: { ...gaya.styles, ...(o.fontSize ? { fontSize: o.fontSize, cellPadding: 1.6 } : {}) }, columnStyles: o.kolom || {}, startY: y, head: [head], body: total && body.length ? [...isi, total] : isi,
        didParseCell: c => { if (kanan.includes(c.column.index)) c.cell.styles.halign = 'right'; if (total && body.length && c.section === 'body' && c.row.index === isi.length) { c.cell.styles.fontStyle = 'bold'; c.cell.styles.fillColor = [253, 236, 236]; } } });
      y = doc.lastAutoTable.finalY + 9;
    };
    tabel('Rekap per layanan', ['Layanan', 'Booking', 'Qty', 'Nilai'], d.perLayanan.map(r => [r.nama, r.booking, r.qty, rpP(r.nilai)]), ['TOTAL', d.perLayanan.reduce((s, r) => s + r.booking, 0), d.perLayanan.reduce((s, r) => s + r.qty, 0), rpP(d.perLayanan.reduce((s, r) => s + r.nilai, 0))], [1, 2, 3]);
    tabel('Rekap per klien', ['Klien', 'WhatsApp', 'Booking', 'Nilai', 'Dibayar', 'Sisa'], d.perKlien.map(r => [r.nama, r.wa, r.booking, rpP(r.nilai), rpP(r.bayar), rpP(r.sisa)]), ['TOTAL', '', d.bk.length, rpP(d.nilaiBk), rpP(jumlah(d.perKlien, r => r.bayar)), rpP(jumlah(d.perKlien, r => r.sisa))], [2, 3, 4, 5]);
    tabel('Pemasukan per sumber', ['Sumber', 'Transaksi', 'Jumlah'], d.perSumber.map(r => [r.nama, r.n, rpP(r.nilai)]), ['TOTAL', d.masuk.length, rpP(d.tm)], [1, 2]);
    tabel('Pengeluaran per kategori', ['Kategori', 'Transaksi', 'Jumlah'], d.perKategori.map(r => [r.nama, r.n, rpP(r.nilai)]), ['TOTAL', d.keluar.length, rpP(d.tk)], [1, 2]);
    const ang = n => Math.round(n).toLocaleString('id-ID');
    tabel('Rincian booking (Rp)', ['No', 'Tanggal', 'Jam', 'Klien', 'Layanan', 'Lokasi', 'Total', 'Dibayar', 'Sisa', 'Status'],
      d.bk.map((b, i) => [i + 1, tglH(b.tanggal), b.jam ? b.jam + (b.jamSelesai ? '–' + b.jamSelesai : '') : '', klienDari(b.klienId).nama, namaLayanan(b), b.lokasi || '', ang(totalBooking(b)), ang(dibayar(b)), ang(sisaBayar(b)), LABEL_BAYAR[statusBayar(b)]]),
      ['', 'TOTAL', '', '', '', '', ang(d.nilaiBk), ang(jumlah(d.bk, dibayar)), ang(jumlah(d.bk, sisaBayar)), ''], [0, 6, 7, 8], { fontSize: 7.5, kolom: { 1: { cellWidth: 17 }, 6: { cellWidth: 17 }, 7: { cellWidth: 17 }, 8: { cellWidth: 17 } } });
    tabel('Rincian pemasukan', ['No', 'Tanggal', 'Keterangan', 'Sumber', 'Jumlah'], d.masuk.map((m, i) => [i + 1, tglH(m.tanggal), m.nama, m.sumber, rpP(m.nominal)]), ['', 'TOTAL', '', '', rpP(d.tm)], [0, 4]);
    tabel('Rincian pengeluaran', ['No', 'Tanggal', 'Keterangan', 'Kategori', 'Jumlah'], d.keluar.map((k, i) => [i + 1, tglH(k.tanggal), k.nama, k.kategori || '', rpP(k.nominal)]), ['', 'TOTAL', '', '', rpP(d.tk)], [0, 4]);
    tabel('Belum lunas (semua jadwal)', ['Tanggal', 'Klien', 'WhatsApp', 'Layanan', 'Sisa', 'Keterangan'], d.belum.map(b => [tglH(b.tanggal), klienDari(b.klienId).nama, klienDari(b.klienId).wa || '', namaLayanan(b), rpP(sisaBayar(b)), b.tanggal <= hariIni() ? 'Lewat jadwal' : 'Mendatang']), ['TOTAL', '', '', '', rpP(d.piutang), ''], [4]);

    const n = doc.internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) { doc.setPage(i); isiTeks(`Beresin · ${S.profil.nama || ''} · ${namaBulan(ym)} · halaman ${i}/${n}`, W / 2, 290, { s: 7.5, c: [150, 150, 150], a: 'center' }); }
    return doc.output('blob');
  }

  /* ---------- Excel ---------- */
  async function xlsx(ym) {
    await muat('xlsx');
    const d = data(ym), wb = XLSX.utils.book_new(), tgl = s => s ? keTgl(s) : '';
    const sheet = (nama, rows, lebar, opsi = {}) => {
      const s = XLSX.utils.aoa_to_sheet(rows, { cellDates: true, dateNF: 'dd/mm/yyyy' });
      s['!cols'] = lebar.map(w => ({ wch: w }));
      if (opsi.filter && rows.length > 1) {
        const akhir = rows.length, kol = XLSX.utils.encode_col(rows[0].length - 1);
        s['!autofilter'] = { ref: `A1:${kol}${akhir}` };
        // total yang ikut berubah sesuai filter (SUBTOTAL hanya menghitung baris yang tampil)
        let c = rows[0].length + 1;
        (opsi.total || []).forEach(([label, k]) => { const a = XLSX.utils.encode_col(c), b = XLSX.utils.encode_col(c + 1); s[a + '1'] = { t: 's', v: label }; s[b + '1'] = { t: 'n', f: `SUBTOTAL(109,${k}2:${k}${akhir})`, z: '#,##0' }; c += 2; });
        s['!ref'] = `A1:${XLSX.utils.encode_col(c)}${akhir}`;
        s['!cols'] = [...s['!cols'], { wch: 3 }, ...(opsi.total || []).flatMap(() => [{ wch: 16 }, { wch: 14 }])];
      }
      XLSX.utils.book_append_sheet(wb, s, nama);
    };
    sheet('Ringkasan', [['Laporan Bulanan Beresin'], ['Bisnis', S.profil.nama || ''], ['Bulan', namaBulan(ym)], ['Dicetak', dicetak()], [],
      ['Pemasukan', d.tm], ['Pengeluaran', d.tk], ['Laba bersih', d.laba], ['Margin', d.tm ? d.laba / d.tm : 0], ['Piutang (semua jadwal)', d.piutang], [],
      ['Booking bulan ini', d.bk.length], ['Booking lunas', d.lunas], ['Booking batal', d.batal], ['Nilai booking', d.nilaiBk], ['Rata-rata per booking', d.bk.length ? Math.round(d.nilaiBk / d.bk.length) : 0], ['Klien baru', d.klienBaru], [],
      ['Omzet 6 bulan', 'Pemasukan', 'Pengeluaran', 'Laba'], ...d.enam.map(e => [e.label, e.nilai, e.keluar, e.nilai - e.keluar])], [26, 16, 16, 16]);
    sheet('Booking', [['No', 'Tanggal', 'Jam', 'Klien', 'WhatsApp', 'Layanan', 'Lokasi', 'Status booking', 'Total', 'Dibayar', 'Sisa', 'Status bayar', 'Catatan'],
      ...d.bk.map((b, i) => [i + 1, tgl(b.tanggal), b.jam ? b.jam + (b.jamSelesai ? '–' + b.jamSelesai : '') : '', klienDari(b.klienId).nama, klienDari(b.klienId).wa || '', namaLayanan(b), b.lokasi || '', STATUS[b.status] || b.status || '', totalBooking(b), dibayar(b), sisaBayar(b), LABEL_BAYAR[statusBayar(b)], b.catatan || ''])],
      [5, 12, 12, 20, 16, 30, 22, 14, 13, 13, 13, 12, 26], { filter: 1, total: [['Total tampil:', 'I'], ['Sisa tampil:', 'K']] });
    sheet('Pemasukan', [['No', 'Tanggal', 'Keterangan', 'Sumber', 'Jumlah'], ...d.masuk.map((m, i) => [i + 1, tgl(m.tanggal), m.nama, m.sumber, m.nominal])], [5, 12, 34, 12, 14], { filter: 1, total: [['Jumlah tampil:', 'E']] });
    sheet('Pengeluaran', [['No', 'Tanggal', 'Keterangan', 'Kategori', 'Jumlah'], ...d.keluar.map((k, i) => [i + 1, tgl(k.tanggal), k.nama, k.kategori || '', k.nominal])], [5, 12, 34, 14, 14], { filter: 1, total: [['Jumlah tampil:', 'E']] });
    sheet('Per Layanan', [['Layanan', 'Booking', 'Qty', 'Nilai'], ...d.perLayanan.map(r => [r.nama, r.booking, r.qty, r.nilai])], [30, 9, 7, 14]);
    sheet('Per Klien', [['Klien', 'WhatsApp', 'Booking', 'Nilai', 'Dibayar', 'Sisa'], ...d.perKlien.map(r => [r.nama, r.wa, r.booking, r.nilai, r.bayar, r.sisa])], [22, 16, 9, 14, 14, 14]);
    sheet('Belum Lunas', [['Tanggal', 'Klien', 'WhatsApp', 'Layanan', 'Total', 'Dibayar', 'Sisa', 'Keterangan'], ...d.belum.map(b => [tgl(b.tanggal), klienDari(b.klienId).nama, klienDari(b.klienId).wa || '', namaLayanan(b), totalBooking(b), dibayar(b), sisaBayar(b), b.tanggal <= hariIni() ? 'Lewat jadwal' : 'Mendatang'])], [12, 20, 16, 30, 13, 13, 13, 14], { filter: 1, total: [['Sisa tampil:', 'G']] });
    sheet('Semua Klien', [['Nama', 'WhatsApp', 'Instagram', 'Alamat', 'Catatan', 'Jumlah booking', 'Total belanja', 'Sisa tagihan'],
      ...S.klien.map(k => { const b = S.booking.filter(x => x.klienId === k.id && aktif(x)); return [k.nama, k.wa || '', k.ig || '', k.alamat || '', k.catatan || '', b.length, jumlah(b, totalBooking), jumlah(b, sisaBayar)]; })], [22, 16, 16, 26, 26, 10, 14, 14], { filter: 1 });
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async function simpanFile(blob, nama) {
    const file = new File([blob], nama, { type: blob.type });
    if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: nama }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    unduh(nama, blob); toast(nama + ' tersimpan di Unduhan');
  }
  const keB64 = blob => new Promise((ok, gagal) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = gagal; r.readAsDataURL(blob); });

  return { data, pdf, xlsx, simpanFile, keB64, namaFile };
})();

const bulanRekap = () => location.hash.startsWith('#/laporan/') ? location.hash.split('/')[2] : bulanUang;
AKSI.rekapPdf = async () => { const ym = bulanRekap(); toast('Membuat PDF…'); try { await REKAP.simpanFile(await REKAP.pdf(ym), REKAP.namaFile(ym, 'pdf')); } catch (e) { toast(e.message || 'Gagal membuat PDF'); } };
AKSI.rekapXlsx = async () => { const ym = bulanRekap(); toast('Membuat Excel…'); try { await REKAP.simpanFile(await REKAP.xlsx(ym), REKAP.namaFile(ym, 'xlsx')); } catch (e) { toast(e.message || 'Gagal membuat Excel'); } };
AKSI.kirimRekap = () => {
  if (typeof MODE_CONTOH !== 'undefined' && MODE_CONTOH) return toast('Mode contoh · aktifkan Beresin dulu untuk kirim rekap ke email');
  const L = bacaLisensi();
  if (!LISENSI_URL || !L) return toast('Kirim ke email butuh Beresin yang sudah diaktifkan');
  if (!navigator.onLine) return toast('Butuh internet untuk mengirim email');
  const ym = bulanRekap();
  konfirmasi(`Rekap ${esc(namaBulan(ym))} dikirim ke <b>${esc(L.email)}</b>: laporan PDF, Excel (booking, pemasukan, pengeluaran, klien) dan file cadangan .json.`, async () => {
    toast('Menyiapkan rekap…', 6000);
    try {
      const [p, x] = await Promise.all([REKAP.pdf(ym), REKAP.xlsx(ym)]);
      const lampiran = [
        { nama: REKAP.namaFile(ym, 'pdf'), tipe: 'application/pdf', b64: await REKAP.keB64(p) },
        { nama: REKAP.namaFile(ym, 'xlsx'), tipe: x.type, b64: await REKAP.keB64(x) },
        { nama: `backup-beresin-${S.profil.slug || 'data'}-${hariIni()}.json`, tipe: 'application/json', b64: await REKAP.keB64(new Blob([JSON.stringify(S)], { type: 'application/json' })) },
      ];
      toast('Mengirim ke email…', 6000);
      const j = await panggilLisensi({ aksi: 'kirimRekap', email: L.email, perangkat: idPerangkat(), token: L.token, bulan: ym,
        judul: `Rekap ${namaBulan(ym)} · ${S.profil.nama || 'Beresin'}`, html: htmlRekap(ym), lampiran });
      toast(j.pesan || (j.ok ? 'Terkirim' : 'Gagal mengirim'), 4000);
    } catch (e) { toast(e.message && /internet/i.test(e.message) ? e.message : 'Tidak bisa terhubung. Periksa internet lalu coba lagi.'); }
  }, 'Kirim');
};
