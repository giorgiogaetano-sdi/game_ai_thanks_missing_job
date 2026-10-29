# Lavorare insieme

## Flusso Git

1. Aggiorna `main` con `git pull --ff-only` e crea un branch, per esempio `git switch -c feat/nuovo-livello`.
2. Concorda l'ambito con i colleghi per limitare modifiche contemporanee agli stessi file.
3. Implementa una modifica coerente; aggiorna test e documentazione interessata.
4. Aggiungi una nuova voce in `CHANGELOG.md` per ogni commit, anche per documentazione, correzioni e revert.
5. Esegui `node tests/tests.cjs` e le verifiche visive pertinenti.
6. Prepara i file esplicitamente, includendo il changelog, e crea il commit.
7. Esegui il push del branch e apri una pull/merge request con problema, risultato, verifiche e voci del changelog incluse nel push.
8. Richiedi la revisione di un collega prima dell'integrazione in `main`.

## Changelog obbligatorio

Ogni commit di lavoro deve aggiungere una voce sotto `Non rilasciato`, con data, tipo, descrizione e verifiche. Non limitarti a cambiare la data o il testo di una vecchia voce. Usa titoli distintivi: non inserire l'hash del commit che stai creando, perché non esiste ancora.

```md
### AAAA-MM-GG — Descrizione breve
- Tipo: aggiunta / correzione / riorganizzazione / documentazione.
- Modifica: comportamento o file interessati e motivo.
- Verifica: comando e risultato; indica esplicitamente le verifiche non eseguite.
```

Ogni push deve contenere il changelog dei commit inviati. Nel riepilogo della pull/merge request riporta le relative voci e gli eventuali limiti conosciuti. Un push senza nuovi commit non richiede una nuova voce. I merge tecnici sono esenti: le modifiche integrate devono già avere il proprio changelog. Se fai squash, conserva tutte le voci utili.

## Attivare i controlli

```sh
git config core.hooksPath .githooks
```

`pre-commit` richiede un'aggiunta nel changelog preparato per il commit. `pre-push` controlla che ciascun nuovo commit non di merge modifichi il changelog aggiungendo testo. Gli hook sono controlli locali, disattivabili: non possono garantire da soli una policy del server né la qualità del testo. Non usare `--no-verify` per aggirarli. Per un vincolo condiviso configura anche controlli CI e protezione di `main` sulla piattaforma scelta.

Alla prima aggiunta degli hook al repository, conserva il permesso di esecuzione per i colleghi su Linux/macOS:

```sh
git add .githooks/pre-commit .githooks/pre-push
git update-index --chmod=+x .githooks/pre-commit .githooks/pre-push
```

Al primo push di un nuovo branch il controllo esamina tutta la sua storia non di merge. Per importare un repository preesistente senza changelog storico, occorre concordare prima una baseline e adeguare il controllo; questo progetto parte con il changelog dal primo commit.

## Convenzioni

Mantieni la separazione tra simulazione, regole e browser. Preferisci modifiche piccole, nomi chiari e commenti che spiegano le scelte. Non introdurre dipendenze o una compilazione senza discuterne l'impatto sull'avvio offline. Non committare credenziali, file personali o output temporanei.

Il repository GitHub viene pubblicato per usare GitHub Pages sul piano gratuito. La visibilità pubblica permette lettura e fork; la scrittura resta limitata ai collaboratori autorizzati.

## Protezione di main su GitHub

Il proprietario configura una regola attiva per `main` da Settings → Rules → Rulesets (oppure Branches → branch protection):

- Richiedere una pull request prima del merge e almeno un'approvazione di un collega.
- Richiedere il controllo `Test e changelog` del workflow `Controlli pull request`.
- Richiedere la risoluzione delle conversazioni.
- Bloccare force push ed eliminazione del branch.
- Applicare la regola anche agli amministratori, senza bypass ordinari.

Il workflow controlla test e changelog dei commit della pull request. Per scegliere il controllo come obbligatorio potrebbe essere necessario eseguire prima una pull request. I file locali non attivano da soli la protezione: la regola deve essere salvata nelle impostazioni GitHub.

L'autore non può approvare la propria pull request: invita almeno un collega con i permessi necessari. La pubblicazione Pages parte soltanto dopo il merge su `main`.
