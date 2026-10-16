# Regole, livelli e AI

## Responsabilità

`src/day.js` espone `OfficeDay` e usa `OfficeSim`. Gestisce stato della giornata, fasi, produttività, interazioni, livelli, NPC, navigazione ed eventi. Rimane indipendente da DOM e Canvas.

## Come intervenire

- Per il bilanciamento, parti dalle configurazioni esistenti e descrivi l'effetto atteso sul gioco.
- Per una nuova regola, definisci stato iniziale, condizioni di attivazione, aggiornamento, annullamento e reset al livello successivo.
- Gestisci esplicitamente le interazioni con pranzo, call, conversazioni, scadenza e uscita.
- Per gli NPC, verifica destinazione, percorso, attese e uscita; evita percorsi che attraversano gli ostacoli.
- Usa il generatore casuale passato alla simulazione per mantenere verificabili gli scenari.
- Esponi lo stato necessario al rendering; evita di disegnare o leggere tasti in questo modulo.

## Prima del commit

Aggiungi regressioni per i comportamenti nuovi e i casi limite. Esegui la suite, prova una giornata nel browser e aggiorna `gameplay.md` e `CHANGELOG.md`. Se il file cresce, separa un sottosistema con un intervento dedicato, preservando il contratto pubblico.
