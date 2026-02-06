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

  // Free hugs: zmiana obrazka na 1 sekundę po kliknięciu
  const hugImg = document.getElementById("hugImg");
  const hugBtn = document.getElementById("hugBtn");
  if (hugImg && hugBtn) {
    const img1 = "hug1.jpg";
    const img2 = "hug2.jpg";

    let busy = false;
    hugBtn.addEventListener("click", () => {
      if (busy) return;
      busy = true;

      const prev = hugImg.getAttribute("src") || img1;
      hugImg.setAttribute("src", img2);

      window.setTimeout(() => {
        hugImg.setAttribute("src", prev === img2 ? img1 : img1);
        busy = false;
      }, 1000);
    });
  }
})();
