# Changelog

Ogni commit di lavoro aggiunge una voce; ogni push include le voci dei commit inviati. Vedi [CONTRIBUTING.md](CONTRIBUTING.md).

## Non rilasciato

### 2026-10-16 — Push con commit remoto non ancora scaricato
- Tipo: correzione.
- Modifica: il controllo pre-push verifica se il commit remoto esiste localmente; se manca, controlla tutta la storia locale senza costruire un intervallo Git non valido. Non forza il push né sovrascrive la storia remota.
- Verifica: `.tools/node/node.exe tests/check-changelog.cjs` superato per remoto noto, remoto assente, branch nuovo e changelog mancante. Nessuna modifica al gioco; suite di 41 test già superata nella revisione precedente.

### 2026-10-16 — Arrivo degli NPC alla destinazione esatta
- Tipo: correzione.
- Modifica: dopo l'ultimo punto della griglia gli NPC completano il breve tratto fino alla destinazione, mantenendo i controlli di collisione. Il collega che spinge alla porta ora esce dopo il panico invece di fermarsi prima della soglia.
- Verifica: `.tools/node/node.exe tests/tests.cjs` completato con tutti i 41 test superati, inclusa la regressione sulla sua uscita con arretrato. Bootstrap Node.js 24.22.0 completato dall'utente dopo la correzione della licenza. Verifica visiva nel browser non eseguita.

### 2026-10-16 — Correzione download licenza Node.js
- Tipo: correzione.
- Modifica: la licenza viene scaricata dal tag ufficiale Node.js su GitHub; il percorso nella directory dei binari restituiva HTTP 404 e interrompeva il bootstrap.
- Verifica: URL della licenza verificato online; esecuzione completa del bootstrap e suite ancora da completare.

### 2026-10-16 — Strumenti portatili per Windows
- Tipo: aggiunta.
- Modifica: bootstrap di Node.js 24.22.0 per Windows x64 con verifica SHA256 e licenza; runtime locale escluso da Git; comando test e hook compatibili con il runtime portatile.
- Verifica: revisione statica dei percorsi e dei comandi. Download fallito per proxy locale non raggiungibile; suite e hook non eseguiti. Commit e push non eseguiti: creazione di `.git/index.lock` e scrittura di `.git/config` negate dall'ambiente.

### 2026-10-16 — Preparazione alla collaborazione
- Tipo: riorganizzazione e documentazione.
- Modifica: separati sorgenti, stili e test; aggiunte guide per ambito e regole Git; aggiunti hook locali per richiedere il changelog a commit e push.
- Verifica: revisione dei percorsi; suite Node.js e hook Git non eseguiti in questo ambiente perché gli eseguibili non sono disponibili nel PATH. Verifica visiva nel browser da completare.
