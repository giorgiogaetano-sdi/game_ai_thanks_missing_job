# Rendering, input e pagina

## Responsabilità

`src/game.js` traduce input, aggiorna la partita, disegna sul Canvas e aggiorna il DOM. `index.html` definisce la pagina; `styles/style.css` gestisce l'aspetto e l'adattamento alle dimensioni dello schermo.

## Come intervenire

- Mantieni le regole di gioco in `day.js`: il rendering legge lo stato e ne rappresenta gli effetti.
- Conserva l'ordine degli script in `index.html`: simulazione, giornata, interfaccia.
- Se cambi ID, pulsanti o selettori, aggiorna JavaScript, HTML, CSS e simulazioni del DOM nei test.
- Verifica tastiera e touch, focus del Canvas, testo leggibile, avvisi e pulsanti di riprova/progressione.
- Mantieni i percorsi relativi e l'avvio offline da `index.html`; non introdurre richieste di rete necessarie al gioco.

## Prima del commit

Esegui i test e controlla il browser a dimensioni desktop e mobile, includendo call, pranzo, avviso delle 17:40 e fine livello. Annota nel changelog cosa hai verificato e gli eventuali limiti; i test con Canvas simulato non verificano l'aspetto visivo.

## Schermata iniziale

All?apertura sono visibili titolo, obiettivo, regole base e Start. Simulazione e input di gioco restano sospesi fino all?attivazione di Start, che porta il focus sul Canvas. Riprova e livello successivo restano nella partita; ricaricare mostra nuovamente la schermata iniziale.
