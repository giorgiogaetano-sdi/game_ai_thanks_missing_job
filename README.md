# AI Thanks Missing Job

Gioco 2D per browser, senza dipendenze, utilizzabile offline.

## Avvio

Clona il repository e apri `index.html` nel browser. Non serve una compilazione.
Per contribuire servono Git e Node.js 22 o successivo.

```sh
git config core.hooksPath .githooks
node tests/tests.cjs
```

Il comando di configurazione va eseguito in ogni clone. Gli hook richiedono Node.js nel PATH oppure il runtime portatile locale.

Su Windows x64 puoi usare anche [Node.js portatile locale](docs/tooling.md), senza installarlo nel sistema: esegui `scripts/setup-node.ps1`, poi `scripts/test.cmd`. Gli hook riconoscono automaticamente il runtime locale.

## Orientamento

| Ambito | Sorgente | Guida |
| --- | --- | --- |
| Mappa, collisioni e movimento | `src/simulation.js` | [Simulazione](docs/simulation.md) |
| Giornata, livelli e NPC | `src/day.js` | [Regole e AI](docs/rules-ai.md) |
| Disegno, input e interfaccia | `src/game.js`, `index.html`, `styles/style.css` | [Interfaccia](docs/interface.md) |
| Verifica | `tests/tests.cjs` | [Test](docs/testing.md) |
| Collaborazione e pubblicazione | Git | [Contribuire](CONTRIBUTING.md) |

[Regole del gioco](docs/gameplay.md) · [Changelog](CHANGELOG.md)

[Pubblicazione web con GitHub Pages](docs/publishing.md): test e deploy automatici a ogni push su `main`, dopo l'attivazione di Pages nel repository.

Gli script vengono caricati nell'ordine simulation → day → game. Mantieni l'avvio tramite file locale e la simulazione indipendente dal DOM.
