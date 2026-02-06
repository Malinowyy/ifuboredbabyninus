// main.js
(function () {
  // Subtelna „klik animacja” też dla linków: dodaj klasę przy kliknięciu
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".btn");
    if (!el) return;
    el.classList.add("btn--clicked");
    window.setTimeout(() => el.classList.remove("btn--clicked"), 140);
  });

  // Zegar świata: licz od 29.09.2025 18:00 do teraz
  const timeEl = document.getElementById("timeSince");
  if (timeEl) {
    // Uwaga: to jest czas lokalny przeglądarki użytkownika
    const start = new Date(2025, 8, 29, 18, 0, 0); // miesiące 0-11, więc 8 = wrzesień

    const pad2 = (n) => String(n).padStart(2, "0");

    const render = () => {
      const now = new Date();
      let diffMs = now - start;

      // jeśli data w przyszłości, pokaż odliczanie "do" tej daty
      const isFuture = diffMs < 0;
      diffMs = Math.abs(diffMs);

      const totalSeconds = Math.floor(diffMs / 1000);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const totalHours = Math.floor(totalMinutes / 60);
      const hours = totalHours % 24;
      const days = Math.floor(totalHours / 24);

      const prefix = isFuture ? "Do tej chwili pozostało: " : "Minęło: ";
      timeEl.textContent = `${prefix}${days} dni ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    };

    render();
    window.setInterval(render, 250);
  }

  // Free hugs: odtwarzanie raz, powrót do pierwszej klatki, licznik uruchomień
(function () {
  const vid = document.getElementById("hugVid");
  const btn = document.getElementById("hugPlayBtn");
  const counterEl = document.getElementById("hugCount");
  if (!vid || !btn || !counterEl) return;

  const gifUrl = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTh3MDI5aHJqMmV3a2lxd3d4MWI4cDVvbzFkcXJ4NnJpaGFraXk5MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1JmGiBtqTuehfYxuy9/giphy.gif";

  // Giphy zazwyczaj ma MP4 pod tą samą ścieżką.
  const mp4Url = gifUrl.replace(/giphy\.gif$/, "giphy.mp4");

  // (Opcjonalnie) “poster” jako pierwsza klatka – często działa jako giphy_s.gif.
  // Jeśli nie zadziała, i tak ustawimy first frame przez currentTime=0 po załadowaniu metadanych.
  const stillUrl = gifUrl.replace(/giphy\.gif$/, "giphy_s.gif");

  // Ustaw źródło video
  vid.muted = true;
  vid.loop = false;
  vid.playsInline = true;
  vid.setAttribute("poster", stillUrl);

  const src = document.createElement("source");
  src.src = mp4Url;
  src.type = "video/mp4";
  vid.appendChild(src);

  let hugs = 0;
  let busy = false;

  const freezeToStart = () => {
    // “Zamrożenie” na pierwszej klatce
    vid.pause();
    try {
      vid.currentTime = 0;
    } catch (_) {
      // czasem blokuje przed metadata; wtedy dociśniemy po loadedmetadata
    }
  };

  vid.addEventListener("loadedmetadata", () => {
    // Upewnij się, że startujemy od 0 i stoimy
    try { vid.currentTime = 0; } catch (_) {}
    vid.pause();
  });

  vid.addEventListener("ended", () => {
    hugs += 1;
    counterEl.textContent = String(hugs);

    freezeToStart();
    busy = false;
    btn.disabled = false;
  });

  btn.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;

    // Odpal raz
    try {
      // Zawsze zaczynaj od początku
      try { vid.currentTime = 0; } catch (_) {}
      await vid.play();
    } catch (e) {
      // Jeśli autoplay/gesture problem, odblokuj UI
      busy = false;
      btn.disabled = false;
    }
  });

  // Dla pewności: na wejściu “zamróź”
  freezeToStart();
})();
