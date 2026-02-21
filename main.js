// main.js

// Subtelna „klik animacja” też dla linków: dodaj klasę przy kliknięciu
document.addEventListener("click", (e) => {
  const el = e.target.closest(".btn, .topbar__homeBtn");
  if (!el) return;
  el.classList.add("btn--clicked");
  window.setTimeout(() => el.classList.remove("btn--clicked"), 140);
});

// Timer na stronie zegar.html (odliczanie od 29.09.2025 19:25)
(function () {
  const timeEl = document.getElementById("timeSince");
  if (!timeEl) return;

  const start = new Date(2025, 8, 29, 19, 25, 0);

  const pad2 = (n) => String(n).padStart(2, "0");

  // --- cookies ---
  const COOKIE_FMT = "timeFormat";
  const COOKIE_DAYS = 365;

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(String(value))}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = name + "=";
    const parts = document.cookie.split(";").map(s => s.trim());
    for (const p of parts) {
      if (p.startsWith(prefix)) return decodeURIComponent(p.substring(prefix.length));
    }
    return null;
  }

  // seconds|minutes|hours|days|weeks|months|years
  let fmt = getCookie(COOKIE_FMT) || "days";

  const fmtBtns = Array.from(document.querySelectorAll("[data-timefmt]"));
  const applyBtnState = () => {
    for (const b of fmtBtns) {
      const on = b.getAttribute("data-timefmt") === fmt;
      b.classList.toggle("btn--primary", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  };

  for (const b of fmtBtns) {
    b.addEventListener("click", () => {
      fmt = b.getAttribute("data-timefmt") || "days";
      setCookie(COOKIE_FMT, fmt, COOKIE_DAYS);
      applyBtnState();
      render();
    });
  }
  applyBtnState();

  // Liczymy lata+miesiące kalendarzowo (pełne jednostki), a resztę w ms.
  function breakdownCalendar(from, to) {
    // zakładamy from <= to
    let cursor = new Date(from.getTime());

    // full years
    let years = to.getFullYear() - cursor.getFullYear();
    let test = new Date(cursor.getTime());
    test.setFullYear(test.getFullYear() + years);
    if (test > to) years -= 1;
    cursor.setFullYear(cursor.getFullYear() + years);

    // full months
    let months = (to.getFullYear() - cursor.getFullYear()) * 12 + (to.getMonth() - cursor.getMonth());
    test = new Date(cursor.getTime());
    test.setMonth(test.getMonth() + months);
    if (test > to) months -= 1;
    cursor.setMonth(cursor.getMonth() + months);

    // remaining ms -> days/h/m/s
    let remMs = to.getTime() - cursor.getTime();
    const totalSeconds = Math.floor(remMs / 1000);

    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    return { years, months, days, hours, minutes, seconds };
  }

  function render() {
    const now = new Date();

    const isFuture = now.getTime() < start.getTime();
    const a = isFuture ? now : start;
    const b = isFuture ? start : now;

    const prefix = isFuture ? "Do tej chwili pozostało: " : "Minęło: ";

    // Zawsze mamy pełny rozkład kalendarzowy:
    const cal = breakdownCalendar(a, b);

    // Do tygodni potrzebujemy też totalDays z ms (nie kalendarzowe), bo tygodnie to „7 dni”
    const diffMs = Math.abs(b.getTime() - a.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const hhmmss = `${pad2(cal.hours)}:${pad2(cal.minutes)}:${pad2(cal.seconds)}`;

    if (fmt === "seconds") {
      // tylko sekundy (total)
      timeEl.textContent = `${prefix}${totalSeconds} sekund`;
      return;
    }

    if (fmt === "minutes") {
      // minuty + sekundy
      const m = totalMinutes;
      const s = totalSeconds % 60;
      timeEl.textContent = `${prefix}${m} minut ${s} sekund`;
      return;
    }

    if (fmt === "hours") {
      // godziny + minuty + sekundy
      const h = totalHours;
      const m = totalMinutes % 60;
      const s = totalSeconds % 60;
      timeEl.textContent = `${prefix}${h} godzin ${m} minut ${s} sekund`;
      return;
    }

    if (fmt === "days") {
      // dni + hh:mm:ss
      timeEl.textContent = `${prefix}${totalDays} dni ${hhmmss}`;
      return;
    }

    if (fmt === "weeks") {
      // tygodnie + dni + hh:mm:ss
      const weeks = Math.floor(totalDays / 7);
      const daysLeft = totalDays % 7;
      timeEl.textContent = `${prefix}${weeks} tygodni ${daysLeft} dni ${hhmmss}`;
      return;
    }

    if (fmt === "months") {
      // miesiące (kalendarzowo) + dni + hh:mm:ss (bez tygodni)
      const totalMonths = cal.years * 12 + cal.months;
      timeEl.textContent = `${prefix}${totalMonths} miesięcy ${cal.days} dni ${hhmmss}`;
      return;
    }

    if (fmt === "years") {
      // lata + miesiące + dni + hh:mm:ss
      timeEl.textContent = `${prefix}${cal.years} lat ${cal.months} miesięcy ${cal.days} dni ${hhmmss}`;
      return;
    }

    // fallback
    timeEl.textContent = `${prefix}${totalDays} dni ${hhmmss}`;
  }

  render();
  window.setInterval(render, 250);
})();

// Free hugs: hug.mp4, restart na KAŻDY klik, licznik od razu (cookies) + reset
(function () {
  const vid = document.getElementById("hugVid");
  const btn = document.getElementById("hugPlayBtn");
  const counterEl = document.getElementById("hugCount");
  const resetBtn = document.getElementById("hugResetBtn");
  if (!vid || !btn || !counterEl) return;

  const VIDEO_SRC = "hug.mp4";
  const COOKIE_KEY = "hugCount";
  const COOKIE_DAYS = 365;

  // --- cookies helpers ---
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(String(value))}; ${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = name + "=";
    const parts = document.cookie.split(";").map(s => s.trim());
    for (const p of parts) {
      if (p.startsWith(prefix)) return decodeURIComponent(p.substring(prefix.length));
    }
    return null;
  }

  function readHugsFromCookie() {
    const raw = getCookie(COOKIE_KEY);
    const n = parseInt(raw || "0", 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  // --- video setup ---
  vid.muted = true;
  vid.loop = false;
  vid.playsInline = true;
  vid.preload = "auto";
  vid.controls = false;

  if (!vid.querySelector("source")) {
    const src = document.createElement("source");
    src.src = VIDEO_SRC;
    src.type = "video/mp4";
    vid.appendChild(src);
  }

  let hugs = readHugsFromCookie();
  counterEl.textContent = String(hugs);

  const freezeToStart = () => {
    vid.pause();
    try { vid.currentTime = 0; } catch (_) {}
  };

  vid.addEventListener("loadedmetadata", () => {
    freezeToStart();
  });

  // Po end i tak zamrażamy na początku (ale NIE wpływa to na licznik)
  vid.addEventListener("ended", () => {
    freezeToStart();
  });

  btn.addEventListener("click", async () => {
    // 1) licznik od razu (spam = spam)
    hugs += 1;
    counterEl.textContent = String(hugs);
    setCookie(COOKIE_KEY, hugs, COOKIE_DAYS);

    // 2) reset i start filmu od nowa na KAŻDY klik
    try {
      vid.pause();

      // na niektórych przeglądarkach bezpieczniej: mały "reflow" resetu
      // ale zwykle wystarczy:
      vid.currentTime = 0;

      await vid.play();
    } catch (_) {
      // jeśli autoplay/play failnie, licznik i tak zostaje (bo klik jest gestem, powinno przejść)
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      hugs = 0;
      counterEl.textContent = "0";
      setCookie(COOKIE_KEY, 0, COOKIE_DAYS);
      freezeToStart();
    });
  }

  freezeToStart();
})();
