# Istruzioni per chi modifica il progetto

Leggi `CONTRIBUTING.md` e la guida in `docs/` relativa all'ambito prima di intervenire.

- Mantieni l'avvio offline aprendo `index.html` e la separazione tra simulazione, regole e interfaccia.
- Per ogni commit aggiungi una voce distinta a `CHANGELOG.md`, includendo modifica, motivo e verifiche. Vale anche per documentazione e correzioni.
- Prima di ogni push controlla che tutti i commit di lavoro inviati abbiano il changelog e fornisci un riepilogo delle voci e delle verifiche al destinatario della consegna.
- Esegui `node tests/tests.cjs` quando modifichi il codice. Per il rendering verifica anche il browser.
- Se un controllo non è eseguibile, dichiaralo nel changelog e nella consegna senza presentarlo come superato.
- Non creare commit o push se non richiesti dall'utente. L'obbligo del changelog non costituisce autorizzazione a pubblicare.
