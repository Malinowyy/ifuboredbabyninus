// terminal.js
(function () {
  const out = document.getElementById("terminalText");
  const input = document.getElementById("terminalInput");
  const caret = document.getElementById("caret");
  const promptRow = document.getElementById("promptRow");
  const terminalBody = document.getElementById("terminalBody");

  const normalCounterEl = document.getElementById("normalCounter");
  const superCounterEl = document.getElementById("superCounter");
  const tableBody = document.getElementById("foundTableBody");

  if (!out || !input || !caret || !promptRow || !terminalBody || !normalCounterEl || !superCounterEl || !tableBody) {
    return;
  }

  // =========================
  // 1) KONFIG: HASŁA + TEKSTY
  // =========================
  // Wpisz tu swoje hasła (klucze) i odpowiedzi (value).
  // Klucze są case-insensitive (normalizujemy).
  const NORMAL_COMMANDS = {
    "haslo1":  "TU wpiszesz wiadomość dla haslo1\n(każde hasło ma swój custom output)\n",
    "haslo2":  "TU wpiszesz wiadomość dla haslo2\n",
    "haslo3":  "...\n",
    "haslo4":  "...\n",
    "haslo5":  "...\n",
    "haslo6":  "...\n",
    "haslo7":  "...\n",
    "haslo8":  "...\n",
    "haslo9":  "...\n",
    "haslo10": "...\n",
    "haslo11": "...\n",
    "haslo12": "...\n",
    "haslo13": "...\n",
    "haslo14": "...\n",
  };

  const SUPER_COMMANDS = {
    "super1": "SUPER WIADOMOŚĆ 1 — wpisz swoją\n",
    "super2": "SUPER WIADOMOŚĆ 2 — wpisz swoją\n",
  };

  const NORMAL_TOTAL = 14;
  const SUPER_TOTAL = 2;

  // =========================
  // 2) STARTOWY TEKST (TYPING)
  // =========================
  const bootLines = [
    "C:\\Users\\misiu> uruchom_historia.exe",
    "",
    "[OK] Ładowanie wspomnień...",
    "[OK] Synchronizacja spojrzeń...",
    "[OK] Sprawdzanie czy to przypadek czy przeznaczenie...",
    "",
    "=> A potem nagle: hello.",
    "=> I jakoś już zostało.",
    "",
  ];
  const bootText = bootLines.join("\n");

  // =========================
  // 3) DŹWIĘK PISANIA (WebAudio)
  // =========================
  let audioCtx = null;
  const ensureAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  };

  const clickSound = () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";

    // lekki “klik” jak klawiatura: krótkie, ciche, z minimalną losowością
    const f = 850 + Math.random() * 250;
    osc.frequency.setValueAtTime(f, t);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.03, t + 0.005);
    gain.gain.linearRampToValueAtTime(0.0, t + 0.035);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  };

  // =========================
  // 4) TABELA 16x2 + “SZYFROWANIE”
  // =========================
  const TABLE_ROWS = 16;
  const ENC_LEN = 7;
  const ENC_INTERVAL_MS = 400;
  const ENC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";

  const tableRows = []; // { tr, leftTd, rightTd, intervalId, locked }
  const usedCommands = new Set(); // żeby nie nabijać 2x
  const usedNormals = new Set();
  const usedSupers = new Set();

  const randEnc = () => {
    let s = "";
    for (let i = 0; i < ENC_LEN; i += 1) {
      s += ENC_CHARS[Math.floor(Math.random() * ENC_CHARS.length)];
    }
    return s;
  };

  const createRow = () => {
    const tr = document.createElement("tr");

    const tdLeft = document.createElement("td");
    tdLeft.className = "cell-enc";
    tdLeft.textContent = randEnc();

    const tdRight = document.createElement("td");
    tdRight.className = "cell-status cell-notfound";
    tdRight.textContent = "not found.";

    tr.appendChild(tdLeft);
    tr.appendChild(tdRight);

    tableBody.appendChild(tr);

    const rowObj = {
      tr,
      leftTd: tdLeft,
      rightTd: tdRight,
      locked: false,
      intervalId: window.setInterval(() => {
        if (!rowObj.locked) {
          rowObj.leftTd.textContent = randEnc();
        }
      }, ENC_INTERVAL_MS),
    };

    tableRows.push(rowObj);
  };

  for (let i = 0; i < TABLE_ROWS; i += 1) createRow();

  const lockNextRowAsFound = (commandText) => {
    // znajdź pierwszy “niezablokowany” wiersz
    const rowObj = tableRows.find(r => !r.locked);
    if (!rowObj) return;

    rowObj.locked = true;
    rowObj.leftTd.textContent = commandText;
    rowObj.leftTd.classList.remove("cell-enc");
    rowObj.leftTd.classList.add("cell-found");

    rowObj.rightTd.textContent = "FOUND!";
    rowObj.rightTd.classList.remove("cell-notfound");
    rowObj.rightTd.classList.add("cell-found");
  };

  // =========================
  // 5) LICZNIKI
  // =========================
  const updateCounters = () => {
    normalCounterEl.textContent = `Inside joke ${usedNormals.size}/${NORMAL_TOTAL}`;
    superCounterEl.textContent = `Super inside joke ${usedSupers.size}/${SUPER_TOTAL}`;
  };
  updateCounters();

  // =========================
  // 6) TERMINAL PRINT HELPERS
  // =========================
  const scrollToBottom = () => {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  };

  const appendLine = (text) => {
    out.textContent += text;
    scrollToBottom();
  };

  const printTyping = (text, speedMs, withSound, done) => {
    let i = 0;

    const step = () => {
      if (i >= text.length) {
        done && done();
        return;
      }

      const ch = text[i];
      appendLine(ch);

      // dźwięk tylko dla “sensownych” znaków
      if (withSound && ch !== "\n" && ch !== "\r" && ch !== " ") {
        clickSound();
      }

      i += 1;

      // mikro-losowość tempa, żeby było żywsze
      const jitter = Math.floor(Math.random() * 12);
      window.setTimeout(step, speedMs + jitter);
    };

    step();
  };

  const setInputEnabled = (enabled) => {
    promptRow.style.display = enabled ? "flex" : "none";
    input.disabled = !enabled;
    if (enabled) {
      input.value = "";
      input.focus();
    }
  };

  // =========================
  // 7) CMD RESPONSES
  // =========================
  const normalize = (s) => s.trim().toLowerCase();

  const cmdNotFound = (raw) => {
    // klasyczny vibe CMD
    return `'${raw}' is not recognized as an internal or external command,\noperable program or batch file.\n\n`;
  };

  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    const key = normalize(trimmed);

    // wyświetl “co user wpisał” w historii (jak cmd)
    appendLine(`Waiting for Misia: ${trimmed}\n`);

    if (key.length === 0) {
      appendLine("\n");
      return;
    }

    // trafienia tylko raz per hasło (żeby liczniki i tabela się zgadzały)
    if (Object.prototype.hasOwnProperty.call(NORMAL_COMMANDS, key)) {
      if (!usedCommands.has(key)) {
        usedCommands.add(key);
        usedNormals.add(key);
        lockNextRowAsFound(trimmed);
        updateCounters();
      }
      appendLine("\n");
      // tu wypisujemy custom wiadomość (Twoja)
      appendLine(NORMAL_COMMANDS[key]);
      appendLine("\n");
      return;
    }

    if (Object.prototype.hasOwnProperty.call(SUPER_COMMANDS, key)) {
      if (!usedCommands.has(key)) {
        usedCommands.add(key);
        usedSupers.add(key);
        lockNextRowAsFound(trimmed);
        updateCounters();
      }
      appendLine("\n");
      appendLine(SUPER_COMMANDS[key]);
      appendLine("\n");
      return;
    }

    // default: not found
    appendLine("\n");
    appendLine(cmdNotFound(trimmed));
  };

  // =========================
  // 8) START: wypisz boot tekst, potem włącz input
  // =========================
  setInputEnabled(false);

  // audio “odblokuje” się dopiero po interakcji usera; pierwszy klik w terminal to wystarczy
  terminalBody.addEventListener("pointerdown", () => ensureAudio(), { once: false });

  // Wypisywanie bootu
  ensureAudio(); // spróbuj, ale i tak może być suspended do interakcji
  printTyping(bootText, 22, true, () => {
    appendLine("\n");
    setInputEnabled(true);
    scrollToBottom();

    // po wpisaniu tekstu: „Waiting for Misia:” ma być widoczne
    // (promptRow już to pokazuje)
  });

  // =========================
  // 9) INPUT: Enter wysyła komendę
  // =========================
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = input.value;

      // zablokuj wpisywanie w trakcie odpowiedzi
      setInputEnabled(false);

      // odpowiedź cmd natychmiast (bez typing), ale możemy dodać typing później
      handleCommand(raw);

      // wróć do promptu
      setInputEnabled(true);
      scrollToBottom();
      return;
    }

    // mały click-sound podczas wpisywania (tylko gdy AudioContext działa)
    if (e.key.length === 1) {
      ensureAudio();
      clickSound();
    }
  });

  // klik w terminal body focusuje input
  terminalBody.addEventListener("pointerdown", () => {
    if (!input.disabled) input.focus();
  });

})();
