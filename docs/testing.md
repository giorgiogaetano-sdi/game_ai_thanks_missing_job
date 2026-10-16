# Test e verifica

## Suite automatica

Da radice del repository, con Node.js 22 o successivo:

```sh
node tests/tests.cjs
```

Non servono pacchetti esterni. La suite carica gli script di `src/` in contesti VM e simula DOM e Canvas dove necessario. Un'asserzione fallita deve essere risolta prima di integrare la modifica.

## Scrivere regressioni

Usa scenari deterministici e il generatore casuale controllato già usato nei test. Verifica risultati osservabili: lavoro residuo, fasi, posizioni, transizioni e disponibilità delle interazioni. Per un bug, riproduci la condizione che lo causava e verifica il risultato corretto. Evita asserzioni che copiano soltanto l'implementazione.

## Verifica manuale

Apri `index.html`, controlla la console e prova movimento, collisioni e interazioni interessate. Per modifiche all'interfaccia controlla anche touch, dimensioni ridotte, leggibilità, avvisi e fine livello. I test automatici non sostituiscono la verifica visiva.

## Consegna

Riporta nel changelog comando, esito e verifiche manuali svolte. Se un ambiente non consente una verifica, dichiaralo: non indicare come passato un controllo non eseguito. Nel riepilogo del push riprendi questi risultati.
