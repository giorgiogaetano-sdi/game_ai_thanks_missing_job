
(function(root){
'use strict';
const sim=root.OfficeSim,desk={x:488,y:363},entry={x:610,y:560},mealSeat={x:775,y:315};
const phrases=['Solo 5 minuti!','È ASAP!','Puoi farmi un favore?','Una call al volo?','Ti rubo un secondo!','Mi fai un recap?','Lo vuole il capo!','Hai un attimo?','È una quick win!'];
const explanations=['Allora, ti spiego…','Prima fai questa parte…','Poi c’è una piccola modifica…','Aspetta, non ho finito!','Ti mando tutti i dettagli!'];
const config={minutesPerSecond:6,initialWork:480,coffeeMultiplier:1.5,coffeeDuration:120,drinkDuration:1.6,missedLunchMultiplier:0.9975,contactSeconds:3,callMinutes:[630,930],callDuration:6,callRingMinutes:60,missedCallPenalty:0.25,lunchStart:780,lunchEnd:840,end:1080,exitDeadline:1110};

const koReasons=[
 'Hai lavorato tutta la notte. Il buongiorno del capo è arrivato prima della tua buonanotte.',
 'Hai trovato il garage chiuso. La tua auto ha ottenuto lo smart working prima di te.',
 'La security ti ha arrestato: non eri autorizzato a restare. Il badge ora è un reperto.',
 'Il robot delle pulizie ti ha classificato come arredamento e parcheggiato in magazzino.',
 'Il badge è scaduto alle 18:30. Per uscire serve un ticket con approvazione del badge.',
 'L’ascensore è entrato in modalità risparmio. Tu sei rimasto in modalità straordinario.',
 'Il capo ti ha visto ancora online e ti ha assegnato il lavoro di domani. E di dopodomani.',
 'Hai perso l’ultimo autobus. Quello dopo passa al prossimo trimestre fiscale.',
 'Il tornello richiede una password nuova: una maiuscola, un numero e le ferie residue.',
 'Ti hanno aggiunto a una call con il fuso orario sbagliato. Dura fino a colazione.',
 'Il distributore ha mangiato il badge. In cambio ti ha dato un brodo vegetale.',
 'Il portone ha deciso di fare quiet quitting. Non apre più conversazioni.',
 'Sei rimasto chiuso con il team building notturno. Prima attività: fidarsi dell’uscita di emergenza.',
 'L’AI ti ha promosso a server. Ora devi restare acceso ventiquattro ore su ventiquattro.',
 'Le luci si sono spente. Hai scoperto che la tua scrivania non supporta la modalità notte.',
 'Il collega ha detto «ultima modifica» per la ventisettesima volta. Ora è lunedì.',
 'Il parcheggio è diventato area riservata al CEO. La tua Panda è stata nominata benefit aziendale.',
 'Hai incontrato il manutentore. Ti ha scambiato per il problema segnalato nel ticket.',
 'Il frigo della sala break si è chiuso su di te. Almeno il pranzo di domani è vicino.',
 'La stampante ha bloccato l’uscita per mancanza di ciano. Anche se stavi uscendo in bianco e nero.',
 'HR ti ha iscritto al corso obbligatorio «Come uscire in orario». Inizia alle 23.',
 'Il Wi-Fi ti ha disconnesso, ma il capo no. Ti aspetta un follow-up dal vivo.',
 'La porta è in manutenzione programmata. Il programma termina quando vai in pensione.',
 'La security ti ha dato un mocio: se resti dopo l’orario, almeno renditi utile.',
 'Hai aperto Excel per un ultimo controllo. Le celle si sono moltiplicate durante la notte.',
 'Il collega ti ha coinvolto in un brainstorming. L’unica idea era non farti uscire.',
 'Il sistema presenze ti ha segnato come pianta ornamentale. Devi aspettare il giardiniere.',
 'Hai perso la coincidenza. Ora il tuo tragitto casa-lavoro comprende un pernottamento al lavoro.',
 'Il capo ha scritto «sei ancora lì?». Il punto interrogativo si è trasformato in un progetto.',
 'Il catering ti ha apparecchiato la colazione. Nessuno ha avuto il coraggio di spiegarti perché.',
 'Il tuo PC ha iniziato gli aggiornamenti. L’uscita verrà installata al riavvio.',
 'Il collega ti ha chiesto un passaggio. Prima però deve finire una presentazione da 180 slide.',
 'L’allarme ti ha scambiato per un intruso. Il capo ti ha scambiato per uno disponibile.'
];

const levels=[
 {name:'Primo giorno',speed:54,maxNPCs:2,spawn:[16,22],patience:[9,13],contact:4,debt:[60,180],efficiency:1.55,returnChance:0.25,urgentSpeed:118},
 {name:'Hai un attimo?',speed:54,maxNPCs:2,spawn:[16,22],patience:[9,13],contact:4,debt:[60,180],efficiency:1.55,returnChance:0.25,urgentSpeed:118},
 {name:'Tutto ASAP',speed:67,maxNPCs:3,spawn:[12,17],patience:[11,17],contact:3.5,debt:[60,180],efficiency:1.45,returnChance:0.4,urgentSpeed:132},
 {name:'Escalation',speed:80,maxNPCs:4,spawn:[9,13],patience:[14,20],contact:3,debt:[60,180],efficiency:1.35,returnChance:0.55,urgentSpeed:145},
 {name:'Venerdì di fuoco',speed:94,maxNPCs:5,spawn:[6,10],patience:[17,24],contact:2.5,debt:[60,180],efficiency:1.25,returnChance:0.7,urgentSpeed:160}
];
const urgentPhrases=['Emergenza!!!','Urgente!!!','Aiuto!!!','È per ieri!!!','Bloccante!!!','Il capo aspetta!!!','Non puoi uscire!!!'];
const eventMinute=1060;
const doorPhrases=['AIUTO!!!','LA CONSEGNA!!!','DEVI FINIRE!!!','IL CLIENTE È ANCORA ONLINE!!!','LA DEMO È STASERA!!!','IL SERVER È IN FIAMME!!!','IL CAPO ASPETTA IL FILE!!!','IL RILASCIO NON SI FA DA SOLO!!!','LA FATTURA PARTE STASERA!!!','IL BACKUP È VUOTO!!!','LA PRODUZIONE È FERMA!!!','PRIMA IL FIX, POI LA PIZZA!!!'];
function repelAtDoor(s){
 endPlayerDelegation(s);s.working=false;s.sitting=false;s.drinking=0;
 s.player.knockback={elapsed:0,duration:1.2,style:['roll','backroll','spin','knees'][Math.min(3,Math.floor(s.random()*4))]};
 s.player.facing='up';s.player.moving=false;
 let guard=s.npcs.find(n=>n.doorGuard);
 if(!guard){guard=spawn(s,true);guard.doorGuard=true;guard.contact=0;}
 guard.mode='doorPush';guard.x=610;guard.y=560;guard.path=[];guard.repath=0;guard.moving=false;guard.facing='up';
 guard.phrase=doorPhrases[Math.min(doorPhrases.length-1,Math.floor(s.random()*doorPhrases.length))];guard.speech=2;
 s.message='ALT! Ti rispediscono dentro: restano '+Math.ceil(s.work)+' minuti. «'+guard.phrase+'»';
}
function clockRate(s){return s.phase==='closing'?1:lunch(s)?1.5:s.lastMinuteEvent?(s.eventPopup>0?0.25:1):config.minutesPerSecond;}
function nextLevel(s){return s.phase==='won'&&s.level<levels.length?create(s.random,s.level+1):null;}

const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),near=(a,b,r=30)=>dist(a,b)<r;

function create(random=Math.random,level=1){
 level=Math.max(1,Math.min(levels.length,Math.trunc(level)||1));const rules=levels[level-1];
 const state={player:{...sim.createPlayer(),despair:0,lastDelegation:0},phase:'arrival',minute:540,work:config.initialWork,assigned:config.initialWork,completed:0,coffeeUntil:0,coffeeReady:0,drinking:0,hungerPenalty:false,koReason:'',meal:0,ate:false,npcs:[],spawnIn:rules.spawn[0],id:0,random,working:false,sitting:false,standup:0,message:'Livello '+level+' — '+rules.name+'. Raggiungi il PC evidenziato e premi E.',delegations:0,level,rules,lastMinuteEvent:false,eventPopup:0,officeElapsed:0,coffeeOwner:null,playerDelegation:null,passedWork:0,call:null,nextCallIndex:0,callsCompleted:0,missedCalls:0,email:null};state.developers=createDevelopers(state);return state;
}

const developerSeats=[
 {x:775,y:212,facing:'down'},{x:827,y:212,facing:'down'},{x:827,y:315,facing:'up'},
 {x:775,y:342,facing:'down'},{x:827,y:342,facing:'down'}
];
function createDevelopers(s){
 const colors=['#e78b65','#6b9edb','#b48bd0','#62b79d','#e0bd59'];
 for(let i=colors.length-1;i>0;i--){const j=Math.floor(s.random()*(i+1));[colors[i],colors[j]]=[colors[j],colors[i]];}
 return sim.world.objects.filter(o=>o.kind==='desk'&&!(o.x===428&&o.y===282)).map((o,i)=>({
  id:'dev-'+i,type:'developer',color:colors[i],...entry,home:{x:o.x+o.w/2,y:o.y+o.h+15},seat:developerSeats[i],
  mode:'waiting',delay:.4+i*.85,active:false,facing:'up',steps:0,moving:false,anim:0,path:[],repath:0,
  coffeeAt:18+i*5+s.random()*15,drinking:0,interruptedBy:null,despair:0,lastDelegation:0,extraWork:0,receivedDelegations:0,avoidUntil:0,fleeTime:0,escapeStyle:null
 }));
}
function updateDevelopers(s,dt,minutes=0){
 s.officeElapsed+=dt;
 for(const n of s.developers){
  n.anim+=dt;
  n.despair=Math.max(0,n.despair-dt);
  if(n.mode==='waiting'){if(s.officeElapsed<n.delay)continue;n.active=true;n.mode='arriving';n.repath=0;}
  if(!n.active)continue;
  if(n.mode==='fleeing'){
   n.fleeTime-=dt;
   if(n.fleeTime<=0){n.mode=s.phase==='closing'?'leaving':lunch(s)?'toLunch':'returning';n.repath=0;}
   else{
    if(!n.escapeTarget||dist(n,n.escapeTarget)<12||dist(s.player,n.escapeTarget)<dist(s.player,n)){
     let best=null,score=-Infinity;
     for(let i=0;i<grid.length;i++)if(grid[i]){const q={x:(i%cols)*cell+6,y:Math.floor(i/cols)*cell+6};if(dist(n,q)>220)continue;const value=dist(s.player,q)-dist(n,q)*.15;if(value>score){score=value;best=q;}}
     n.escapeTarget=best||n.home;n.repath=0;
    }
    moveNPC(n,n.escapeTarget,250,dt);continue;
   }
  }
  if(n.interruptedBy!==null||n.despair>0){n.moving=false;continue;}
  if(s.phase==='closing'&&n.mode!=='leaving'){if(s.coffeeOwner===n.id)s.coffeeOwner=null;n.drinking=0;n.mode='leaving';n.repath=0;}
  else if(lunch(s)&&!['toLunch','eating','leaving'].includes(n.mode)){if(s.coffeeOwner===n.id)s.coffeeOwner=null;n.drinking=0;n.mode='toLunch';n.repath=0;}
  else if(!lunch(s)&&['toLunch','eating'].includes(n.mode)){n.mode='returning';n.repath=0;n.coffeeAt=s.officeElapsed+20+s.random()*25;}
  if(n.mode==='working'){
   n.moving=false;
   n.extraWork=Math.max(0,n.extraWork-minutes*s.rules.efficiency);
   if(s.phase==='running'&&!lunch(s)&&s.minute<eventMinute&&s.officeElapsed>=n.coffeeAt&&!s.coffeeOwner){s.coffeeOwner=n.id;n.mode='toCoffee';n.repath=0;}
  }
  if(n.mode==='drinking'){
   n.drinking=Math.max(0,n.drinking-dt);n.moving=false;
   if(n.drinking<=0){s.coffeeOwner=null;n.mode='returning';n.repath=0;n.coffeeAt=s.officeElapsed+25+s.random()*30;}
   continue;
  }
  if(n.mode==='eating'){n.moving=false;continue;}
  const target=n.mode==='toCoffee'?{x:750,y:146}:n.mode==='toLunch'?n.seat:n.mode==='leaving'?entry:['arriving','returning'].includes(n.mode)?n.home:null;
  if(!target)continue;
  moveNPC(n,target,90,dt);
  if(dist(n,target)<8){
   n.x=target.x;n.y=target.y;n.moving=false;n.repath=0;n.path=[];
   if(n.mode==='toCoffee'){n.mode='drinking';n.drinking=config.drinkDuration;n.facing='down';}
   else if(n.mode==='toLunch'){n.mode='eating';n.facing=n.seat.facing;}
   else if(n.mode==='leaving')n.active=false;
   else{n.mode='working';n.facing='up';}
  }
 }
}

function lastMinute(s){
 s.lastMinuteEvent=true;s.eventPopup=4;
 s.message='17:40 — Arriva il collega dell’ultimo secondo! Il tempo rallenta: non farti delegare l’emergenza!';
 spawn(s,true);
}
function canTalk(a,b){const length=dist(a,b);if(length>=35)return false;const count=Math.ceil(length/4);for(let i=1;i<count;i++)if(sim.blocked(a.x+(b.x-a.x)*i/count,a.y+(b.y-a.y)*i/count))return false;return true;}
function recipient(s,n){return n.targetId&&n.targetId!=='player'?s.developers.find(d=>d.id===n.targetId&&d.active):n.audience==='team'&&!n.targetId?undefined:s.player;}
function availableDevelopers(s){return s.developers.filter(d=>d.active&&d.mode!=='leaving'&&d.interruptedBy===null&&d.despair<=0&&d.mode!=='fleeing');}
function remainingDevelopers(s,n){return availableDevelopers(s).filter(d=>!(n.visitedRecipients||[]).includes(d.id));}
function chooseRecipient(s,n){
 if(n.urgent)return 'player';
 const others=remainingDevelopers(s,n);
 if(n.audience==='team')return others.length?others[Math.floor(s.random()*others.length)].id:null;
 return others.length&&s.random()<.4?others[Math.floor(s.random()*others.length)].id:'player';
}
function playerIsDisturbed(s){if(s.call&&s.call.status==='active')return false;return s.npcs.some(n=>n.audience!=='team'&&(!n.targetId||n.targetId==='player')&&(['explaining','chase'].includes(n.mode)&&canTalk(n,s.player)));}
function beginExplanation(s,n,target){
 n.mode='explaining';n.contact=0;n.repath=0;n.speech=0;
 if(target!==s.player){
  n.targetId=target.id;target.interruptedBy=n.id;target.mode='listening';target.drinking=0;target.moving=false;
  if(s.coffeeOwner===target.id)s.coffeeOwner=null;
  s.message='Un disturbatore sta spiegando nuovo lavoro a un altro sviluppatore…';
 }else{n.targetId='player';s.message='Ti ha raggiunto! Allontanati per interrompere la spiegazione: la barra riprende quando ti raggiunge.';}
}
function finishExplanation(s,n,target){
 const debt=Math.round(random(s,...(n.urgent?[10,60]:s.rules.debt)));
 n.visitedRecipients.push(target===s.player?'player':target.id);
 target.despair=1.8;target.lastDelegation=debt;
 if(target===s.player){
  s.work+=debt;s.assigned+=debt;s.delegations++;
  s.message='Spiegazione finita: ti ha delegato altri '+debt+' minuti. Disperazione!';leave(s,n,true);
 }else{
  target.extraWork+=debt;target.receivedDelegations++;target.interruptedBy=null;
  target.mode=s.phase==='closing'?'leaving':lunch(s)?'toLunch':'returning';target.repath=0;
  const others=remainingDevelopers(s,n),decision=s.random();let next=null;
  if(n.audience==='team'){if(decision>=.35&&others.length)next=others[Math.floor(s.random()*others.length)].id;}
  else if(decision>=.3)next=decision<.7&&others.length?others[Math.floor(s.random()*others.length)].id:'player';
  if(next){
   n.mode='handoff';n.ttl=1.5;n.contact=0;n.repath=0;n.targetId=next;n.forcePlayer=next==='player';n.phrase=next==='player'?'Ora chiedo anche a te!':'Sento anche un altro collega!';
   s.message='Un collega ha ricevuto '+debt+' minuti extra. '+(next==='player'?'Il disturbatore adesso cerca te!':'Il disturbatore passa a un altro sviluppatore.');
  }else{leave(s,n);n.phrase='Grazie! Per oggi ho finito.';s.message='Un collega ha ricevuto '+debt+' minuti extra. Il disturbatore esce e ti lascia in pace.';}
 }
}
const lunch=s=>s.minute>=config.lunchStart&&s.minute<config.lunchEnd;
function productivity(s){return Math.max(0,s.rules.efficiency-s.missedCalls*config.missedCallPenalty)*(s.minute<s.coffeeUntil?config.coffeeMultiplier:1)*(s.hungerPenalty?config.missedLunchMultiplier:1);}
function sitAtPC(s){Object.assign(s.player,desk,{facing:'up',moving:false});}
function delegationCandidate(s){return availableDevelopers(s).filter(d=>d.mode!=='fleeing'&&s.officeElapsed>=d.avoidUntil&&canTalk(s.player,d)).sort((a,b)=>dist(s.player,a)-dist(s.player,b))[0];}
function endPlayerDelegation(s){
 const d=s.playerDelegation&&s.developers.find(d=>d.id===s.playerDelegation.targetId);
 if(d&&d.interruptedBy==='player'){d.interruptedBy=null;d.mode=s.phase==='closing'?'leaving':lunch(s)?'toLunch':'returning';d.repath=0;}
 s.playerDelegation=null;
}
function delegateWork(s){
 if(s.call&&s.call.status==='active'||!['running','closing'].includes(s.phase)||s.work<=0||s.drinking>0||s.player.despair>0||playerIsDisturbed(s))return false;
 const d=delegationCandidate(s);if(!d)return false;
 s.working=false;s.sitting=false;
 if(s.random()<.5){
  d.mode='fleeing';d.fleeTime=4;d.avoidUntil=s.officeElapsed+10;d.escapeStyle=s.random()<.5?'music':'hop';d.escapeTarget=null;d.repath=0;
  if(s.coffeeOwner===d.id)s.coffeeOwner=null;d.drinking=0;
  s.message=d.escapeStyle==='music'?'Ha messo le cuffie: «Non ti sentooo!»':'«Ho una call!» E saltella via più veloce di te!';
 }else{
  s.playerDelegation={targetId:d.id,progress:0,duration:2,amount:Math.min(s.work,Math.round(random(s,60,180)))};
  d.interruptedBy='player';d.mode='listening';d.moving=false;d.drinking=0;if(s.coffeeOwner===d.id)s.coffeeOwner=null;
  s.message='Ti ascolta! Resta accanto al collega per 2 secondi per delegare il lavoro.';
 }
 return true;
}
function updatePlayerDelegation(s,dt){
 const task=s.playerDelegation;if(!task)return;
 const d=s.developers.find(d=>d.id===task.targetId);
 if(!d||!d.active||!canTalk(s.player,d)||playerIsDisturbed(s)||s.work<=0){endPlayerDelegation(s);s.message='Delega interrotta: resta vicino al collega mentre spieghi.';return;}
 task.progress+=dt;if(task.progress<task.duration)return;
 const amount=Math.min(s.work,task.amount);s.work-=amount;s.passedWork+=amount;d.extraWork+=amount;d.receivedDelegations++;d.despair=1.8;d.lastDelegation=amount;d.avoidUntil=s.officeElapsed+10;
 endPlayerDelegation(s);s.message='Delegati '+amount+' minuti al collega! Il tuo arretrato diminuisce.';
}
function startCall(s){
 if(!s.call||s.call.status!=='pending'||!near(s.player,desk,38))return false;
 endPlayerDelegation(s);s.call.status='active';s.call.remaining=config.callDuration;s.working=false;s.sitting=false;s.drinking=0;s.player.despair=0;sitAtPC(s);
 s.message='Call obbligatoria in corso: resta al PC. I colleghi aspettano la fine.';return true;
}
function updateCalls(s,dt){
 if(s.email)s.email.remaining=Math.max(0,s.email.remaining-dt);
 if(s.call&&s.call.status==='pending'&&s.minute>=s.call.deadline){
  const subjects=['OGGETTO: URGENTE!','OGGETTO: Funzionalit\u00e0 delle fate','OGGETTO: Superbonifica totale','OGGETTO: Il bottone deve sapere cosa fare','OGGETTO: Come da accordi mai presi'];
  const subject=subjects[Math.min(subjects.length-1,Math.floor(s.random()*subjects.length))],amount=Math.round(random(s,...s.rules.debt));
  s.work+=amount;s.assigned+=amount;s.missedCalls++;s.email={subject,amount,remaining:12};s.call=null;
  s.message='ARRIVATA EMAIL! '+subject+' - Requisiti confusi, allegato immaginario. +'+amount+' minuti di lavoro; produttivit\u00e0 -0,25 per lavoro disordinato.';
 }

 if(!s.call&&s.nextCallIndex<config.callMinutes.length&&s.minute>=config.callMinutes[s.nextCallIndex]){
  s.call={status:'pending',remaining:config.callDuration,deadline:config.callMinutes[s.nextCallIndex]+config.callRingMinutes};s.nextCallIndex++;
  s.message='Call obbligatoria! Torna al tuo PC e premi E per partecipare.';
 }
 if(s.call&&s.call.status==='active'){
  s.call.remaining=Math.max(0,s.call.remaining-dt);
  if(s.call.remaining<=0){const amount=Math.round(random(s,...s.rules.debt));s.work+=amount;s.assigned+=amount;s.callsCompleted++;s.call=null;s.message='Call finita: altri '+amount+' minuti di lavoro assegnati!';}
 }
}
function interact(s){
 if(s.player.knockback)return;
 if(['won','lost','standup'].includes(s.phase))return;
 if(s.call&&s.call.status==='active'){s.message='Sei in call: attendi la fine prima di alzarti.';return;}
 if(startCall(s))return;
 if(s.playerDelegation){endPlayerDelegation(s);s.message='Hai interrotto la delega.';return;}
 if(delegateWork(s))return;
 if(s.drinking>0){s.message='Stai bevendo il caffè. Un sorso alla volta!';return;}
 if(near(s.player,desk,38)){
  if(s.phase==='arrival'){s.phase='standup';s.standup=3;s.message='Standup livello '+s.level+': 8 ore di lavoro. Efficienza ×'+s.rules.efficiency+'. Premi E al PC per lavorare.';return;}
  s.working=!s.working;s.sitting=false;if(s.working)sitAtPC(s);s.message=s.working?'Al lavoro. Muoviti per alzarti e sfuggire ai colleghi.':'Ti sei alzato dalla postazione.';return;
 }
 if(!['running','closing'].includes(s.phase)){s.message='Prima raggiungi il tuo PC e avvia lo standup con E.';return;}
 const coffee=sim.world.objects.find(o=>o.kind==='coffee');
 if(s.player.x>coffee.x-24&&s.player.x<coffee.x+coffee.w+24&&s.player.y>coffee.y+coffee.h&&s.player.y<coffee.y+coffee.h+42){
  if(s.minute<s.coffeeReady){s.message='Hai già preso il caffè: aspetta 30 minuti di gioco tra una tazza e l’altra.';return;}
  s.coffeeUntil=s.minute+config.coffeeDuration;s.coffeeReady=s.minute+30;s.drinking=config.drinkDuration;s.working=false;s.sitting=false;s.player.facing='down';s.message='Caffè! Produttività ×1,5 per 2 ore. I bonus non si sommano.';return;
 }
 if(near(s.player,mealSeat,55)){
  if(!lunch(s)){s.message='Il pranzo si serve dalle 13 alle 14.';return;}
  if(s.ate){if(s.sitting){s.sitting=false;s.message='Ti sei alzato dal tavolo. Pranzo completato!';}else s.message='Hai già mangiato. Goditi il resto della pausa!';return;}
  s.sitting=!s.sitting;s.meal=0;s.working=false;if(s.sitting){s.player.x=mealSeat.x;s.player.y=mealSeat.y;s.player.facing='up';}
  s.message=s.sitting?'A tavola: resta seduto 5 secondi. Muoviti per alzarti.':'Ti sei alzato dal tavolo.';return;
 }
 s.message='E al tuo PC per lavorare, alla macchinetta per il caffè, al tavolo per pranzare.';
}
// BFS uses the same collision footprint as the player.
const cell=12,cols=80,rows=50,grid=Array.from({length:cols*rows},(_,i)=>!sim.blocked((i%cols)*cell+6,Math.floor(i/cols)*cell+6));
function node(p){let best=-1,d=Infinity;for(let i=0;i<grid.length;i++)if(grid[i]){const v=((i%cols)*cell+6-p.x)**2+(Math.floor(i/cols)*cell+6-p.y)**2;if(v<d){d=v;best=i;}}return best;}
function path(from,to){const a=node(from),b=node(to);if(a<0||b<0)return [];const prev=new Int32Array(grid.length).fill(-1),queue=[a];prev[a]=a;
 for(let q=0;q<queue.length&&prev[b]<0;q++){const n=queue[q];for(const k of [n-cols,n+cols,...(n%cols?[n-1]:[]),...(n%cols<cols-1?[n+1]:[])])if(k>=0&&k<grid.length&&grid[k]&&prev[k]<0){prev[k]=n;queue.push(k);}}
 if(prev[b]<0)return [];const result=[];for(let n=b;n!==a;n=prev[n])result.push({x:(n%cols)*cell+6,y:Math.floor(n/cols)*cell+6});return result.reverse();
}
const random=(s,min,max)=>min+s.random()*(max-min);
function wander(s){return [{x:703,y:360},{x:902,y:356},{x:902,y:450},{x:690,y:206}][Math.floor(s.random()*4)];}

function spawn(s,urgent=false){
 const n={id:++s.id,...entry,facing:'up',moving:false,steps:0,urgent,mode:'chase',
 ttl:urgent?Infinity:random(s,...s.rules.patience),contact:0,repath:0,path:[],
 phrase:urgent?urgentPhrases[0]:phrases[Math.floor(s.random()*phrases.length)],
 speech:urgent?0.9:random(s,2,5),target:wander(s),color:urgent?'#b4443f':['#405b72','#65516d','#526856'][s.id%3],
 speed:urgent?s.rules.urgentSpeed:s.rules.speed,contactLimit:urgent?Math.max(2,s.rules.contact-1):s.rules.contact};
 n.visitedRecipients=[];n.audience=!urgent&&availableDevelopers(s).length&&s.random()<.35?'team':'any';
 n.targetId=chooseRecipient(s,n);s.npcs.push(n);return n;
}
function leave(s,n,delegated=false){n.forcePlayer=false;n.mode=!n.urgent&&delegated&&s.random()<s.rules.returnChance?'break':'exit';n.target=n.mode==='break'?wander(s):entry;n.ttl=random(s,5,11);n.contact=0;n.repath=0;n.phrase=delegated?'Grazie! Sapevo di contare su di te.':'Ci sentiamo dopo!';}
function moveNPC(n,target,speed,dt){n.repath-=dt;if(n.repath<=0){n.path=path(n,target);n.repath=n.mode==='explaining'?0.12:0.65;}while(n.path.length&&dist(n,n.path[0])<3)n.path.shift();
 // Grid waypoints can stop short of the exact destination; finish the last leg.
 const next=n.path[0]||(dist(n,target)<cell&&!sim.blocked(target.x,target.y)?target:null);n.moving=!!next&&dist(n,next)>.01;if(!n.moving)return;
 if(Math.abs(n.x-next.x)<.01&&!sim.blocked(next.x,n.y))n.x=next.x;
 if(Math.abs(n.y-next.y)<.01&&!sim.blocked(n.x,next.y))n.y=next.y;
 let dx=next.x-n.x,dy=next.y-n.y,len=Math.hypot(dx,dy);if(!len)return;const amount=Math.min(len,speed*dt);dx=dx/len*amount;dy=dy/len*amount;
 if(!sim.blocked(n.x+dx,n.y))n.x+=dx;if(!sim.blocked(n.x,n.y+dy))n.y+=dy;
 // Keep exact grid tangencies stable when walking alongside furniture.
 n.x=Math.round(n.x*1e6)/1e6;n.y=Math.round(n.y*1e6)/1e6;
 n.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';n.steps+=dt*8;
}
function update(s,input,dt){
 if(s.phase==='won'||s.phase==='lost')return;
 s.player.despair=Math.max(0,s.player.despair-dt);
 s.drinking=Math.max(0,s.drinking-dt);
 if(s.phase==='arrival'||s.phase==='standup')updateDevelopers(s,dt);
 if(s.phase==='standup'){s.standup-=dt;if(s.standup<=0){s.phase='running';s.working=true;sitAtPC(s);s.message='09:00: inizia la giornata! Completa il lavoro entro le 18.';}return;}
 const moving=input.left||input.right||input.up||input.down;
 if(s.player.knockback){
  const hit=s.player.knockback;hit.elapsed=Math.min(hit.duration,hit.elapsed+dt);
  const distance=150*(1-hit.elapsed/hit.duration)*dt;
  for(let left=distance;left>0;left-=2){const step=Math.min(2,left);if(!sim.blocked(s.player.x,s.player.y-step))s.player.y-=step;}
  s.player.moving=false;if(hit.elapsed>=hit.duration)s.player.knockback=null;
 }else if(s.call&&s.call.status==='active'){sitAtPC(s);}else{if(moving){s.working=false;s.sitting=false;s.meal=0;}sim.step(s.player,input,dt);}
 if(!['running','closing'].includes(s.phase))return;
 const wasLunch=lunch(s),limit=s.phase==='closing'?config.exitDeadline:config.end,minutes=Math.min(dt*clockRate(s),limit-s.minute,s.phase==='running'&&!s.lastMinuteEvent?eventMinute-s.minute:Infinity);
 s.minute+=minutes;
 updateCalls(s,dt);
 updateDevelopers(s,dt,minutes);
 if(s.phase==='running'&&!s.lastMinuteEvent&&s.minute>=eventMinute-1e-8){s.minute=eventMinute;lastMinute(s);}
 else s.eventPopup=Math.max(0,s.eventPopup-dt);
 if(!wasLunch&&lunch(s)){s.message='13:00: pausa pranzo! Puoi continuare a lavorare o sederti al tavolo con E. Se non mangi, dopo le 14 perdi lo 0,25% di produttività.';}
 if(wasLunch&&!lunch(s)){s.sitting=false;s.meal=0;s.hungerPenalty=!s.ate;s.message=s.ate?'14:00: pranzo completato, produttività piena.':'14:00: hai saltato il pranzo! Produttività −0,25% per il resto della giornata.';}
 if(s.sitting&&lunch(s)&&!s.ate){s.meal+=dt;if(s.meal>=5){s.ate=true;s.message='Pranzo completato! Alzati per un caffè o goditi la pausa.';}}
 const threat=playerIsDisturbed(s);
 if(!(s.call&&s.call.status==='active')&&s.working&&s.player.despair<=0&&s.drinking<=0&&near(s.player,desk,38)&&!threat){const done=Math.min(s.work,minutes*productivity(s));s.work=Math.max(0,s.work-done);s.completed+=done;}
 s.spawnIn-=dt;if(s.spawnIn<=0&&!s.lastMinuteEvent){if(s.npcs.filter(n=>!n.urgent).length<s.rules.maxNPCs)spawn(s);s.spawnIn=random(s,...s.rules.spawn);}
 for(const n of s.npcs){
 if(n.doorGuard){
  n.moving=false;
  if(n.mode==='doorPush'){
   if(!s.player.knockback){n.mode='panic';n.speech=2;}
   continue;
  }
  if(n.mode==='panic'){
   n.speech-=dt;
   if(n.speech<=0){n.mode='exit';n.repath=0;n.path=[];}
   continue;
  }
  if(n.mode==='exit'){moveNPC(n,{x:610,y:574},85,dt);continue;}
 }
 if(s.call&&s.call.status==='active'&&((['chase','explaining'].includes(n.mode)&&recipient(s,n)===s.player)||n.mode==='waitingCall')){
  if(n.mode!=='waitingCall'){n.resumeMode=n.mode;n.mode='waitingCall';n.repath=0;n.waitAnim=0;n.phrase='Fai pure… io aspetto!';}
  n.waitAnim+=dt;
  if(dist(n,s.player)>48)moveNPC(n,s.player,n.speed,dt);else n.moving=false;
  continue;
 }
 if(n.mode==='waitingCall'){n.mode=n.resumeMode||'chase';n.repath=0;n.speech=0;}
 n.ttl-=dt;n.speech-=dt;
 if(n.mode==='chase'||n.mode==='explaining'){
  let target=recipient(s,n);
  if(n.mode==='chase'&&(!target||target!==s.player&&(target.mode==='leaving'||target.interruptedBy!==null||target.despair>0))){n.targetId=chooseRecipient(s,n);target=recipient(s,n);n.repath=0;}
  if(!target&&n.audience==='team'){leave(s,n);continue;}
  if(!target){n.targetId='player';n.mode='chase';target=s.player;n.contact=0;n.repath=0;}
  if(s.call&&s.call.status==='active'&&target===s.player){n.resumeMode=n.mode;n.mode='waitingCall';n.waitAnim=dt;n.ttl+=dt;n.repath=0;n.moving=false;continue;}
  if(n.mode==='chase'){
   if(!canTalk(n,target)&&!n.urgent&&!n.forcePlayer){const nearby=[...(n.audience==='team'||s.call&&s.call.status==='active'?[]:[s.player]),...remainingDevelopers(s,n)].filter(d=>canTalk(n,d)).sort((a,b)=>dist(n,a)-dist(n,b));if(nearby.length)target=nearby[0];}
   if(canTalk(n,target))beginExplanation(s,n,target);
  }
  if(n.speech<=0){const choices=n.urgent?urgentPhrases:n.mode==='explaining'?explanations:phrases;n.phrase=choices[Math.floor(s.random()*choices.length)];n.speech=n.mode==='explaining'||n.urgent?0.9:random(s,2,5);}
  if(n.mode==='explaining'){
   if(canTalk(n,target))n.contact+=dt;
   if(dist(n,target)>22)moveNPC(n,target,n.speed,dt);else n.moving=false;
   if(n.contact>=n.contactLimit)finishExplanation(s,n,target);
  }else moveNPC(n,target,n.speed,dt);
  // Allow visits to developers to cross the office before giving up.
  if(n.mode==='chase'&&target===s.player&&n.ttl<=0)leave(s,n);
 }else if(n.mode==='handoff'){
  n.moving=false;if(n.ttl<=0){n.mode='chase';n.ttl=random(s,...s.rules.patience);n.repath=0;n.speech=0;}
 }else if(n.mode==='break'){
  moveNPC(n,n.target,38,dt);
  if(n.ttl<=0){if(s.random()<s.rules.returnChance){n.mode='chase';n.targetId=chooseRecipient(s,n);n.ttl=random(s,...s.rules.patience);n.repath=0;n.phrase=phrases[Math.floor(s.random()*phrases.length)];}
  else leave(s,n);}
 }else moveNPC(n,entry,85,dt);
 }
 updatePlayerDelegation(s,dt);
 s.npcs=s.npcs.filter(n=>!(n.mode==='exit'&&(n.doorGuard?near(n,{x:610,y:574},3):near(n,entry,15))));
 if(s.phase==='running'&&s.minute>=config.end){
  s.minute=config.end;s.phase='closing';s.working=false;s.sitting=false;s.eventPopup=0;
  s.message='18:00 — Hai 30 secondi per uscire! Raggiungi la porta in basso con zero lavoro. Puoi ancora finire l’arretrato al PC.';
 }
 if(s.phase==='closing'){
  if(s.minute>=config.exitDeadline-1e-8){
   s.minute=config.exitDeadline;s.phase='lost';s.working=false;s.sitting=false;s.drinking=0;
   s.koReason=koReasons[Math.min(koReasons.length-1,Math.floor(s.random()*koReasons.length))];s.message='18:30 — ESCALATION! '+s.koReason;
  }else if(s.player.x>=589&&s.player.x<=631&&s.player.y>=572){
   if(s.work>.001&&!s.player.knockback)repelAtDoor(s);
   else if(s.call||s.nextCallIndex<config.callMinutes.length)s.message='Devi completare le call obbligatorie prima di uscire. Torna al PC!';
   else if(s.npcs.some(n=>n.mode==='explaining'&&(!n.targetId||n.targetId==='player')&&canTalk(n,s.player)))s.message='Aspetta, non ha finito di spiegare! Devi concludere la conversazione prima di uscire.';
   else if(s.work<=0.001){s.work=0;s.phase='won';s.working=false;s.sitting=false;s.drinking=0;s.message='Sei uscito in tempo con zero arretrato! Livello superato.';}
   else s.message='Non puoi uscire: restano '+Math.ceil(s.work)+' minuti di lavoro. Finiscili al PC prima delle 18:30!';
  }
 }
}
root.OfficeDay={config,desk,entry,mealSeat,create,interact,update,path,spawn,lunch,canTalk,levels,clockRate,nextLevel,eventMinute,urgentPhrases,koReasons,developerSeats,playerIsDisturbed,productivity,delegateWork,delegationCandidate,startCall};
})(globalThis);





