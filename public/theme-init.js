// Inisialisasi tema sebelum render pertama agar bebas kilat tanpa skrip inline di HTML (ketat CSP).
(function () {
  try {
    var t = localStorage.getItem('ja-theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {
    /* abaikan bila storage diblokir */
  }
})();

