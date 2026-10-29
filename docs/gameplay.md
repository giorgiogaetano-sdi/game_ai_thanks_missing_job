
# AI Thanks Missing Job

Quando un disturbatore ti raggiunge, la barra avanza solo mentre sei nel raggio di conversazione. Puoi allontanarti: ti insegue alla sua velocità normale e al nuovo contatto la barra riprende dal progresso conservato. Durante il contatto non produci lavoro e non puoi completare l’uscita. Il pranzo non ferma gli inseguimenti. Vale anche per il collega urgente.

Gioco 2D dall’alto per browser, senza dipendenze e utilizzabile offline. Apri index.html con doppio clic; ricarica la pagina dopo gli aggiornamenti.

## Comandi e obiettivo
WASD/frecce: muoversi. Shift: correre. E: standup, lavoro, caffè, pranzo, continua/riprova a fine livello. Pulsanti touch disponibili.
Entra in ufficio, raggiungi il PC evidenziato e premi E. Dopo tre secondi di standup parte la giornata 09–18 con 480 minuti di lavoro. Al PC E avvia/interrompe il lavoro; muoversi lo interrompe. I colleghi vicini interrompono la produttività e possono delegare lavoro. La barra sotto ciascuno indica quanto manca alla delega. Vinci uscendo dalla porta in basso tra le 18 e le 18:30 con zero lavoro residuo.

## Campagna di cinque livelli
Ogni livello riparte dall’ingresso con una nuova giornata. Vittoria: Livello successivo / E. Sconfitta: Riprova livello / E. Il pulsante Riprova mantiene il livello corrente. Dopo la quinta vittoria puoi ricominciare la campagna. Il progresso resta nella pagina, senza salvataggio persistente.

| Livello | Nome | Colleghi normali massimi | Velocità NPC | Delega normale | Efficienza base |
| --- | --- | --- | --- | --- | --- |
| 1 | Primo giorno | 1 | 42 | 5–10 min | ×1,70 |
| 2 | Hai un attimo? | 2 | 54 | 15–25 min | ×1,55 |
| 3 | Tutto ASAP | 3 | 67 | 30–45 min | ×1,45 |
| 4 | Escalation | 4 | 80 | 50–75 min | ×1,35 |
| 5 | Venerdì di fuoco | 5 | 94 | 80–120 min | ×1,25 |

Il carico iniziale resta 8 ore. L’efficienza base rende il primo livello molto permissivo. Aumentano frequenza, velocità, pazienza e probabilità di nuove richieste; diminuisce il tempo di contatto necessario per delegare. I colleghi aggirano i mobili e non parlano attraverso le pareti.

## Tempo ed evento delle 17:40
La giornata scorre a 6 minuti di gioco per secondo reale: un’ora in 10 secondi, tre volte più veloce della versione precedente.
Alle 17:40 compare per quattro secondi un popup non bloccante. L’orologio rallenta a 0,25 minuti/secondo durante l’avviso, poi a 1 minuto/secondo fino alle 18. Il movimento resta a velocità normale. Una giornata dura circa 140 secondi, più ingresso e standup.

## Uscita entro le 18:30 e ESCALATION!
Alle 18 inizia la fase di uscita: 30 minuti di gioco corrispondono a 30 secondi reali di partita attiva. Un conto alla rovescia mostra il tempo rimasto e la porta viene evidenziata. Puoi ancora lavorare al PC per finire l’arretrato; i colleghi presenti possono ancora disturbare. Cammina fino alla soglia della porta in basso: la vittoria è automatica soltanto con lavoro residuo zero. Prima delle 18 la porta non conclude il livello.
Alle 18:30 perdi se sei ancora dentro, anche con zero arretrato. La schermata mostra una delle 33 motivazioni casuali: notte in ufficio, garage chiuso, arresto della security e altre 30 disavventure aziendali. La scadenza ha precedenza sull’uscita nello stesso istante. Il livello successivo si sblocca solo dopo essere usciti in tempo.

Entra un solo collega dell’ultimo secondo, anche se il limite ordinario è pieno. Giacca rossa, vignette spigolose e urla alternate: “Emergenza!!!”, “Urgente!!!”, “Aiuto!!!”, “È per ieri!!!”, “Bloccante!!!” e altre. Velocità crescente da 105 a 160 (il player corre a 190). Non rinuncia per timeout prima della delega; la sua richiesta vale ×1,5 rispetto alle deleghe del livello. Dopo la delega esce soddisfatto. Non vengono generati nuovi colleghi normali nel finale, ma quelli presenti restano.

## Pranzo e caffè
13–14: pausa rallentata a 1,5 minuti di gioco per secondo (40 secondi reali). Puoi continuare a lavorare al tuo PC oppure pranzare. I disturbatori continuano a raggiungere il destinatario e a delegare lavoro anche durante il pranzo, alla velocità normale e con la stessa frequenza di arrivo. Possono interrompere anche gli sviluppatori seduti a mangiare. E vicino al bordo inferiore del tavolo fa sedere; restare seduti cinque secondi completa il pranzo. Muoversi o alzarsi interrompe la preparazione. Se alle 14 non hai finito di mangiare, la produttività cala dello 0,25% per il resto della giornata (moltiplicatore 0,9975, combinato con il caffè). La penalità viene azzerata a ogni nuovo livello.
E davanti alla macchinetta: bonus ×1,5 sulla produttività base per 120 minuti di gioco. Nuova tazza dopo 30 minuti, rinnova senza sommare. Nessun lavoro viene eliminato istantaneamente.
Il personaggio beve per 1,6 secondi: solleva una tazzina fumante alla bocca e la abbassa. Puoi muoverti durante il sorso; le altre interazioni attendono la fine dell’animazione. Al PC il player alterna digitazione e mouse; quando si siede a pranzo compaiono piatto, bottiglia e posate e una barra mostra l’avanzamento del pasto.

## Struttura e verifica
src/simulation.js: mappa, movimento e collisioni. src/day.js: regole, livelli, AI, navigazione ed evento. src/game.js: input, rendering, interfaccia e progressione. index.html/styles/style.css: pagina.
Con Node.js disponibile, esegui node tests/tests.cjs per i test di simulazione e interfaccia con DOM/Canvas simulati. La verifica visiva richiede un browser reale.

## Multiplayer futuro
La simulazione è separata dal browser. Possibile evoluzione: modulo condiviso e server autorevole Node.js/Colyseus, comandi numerati, snapshot, interpolazione, previsione e riconciliazione. Il multiplayer richiede un backend; non è ancora implementato. Armi, potenziamenti e nuove mappe restano sviluppi successivi.


## Colleghi sviluppatori
Cinque sviluppatori entrano progressivamente fin dall’ingresso del player, anche prima dello standup, e raggiungono le cinque postazioni diverse dalla tua. Hanno magliette casual di cinque colori, assegnati casualmente a ogni livello; lavorano con animazioni di tastiera e mouse. Non inseguono il player e non delegano lavoro.
Ogni tanto uno va alla macchinetta, beve un caffè e torna al proprio PC; la macchinetta è condivisa in turni tra gli sviluppatori e resta utilizzabile dal player. A pranzo raggiungono cinque posti riservati sui due tavoli, lasciando libero il tuo, e mangiano. Alle 14 tornano alle loro postazioni; dalle 18 si dirigono verso l’uscita.

I disturbatori possono scegliere anche gli sviluppatori come destinatari, o fermarsi a parlare con quelli che incontrano lungo il percorso. Lo sviluppatore ascolta fino alla fine, riceve un arretrato personale e reagisce per 1,8 secondi con mani alla testa, tremolio e una nuvoletta «NOOO! +… MIN?!», poi riprende la propria routine. Il player mostra la stessa reazione quando riceve una delega. Gli incarichi dati ai colleghi non aumentano l’arretrato del player e le loro conversazioni non ne bloccano lavoro o uscita.

Quando sono disponibili sviluppatori, il 35% dei disturbatori normali viene dedicato esclusivamente a loro: può parlare con uno o più NPC distinti e poi uscire, ignorando il player anche se gli passa accanto. Se non restano sviluppatori disponibili, esce senza ripiegare sul player. Gli altri visitatori possono scegliere liberamente sviluppatori o player; dopo una delega a uno sviluppatore possono uscire, visitarne un altro oppure cercare il player. Il passaggio al player non è obbligatorio. Il collega urgente delle 17:40 continua a cercare il player.


## Delegare ai colleghi
Durante la giornata e la fase di uscita, avvicinati a uno sviluppatore e premi E (anche dal pulsante touch). Con lavoro residuo e senza una conversazione subita in corso, puoi provare a delegare. Il collega ha il 50% di probabilità di ascoltare: resta entro il raggio di conversazione per 2 secondi, seguendo la barra verde. A fine spiegazione trasferisci 60–180 minuti, limitati al tuo lavoro residuo, al suo arretrato personale. Allontanarti, premere di nuovo E o essere raggiunto da un disturbatore annulla il tentativo senza trasferire lavoro.
Chi rifiuta scappa per 4 secondi a velocità 250 (il player corre a 190), con cuffie e note musicali oppure saltellando con la scusa di una call. Poi riprende la routine. Per 10 secondi dal rifiuto o dalla delega completata non puoi riproporre lavoro allo stesso collega. La delega è disponibile anche a pranzo.

Dopo le 18, tentare di uscire con lavoro residuo scatena una spinta verso l’interno: per 1,2 secondi il player rotola in avanti o all’indietro, gira come una trottola oppure frena sulle ginocchia, con polvere e segni sul pavimento. Il collega che spinge resta alla porta senza vignetta durante la caduta. Solo al termine mostra una frase di panico per 2 secondi, poi esce dalla porta anche se resta lavoro. Non insegue il player né aggiunge arretrati; ai tentativi successivi la sequenza si ripete, riutilizzando il collega se è ancora presente. La scadenza delle 18:30 continua a scorrere durante la spinta.

Quando arriva una call obbligatoria, il monitor del tuo PC vibra e mostra una vignetta «DRIIIN! ♪» / «♪ PRONTOOO?» finché non partecipi.

## Call ed email confuse
Alle 10:30 e alle 15:30 il PC squilla per un massimo di 60 minuti di gioco. Durante lo squillo puoi muoverti, prendere caffe, pranzare e delegare, anche se la call arriva durante una spiegazione. E al PC risponde: la conversazione dura 6 secondi reali e richiede di restare seduti, poi assegna il normale lavoro della call.

Se non rispondi entro la scadenza, arriva un'email con oggetto casuale (URGENTE!, Funzionalita delle fate, Superbonifica totale e altri). Un avviso appare per 12 secondi reali. Ricevi comunque il lavoro e perdi 0,25 punti di efficienza base per ogni call ignorata, fino al prossimo livello; caffe e pranzo applicano i rispettivi moltiplicatori all'efficienza ridotta. La penalita totale resta visibile. Le email risolvono le call ai fini dell'uscita.

Durante una call attiva i disturbatori diretti al player aspettano senza consumare timeout o avanzamento; le conversazioni rivolte ai colleghi continuano.
