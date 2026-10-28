// =========================================
// صفحة المنتجات: البحث برقم القطعة أو الاسم أو الموديل
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("pSearch");
  const info = document.getElementById("pSearchInfo");
  if (!input) return;

  const cards = [...document.querySelectorAll(".p-card")];
  const groups = [...document.querySelectorAll(".p-group")];
  const brands = [...document.querySelectorAll(".p-brand")];

  // توحيد الحروف عشان البحث يلاقي "اكتروس" و"أكتروس" ويتجاهل المسافات في الأرقام
  const norm = (s) =>
    s.toLowerCase()
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
      .replace(/\s+/g, "");

  cards.forEach((c) => (c._s = norm(c.dataset.s || "")));

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });

  function run() {
    const q = norm(input.value);
    let shown = 0;
    cards.forEach((c) => {
      const ok = !q || c._s.includes(q);
      c.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach((g) => (g.hidden = !g.querySelector(".p-card:not([hidden])")));
    brands.forEach((b) => (b.hidden = !b.querySelector(".p-card:not([hidden])")));

    if (!q) info.textContent = "";
    else if (shown) info.textContent = `لقينا ${shown} صنف`;
    else info.innerHTML = 'مش لاقيين الصنف ده هنا، <a href="https://wa.me/201130151717" target="_blank" rel="noopener">ابعتلنا رقمه على واتساب</a> ونشوفهولك.';
  }
});
