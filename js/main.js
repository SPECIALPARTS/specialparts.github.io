// =========================================
// سبيشيال بارتس - ملف الجافاسكريبت الرئيسي
// =========================================

// ----- تتبّع Meta Pixel (بيشتغل بس لو رقم البكسل متحط في index.html) -----
function trackPixel(eventName, params) {
  if (typeof window.fbq === "function") window.fbq("track", eventName, params || {});
}

document.addEventListener("DOMContentLoaded", () => {
  // ضغطة على أي زرار واتساب أو رقم تليفون = تواصل (Contact)
  document.querySelectorAll('a[href*="wa.me"]').forEach((a) =>
    a.addEventListener("click", () => trackPixel("Contact", { method: "whatsapp" }))
  );
  document.querySelectorAll('a[href^="tel:"]').forEach((a) =>
    a.addEventListener("click", () => trackPixel("Contact", { method: "phone" }))
  );

  // ----- رسالة ترحيب جنب زرار الواتساب (بتظهر مرة واحدة في الزيارة) -----
  const bubble = document.getElementById("waBubble");
  const bubbleClose = document.getElementById("waBubbleClose");
  if (bubble) {
    let seen = false;
    try { seen = sessionStorage.getItem("waBubbleSeen") === "1"; } catch (e) {}
    const hide = () => {
      bubble.classList.remove("show");
      try { sessionStorage.setItem("waBubbleSeen", "1"); } catch (e) {}
    };
    if (!seen) {
      setTimeout(() => bubble.classList.add("show"), 4000);
      setTimeout(hide, 16000);
    }
    if (bubbleClose) bubbleClose.addEventListener("click", hide);
  }

  // ----- مفتوح دلوقتي ولا مقفول (بتوقيت القاهرة) -----
  // المواعيد: السبت – الخميس من 10 الصبح لـ 6 المغرب، الجمعة إجازة
  const statusEl = document.getElementById("openStatus");
  if (statusEl) {
    const OPEN_HOUR = 10, CLOSE_HOUR = 18;
    const updateStatus = () => {
      let day, hour;
      try {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: "Africa/Cairo", weekday: "short", hour: "numeric", hour12: false,
        }).formatToParts(new Date());
        day = parts.find((p) => p.type === "weekday").value;   // Sat, Sun, ... Fri
        hour = parseInt(parts.find((p) => p.type === "hour").value, 10) % 24;
      } catch (e) { return; }
      const isFriday = day === "Fri";
      const open = !isFriday && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
      statusEl.className = "open-status " + (open ? "is-open" : "is-closed");
      if (open) {
        statusEl.textContent = "مفتوح الآن · حتى 6 مساءً";
      } else if (isFriday || (day === "Thu" && hour >= CLOSE_HOUR)) {
        statusEl.textContent = "مغلق الآن · نفتح السبت 10 صباحًا – اترك رسالة على واتساب";
      } else if (hour < OPEN_HOUR) {
        statusEl.textContent = "مغلق الآن · نفتح اليوم 10 صباحًا";
      } else {
        statusEl.textContent = "مغلق الآن · نفتح غدًا 10 صباحًا – اترك رسالة على واتساب";
      }
    };
    updateStatus();
    setInterval(updateStatus, 60000);
  }

  // ----- قائمة الموبايل -----
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });

    // إغلاق القائمة عند الضغط على أي رابط
    nav.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // ----- سنة حقوق النشر تلقائيًا -----
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ----- تمييز رابط القسم الظاهر في القائمة -----
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = [...navLinks]
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }


  // ----- قايمة الأصناف والكمية في نموذج الطلب -----
  // كل الأصناف ظاهرة حسب الماركة، والعميل يكتب الكمية قدام اللي محتاجه.
  const ITEMS = window.SP_ITEMS || [];
  const qtys = {};           // رقم الصنف -> الكمية
  let curBrand = "SAMPIYON";
  const pList = document.getElementById("pickList");
  const pSearch = document.getElementById("pickSearch");
  const pSummary = document.getElementById("pickSummary");
  const tabs = [...document.querySelectorAll(".brand-tab")];
  const normAr = (t) => (t || "").toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, "");

  function picked() {
    return Object.keys(qtys).filter((k) => qtys[k] > 0).map((k) => ({ it: ITEMS[k], qty: qtys[k] }));
  }
  function updateSummary() {
    const list = picked();
    const pieces = list.reduce((a, p) => a + p.qty, 0);
    pSummary.className = "pick-summary" + (list.length ? " ok" : "");
    pSummary.textContent = list.length
      ? `اخترت ${list.length} صنف (${pieces} قطعة)`
      : "اكتب الكمية قدام الأصناف اللي محتاجها.";
    const box = document.getElementById("orderBox"), ol = document.getElementById("orderList");
    if (box) {
      box.hidden = !list.length; ol.innerHTML = "";
      list.forEach((p) => {
        const li = document.createElement("li");
        const nm = document.createElement("bdi"); nm.dir = "rtl"; nm.textContent = `${p.it.b} – ${p.it.n}`;
        const cd = document.createElement("bdi"); cd.className = "oc"; cd.textContent = p.it.c || "";
        const qt = document.createElement("b"); qt.className = "oq"; qt.textContent = `الكمية: ${p.qty}`;
        li.append(nm, " ", cd, " ", qt);
        ol.appendChild(li);
      });
    }
    tabs.forEach((t) => {
      const n = list.filter((p) => p.it.b === t.dataset.brand).length;
      t.innerHTML = t.dataset.brand + (n ? ` <span class="cnt">${n}</span>` : "");
    });
  }
  function renderList() {
    if (!pList) return;
    const q = normAr(pSearch.value);
    pList.innerHTML = "";
    let lastGroup = null, count = 0;
    ITEMS.forEach((it, i) => {
      if (q) { if (!normAr(it.n + it.c + it.g + it.b).includes(q)) return; }
      else if (it.b !== curBrand) return;
      const grp = (q ? it.b + " – " : "") + (it.g || "أصناف");
      if (grp !== lastGroup) {
        const g = document.createElement("li"); g.className = "pg"; g.textContent = grp; pList.appendChild(g); lastGroup = grp;
      }
      const li = document.createElement("li");
      if (qtys[i] > 0) li.classList.add("has-qty");
      const txt = document.createElement("label"); txt.className = "pi-txt"; txt.htmlFor = "q" + i;
      txt.textContent = it.n;
      if (it.c) { const sm = document.createElement("small"); sm.textContent = it.c; txt.appendChild(sm); }
      const inp = document.createElement("input");
      inp.type = "number"; inp.min = "0"; inp.inputMode = "numeric"; inp.id = "q" + i; inp.placeholder = "0";
      if (qtys[i] > 0) inp.value = qtys[i];
      inp.addEventListener("input", () => {
        const v = parseInt(inp.value, 10);
        qtys[i] = v > 0 ? v : 0;
        li.classList.toggle("has-qty", qtys[i] > 0);
        document.getElementById("picker").classList.remove("invalid-box");
        updateSummary();
      });
      li.append(txt, inp); pList.appendChild(li); count++;
    });
    if (!count) {
      const e = document.createElement("li"); e.className = "pick-empty";
      e.textContent = "مفيش صنف بالاسم ده – اكتبه في الملاحظات تحت"; pList.appendChild(e);
    }
  }
  if (pList) {
    tabs.forEach((t) => t.addEventListener("click", () => {
      curBrand = t.dataset.brand; pSearch.value = "";
      tabs.forEach((x) => { x.classList.toggle("is-active", x === t); x.setAttribute("aria-selected", x === t); });
      renderList();
    }));
    pSearch.addEventListener("input", renderList);
    renderList(); updateSummary();
  }

  // ----- نموذج التواصل -----
  // النموذج يفتح واتساب على رقم الشركة والرسالة مكتوبة جاهزة.
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const WHATSAPP_NUMBER = "201130151717";

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const message = form.message.value.trim();

      // التحقق من الحقول المطلوبة
      form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
      const errors = [];
      if (!name) errors.push(form.name);
      if (!/^01[0125]\d{8}$/.test(phone.replace(/\s/g, ""))) errors.push(form.phone);
      const pickerBox = document.getElementById("picker");
      if (pickerBox) pickerBox.classList.remove("invalid-box");
      const chosen = pList ? picked() : [];
      if (!message && !chosen.length) {
        if (pickerBox) { pickerBox.classList.add("invalid-box"); errors.push(pSearch); }
        else errors.push(form.message);
      }

      if (errors.length) {
        errors.forEach((el) => el.classList.add("invalid"));
        errors[0].focus();
        status.className = "form-status error";
        status.textContent = "من فضلك اكتب الاسم ورقم موبايل صحيح (11 رقم)، واختار صنف واحد على الأقل أو اكتب استفسارك.";
        return;
      }

      const text =
        `*${form.type.value}* - من موقع سبيشيال بارتس\n` +
        `الاسم: ${name}\n` +
        `الموبايل: ${phone}\n` +
        `المحافظة: ${form.city.value || "غير محدد"}\n` +
        (form.address && form.address.value.trim() ? `العنوان: ${form.address.value.trim()}\n` : "") + "\n" +
        (chosen.length
          ? "*الأصناف المطلوبة:*\n" + chosen.map((p, i) => `${i + 1}) ${p.it.b} – ${p.it.n}${p.it.c ? " (" + p.it.c + ")" : ""} — الكمية: ${p.qty}`).join("\n") + "\n\n"
          : "") +
        (message ? `ملاحظات: ${message}` : "");

      // إرسال طلب من النموذج = عميل محتمل (Lead)
      trackPixel("Lead", { content_name: form.type.value });

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");

      status.className = "form-status success";
      status.textContent = "تمام! اتفتح واتساب ورسالتك جاهزة، دوس إرسال من هناك.";
      form.reset();
      Object.keys(qtys).forEach((k) => delete qtys[k]); if (pList) { renderList(); updateSummary(); }
    });
  }
});
