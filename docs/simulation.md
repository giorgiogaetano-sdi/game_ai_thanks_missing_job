# Simulazione e mappa

## Responsabilità

`src/simulation.js` espone `OfficeSim`: mondo, oggetti, ostacoli, creazione del player, collisioni e movimento. Non accede a DOM, Canvas o input hardware. `step` riceve comandi e tempo trascorso; il browser traduce i tasti in quei comandi.

## Come intervenire

- Per cambiare la mappa, aggiorna oggetti e ostacoli insieme. Controlla spawn, porta, passaggi e accessibilità delle postazioni.
- Mantieni coordinate e ingombri coerenti con rendering, destinazioni e navigazione in `day.js`.
- Per cambiare velocità o collisioni, verifica movimento diagonale, corsa, bordi e attraversamento degli ostacoli con passi temporali diversi.
- Conserva l'interfaccia `OfficeSim` oppure aggiorna tutti i chiamanti e i test nello stesso intervento.

## Prima del commit

Esegui la suite e attraversa la mappa nel browser. Documenta effetti sulle regole in `gameplay.md`, aggiorna il changelog e segnala ai colleghi eventuali nuove coordinate condivise.
