/* Beresin — poster: pricelist (5 gaya), promo, jadwal kosong + desain sendiri (template milik vendor) */

function rr(x, a, b, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function tulisMuat(x, t, a, b, maks, ukuran) { let s = ukuran; const font = x.font; while (x.measureText(t).width > maks && s > 12) { s -= 2; x.font = font.replace(/\d+(\.\d+)?px/, s + 'px'); } x.fillText(t, a, b); }
/* pecah teks jadi beberapa baris (terakhir diberi …) */
function bungkus(x, teks, maks, baris) {
  const kata = String(teks || '').split(/\s+/).filter(Boolean), out = []; let cur = '';
  kata.forEach(k => { const t = cur ? cur + ' ' + k : k; if (x.measureText(t).width <= maks || !cur) cur = t; else { out.push(cur); cur = k; } });
  if (cur) out.push(cur);
  if (out.length > baris) { out.length = baris; let l = out[baris - 1]; while (x.measureText(l + '…').width > maks && l.length > 1) l = l.slice(0, -1); out[baris - 1] = l + '…'; }
  return out;
}
const muatGambar = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function terang(hex) { const h = String(hex).replace('#', ''); if (h.length < 6) return 1; const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return .2126 * r + .7152 * g + .0722 * b; }

const UK_POSTER = { feed: [1080, 1350, 'Feed 4:5'], story: [1080, 1920, 'Story 9:16'], kotak: [1080, 1080, 'Kotak 1:1'] };
const TEMA_POSTER = {
  gelap: { nama: 'Hitam', bg: '#0D0D0D', teks: '#FFFFFF', aksen: '#E3EF26', kartu: 'rgba(255,255,255,.08)', redup: '#A8A8A8', glow: 'rgba(227,43,43,.55)' },
  terang: { nama: 'Putih', bg: '#F4F4F4', teks: '#0D0D0D', aksen: '#E32B2B', kartu: '#FFFFFF', redup: '#6B6B6B' },
  merah: { nama: 'Merah', bg: '#B32222', teks: '#FFFFFF', aksen: '#E3EF26', kartu: 'rgba(0,0,0,.18)', redup: '#FFD6D6', glow: 'rgba(255,120,120,.6)' },
  krem: { nama: 'Krem emas', bg: '#F6F0E6', teks: '#3A2E27', aksen: '#A9824A', kartu: 'rgba(169,130,74,.10)', redup: '#7D6B5D' },
  pink: { nama: 'Blush', bg: '#FBE7EC', teks: '#4E2430', aksen: '#C2185B', kartu: 'rgba(255,255,255,.75)', redup: '#8A5C67' },
  sage: { nama: 'Sage', bg: '#E7ECE3', teks: '#26352A', aksen: '#4F7A48', kartu: 'rgba(255,255,255,.7)', redup: '#5D6B5F' },
  navy: { nama: 'Navy', bg: '#14213D', teks: '#FFFFFF', aksen: '#FCA311', kartu: 'rgba(255,255,255,.07)', redup: '#AFB8CC', glow: 'rgba(252,163,17,.35)' },
  merek: { nama: 'Warna usahaku' },
};
function temaPoster(k) {
  if (k !== 'merek') return TEMA_POSTER[k] || TEMA_POSTER.gelap;
  const w = S.profil.warna || '#E32B2B', gelap = terang(w) < .55;
  return { nama: 'Warna usahaku', bg: w, teks: gelap ? '#FFFFFF' : '#0D0D0D', aksen: gelap ? '#E3EF26' : '#0D0D0D', kartu: gelap ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.6)', redup: gelap ? 'rgba(255,255,255,.75)' : 'rgba(13,13,13,.65)', glow: gelap ? 'rgba(255,255,255,.18)' : '' };
}
const GAYA_POSTER = { daftar: ['Daftar harga', 'Rapi, cocok semua usaha'], katalog: ['Katalog', '2 kolom per kategori'], paket: ['Kartu paket', 'Harga besar + isi paket'], elegan: ['Elegan', 'Huruf sambung, nuansa wedding'], tebal: ['Huruf besar', 'Tegas & mencolok'] };
const JENIS_POSTER = { pricelist: ['Pricelist', 'PRICELIST'], promo: ['Promo', 'PROMO'], jadwal: ['Jadwal kosong', 'JADWAL TERSEDIA'] };
/* rekomendasi [gaya, warna] per jenis usaha */
const PRESET_POSTER = {
  mua: [['elegan', 'krem'], ['elegan', 'pink'], ['daftar', 'gelap'], ['paket', 'merah']], henna: [['elegan', 'krem'], ['katalog', 'pink'], ['daftar', 'gelap']],
  hair: [['elegan', 'pink'], ['daftar', 'gelap'], ['katalog', 'krem']], foto: [['paket', 'gelap'], ['tebal', 'merah'], ['daftar', 'navy'], ['elegan', 'krem']],
  video: [['paket', 'gelap'], ['tebal', 'navy'], ['daftar', 'merah']], dekor: [['paket', 'krem'], ['elegan', 'sage'], ['katalog', 'gelap']],
  florist: [['katalog', 'pink'], ['elegan', 'sage'], ['daftar', 'krem']], tenda: [['katalog', 'terang'], ['paket', 'navy'], ['daftar', 'gelap']],
  wo: [['paket', 'krem'], ['elegan', 'navy'], ['daftar', 'gelap']], mc: [['tebal', 'gelap'], ['paket', 'navy'], ['elegan', 'krem']],
  musik: [['tebal', 'gelap'], ['paket', 'merah'], ['daftar', 'navy']], sound: [['katalog', 'gelap'], ['tebal', 'navy'], ['paket', 'merah']],
  catering: [['katalog', 'sage'], ['daftar', 'krem'], ['tebal', 'merah']], kue: [['katalog', 'pink'], ['elegan', 'krem'], ['daftar', 'gelap']],
  undangan: [['katalog', 'krem'], ['elegan', 'pink'], ['daftar', 'gelap']], gaun: [['katalog', 'krem'], ['elegan', 'navy'], ['paket', 'gelap']],
  mobil: [['paket', 'gelap'], ['tebal', 'navy'], ['daftar', 'merah']], lain: [['daftar', 'gelap'], ['paket', 'terang'], ['tebal', 'merah']],
};
const presetUsaha = () => PRESET_POSTER[S.profil.profesi] || PRESET_POSTER.lain;
function siapkanPoster() {
  const [g, t] = presetUsaha()[0];
  S.poster = Object.assign({ jenis: 'pricelist', gaya: g, tema: t, ukuran: 'feed', label: '', sub: '', pilih: null, bulan: '', templat: '' }, S.poster || {});
  S.poster.promo = Object.assign({ judul: 'Promo spesial', persen: 10, sampai: '', ket: '' }, S.poster.promo || {});
  if (!Array.isArray(S.templatPoster)) S.templatPoster = [];
  if (S.poster.templat && !S.templatPoster.find(x => x.id === S.poster.templat)) S.poster.templat = '';
  return S.poster;
}
const layananPoster = () => { const P = S.poster; return S.layanan.filter(l => l.tampil !== false && (!P.pilih || P.pilih.includes(l.id))); };
const fontJudul = (b, px, serif) => serif ? `italic ${b} ${px}px Georgia, "Times New Roman", serif` : `${b} ${px}px OSO`;
let posterSisa = 0;

/* ---------- gambar ---------- */
async function gambarPoster(c) {
  await muatFontKanvas(); siapkanPoster();
  const P = S.poster, T = S.templatPoster.find(t => t.id === P.templat), t = temaPoster(P.tema);
  let W, H; if (T) { W = 1080; H = Math.round(1080 * T.h / T.w); } else [W, H] = UK_POSTER[P.ukuran] || UK_POSTER.feed;
  c.width = W; c.height = H; const x = c.getContext('2d'); x.textAlign = 'left'; x.textBaseline = 'alphabetic'; posterSisa = 0;
  let R;
  if (T) { x.drawImage(await muatGambar(T.img), 0, 0, W, H); const a = T.area; R = { x: W * a.ki / 100, y: H * a.a / 100, w: W * (1 - (a.ki + a.ka) / 100), h: H * (1 - (a.a + a.b) / 100) }; }
  else { latarPoster(x, W, H, t, P); R = { x: 80, y: 80, w: W - 160, h: H - 160 }; }
  const s = Math.max(.4, Math.min(1.25, R.w / 920 * (R.h > R.w * 1.6 ? 1.14 : 1), R.h / 900)), tengah = P.jenis === 'pricelist' && P.gaya === 'elegan';
  const atas = kepalaPoster(x, R, s, t, P, tengah), bawah = kakiPoster(x, R, s, t, P, tengah, !!T);
  const B = { x: R.x, y: atas + 24 * s, w: R.w, h: bawah - atas - 48 * s };
  if (B.h < 60) return;
  const L = layananPoster();
  if (P.jenis === 'promo') badanPromo(x, B, s, t, P, L);
  else if (P.jenis === 'jadwal') badanJadwal(x, B, s, t, P);
  else (BADAN_POSTER[P.gaya] || BADAN_POSTER.daftar)(x, B, s, t, L);
}
function latarPoster(x, W, H, t, P) {
  x.fillStyle = t.bg; x.fillRect(0, 0, W, H);
  if (t.glow) { const g = x.createRadialGradient(W - 120, 120, 10, W - 120, 120, 560); g.addColorStop(0, t.glow); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
  if (P.jenis === 'pricelist' && P.gaya === 'elegan') { x.strokeStyle = t.aksen; x.lineWidth = 3; x.strokeRect(36, 36, W - 72, H - 72); x.lineWidth = 1.2; x.strokeRect(50, 50, W - 100, H - 100); }
  if (P.jenis === 'pricelist' && P.gaya === 'tebal') { x.save(); x.globalAlpha = .12; x.fillStyle = t.aksen; x.translate(W, 0); x.rotate(Math.PI / 4); x.fillRect(-140, -60, 280, H * 2); x.restore(); }
  if (P.jenis === 'promo') { x.save(); x.globalAlpha = .14; x.fillStyle = t.aksen; x.beginPath(); x.arc(W * .1, H * .92, 300, 0, Math.PI * 2); x.fill(); x.restore(); }
}
function kepalaPoster(x, R, s, t, P, tengah) {
  const cx = tengah ? R.x + R.w / 2 : R.x; x.textAlign = tengah ? 'center' : 'left';
  const lbl = (P.label || JENIS_POSTER[P.jenis][1]).toUpperCase().slice(0, 40); x.font = `800 ${28 * s}px OSO`;
  const lw = Math.min(R.w, x.measureText(lbl).width + 44 * s), lx = tengah ? cx - lw / 2 : R.x;
  rr(x, lx, R.y, lw, 54 * s, 14 * s); x.fillStyle = t.aksen; x.fill(); x.fillStyle = terang(t.aksen) > .5 ? '#0D0D0D' : '#FFFFFF';
  x.textAlign = 'left'; tulisMuat(x, lbl, lx + 22 * s, R.y + 38 * s, lw - 44 * s, 28 * s); x.textAlign = tengah ? 'center' : 'left';
  x.fillStyle = t.teks; x.font = fontJudul(800, 80 * s, tengah); tulisMuat(x, S.profil.nama || 'Bisnis Kamu', cx, R.y + 150 * s, R.w, 80 * s);
  x.fillStyle = t.redup; x.font = `600 ${28 * s}px Inter`;
  const sub = P.sub || (PROFESI[S.profil.profesi] || PROFESI.lain).nama + (S.profil.kota ? ' · ' + S.profil.kota : '');
  tulisMuat(x, sub, cx, R.y + 200 * s, R.w, 28 * s); x.textAlign = 'left';
  return R.y + 214 * s;
}
function kakiPoster(x, R, s, t, P, tengah, templat) {
  const cx = tengah ? R.x + R.w / 2 : R.x, y0 = R.y + R.h; x.textAlign = tengah ? 'center' : 'left';
  const link = typeof linkBookingSingkat === 'function' ? linkBookingSingkat() : '';
  const wm = !templat;
  let y = y0 - (wm ? 34 * s : 10 * s) - (link ? 40 * s : 0);
  x.fillStyle = t.teks; x.font = `800 ${38 * s}px OSO`; tulisMuat(x, 'WA ' + (S.profil.wa || '-') + (S.profil.ig ? '  ·  ' + S.profil.ig : ''), cx, y, R.w, 38 * s);
  x.fillStyle = t.redup; x.font = `600 ${25 * s}px Inter`; x.fillText(P.jenis === 'jadwal' ? 'Amankan tanggalmu sekarang:' : 'Booking & tanya jadwal:', cx, y - 50 * s);
  if (link) { x.fillStyle = t.aksen; x.font = `700 ${26 * s}px Inter`; tulisMuat(x, link.replace(/^https?:\/\//, ''), cx, y + 40 * s, R.w, 26 * s); }
  if (wm) { x.fillStyle = t.redup; x.font = `600 ${20 * s}px Inter`; x.fillText('Dibuat dengan Beresin', cx, y0); }
  x.textAlign = 'left';
  return y - 50 * s - 34 * s;
}
const isiPaket = l => String(l.ket || '').split(/\s*[,;•\n]\s*|\s+\+\s+/).filter(Boolean);
const durasiPoster = d => !d ? "" : "± " + durasiTeks(d);

const BADAN_POSTER = {
  daftar(x, B, s, t, L) {
    const maks = Math.max(1, Math.floor(B.h / (64 * s))), it = L.slice(0, maks); posterSisa = L.length - it.length; if (!it.length) return kosongPoster(x, B, s, t);
    const tinggi = Math.min(150 * s, B.h / it.length); let y = B.y + (B.h - tinggi * it.length) / 2;
    it.forEach(l => {
      const h = tinggi - 14 * s, mid = y + h / 2; x.fillStyle = t.kartu; rr(x, B.x, y, B.w, h, 20 * s); x.fill();
      const fn = Math.min(40 * s, tinggi * .3), ket = l.ket && h > 76 * s;
      x.fillStyle = t.teks; x.font = `700 ${fn}px OSO`; tulisMuat(x, l.nama, B.x + 30 * s, ket ? mid - 4 * s : mid + fn * .36, B.w * .6, fn);
      if (ket) { x.fillStyle = t.redup; x.font = `500 ${Math.min(26 * s, tinggi * .19)}px Inter`; tulisMuat(x, l.ket, B.x + 30 * s, mid + 30 * s, B.w * .6, Math.min(26 * s, tinggi * .19)); }
      x.fillStyle = t.aksen; x.font = `800 ${Math.min(46 * s, tinggi * .34)}px OSO`; x.textAlign = 'right'; x.fillText(rp(l.harga), B.x + B.w - 30 * s, mid + Math.min(46 * s, tinggi * .34) * .36); x.textAlign = 'left';
      y += tinggi;
    });
  },
  katalog(x, B, s, t, L) {
    if (!L.length) return kosongPoster(x, B, s, t);
    const grup = [...new Set(L.map(l => l.kategori || 'Lainnya'))].map(k => [k, L.filter(l => (l.kategori || 'Lainnya') === k)]);
    const gap = 18 * s, kolW = (B.w - gap) / 2; let k = 1.9, ukur;
    const hitung = k => grup.reduce((a, [, it]) => a + 62 * s * k + Math.ceil(it.length / 2) * (140 * s * k + gap), 0);
    while ((ukur = hitung(k)) > B.h && k > .55) k -= .05;
    let y = B.y + Math.max(0, (B.h - ukur) / 2), tampil = 0;
    for (const [nama, it] of grup) {
      if (y + 62 * s * k + 140 * s * k > B.y + B.h + 1) break;
      x.fillStyle = t.aksen; x.font = `800 ${24 * s * k}px OSO`; x.fillText(nama.toUpperCase(), B.x, y + 34 * s * k);
      const lw = x.measureText(nama.toUpperCase()).width; x.fillRect(B.x + lw + 16 * s, y + 25 * s * k, Math.max(0, B.w - lw - 16 * s), 2 * s);
      y += 62 * s * k;
      for (let i = 0; i < it.length; i += 2) {
        const tinggi = 140 * s * k; if (y + tinggi > B.y + B.h + 1) break;
        [it[i], it[i + 1]].forEach((l, j) => {
          if (!l) return; tampil++; const cx = B.x + j * (kolW + gap);
          x.fillStyle = t.kartu; rr(x, cx, y, kolW, tinggi, 18 * s); x.fill();
          x.fillStyle = t.teks; x.font = `700 ${28 * s * k}px OSO`; bungkus(x, l.nama, kolW - 44 * s, 2).forEach((b, n) => x.fillText(b, cx + 22 * s, y + (40 + n * 32) * s * k));
          x.fillStyle = t.aksen; x.font = `800 ${30 * s * k}px OSO`; x.fillText(rp(l.harga), cx + 22 * s, y + tinggi - 20 * s * k);
        });
        y += tinggi + gap;
      }
    }
    posterSisa = L.length - tampil;
  },
  paket(x, B, s, t, L) {
    const it = L.slice(0, 4); posterSisa = L.length - it.length; if (!it.length) return kosongPoster(x, B, s, t);
    const gap = 20 * s, grid = it.length === 4, kol = grid ? 2 : 1, baris = grid ? 2 : it.length;
    const w = (B.w - gap * (kol - 1)) / kol, h = Math.min(grid ? 520 * s : 420 * s, (B.h - gap * (baris - 1)) / baris), k = Math.min(grid ? 1 : 1.15, h / (grid ? 300 * s : 280 * s)), y1 = B.y + (B.h - (h * baris + gap * (baris - 1))) / 2;
    it.forEach((l, i) => {
      const cx = B.x + (i % kol) * (w + gap), cy = y1 + Math.floor(i / kol) * (h + gap);
      x.fillStyle = t.kartu; rr(x, cx, cy, w, h, 24 * s); x.fill(); x.fillStyle = t.aksen; rr(x, cx, cy, 10 * s, h, 5 * s); x.fill();
      const p = cx + 36 * s; let y = cy + 56 * s * k;
      x.fillStyle = t.teks; x.font = `700 ${36 * s * k}px OSO`; tulisMuat(x, l.nama, p, y, w - 72 * s - (l.durasi && !grid ? 150 * s : 0), 36 * s * k);
      if (l.durasi && !grid) { x.fillStyle = t.redup; x.font = `600 ${22 * s}px Inter`; x.textAlign = 'right'; x.fillText(durasiPoster(l.durasi), cx + w - 30 * s, y); x.textAlign = 'left'; }
      y += 66 * s * k; x.fillStyle = t.aksen; x.font = `800 ${56 * s * k}px OSO`; tulisMuat(x, rp(l.harga), p, y, w - 72 * s, 56 * s * k);
      const poin = isiPaket(l), muat = Math.max(0, Math.floor((cy + h - y - 30 * s) / (40 * s * k)));
      x.font = `500 ${27 * s * k}px Inter`; poin.slice(0, Math.min(grid ? 4 : 5, muat)).forEach((b, n) => { x.fillStyle = t.aksen; x.fillText('✓', p, y + (48 + n * 40) * s * k); x.fillStyle = t.teks; x.globalAlpha = .8; tulisMuat(x, b.charAt(0).toUpperCase() + b.slice(1), p + 36 * s * k, y + (48 + n * 40) * s * k, w - 110 * s, 27 * s * k); x.globalAlpha = 1; });
    });
  },
  elegan(x, B, s, t, L) {
    const maks = Math.max(1, Math.floor(B.h / (86 * s))), it = L.slice(0, maks); posterSisa = L.length - it.length; if (!it.length) return kosongPoster(x, B, s, t);
    const tinggi = Math.min(210 * s, B.h / it.length), cx = B.x + B.w / 2, y1 = B.y + (B.h - tinggi * it.length) / 2; x.textAlign = 'center';
    it.forEach((l, i) => {
      const y = y1 + i * tinggi, fn = Math.min(54 * s, tinggi * .29);
      x.fillStyle = t.teks; x.font = fontJudul(600, fn, true); tulisMuat(x, l.nama, cx, y + tinggi * .42, B.w * .9, fn);
      x.fillStyle = t.aksen; x.font = `700 ${Math.min(40 * s, tinggi * .21)}px OSO`; x.fillText(rp(l.harga), cx, y + tinggi * .78);
      if (i < it.length - 1) { x.strokeStyle = t.aksen; x.globalAlpha = .5; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx - 120 * s, y + tinggi); x.lineTo(cx - 14 * s, y + tinggi); x.moveTo(cx + 14 * s, y + tinggi); x.lineTo(cx + 120 * s, y + tinggi); x.stroke(); x.globalAlpha = 1; x.fillStyle = t.aksen; x.save(); x.translate(cx, y + tinggi); x.rotate(Math.PI / 4); x.fillRect(-5 * s, -5 * s, 10 * s, 10 * s); x.restore(); }
    });
    x.textAlign = 'left';
  },
  tebal(x, B, s, t, L) {
    const maks = Math.max(1, Math.floor(B.h / (84 * s))), it = L.slice(0, maks); posterSisa = L.length - it.length; if (!it.length) return kosongPoster(x, B, s, t);
    const tinggi = Math.min(210 * s, B.h / it.length), y1 = B.y + (B.h - tinggi * it.length) / 2;
    it.forEach((l, i) => {
      const y = y1 + i * tinggi, fn = Math.min(72 * s, tinggi * .38), base = y + tinggi - 30 * s;
      x.fillStyle = t.teks; x.font = `800 ${fn}px OSO`; tulisMuat(x, l.nama.toUpperCase(), B.x, base, B.w * .6, fn);
      x.fillStyle = t.aksen; x.textAlign = 'right'; x.font = `800 ${fn}px OSO`; tulisMuat(x, rp(l.harga).replace('Rp ', 'Rp'), B.x + B.w, base, B.w * .38, fn); x.textAlign = 'left';
      x.fillStyle = t.aksen; x.globalAlpha = .55; x.fillRect(B.x, y + tinggi - 8 * s, B.w, 4 * s); x.globalAlpha = 1;
    });
  },
};
function kosongPoster(x, B, s, t) { x.fillStyle = t.redup; x.font = `600 ${28 * s}px Inter`; x.fillText('Belum ada layanan yang dipilih.', B.x, B.y + 40 * s); }

function badanPromo(x, B, s, t, P, L) {
  const pr = P.promo, persen = Math.max(0, Math.min(90, Number(pr.persen) || 0)); let y = B.y;
  x.fillStyle = t.teks; x.font = `800 ${74 * s}px OSO`; bungkus(x, pr.judul || 'Promo spesial', B.w, 2).forEach(b => { y += 78 * s; x.fillText(b, B.x, y); });
  y += 26 * s;
  if (persen) { const teks = 'DISKON ' + persen + '%'; x.font = `800 ${52 * s}px OSO`; const w = x.measureText(teks).width + 56 * s; rr(x, B.x, y, w, 84 * s, 22 * s); x.fillStyle = t.aksen; x.fill(); x.fillStyle = terang(t.aksen) > .5 ? '#0D0D0D' : '#FFFFFF'; x.fillText(teks, B.x + 28 * s, y + 62 * s); y += 84 * s + 20 * s; }
  x.font = `600 ${26 * s}px Inter`; x.fillStyle = t.redup;
  const info = [pr.sampai ? 'Berlaku sampai ' + tglPanjang(pr.sampai) : '', pr.ket].filter(Boolean);
  info.forEach(b => { y += 34 * s; tulisMuat(x, b, B.x, y, B.w, 26 * s); });
  y += 30 * s;
  const sisaH = B.y + B.h - y, maks = Math.max(0, Math.floor(sisaH / (74 * s))), it = L.slice(0, maks); posterSisa = L.length - it.length;
  const tinggi = it.length ? Math.min(100 * s, sisaH / it.length) : 0;
  it.forEach(l => {
    const h = tinggi - 12 * s, mid = y + h / 2, baru = Math.round(l.harga * (100 - persen) / 100);
    x.fillStyle = t.kartu; rr(x, B.x, y, B.w, h, 18 * s); x.fill();
    x.fillStyle = t.teks; x.font = `700 ${Math.min(30 * s, tinggi * .32)}px OSO`; tulisMuat(x, l.nama, B.x + 26 * s, mid + 10 * s, B.w * .5, Math.min(30 * s, tinggi * .32));
    x.textAlign = 'right'; x.fillStyle = t.aksen; x.font = `800 ${Math.min(34 * s, tinggi * .36)}px OSO`; x.fillText(rp(baru), B.x + B.w - 26 * s, mid + 12 * s);
    if (persen) { const bw = x.measureText(rp(baru)).width; x.fillStyle = t.redup; x.font = `600 ${22 * s}px Inter`; const lama = rp(l.harga), lx = B.x + B.w - 26 * s - bw - 18 * s; x.fillText(lama, lx, mid + 10 * s); const lw = x.measureText(lama).width; x.fillRect(lx - lw, mid + 2 * s, lw, 2 * s); }
    x.textAlign = 'left'; y += tinggi;
  });
}

function badanJadwal(x, B, s, t, P) {
  const ym = P.bulan || hariIni().slice(0, 7), cap = Number(S.setelan.kapasitasHarian) || 1, h0 = hariIni(), per = {};
  S.booking.filter(aktif).forEach(b => { if (b.tanggal.startsWith(ym)) per[b.tanggal] = (per[b.tanggal] || 0) + 1; });
  x.fillStyle = t.teks; x.font = `800 ${58 * s}px OSO`; x.fillText(namaBulan(ym), B.x, B.y + 56 * s);
  const jml = Number(akhirBulan(ym).slice(8)), mulai = (keTgl(ym + '-01').getDay() + 6) % 7, baris = Math.ceil((mulai + jml) / 7);
  const atas = B.y + 96 * s, legH = 56 * s, gap = 10 * s, sel = Math.min((B.w - gap * 6) / 7, (B.h - (atas - B.y) - 44 * s - legH - gap * baris) / baris);
  const lebar = sel * 7 + gap * 6, x0 = B.x;
  x.font = `700 ${22 * s}px Inter`; x.fillStyle = t.redup; x.textAlign = 'center';
  ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].forEach((d, i) => x.fillText(d, x0 + i * (sel + gap) + sel / 2, atas + 22 * s));
  let kosongN = 0; const y0 = atas + 44 * s;
  for (let d = 1; d <= jml; d++) {
    const i = mulai + d - 1, cx = x0 + (i % 7) * (sel + gap), cy = y0 + Math.floor(i / 7) * (sel + gap), tg = ym + '-' + String(d).padStart(2, '0');
    const lewat = tg < h0, penuh = (per[tg] || 0) >= cap, bebas = !lewat && !penuh; if (bebas) kosongN++;
    rr(x, cx, cy, sel, sel, 14 * s); x.fillStyle = bebas ? t.aksen : t.kartu; x.fill();
    x.fillStyle = bebas ? (terang(t.aksen) > .5 ? '#0D0D0D' : '#FFFFFF') : t.redup; x.globalAlpha = lewat ? .4 : 1;
    x.font = `800 ${Math.min(34 * s, sel * .42)}px OSO`; x.fillText(String(d), cx + sel / 2, cy + sel / 2 + Math.min(34 * s, sel * .42) * .36);
    if (penuh && !lewat) { x.strokeStyle = t.redup; x.lineWidth = 3 * s; x.beginPath(); x.moveTo(cx + sel * .25, cy + sel * .75); x.lineTo(cx + sel * .75, cy + sel * .25); x.stroke(); }
    x.globalAlpha = 1;
  }
  x.textAlign = 'left'; const ly = y0 + baris * (sel + gap) + 26 * s;
  rr(x, x0, ly - 22 * s, 28 * s, 28 * s, 8 * s); x.fillStyle = t.aksen; x.fill(); x.fillStyle = t.teks; x.font = `600 ${24 * s}px Inter`; x.fillText('Masih kosong (' + kosongN + ' tanggal)', x0 + 40 * s, ly);
  const lx = x0 + Math.min(lebar * .58, 420 * s); rr(x, lx, ly - 22 * s, 28 * s, 28 * s, 8 * s); x.fillStyle = t.kartu; x.fill(); x.fillStyle = t.teks; x.fillText('Penuh', lx + 40 * s, ly);
}

/* ---------- tampilan ---------- */
VIEWS.pricelist = () => {
  const P = siapkanPoster(), T = S.templatPoster, Tp = T.find(x => x.id === P.templat), semua = S.layanan.filter(l => l.tampil !== false);
  const sw = k => { const t = temaPoster(k); return `<span class="sw" style="background:${t.bg}"><i style="background:${t.aksen}"></i></span>`; };
  const bulan = [0, 1, 2].map(i => geserBulan(hariIni().slice(0, 7), i));
  return `<div class="judul-hal"><div><h1>Poster & Pricelist</h1><p>Pilih jenis, gaya & warna — atau pakai desain sendiri. Isinya otomatis dari data layanan & jadwalmu.</p></div><div class="aksi-baris"><button class="btn btn-merah" data-act="unduhPoster">${ik('share')} Bagikan / unduh</button></div></div>
  <div class="poster-wrap masuk">
   <div class="kartu poster-pratinjau"><canvas id="poster" width="1080" height="1350"></canvas><p class="muted" id="posterInfo" style="font-size:13px;margin:10px 0 0;text-align:center"></p></div>
   <div class="poster-atur">
    <div class="kartu"><h3>${ik('image')} Jenis poster</h3><div class="tabs">${Object.entries(JENIS_POSTER).map(([k, [n]]) => `<button class="${P.jenis === k ? 'on' : ''}" data-act="setPoster" data-k="jenis" data-v="${k}">${n}</button>`).join('')}</div></div>
    ${P.jenis === 'pricelist' ? `<div class="kartu"><h3>${ik('star')} Cocok untuk ${esc((PROFESI[S.profil.profesi] || PROFESI.lain).nama)}</h3><div class="preset-grid">${presetUsaha().map(([g, k]) => `<button class="${P.gaya === g && P.tema === k ? 'on' : ''}" data-act="presetPoster" data-v="${g}|${k}">${sw(k)}<b>${GAYA_POSTER[g][0]}</b><small>${temaPoster(k).nama}</small></button>`).join('')}</div></div>` : ''}
    <div class="kartu"><h3>${ik('edit')} Atur desain</h3><div class="form">
     ${P.jenis === 'pricelist' ? `<div class="f"><span>Gaya</span><div class="pilihan">${Object.entries(GAYA_POSTER).map(([k, [n, d]]) => `<button type="button" class="${P.gaya === k ? 'on' : ''}" data-act="setPoster" data-k="gaya" data-v="${k}">${n}<small>${d}</small></button>`).join('')}</div></div>` : ''}
     <div class="f"><span>Warna</span><div class="pilihan warna-poster">${Object.keys(TEMA_POSTER).map(k => `<button type="button" class="${P.tema === k ? 'on' : ''}" data-act="setPoster" data-k="tema" data-v="${k}">${sw(k)}${temaPoster(k).nama}</button>`).join('')}</div>${Tp ? '<small>Warna dipakai untuk teks & kotak di atas desainmu.</small>' : ''}</div>
     ${Tp ? '' : `<div class="f"><span>Ukuran</span><div class="tabs">${Object.entries(UK_POSTER).map(([k, [, , n]]) => `<button type="button" class="${P.ukuran === k ? 'on' : ''}" data-act="setPoster" data-k="ukuran" data-v="${k}">${n}</button>`).join('')}</div></div>`}
     <div class="dua"><label class="f"><span>Label atas</span><input class="inp-poster" data-k="label" value="${esc(P.label)}" placeholder="${JENIS_POSTER[P.jenis][1]}" maxlength="40"></label><label class="f"><span>Baris kecil</span><input class="inp-poster" data-k="sub" value="${esc(P.sub)}" placeholder="${esc((PROFESI[S.profil.profesi] || PROFESI.lain).nama + (S.profil.kota ? ' · ' + S.profil.kota : ''))}" maxlength="60"></label></div>
    </div></div>
    ${P.jenis === 'promo' ? `<div class="kartu"><h3>${ik('gift')} Isi promo</h3><div class="form">
     <label class="f"><span>Judul promo</span><input class="inp-poster" data-k="promo.judul" value="${esc(P.promo.judul)}" maxlength="50" placeholder="Promo akhir tahun"></label>
     <div class="dua"><label class="f"><span>Diskon (%)</span><input class="inp-poster" data-k="promo.persen" type="number" min="0" max="90" value="${esc(P.promo.persen)}"><small>Isi 0 kalau tanpa potongan harga.</small></label><label class="f"><span>Berlaku sampai</span><input class="inp-poster" data-k="promo.sampai" type="date" value="${esc(P.promo.sampai)}"></label></div>
     <label class="f"><span>Keterangan</span><input class="inp-poster" data-k="promo.ket" value="${esc(P.promo.ket)}" maxlength="80" placeholder="mis. khusus booking bulan Desember"></label></div></div>` : ''}
    ${P.jenis === 'jadwal' ? `<div class="kartu"><h3>${ik('cal')} Bulan</h3><div class="tabs">${bulan.map(m => `<button class="${(P.bulan || bulan[0]) === m ? 'on' : ''}" data-act="setPoster" data-k="bulan" data-v="${m}">${namaBulan(m)}</button>`).join('')}</div><p class="muted" style="font-size:13px;margin:10px 0 0">Tanggal kosong dihitung dari booking & kapasitas harian (${Number(S.setelan.kapasitasHarian) || 1}/hari).</p></div>` : ''}
    ${P.jenis !== 'jadwal' ? `<div class="kartu"><h3 style="justify-content:space-between">${ik('tag')} Layanan yang tampil <a class="link-kk" href="#/layanan">Ubah harga</a></h3>${semua.length ? `<div class="pilih-layanan">${semua.map(l => `<label class="cek ${!P.pilih || P.pilih.includes(l.id) ? 'ok' : ''}"><input type="checkbox" class="cek-poster" value="${l.id}" ${!P.pilih || P.pilih.includes(l.id) ? 'checked' : ''}><span style="text-decoration:none;color:inherit">${esc(l.nama)} <small class="muted">${rp(l.harga)}</small></span></label>`).join('')}</div>` : kosong('Belum ada layanan.', 'tag', '<a class="btn" href="#/layanan">Tambah layanan</a>')}</div>` : ''}
    <div class="kartu"><h3>${ik('in')} Desain sendiri</h3>
     <p class="muted" style="font-size:13px;margin:0 0 12px">Punya desain dari Canva/Photoshop? Unggah gambarnya (bagian tengah dikosongkan), lalu Beresin menulis nama, harga & kontak di area yang kamu atur. Maks 3 desain.</p>
     <div class="templat-grid"><button class="${!Tp ? 'on' : ''}" data-act="pilihTemplat" data-v=""><span class="tp-kosong">${ik('image')}</span><small>Desain Beresin</small></button>${T.map(x => `<button class="${P.templat === x.id ? 'on' : ''}" data-act="pilihTemplat" data-v="${x.id}"><img src="${x.img}" alt=""><small>${esc(x.nama)}</small></button>`).join('')}${T.length < 3 ? `<button data-act="tambahTemplat"><span class="tp-kosong">${ik('plus')}</span><small>Unggah desain</small></button>` : ''}</div>
     <input type="file" id="fileTemplat" accept="image/png,image/jpeg,image/webp" hidden>
     ${Tp ? `<div class="form" style="margin-top:14px"><small class="muted">Geser untuk menentukan area tulisan (dalam persen dari tepi gambar):</small>
       ${[['a', 'Jarak dari atas'], ['b', 'Jarak dari bawah'], ['ki', 'Jarak dari kiri'], ['ka', 'Jarak dari kanan']].map(([k, n]) => `<label class="f geser"><span>${n} <b id="nilai_${k}">${Tp.area[k]}%</b></span><input type="range" class="area-poster" data-k="${k}" min="0" max="${k === 'a' || k === 'b' ? 70 : 40}" value="${Tp.area[k]}"></label>`).join('')}
       <label class="cek"><input type="checkbox" id="garisArea" ${posterGaris ? 'checked' : ''}><span style="text-decoration:none;color:inherit">Tampilkan garis area (tidak ikut terunduh)</span></label>
       <div class="aksi-baris" style="justify-content:flex-start"><button class="btn btn-hapus" data-act="hapusTemplat" data-v="${Tp.id}">${ik('trash')} Hapus desain ini</button></div></div>` : ''}
    </div>
   </div>
  </div>`;
};
let posterGaris = true, tPoster = 0;
async function gambarUlangPoster() {
  const c = $('#poster'); if (!c) return; await gambarPoster(c);
  const P = S.poster, Tp = S.templatPoster.find(x => x.id === P.templat);
  if (Tp && posterGaris) { const x = c.getContext('2d'), a = Tp.area, W = c.width, H = c.height; x.save(); x.setLineDash([16, 10]); x.lineWidth = 4; x.strokeStyle = '#E32B2B'; x.strokeRect(W * a.ki / 100, H * a.a / 100, W * (1 - (a.ki + a.ka) / 100), H * (1 - (a.a + a.b) / 100)); x.restore(); }
  const info = $('#posterInfo'); if (info) info.textContent = posterSisa > 0 ? `${posterSisa} layanan tidak muat. Kurangi pilihan layanan, ganti gaya, atau pakai ukuran Story.` : (P.jenis === 'jadwal' ? 'Tanggal kuning/terang = masih bisa dibooking.' : '');
}
VIEWS.pricelist_siap = () => {
  gambarUlangPoster();
  const tunda = () => { clearTimeout(tPoster); tPoster = setTimeout(() => { simpan(); }, 600); };
  document.querySelectorAll('.inp-poster').forEach(i => i.oninput = () => { const [a, b] = i.dataset.k.split('.'); if (b) S.poster[a][b] = i.type === 'number' ? Number(i.value) : i.value; else S.poster[a] = i.value; gambarUlangPoster(); tunda(); });
  document.querySelectorAll('.cek-poster').forEach(i => i.onchange = () => { const v = [...document.querySelectorAll('.cek-poster')].filter(x => x.checked).map(x => x.value); i.closest('.cek').classList.toggle('ok', i.checked); S.poster.pilih = v.length === S.layanan.filter(l => l.tampil !== false).length ? null : v; gambarUlangPoster(); tunda(); });
  document.querySelectorAll('.area-poster').forEach(i => i.oninput = () => { const Tp = S.templatPoster.find(x => x.id === S.poster.templat); if (!Tp) return; Tp.area[i.dataset.k] = Number(i.value); $('#nilai_' + i.dataset.k).textContent = i.value + '%'; gambarUlangPoster(); tunda(); });
  const g = $('#garisArea'); if (g) g.onchange = () => { posterGaris = g.checked; gambarUlangPoster(); };
};
AKSI.setPoster = el => { S.poster[el.dataset.k] = el.dataset.v; simpan(); render(); };
AKSI.presetPoster = el => { const [g, t] = el.dataset.v.split('|'); Object.assign(S.poster, { gaya: g, tema: t }); simpan(); render(); };
AKSI.pilihTemplat = el => { S.poster.templat = el.dataset.v; simpan(); render(); };
AKSI.hapusTemplat = el => konfirmasi('Desain ini dihapus dari Beresin. File aslimu di HP/laptop tidak ikut terhapus.', () => { S.templatPoster = S.templatPoster.filter(x => x.id !== el.dataset.v); S.poster.templat = ''; simpan(); render(); });
AKSI.tambahTemplat = () => {
  const inp = $('#fileTemplat'); inp.onchange = async () => {
    const f = inp.files[0]; inp.value = ''; if (!f) return;
    try {
      const url = URL.createObjectURL(f), img = await muatGambar(url); URL.revokeObjectURL(url);
      const r = img.height / img.width; if (r < .5 || r > 2.2) return toast('Ukuran gambar terlalu lebar/tinggi. Pakai rasio 1:1, 4:5 atau 9:16.');
      const c = document.createElement('canvas'); c.width = 1080; c.height = Math.round(1080 * r); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let data = c.toDataURL('image/jpeg', .85); if (data.length > 900000) data = c.toDataURL('image/jpeg', .7);
      // pilih warna teks otomatis: desain gelap → teks putih, desain terang → teks hitam
      const px = c.getContext('2d').getImageData(0, Math.round(c.height * .25), c.width, Math.round(c.height * .63)).data; let L = 0, n = 0;
      for (let i = 0; i < px.length; i += 4 * 97) { L += (.2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2]) / 255; n++; }
      S.poster.tema = L / n < .5 ? 'gelap' : 'terang';
      const id = uid(); S.templatPoster.push({ id, nama: f.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'Desainku', img: data, w: c.width, h: c.height, area: { a: 25, b: 12, ki: 8, ka: 8 } });
      S.poster.templat = id; posterGaris = true; catat('Tambah desain poster sendiri', 'image'); simpan(); render(); toast('Desain ditambahkan — atur area tulisannya');
    } catch (e) { toast('Gambar tidak bisa dibuka. Coba file PNG atau JPG.'); }
  }; inp.click();
};
AKSI.unduhPoster = async () => { const g = posterGaris; posterGaris = false; await gambarUlangPoster(); await bagikanGambar($('#poster'), (S.poster.jenis || 'pricelist') + '-' + (S.profil.slug || 'beresin') + '.png', JENIS_POSTER[S.poster.jenis][0] + ' ' + S.profil.nama); posterGaris = g; gambarUlangPoster(); };
