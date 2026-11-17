/* Beresin — inti: data, util, hitungan, ikon, modal/toast */
'use strict';
const KEY = 'beresin_v1';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const rp = n => (n < 0 ? '−' : '') + 'Rp ' + Math.abs(Math.round(n || 0)).toLocaleString('id-ID');
const rpPendek = n => { n = Math.round(n || 0); const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1e9) return s + 'Rp ' + (a / 1e9).toFixed(1).replace('.', ',').replace(',0', '') + 'M';
  if (a >= 1e6) return s + 'Rp ' + (a / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + 'jt';
  if (a >= 1e3) return s + 'Rp ' + Math.round(a / 1e3) + 'rb'; return rp(n); };
const angka = s => parseInt(String(s ?? '').replace(/\D/g, ''), 10) || 0;
const titik = n => n ? Math.abs(Number(n)).toLocaleString('id-ID') : '';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const keTgl = s => new Date(s + 'T00:00');
const tambahHari = (s, n) => { const d = keTgl(s); d.setDate(d.getDate() + n); return iso(d); };
const selisihHari = (a, b) => Math.round((keTgl(b) - keTgl(a)) / 864e5);
const tglPanjang = s => { if (!s) return '—'; const d = keTgl(s); return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); };
const tglSedang = s => { if (!s) return '—'; const d = keTgl(s); return d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); };
const tglPendek = s => { if (!s) return '—'; const d = keTgl(s); return d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3); };
const hariIni = () => iso(new Date());
const jamTgl = t => { const d = new Date(t); return d.getDate() + ' ' + BULAN[d.getMonth()].slice(0, 3) + ', ' + String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); };
const waNo = s => { let n = String(s || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '62' + n.slice(1); if (n.startsWith('8')) n = '62' + n; return n; };
const waLink = (no, teks) => `https://wa.me/${waNo(no)}?text=${encodeURIComponent(teks)}`;
const bukaWA = (no, teks) => window.open(waLink(no, teks), '_blank', 'noopener');

/* ---------- profesi: layanan & ceklist awal ---------- */
const GRUP_PROFESI = ['Kecantikan', 'Dokumentasi', 'Dekor & venue', 'Acara & hiburan', 'Kuliner & souvenir', 'Sewa & transport', 'Lainnya'];
/* modul = fitur Beresin yang diutamakan untuk profesi itu (rute, label, alasan) */
const PROFESI = {
  mua: { grup: 'Kecantikan', nama: 'Makeup Artist', ikon: 'brush', layanan: [['Makeup Akad', 'Wedding', 1500000, 150], ['Makeup Resepsi', 'Wedding', 2000000, 180], ['Makeup Wisuda', 'Event', 450000, 90], ['Makeup Lamaran', 'Event', 800000, 120], ['Makeup Keluarga (per orang)', 'Event', 300000, 60]], ceklist: ['Kuas & spons lengkap', 'Foundation & concealer', 'Bulu mata cadangan', 'Hairspray & pin', 'Ring light', 'Tisu basah'],
    modul: [['kursus', 'Kelas makeup + sertifikat'], ['tim', 'Jadwal asisten MUA'], ['sewa', 'Sewa kebaya & aksesori'], ['ceklist', 'Ceklist kit makeup']] },
  henna: { grup: 'Kecantikan', nama: 'Henna Artist', ikon: 'flower', layanan: [['Henna Pengantin (tangan+kaki)', 'Wedding', 750000, 180], ['Henna Tangan Simple', 'Reguler', 150000, 45], ['Henna Lamaran', 'Event', 300000, 90]], ceklist: ['Cone henna (cadangan 5)', 'Minyak kayu putih', 'Tisu & kapas', 'Lemon-gula sealing'],
    modul: [['kursus', 'Kelas henna + sertifikat'], ['pricelist', 'Poster motif & harga'], ['radar', 'Pantau musim nikah']] },
  hair: { grup: 'Kecantikan', nama: 'Hairstylist & Hijab', ikon: 'scissors', layanan: [['Hairdo Pengantin', 'Wedding', 900000, 120], ['Hijab Styling', 'Event', 250000, 45], ['Hairdo Wisuda', 'Event', 300000, 60]], ceklist: ['Catok & curly', 'Hairspray', 'Jarum pentul & pin', 'Aksesori rambut'],
    modul: [['tim', 'Bagi jadwal stylist'], ['ceklist', 'Ceklist alat styling'], ['kursus', 'Kelas hijab styling']] },
  foto: { grup: 'Dokumentasi', nama: 'Fotografer', ikon: 'camera', layanan: [['Prewedding (1 lokasi)', 'Wedding', 2500000, 240], ['Dokumentasi Akad', 'Wedding', 1800000, 180], ['Wisuda (1 sesi)', 'Event', 400000, 60], ['Foto Produk (10 foto)', 'Komersial', 500000, 120], ['Event (per jam)', 'Event', 350000, 60]], ceklist: ['Kamera + baterai cadangan', 'Lensa 35mm & 85mm', 'Memory card kosong', 'Flash + baterai', 'Reflektor', 'Lightstand'],
    modul: [['ceklist', 'Ceklist gear sebelum berangkat'], ['tim', 'Jadwal second shooter'], ['halaman', 'Galeri portofolio di link booking'], ['sewa', 'Sewa kamera & lensa']] },
  video: { grup: 'Dokumentasi', nama: 'Videografer', ikon: 'video', layanan: [['Cinematic Wedding', 'Wedding', 4500000, 480], ['Highlight Event 1 menit', 'Event', 1200000, 180], ['Video Profil Usaha', 'Komersial', 2500000, 240]], ceklist: ['Kamera + baterai', 'Gimbal', 'Mic wireless', 'Drone (cek izin)', 'Memory card', 'Lampu LED'],
    modul: [['ceklist', 'Ceklist gear + drone'], ['tim', 'Kru & editor'], ['tagih', 'Pelunasan saat file dikirim']] },
  dekor: { grup: 'Dekor & venue', nama: 'Dekorator', ikon: 'sparkle', layanan: [['Dekor Akad Rumah', 'Wedding', 3500000, 360], ['Dekor Lamaran', 'Event', 2000000, 240], ['Backdrop Ulang Tahun', 'Event', 1200000, 180]], ceklist: ['Backdrop & rangka', 'Bunga & vas', 'Lampu tumblr', 'Kabel rol', 'Lakban & tali'],
    modul: [['sewa', 'Stok properti dekor'], ['tim', 'Kru pasang & bongkar'], ['radar', 'Cegah stok bentrok']] },
  florist: { grup: 'Dekor & venue', nama: 'Florist & Hantaran', ikon: 'gift', layanan: [['Hand bouquet pengantin', 'Wedding', 450000, 60], ['Hantaran / seserahan (per tray)', 'Wedding', 150000, 60], ['Bunga papan', 'Event', 600000, 60], ['Mahar bingkai', 'Wedding', 350000, 60]], ceklist: ['Bunga segar dicek pagi', 'Pita & kertas wrap', 'Tray & mika', 'Lem tembak'],
    modul: [['pricelist', 'Katalog harga per tray'], ['ceklist', 'Ceklist isi seserahan'], ['tagih', 'DP sebelum belanja bahan']] },
  tenda: { grup: 'Dekor & venue', nama: 'Tenda & Pelaminan', ikon: 'home', layanan: [['Tenda 5×10 m', 'Wedding', 2500000, 600], ['Pelaminan adat', 'Wedding', 6000000, 600], ['Kursi futura (per 100)', 'Sewa', 500000, 600]], ceklist: ['Rangka & terpal', 'Kursi dihitung', 'Karpet', 'Kabel & lampu'],
    modul: [['sewa', 'Stok tenda, kursi, pelaminan'], ['tim', 'Jadwal kru pasang'], ['setelan', 'Biaya angkut per km']] },
  wo: { grup: 'Acara & hiburan', nama: 'Wedding / Event Organizer', ikon: 'heart', layanan: [['Paket WO Akad', 'Wedding', 5000000, 480], ['Paket WO Resepsi', 'Wedding', 9000000, 600], ['Event Organizer (per hari)', 'Event', 4000000, 600]], ceklist: ['Rundown dicetak', 'HT / radio', 'Daftar vendor + kontak', 'Kotak P3K', 'ID card kru'],
    modul: [['tim', 'Kru + hak akses'], ['ceklist', 'Rundown & ceklist hari-H'], ['klien', 'Catatan keluarga & adat'], ['keuangan', 'Termin pembayaran']] },
  mc: { grup: 'Acara & hiburan', nama: 'MC / Host', ikon: 'mic', layanan: [['MC Akad', 'Wedding', 1000000, 120], ['MC Resepsi', 'Wedding', 1500000, 180], ['Host Event', 'Event', 1200000, 180]], ceklist: ['Naskah & rundown', 'Baju sesuai tema', 'Mic cadangan'],
    modul: [['halaman', 'Link booking + jadwal kosong'], ['reminder', 'Reminder H-1 ke klien'], ['radar', 'Tanggal ramai']] },
  musik: { grup: 'Acara & hiburan', nama: 'Band / Musisi / DJ', ikon: 'music', layanan: [['Akustik 2 jam', 'Event', 2500000, 120], ['Full Band Resepsi', 'Wedding', 6000000, 240], ['DJ Set 2 jam', 'Event', 3000000, 120]], ceklist: ['Instrumen', 'Kabel jack', 'Setlist', 'Mixer & speaker'],
    modul: [['tim', 'Personel & fee'], ['ceklist', 'Setlist & alat'], ['sewa', 'Sewa alat musik']] },
  sound: { grup: 'Acara & hiburan', nama: 'Sound System & Lighting', ikon: 'speaker', layanan: [['Sound 2.000 watt', 'Event', 1500000, 480], ['Sound + lighting resepsi', 'Wedding', 3500000, 600], ['LED screen (per hari)', 'Event', 4000000, 600]], ceklist: ['Speaker & stand', 'Mixer', 'Kabel rol & genset', 'Lampu par'],
    modul: [['sewa', 'Stok alat & denda'], ['tim', 'Operator'], ['setelan', 'Biaya angkut per km']] },
  catering: { grup: 'Kuliner & souvenir', nama: 'Catering', ikon: 'food', layanan: [['Prasmanan (per pax)', 'Wedding', 45000, 240], ['Nasi kotak (per box)', 'Event', 30000, 60], ['Gubukan / food stall', 'Wedding', 1500000, 240]], ceklist: ['Jumlah pax dikonfirmasi', 'Alat saji & chafing dish', 'Pramusaji', 'Air & es'],
    modul: [['booking', 'Hitung per pax (qty)'], ['keuangan', 'Modal bahan vs omzet'], ['tagih', 'DP 50% sebelum belanja']] },
  kue: { grup: 'Kuliner & souvenir', nama: 'Wedding Cake & Dessert', ikon: 'cake', layanan: [['Wedding cake 3 tingkat', 'Wedding', 2500000, 60], ['Dessert table', 'Wedding', 1800000, 120], ['Kue hantaran', 'Wedding', 350000, 30]], ceklist: ['Box & alas kue', 'Topper', 'Cooler'],
    modul: [['pricelist', 'Katalog kue & harga'], ['radar', 'Kapasitas produksi per hari'], ['tagih', 'DP saat pesan']] },
  undangan: { grup: 'Kuliner & souvenir', nama: 'Undangan & Souvenir', ikon: 'mail', layanan: [['Undangan cetak (per 100)', 'Wedding', 650000, 30], ['Undangan digital (web)', 'Wedding', 150000, 30], ['Souvenir (per 100 pcs)', 'Wedding', 500000, 30]], ceklist: ['Proof desain di-ACC', 'Daftar nama tamu', 'Packing'],
    modul: [['pricelist', 'Katalog desain & harga'], ['klien', 'Simpan revisi & data tamu'], ['tagih', 'Pelunasan sebelum cetak']] },
  gaun: { grup: 'Sewa & transport', nama: 'Sewa Gaun & Baju Adat', ikon: 'dress', layanan: [['Sewa gaun pengantin', 'Sewa', 1500000, 60], ['Sewa beskap / jas', 'Sewa', 500000, 60], ['Sewa baju adat keluarga (per set)', 'Sewa', 250000, 60]], ceklist: ['Cek ukuran', 'Laundry setelah kembali', 'Jaminan KTP'],
    modul: [['sewa', 'Stok, tanggal kembali & denda'], ['ceklist', 'Ceklist kondisi baju'], ['pricelist', 'Katalog koleksi']] },
  mobil: { grup: 'Sewa & transport', nama: 'Mobil Pengantin', ikon: 'car', layanan: [['Mobil pengantin + dekor bunga', 'Wedding', 1500000, 480], ['Mobil keluarga (per hari)', 'Sewa', 700000, 600]], ceklist: ['BBM penuh', 'Dekor bunga mobil', 'Sopir berseragam'],
    modul: [['sewa', 'Armada & jadwal'], ['setelan', 'Biaya per km'], ['tim', 'Jadwal sopir']] },
  lain: { grup: 'Lainnya', nama: 'Jasa lainnya', ikon: 'briefcase', layanan: [['Layanan Reguler', 'Reguler', 300000, 60], ['Layanan Premium', 'Premium', 750000, 120]], ceklist: ['Alat utama', 'Perlengkapan cadangan'],
    modul: [['halaman', 'Link booking'], ['tagih', 'Tagihan & invoice']] },
};

const TEMPLATE_WA = {
  konfirmasi: 'Halo {nama} 👋\nBooking kamu sudah kami terima:\n{layanan}\n📅 {tanggal} · {jam}\n📍 {lokasi}\nTotal: {total}\n\nTerima kasih sudah percaya sama {bisnis}!',
  ingat: 'Halo {nama} 👋\nPengingat jadwal {kapan} ya:\n{layanan}\n📅 {tanggal} · {jam}\n📍 {lokasi}\nSampai ketemu! — {bisnis}',
  tagih: 'Halo {nama}, mau info sisa pembayaran untuk {layanan} ({tanggal}): {sisa}.\nInvoice: {link}\nTerima kasih 🙏 — {bisnis}',
  invoice: 'Halo {nama}, berikut invoice dari {bisnis}:\n{link}\nTotal {total} · Sudah dibayar {dibayar} · Sisa {sisa}',
  terimakasih: 'Halo {nama}, terima kasih sudah memakai jasa {bisnis} 🙏 Kalau berkenan, boleh minta ulasan/tag kami di IG {ig} ya!',
};

function dataAwal() {
  return {
    versi: 1, siap: false,
    profil: { nama: '', profesi: 'foto', wa: '', ig: '', kota: '', alamat: '', bio: '', slug: '', warna: '#E32B2B', hero: 'Jadwal kosong? Booking langsung di sini.', galeri: [], rekening: '' },
    setelan: { dpPersen: 30, biayaPerKm: 3000, gratisKm: 10, reminder: [{ h: 1, aktif: true }, { h: 3, aktif: false }], wa: { ...TEMPLATE_WA }, kapasitasHarian: 2, namaPerangkat: '' },
    layanan: [], klien: [], booking: [], bayar: [], keluar: [],
    sewaItem: [], sewa: [], tim: [], ceklist: [], kursus: [], log: [], notif: [], terkirim: {},
  };
}
function muat() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.versi) return Object.assign(dataAwal(), d); } catch (e) {}
  return dataAwal();
}
let S = muat();
function simpan() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Gagal menyimpan di perangkat ini'); } }
function catat(teks, ikon = 'dot') { S.log.unshift({ id: uid(), t: Date.now(), teks, oleh: S.setelan.namaPerangkat || S.profil.nama || 'Saya', ikon }); S.log = S.log.slice(0, 500); }
function beriNotif(judul, isi, link = '') { S.notif.unshift({ id: uid(), t: Date.now(), judul, isi, link, baca: false }); S.notif = S.notif.slice(0, 200); }

function terapkanProfesi(kode) {
  const p = PROFESI[kode] || PROFESI.lain;
  S.profil.profesi = kode;
  if (!S.layanan.length) S.layanan = p.layanan.map(([nama, kategori, harga, durasi]) => ({ id: uid(), nama, kategori, harga, durasi, ket: '', tampil: true }));
  if (!S.ceklist.length) S.ceklist = [{ id: uid(), nama: 'Perlengkapan wajib ' + p.nama, items: p.ceklist }];
}

/* ---------- getter & hitungan ---------- */
const klienDari = id => S.klien.find(k => k.id === id) || { nama: '(klien dihapus)', wa: '' };
const bookingDari = id => S.booking.find(b => b.id === id);
const subtotal = b => (b.item || []).reduce((s, i) => s + (Number(i.harga) || 0) * (Number(i.qty) || 1), 0) + (b.tambahan || []).reduce((s, t) => s + (Number(t.harga) || 0), 0);
const biayaJalan = b => Number(b.biayaJalan) || 0;
const totalBooking = b => Math.max(0, subtotal(b) + biayaJalan(b) - (Number(b.diskon) || 0));
const bayarDari = id => S.bayar.filter(p => p.bookingId === id);
const dibayar = b => bayarDari(b.id).reduce((s, p) => s + (Number(p.nominal) || 0), 0);
const sisaBayar = b => Math.max(0, totalBooking(b) - dibayar(b));
const statusBayar = b => { const t = totalBooking(b), d = dibayar(b); return d <= 0 ? 'belum' : d >= t ? 'lunas' : 'dp'; };
const LABEL_BAYAR = { belum: 'Belum bayar', dp: 'DP', lunas: 'Lunas' };
const STATUS = { baru: 'Baru masuk', konfirmasi: 'Terkonfirmasi', selesai: 'Selesai', batal: 'Batal' };
const aktif = b => b.status !== 'batal';
const namaLayanan = b => (b.item || []).map(i => (Number(i.qty) > 1 ? i.qty + '× ' : '') + i.nama).join(', ') || '—';
const noInvoice = b => 'INV-' + (b.tanggal || hariIni()).replace(/-/g, '').slice(2) + '-' + String(b.no || 0).padStart(3, '0');
const hitungJalan = km => { const k = Math.max(0, (Number(km) || 0) - (Number(S.setelan.gratisKm) || 0)); return Math.ceil(k * (Number(S.setelan.biayaPerKm) || 0) / 1000) * 1000; };
const totalSewa = s => (s.items || []).reduce((a, i) => a + (Number(i.harga) || 0) * (Number(i.qty) || 1) * Math.max(1, lamaSewa(s)), 0) + (Number(s.denda) || 0);
const lamaSewa = s => Math.max(1, selisihHari(s.mulai, s.selesai || s.mulai) + 1);
const dibayarSewa = s => (s.bayar || []).reduce((a, p) => a + (Number(p.nominal) || 0), 0);
const stokDipakai = (itemId, tgl, kecuali) => S.sewa.filter(s => s.id !== kecuali && s.status !== 'kembali' && s.status !== 'batal' && s.mulai <= tgl && (s.selesai || s.mulai) >= tgl)
  .reduce((a, s) => a + (s.items || []).filter(i => i.itemId === itemId).reduce((x, i) => x + (Number(i.qty) || 0), 0), 0);

/** Semua uang masuk (pembayaran booking + sewa + kursus) dalam rentang tanggal */
function uangMasuk(dari, sampai) {
  const r = [];
  S.bayar.forEach(p => { if (p.tanggal >= dari && p.tanggal <= sampai) { const b = bookingDari(p.bookingId); r.push({ tanggal: p.tanggal, nominal: Number(p.nominal) || 0, nama: (b ? klienDari(b.klienId).nama : 'Booking') + ' · ' + (p.jenis === 'dp' ? 'DP' : p.jenis === 'pelunasan' ? 'Pelunasan' : 'Pembayaran'), sumber: 'booking', id: p.id }); } });
  S.sewa.forEach(s => (s.bayar || []).forEach(p => { if (p.tanggal >= dari && p.tanggal <= sampai) r.push({ tanggal: p.tanggal, nominal: Number(p.nominal) || 0, nama: 'Sewa · ' + (klienDari(s.klienId).nama), sumber: 'sewa', id: s.id }); }));
  S.kursus.forEach(k => (k.peserta || []).forEach(p => { if (p.bayar && p.tglDaftar >= dari && p.tglDaftar <= sampai) r.push({ tanggal: p.tglDaftar, nominal: Number(p.bayar) || 0, nama: 'Kursus · ' + p.nama, sumber: 'kursus', id: k.id }); }));
  return r.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}
const uangKeluar = (dari, sampai) => S.keluar.filter(k => k.tanggal >= dari && k.tanggal <= sampai).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
const jumlah = (arr, f = x => x.nominal) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const awalBulan = (ym) => ym + '-01';
const akhirBulan = (ym) => { const [y, m] = ym.split('-').map(Number); return iso(new Date(y, m, 0)); };
const piutangSemua = () => S.booking.filter(b => aktif(b) && statusBayar(b) !== 'lunas').reduce((s, b) => s + sisaBayar(b), 0);

/* ---------- ikon (garis) ---------- */
const IK = {
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6 6 0 0 0-4-5.6"/>',
  wallet: '<path d="M4 7a2 2 0 0 1 2-2h12v4"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="16.5" cy="13.5" r="1.4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  wa: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1-1 1.8.8"/>',
  invoice: '<path d="M6 3h9l4 4v14l-2.5-1.5L14 21l-2.5-1.5L9 21l-3-1.5z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  chart: '<path d="M5 20V11M12 20V5M19 20v-6"/>', radar: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l6-6"/>',
  box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  team: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><circle cx="4.5" cy="10" r="2"/><circle cx="19.5" cy="10" r="2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
  log: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
  out: '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  in: '<path d="M12 15V3M7 10l5 5 5-5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-3.8M8.2 13l7.6 3.8"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>', gift: '<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M12 9v11M3.5 13h17M12 9C9 9 7 4 9.5 4S12 9 12 9zm0 0c3 0 5-5 2.5-5S12 9 12 9z"/>',
  dot: '<circle cx="12" cy="12" r="3"/>', print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>', alert: '<path d="M12 3.5L21.5 20h-19z"/><path d="M12 10v4M12 17v.5"/>',
  brush: '<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-5 2-5 5 0 1-1 2-2 2 2 2 7 2 9-1 1-1.5 1-3 1-3"/>', flower: '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 5 14 5 12 9.5zM14.5 12c4.5-2 4.5 2 0 0zM12 14.5c2 4.5-2 4.5 0 0zM9.5 12C5 14 5 10 9.5 12z"/>',
  scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 18M8 15.5L20 6"/>', camera: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  video: '<rect x="3" y="6.5" width="13" height="11" rx="2.5"/><path d="M16 11l5-3v8l-5-3"/>', sparkle: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>', briefcase: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5h6v2M3 12h18"/>',
  cake: '<path d="M4 20h16M5 20v-6h14v6M7 14v-3h10v3M12 11V8"/><path d="M12 4.5c.9 1 .9 2 0 3-.9-1-.9-2 0-3z"/>', dress: '<path d="M9 3l1.5 4h3L15 3M10.5 7L8 11l-3 10h14l-3-10-2.5-4"/>',
  food: '<path d="M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v7a3 3 0 0 1-3 3"/><path d="M17 21V3c-2 2-3 5-3 8h3"/>', speaker: '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3.5"/><circle cx="12" cy="7" r="1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  arrow: '<path d="M9 5l7 7-7 7"/>', back: '<path d="M15 5l-7 7 7 7"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', down: '<path d="M6 9l6 6 6-6"/>',
};
const ik = (n, c = '') => `<svg class="ik ${c}" viewBox="0 0 24 24" aria-hidden="true">${IK[n] || IK.dot}</svg>`;

/* ---------- toast & modal ---------- */
let toastT;
function toast(t, aksi) {
  const el = $('#toast'); el.innerHTML = esc(t) + (aksi ? ` <button data-act="${aksi.act}" data-v="${aksi.v || ''}">${esc(aksi.label)}</button>` : '');
  el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), aksi ? 6000 : 2600);
}
function modal(html, kelas = '') {
  const m = $('#modal'); m.className = 'modal ' + kelas; m.innerHTML = `<div class="lembar" role="dialog" aria-modal="true">${html}</div>`; m.hidden = false;
  document.body.classList.add('kunci'); setTimeout(() => m.querySelector('[autofocus]')?.focus(), 60);
}
function tutup() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('kunci'); }
const kepala = (judul, sub = '') => `<div class="lembar-kepala"><div><h2>${judul}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="ikon-btn" data-act="tutup" aria-label="Tutup">${ik('x')}</button></div>`;
function konfirmasi(teks, lanjut, label = 'Hapus') {
  modal(`${kepala('Yakin?')}<p class="muted" style="margin:0 0 20px">${teks}</p><div class="aksi-baris"><button class="btn" data-act="tutup">Batal</button><button class="btn btn-merah" id="okKonf">${label}</button></div>`, 'kecil');
  $('#okKonf').onclick = () => { tutup(); lanjut(); };
}

/* ---------- kode untuk link publik (tanpa server) ---------- */
async function kode(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let out = bytes;
  if ('CompressionStream' in window) { const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw')); out = new Uint8Array(await new Response(cs).arrayBuffer()); }
  let bin = ''; out.forEach(b => bin += String.fromCharCode(b));
  return ('CompressionStream' in window ? 'z' : 'p') + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function urai(s) {
  const tipe = s[0], b64 = s.slice(1).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '==='.slice((b64.length + 3) % 4)); const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  let out = bytes;
  if (tipe === 'z') { const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); out = new Uint8Array(await new Response(ds).arrayBuffer()); }
  return JSON.parse(new TextDecoder().decode(out));
}
const alamatApp = () => location.origin + location.pathname;
async function salin(t) { try { await navigator.clipboard.writeText(t); toast('Tersalin'); } catch (e) { prompt('Salin teks ini:', t); } }
function unduh(nama, isi, tipe = 'text/plain') { const a = document.createElement('a'); a.href = URL.createObjectURL(isi instanceof Blob ? isi : new Blob([isi], { type: tipe })); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
async function bagikanGambar(canvas, nama, teks = '') {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const file = new File([blob], nama, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text: teks }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  unduh(nama, blob);
}

/** isi template WA */
function isiTemplate(kunci, b, extra = {}) {
  const k = b ? klienDari(b.klienId) : {};
  const map = {
    nama: k.nama || '', bisnis: S.profil.nama || 'kami', ig: S.profil.ig ? '@' + S.profil.ig.replace('@', '') : '',
    layanan: b ? namaLayanan(b) : '', tanggal: b ? tglPanjang(b.tanggal) : '', jam: b ? (b.jam || '-') + (b.jamSelesai ? '–' + b.jamSelesai : '') : '',
    lokasi: b ? (b.lokasi || '-') : '', total: b ? rp(totalBooking(b)) : '', dibayar: b ? rp(dibayar(b)) : '', sisa: b ? rp(sisaBayar(b)) : '', kapan: 'besok', link: '', ...extra,
  };
  return (S.setelan.wa[kunci] || TEMPLATE_WA[kunci]).replace(/\{(\w+)\}/g, (m, x) => map[x] ?? m);
}
