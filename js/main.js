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


  // ----- اختيار الأصناف والكمية في نموذج الطلب -----
  const picked = []; // {label, code, qty}
  const pSearch = document.getElementById("pickSearch");
  const pBrand = document.getElementById("pickBrand");
  const pItem = document.getElementById("pickItem");
  const pQty = document.getElementById("pickQty");
  const pAdd = document.getElementById("pickAdd");
  const pList = document.getElementById("pickedList");
  const pEmpty = document.getElementById("pickedEmpty");
  const ITEMS = window.SP_ITEMS || [];
  const normAr = (t) => (t || "").toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, "");

  function fillItems() {
    if (!pItem) return;
    const q = normAr(pSearch.value), b = pBrand.value;
    pItem.innerHTML = "";
    const first = document.createElement("option");
    first.value = ""; pItem.appendChild(first);
    let count = 0; const groups = {};
    ITEMS.forEach((it, i) => {
      if (b && it.b !== b) return;
      if (q && !normAr(it.n + it.c + it.b + it.g).includes(q)) return;
      const key = it.b + " – " + (it.g || "أصناف");
      if (!groups[key]) { groups[key] = document.createElement("optgroup"); groups[key].label = key; pItem.appendChild(groups[key]); }
      const o = document.createElement("option");
      o.value = i; o.textContent = it.n + (it.c ? "  (" + it.c + ")" : "");
      groups[key].appendChild(o); count++;
    });
    first.textContent = count ? `اختار الصنف (${count} صنف)` : "مفيش صنف بالاسم ده – اكتبه في الملاحظات تحت";
  }

  function renderPicked() {
    pList.innerHTML = "";
    picked.forEach((p, idx) => {
      const li = document.createElement("li");
      const txt = document.createElement("span"); txt.className = "p-txt";
      txt.textContent = p.label;
      if (p.code) { const sm = document.createElement("small"); sm.textContent = p.code; txt.appendChild(sm); }
      const q = document.createElement("input");
      q.type = "number"; q.min = "1"; q.value = p.qty; q.setAttribute("aria-label", "الكمية");
      q.addEventListener("input", () => { p.qty = Math.max(1, parseInt(q.value, 10) || 1); });
      const del = document.createElement("button");
      del.type = "button"; del.className = "p-del"; del.textContent = "×"; del.setAttribute("aria-label", "شيل الصنف");
      del.addEventListener("click", () => { picked.splice(idx, 1); renderPicked(); });
      li.append(txt, q, del); pList.appendChild(li);
    });
    pEmpty.hidden = picked.length > 0;
  }

  if (pItem) {
    fillItems();
    pSearch.addEventListener("input", fillItems);
    pBrand.addEventListener("change", fillItems);
    pAdd.addEventListener("click", () => {
      const it = ITEMS[pItem.value];
      if (!it) { pItem.focus(); return; }
      const qty = Math.max(1, parseInt(pQty.value, 10) || 1);
      const existing = picked.find((p) => p.idx === Number(pItem.value));
      if (existing) existing.qty += qty;
      else picked.push({ idx: Number(pItem.value), label: it.b + " – " + it.n, code: it.c, qty });
      document.getElementById("picker").classList.remove("invalid-box");
      pQty.value = 1; pItem.value = ""; renderPicked();
    });
    renderPicked();
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
      if (!message && !picked.length) {
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
        `المحافظة: ${form.city.value || "غير محدد"}\n\n` +
        (picked.length
          ? "*الأصناف المطلوبة:*\n" + picked.map((p, i) => `${i + 1}) ${p.label}${p.code ? " (" + p.code + ")" : ""} — الكمية: ${p.qty}`).join("\n") + "\n\n"
          : "") +
        (message ? `ملاحظات: ${message}` : "");

      // إرسال طلب من النموذج = عميل محتمل (Lead)
      trackPixel("Lead", { content_name: form.type.value });

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");

      status.className = "form-status success";
      status.textContent = "تمام! اتفتح واتساب ورسالتك جاهزة، دوس إرسال من هناك.";
      form.reset();
      picked.length = 0; if (pItem) { fillItems(); renderPicked(); }
    });
  }
});
