# Node.js portatile e strumenti locali

Il gioco funziona nel browser senza Node.js. Node.js serve soltanto per la suite e gli hook del changelog.

## Windows x64 senza installazione di sistema

Da PowerShell nella radice del progetto:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/setup-node.ps1
scripts\test.cmd
```

Il bootstrap scarica Node.js 24.22.0 dal sito ufficiale, verifica SHA256 contro `SHASUMS256.txt` prima di eseguirlo e conserva la licenza. Il runtime vive in `.tools/node/`, esclusa da Git. Non modifica il PATH o le installazioni del computer. Il primo download richiede rete; in seguito test e hook possono usare il runtime offline.

Gli hook preferiscono il runtime locale se presente, altrimenti usano `node` dal PATH. Per macOS, Linux e Windows ARM64 usa un'installazione Node.js compatibile e `node tests/tests.cjs`.

Per aggiornare la versione, modifica il valore fissato in `scripts/setup-node.ps1`, ripeti il bootstrap, esegui la suite e documenta l'aggiornamento nel changelog. La distribuzione ufficiale è descritta in https://nodejs.org/en/download/archive/v24.22.0.

## Primo collegamento GitHub

Con Git disponibile e il repository GitHub vuoto:

```powershell
C:\Work\claude\git\cmd\git.exe remote add origin https://github.com/giorgiogaetano-sdi/game_ai_thanks_missing_job.git
C:\Work\claude\git\cmd\git.exe config core.hooksPath .githooks
```

Se `origin` esiste già, verifica `git remote -v` prima di modificarlo. L'autenticazione GitHub avviene sul computer tramite il gestore credenziali; non inserire token nei file del progetto.
