# Giocare via web con GitHub Pages

Il repository attuale è su GitHub, non GitLab. Il workflow `.github/workflows/pages.yml` esegue entrambe le suite e pubblica il gioco soltanto se i test passano. Si avvia a ogni push su `main` oppure manualmente da Actions.

## Prima attivazione

1. Apri il repository GitHub e vai in Settings → Pages.
2. In Build and deployment scegli Source → GitHub Actions.
3. Carica il workflow con commit e push, includendo il changelog.
4. Segui la procedura in Actions → Test e pubblicazione gioco.
5. Dopo il successo apri il link fornito dal job deploy o da Settings → Pages e verifica avvio, movimento e interazione nel browser.

La scelta concordata è repository pubblico e GitHub Pages sul piano gratuito. Il proprietario imposta la visibilità in Settings → General → Danger Zone → Change repository visibility → Public. Le pull request continuano a essere disponibili; proteggi `main` come descritto in `CONTRIBUTING.md`.

Il cambio di visibilità è un'impostazione GitHub: aggiungere questo documento non rende pubblico il repository. Se in futuro il repository torna privato, Pages richiede un piano compatibile (Pro, Team o Enterprise).

La visibilità del sito è distinta da quella del repository: un sito Pages può essere pubblico anche quando il repository è privato. I file JavaScript inviati al browser sono scaricabili da chi può accedere al gioco. Per accesso riservato ai colleghi occorre verificare le opzioni disponibili nel piano o scegliere hosting con autenticazione.

L'indirizzo atteso per una pubblicazione standard è `https://giorgiogaetano-sdi.github.io/game_ai_thanks_missing_job/`; non è un link attivo finché il deploy non è completato. Fa fede l'URL restituito da GitHub.

## Contenuto pubblicato

Il pacchetto contiene `index.html`, `src/`, `styles/`, `LICENSE` e `.nojekyll`. Non contiene runtime Node.js, strumenti locali, test, configurazione Git o documentazione di lavoro. Node.js viene usato soltanto nella pipeline di verifica.

La pubblicazione conserva il gioco single player e l'avvio offline. Non aggiunge un server o il multiplayer.

## Riferimenti

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
