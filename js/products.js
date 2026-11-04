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

// =========================================
// الكمية المطلوبة: زرار الواتساب مش بيتفعل غير بعد ما العميل يحدد الكمية
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".p-card a.p-wa").forEach((a) => {
    let base = "";
    try { base = new URL(a.href).searchParams.get("text") || ""; } catch (e) {}
    const phone = (a.href.match(/wa\.me\/(\d+)/) || [])[1] || "201130151717";

    const box = document.createElement("div");
    box.className = "p-qty";
    box.innerHTML =
      '<span class="p-qty-label">الكمية المطلوبة</span>' +
      '<div class="p-qty-ctrl">' +
      '<button type="button" class="p-qty-btn" data-d="1" aria-label="زوّد الكمية">+</button>' +
      '<input type="number" min="1" step="1" inputmode="numeric" placeholder="0" aria-label="الكمية المطلوبة">' +
      '<button type="button" class="p-qty-btn" data-d="-1" aria-label="قلّل الكمية">−</button>' +
      "</div>";
    a.before(box);
    const input = box.querySelector("input");
    box.addEventListener("animationend", () => box.classList.remove("p-qty-shake"));

    const update = () => {
      const n = parseInt(input.value, 10);
      const ok = Number.isFinite(n) && n > 0;
      a.classList.toggle("is-off", !ok);
      a.setAttribute("aria-disabled", ok ? "false" : "true");
      a.tabIndex = ok ? 0 : -1;
      a.textContent = ok ? `اطلب ${n} على واتساب` : "حدد الكمية الأول";
      a.href = `https://wa.me/${phone}?text=` + encodeURIComponent(ok ? `${base} - الكمية: ${n}` : base);
    };

    box.querySelectorAll(".p-qty-btn").forEach((b) =>
      b.addEventListener("click", () => {
        const n = (parseInt(input.value, 10) || 0) + Number(b.dataset.d);
        input.value = n > 0 ? n : "";
        update();
      })
    );
    input.addEventListener("input", () => {
      if (input.value !== "" && !/^\d+$/.test(input.value)) input.value = input.value.replace(/\D/g, "");
      update();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !a.classList.contains("is-off")) a.click();
    });

    // الضغط على الزرار وهو مقفول: نوجّه العميل لخانة الكمية بدل ما يفتح واتساب
    a.addEventListener("click", (e) => {
      if (a.classList.contains("is-off")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        box.classList.remove("p-qty-shake");
        void box.offsetWidth;
        box.classList.add("p-qty-shake");
        input.focus();
      }
    }, true);

    update();
  });
});
