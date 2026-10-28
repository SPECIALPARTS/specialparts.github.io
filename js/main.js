// =========================================
// سبشيال بارتس - ملف الجافاسكريبت الرئيسي
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
      if (!message) errors.push(form.message);

      if (errors.length) {
        errors.forEach((el) => el.classList.add("invalid"));
        errors[0].focus();
        status.className = "form-status error";
        status.textContent = "من فضلك اكتب الاسم ورقم موبايل صحيح (11 رقم) والرسالة.";
        return;
      }

      const text =
        `*${form.type.value}* - من موقع سبشيال بارتس\n` +
        `الاسم: ${name}\n` +
        `الموبايل: ${phone}\n` +
        `المحافظة: ${form.city.value || "غير محدد"}\n\n` +
        `${message}`;

      // إرسال طلب من النموذج = عميل محتمل (Lead)
      trackPixel("Lead", { content_name: form.type.value });

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");

      status.className = "form-status success";
      status.textContent = "تمام! اتفتح واتساب ورسالتك جاهزة، دوس إرسال من هناك.";
      form.reset();
    });
  }
});
