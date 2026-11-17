/* Beresin — boot: delegasi klik, router, service worker */
AKSI.go = el => { location.hash = '#/' + el.dataset.v; };
AKSI.tutup = () => tutup();
async function muatFontKanvas() { try { await Promise.all(['800 40px OSO', '700 40px OSO', '400 20px Inter', '600 20px Inter'].map(f => document.fonts.load(f))); } catch (e) {} }
document.addEventListener('click', e => {
  if (e.target.id === 'modal') return tutup();
  const el = e.target.closest('[data-act]'); if (!el) return;
  const f = AKSI[el.dataset.act]; if (!f) return console.warn('AKSI tidak ada:', el.dataset.act);
  if (el.tagName === 'A' && !el.target) e.preventDefault();
  f(el, e);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !document.getElementById('modal')?.hidden) tutup(); });
/* transisi halaman: arah geser ikut urutan tab / masuk-keluar detail */
const URUT_TAB = { beranda: 0, jadwal: 1, keuangan: 2 };
let ruteLama = bacaRute();
function arahTransisi(a, b) {
  const ia = URUT_TAB[a.nama] ?? 3, ib = URUT_TAB[b.nama] ?? 3;
  if (!a.param && !b.param && ia !== ib) return ib > ia ? 'tr-kanan' : 'tr-kiri';
  if (b.param && !a.param) return 'tr-kanan';
  if (a.param && !b.param) return 'tr-kiri';
  return 'tr-naik';
}
window.addEventListener('hashchange', async () => {
  tutup(); const baru = bacaRute(), arah = arahTransisi(ruteLama, baru); ruteLama = baru;
  await render(); window.scrollTo(0, 0);
  const v = $('#view'); v.classList.remove('tr-kanan', 'tr-kiri', 'tr-naik'); void v.offsetWidth; v.classList.add(arah);
});
document.getElementById('view').addEventListener('animationend', e => { if (e.target.id === 'view') e.target.classList.remove('tr-kanan', 'tr-kiri', 'tr-naik'); });
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
