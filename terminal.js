overlay.classList.remove("hidden");

function typeAdminText(container, lines, done) {
  container.innerHTML = "";
  container.innerHTML = "<M4LINA> Widzę co próbujesz zrobić. \n Myślisz, że tak łatwo ci na to pozwolę? HAHAHAHAHAHAAH (laughs ominously) ";
let i = 0;

function nextLine() {
@@ -713,13 +713,13 @@ function showFinal() {

content.innerHTML = `
   <img src="photo_final.png">
    <p>Twoja wiadomosc tutaj</p>
    <button id="authorBtn">Wiadomosc od autora</button>
    <p>Co??? JAK CI SIE TO UDAŁO??? \n Ech... Zapomniałem że jesteśmy klonami. Wchodź zatem, zasłużyłaś.</p>
    <button id="authorBtn">Wiadomość od autora (koniec) </button>
 `;

document.getElementById("authorBtn").onclick = () => {
content.innerHTML = `
      <p>Tutaj twoja druga wiadomosc...</p>
      <p>Wow! Imponujące. Jestem ciekawy ile rzeczy musiałem ci podpowiedzieć hahah. Ale mam nadzieję, że ta gierka zapewniła ci trochę radości, trochę nostalgii i trochę cię zaciekawiła. Kocham cię! Do zobaczenia w pszyszłych projektach - Twój informatyk <3.\n.</p>
     <button id="resetAll">Resetuj</button>
   `;
