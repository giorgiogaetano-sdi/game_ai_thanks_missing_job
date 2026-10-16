
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=name=>fs.readFileSync(path.join(__dirname,'..','src',name),'utf8');
const box={};vm.createContext(box);
for(const name of ['simulation.js','day.js','game.js']){new vm.Script(source(name),{filename:name});if(name!=='game.js')vm.runInContext(source(name),box);}
const D=box.OfficeDay,S=box.OfficeSim,dt=1/60;
const run=(s,seconds,input={})=>{for(let i=0;i<Math.round(seconds*60);i++)D.update(s,input,dt);};
const fresh=(level=1)=>{const s=D.create(()=>0.5,level);s.phase='running';s.spawnIn=1e6;s.nextCallIndex=D.config.callMinutes.length;return s;};
let count=0;function test(name,fn){fn();console.log('PASS '+name);count++;}
test('5 livelli, partenza alla difficoltà 2 e progressione',()=>{
 assert.equal(D.levels.length,5);
 assert.equal(JSON.stringify({...D.levels[0],name:D.levels[1].name}),JSON.stringify(D.levels[1]));
 for(let i=2;i<D.levels.length;i++){const a=D.levels[i-1],b=D.levels[i];for(const key of ['speed','maxNPCs','urgentSpeed'])assert.ok(b[key]>a[key]);assert.ok(b.spawn[0]<a.spawn[0]);assert.ok(b.contact<a.contact);}
 for(let level=1;level<=5;level++){const s=D.create(()=>0.5,level);assert.equal(s.level,level);assert.equal(s.work,480);assert.equal(s.rules,D.levels[level-1]);}
});
test('Standup, timer accelerato e lavoro al PC',()=>{
 const s=D.create(()=>.5);run(s,1);assert.equal(s.minute,540);Object.assign(s.player,D.desk);D.interact(s);run(s,3.1);assert.equal(s.phase,'running');
 const a=fresh();Object.assign(a.player,D.desk);a.working=true;run(a,1);assert.ok(Math.abs(a.minute-546)<1e-6);assert.ok(Math.abs(a.work-(480-6*a.rules.efficiency))<1e-6);run(a,.2,{right:true});assert.equal(a.working,false);
});
test('Evento esattamente alle 17:40, singolo ingresso anche al limite NPC',()=>{
 const s=fresh(5);s.minute=1059.95;s.player.x=40;s.player.y=100;for(let i=0;i<s.rules.maxNPCs;i++)D.spawn(s);
 D.update(s,{},dt);assert.equal(s.minute,1060);assert.equal(s.lastMinuteEvent,true);assert.ok(s.eventPopup>0);assert.equal(s.npcs.filter(n=>n.urgent).length,1);assert.equal(s.npcs.length,6);
 const boss=s.npcs.find(n=>n.urgent);assert.ok(boss.speed>s.rules.speed);assert.equal(boss.phrase,'Emergenza!!!');
 const before=s.minute;D.update(s,{},dt);assert.ok(Math.abs(s.minute-before-.25*dt)<1e-6);
 run(s,4.2);assert.equal(s.eventPopup,0);assert.equal(D.clockRate(s),1);assert.equal(s.npcs.filter(n=>n.urgent).length,1);
 assert.ok(D.urgentPhrases.includes('Urgente!!!'));assert.ok(D.urgentPhrases.includes('Aiuto!!!'));
});
test('Slow clock leaves player movement unchanged',()=>{
 const a=fresh(),b=fresh();b.lastMinuteEvent=true;b.eventPopup=4;
 run(a,1,{left:true});run(b,1,{left:true});assert.ok(Math.abs(a.player.x-b.player.x)<1e-6);assert.ok(a.minute-b.minute>5);
});
test('Deleghe normali 60–180 minuti e urgenza 10–60 a tutti i livelli',()=>{
 for(let level=1;level<=5;level++)for(const urgent of [false,true])for(const roll of [0,.5,1]){
 const s=fresh(level);Object.assign(s.player,D.desk);const n=D.spawn(s,urgent);Object.assign(n,D.desk,{ttl:100});s.random=()=>roll;
 run(s,n.contactLimit+.1);assert.equal(s.delegations,1);assert.equal(s.work-480,Math.round(urgent?10+50*roll:60+120*roll));
 }
});
test('Pranzo e caffè conservano le regole',()=>{
 const s=fresh();s.minute=780;Object.assign(s.player,D.mealSeat);D.interact(s);run(s,5.1);assert.equal(s.ate,true);assert.equal(s.work,480);
 const a=fresh();a.player.x=750;a.player.y=146;D.interact(a);assert.equal(a.coffeeUntil,660);assert.equal(a.drinking,D.config.drinkDuration);run(a,1.7);assert.equal(a.drinking,0);Object.assign(a.player,D.desk);a.working=true;run(a,1);assert.ok(Math.abs(a.work-(480-6*a.rules.efficiency*1.5))<1e-6);
});
test('Livello 1: completamento del lavoro e uscita senza disturbi',()=>{
 const s=D.create(()=>.5);s.phase='running';s.spawnIn=Infinity;s.nextCallIndex=D.config.callMinutes.length;Object.assign(s.player,D.desk);let elapsed=0;
 while(s.phase==='running'&&elapsed<180){s.npcs=[];if(!D.lunch(s))s.working=true;D.update(s,{},dt);elapsed+=dt;}
 assert.equal(s.phase,'closing');assert.ok(elapsed>130&&elapsed<160);
 for(let i=0;i<600&&s.work>0;i++){s.working=true;D.update(s,{},dt);}assert.equal(s.work,0);
 run(s,1.07,{right:true});run(s,1.85,{down:true});assert.equal(s.phase,'won');
});
test('Progressione solo dopo vittoria e reset di stato',()=>{
 const s=fresh(2);assert.equal(D.nextLevel(s),null);s.phase='lost';assert.equal(D.nextLevel(s),null);s.phase='won';s.coffeeUntil=1000;s.lastMinuteEvent=true;const next=D.nextLevel(s);
 assert.equal(next.level,3);assert.equal(next.phase,'arrival');assert.equal(next.minute,540);assert.equal(next.work,480);assert.equal(next.npcs.length,0);assert.equal(next.lastMinuteEvent,false);assert.equal(next.coffeeUntil,0);const final=fresh(5);final.phase='won';assert.equal(D.nextLevel(final),null);
});
test('Giornate complete: collisioni, evento unico, limiti NPC ed esito',()=>{
 for(let level=1;level<=5;level++){
 const s=D.create(()=>.5,level);s.phase='running';let frames=0;
 while(['running','closing'].includes(s.phase)&&frames<12000){D.update(s,{},dt);frames++;assert.ok(s.npcs.length<=s.rules.maxNPCs+1);for(const n of [...s.npcs,...s.developers.filter(d=>d.active)])assert.equal(S.blocked(n.x,n.y),false);}
 assert.equal(s.phase,'lost');assert.equal(s.minute,1110);assert.equal(s.lastMinuteEvent,true);assert.ok(D.koReasons.includes(s.koReason));const work=s.work;run(s,1);assert.equal(s.work,work);
 }
});
test('Interfaccia: popup, vignetta spigolosa, successivo, riprova e fine campagna',()=>{
 const elements={},frames=[],captured=[],ellipses=[];let lines=0;
 const context=new Proxy({measureText:t=>({width:t.length*7}),lineTo(){lines++;},ellipse(...args){ellipses.push(args);}},{get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
 function el(id){return elements[id]||(elements[id]={classList:{toggle(){}},focus(){},getContext:()=>context});}
 const wrapped={...D,create(...args){const s=D.create(...args);captured.push(s);return s;},nextLevel(s){const next=D.nextLevel(s);if(next)captured.push(next);return next;}};
 const ui={OfficeSim:S,OfficeDay:wrapped,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLButtonElement:class{},requestAnimationFrame:f=>frames.push(f)};
 vm.runInNewContext(source('game.js'),ui);frames.shift()(16);assert.equal(el('#next').hidden,true);assert.equal(el('#event-popup').hidden,true);
 let state=captured.at(-1);state.phase='running';state.nextCallIndex=D.config.callMinutes.length;state.minute=780;state.spawnIn=1e6;Object.assign(state.player,D.mealSeat);
 el('#action').onclick();assert.equal(state.sitting,true);assert.equal(state.player.facing,'up');run(state,2.5);frames.shift()(20);
 assert.ok(Math.abs(el('#lunch-progress').value-2.5)<0.1);assert.ok(el('#lunch-label').textContent.includes('50%'));assert.ok(ellipses.some(args=>args[0]===D.mealSeat.x&&args[1]===264));
 run(state,2.6);frames.shift()(30);assert.equal(el('#lunch-progress').value,5);assert.ok(el('#lunch-label').textContent.includes('completato'));el('#action').onclick();assert.equal(state.sitting,false);
 state.minute=1059.95;D.update(state,{},dt);frames.shift()(50);assert.equal(el('#event-popup').hidden,false);assert.ok(lines>=24);
 state.phase='won';frames.shift()(66);assert.equal(el('#next').hidden,false);el('#next').onclick();assert.equal(captured.at(-1).level,2);el('#reset').onclick();assert.equal(captured.at(-1).level,2);
 state=captured.at(-1);state.level=5;state.rules=D.levels[4];state.phase='won';el('#next').onclick();assert.equal(captured.at(-1).level,1);
});
test('18:00 apre 30 secondi reali, vittoria solo alla porta con zero lavoro',()=>{
 const s=fresh();s.lastMinuteEvent=true;s.minute=1079.99;s.work=0;Object.assign(s.player,D.desk);D.update(s,{},dt);
 assert.equal(s.phase,'closing');assert.equal(s.minute,1080);assert.equal(D.clockRate(s),1);
 run(s,29.9);assert.equal(s.phase,'closing');assert.ok(Math.abs(s.minute-1109.9)<1e-6);run(s,.2);assert.equal(s.phase,'lost');assert.equal(s.minute,1110);
 const before=fresh();before.lastMinuteEvent=true;before.minute=1079;before.work=0;before.player.x=610;before.player.y=574;run(before,.5);assert.equal(before.phase,'running');run(before,.6);assert.equal(before.phase,'won');
 const debt=fresh();debt.phase='closing';debt.minute=1080;debt.player.x=610;debt.player.y=574;debt.work=2;D.update(debt,{},dt);assert.equal(debt.phase,'closing');
 run(debt,1.3);Object.assign(debt.player,D.desk);D.interact(debt);run(debt,1.3);assert.equal(debt.work,0);debt.player.x=610;debt.player.y=574;D.update(debt,{},dt);assert.equal(debt.phase,'won');
});
test('33 motivazioni KO uniche, selezione casuale e scadenza prioritaria',()=>{
 assert.equal(D.koReasons.length,33);assert.equal(new Set(D.koReasons).size,33);
 for(let i=0;i<33;i++){const s=fresh();s.random=()=>(i+.1)/33;s.phase='closing';s.minute=1109.99;s.work=0;s.player.x=610;s.player.y=574;D.update(s,{},dt);assert.equal(s.phase,'lost');assert.equal(s.koReason,D.koReasons[i]);assert.ok(s.message.includes(s.koReason));}
});
test('Animazione caffè: tazzina alla bocca, fine animazione e HUD uscita',()=>{
 const frames=[],elements={},cups=[];let state;
 const context=new Proxy({measureText:t=>({width:t.length*7}),fillRect(...args){if(this.fillStyle==='#fff5df')cups.push(args);}},{get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
 const el=id=>elements[id]||(elements[id]={classList:{toggle(){}},focus(){},getContext:()=>context});
 const wrapped={...D,create(...args){state=D.create(...args);return state;}};
 vm.runInNewContext(source('game.js'),{OfficeSim:S,OfficeDay:wrapped,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLButtonElement:class{},requestAnimationFrame:f=>frames.push(f)});
 frames.shift()(16);state.phase='running';state.spawnIn=1e6;state.player.x=750;state.player.y=146;el('#action').onclick();
 frames.shift()(20);assert.ok(cups.length>0);const initial=JSON.stringify(cups);cups.length=0;run(state,.8);frames.shift()(30);assert.notEqual(JSON.stringify(cups),initial);
 cups.length=0;run(state,1);frames.shift()(40);assert.equal(cups.length,0);
 state.phase='closing';state.minute=1080;frames.shift()(50);assert.equal(el('#exit-notice').hidden,false);assert.equal(el('#exit-countdown').textContent,'30s');
});
test('Sviluppatori: ingresso iniziale, cinque PC distinti e magliette colorate',()=>{
 const s=D.create(()=>.5);assert.equal(s.developers.length,5);assert.equal(new Set(s.developers.map(n=>n.color)).size,5);assert.equal(s.developers.every(n=>!n.active),true);
 run(s,.5);assert.equal(s.developers.filter(n=>n.active).length,1);run(s,15);
 assert.equal(s.minute,540);assert.equal(s.phase,'arrival');assert.equal(s.developers.every(n=>n.mode==='working'),true);
 assert.equal(new Set(s.developers.map(n=>n.home.x+','+n.home.y)).size,5);
 for(const n of s.developers){assert.notDeepEqual(n.home,D.desk);assert.equal(n.x,n.home.x);assert.equal(n.y,n.home.y);assert.equal(n.facing,'up');assert.equal(S.blocked(n.x,n.y),false);}
});
test('Sviluppatore al caffè, sorso animato e ritorno al proprio PC senza deleghe',()=>{
 const s=D.create(()=>.5);run(s,16);s.phase='running';s.nextCallIndex=D.config.callMinutes.length;s.spawnIn=1e6;for(const n of s.developers)n.coffeeAt=Infinity;s.developers[0].coffeeAt=0;
 const modes=new Set();for(let i=0;i<35*60;i++){D.update(s,{},dt);modes.add(s.developers[0].mode);assert.ok(s.developers.filter(n=>['toCoffee','drinking'].includes(n.mode)).length<=1);}
 for(const mode of ['toCoffee','drinking','returning','working'])assert.ok(modes.has(mode));assert.equal(s.developers[0].mode,'working');assert.equal(s.work,480);assert.equal(s.delegations,0);
});
test('Pranzo rallentato, posti liberi per tutti e ritorno alle postazioni',()=>{
 const s=D.create(()=>.5);run(s,16);s.phase='running';s.nextCallIndex=D.config.callMinutes.length;s.spawnIn=1e6;s.minute=780;s.coffeeOwner=s.developers[0].id;s.developers[0].mode='toCoffee';
 D.update(s,{},dt);assert.equal(s.coffeeOwner,null);assert.equal(D.clockRate(s),1.5);run(s,30);
 assert.equal(s.developers.every(n=>n.mode==='eating'),true);assert.equal(new Set(s.developers.map(n=>n.x+','+n.y)).size,5);
 for(const n of s.developers){assert.notDeepEqual(n.seat,D.mealSeat);assert.equal(S.blocked(n.x,n.y),false);}
 assert.ok(s.minute<840);run(s,10.1);assert.ok(s.minute>=840);assert.equal(D.clockRate(s),6);run(s,16);
 assert.equal(s.developers.every(n=>n.mode==='working'),true);
});
test('Etichetta ESCALATION! nei messaggi e nella schermata di sconfitta',()=>{
 const s=fresh();s.phase='closing';s.minute=1109.99;D.update(s,{},dt);assert.ok(s.message.includes('ESCALATION!'));assert.equal(s.message.includes('KO!'),false);
 assert.ok(source('game.js').includes('18:30 — ESCALATION!'));assert.equal(source('game.js').includes('18:30 — KO!'),false);
});
test('Fuga, velocità normale e ripresa della barra',()=>{
 const s=fresh();s.player.x=100;s.player.y=400;const n=D.spawn(s);Object.assign(n,{x:100,y:400,ttl:.02});
 run(s,.5);assert.ok(n.contact>.4);run(s,.5,{right:true,run:true});assert.equal(D.canTalk(n,s.player),false);assert.equal(D.playerIsDisturbed(s),false);
 const progress=n.contact,start={x:n.x,y:n.y};run(s,.5,{right:true,run:true});assert.equal(n.contact,progress);assert.ok(Math.hypot(n.x-start.x,n.y-start.y)<=n.speed*.5+.001);assert.ok(n.ttl<0);
 for(let i=0;i<1200&&!D.canTalk(n,s.player);i++)D.update(s,{},dt);
 assert.equal(D.canTalk(n,s.player),true);assert.equal(n.contact,progress);D.update(s,{},dt);assert.ok(Math.abs(n.contact-progress-dt)<1e-6);
 run(s,n.contactLimit-n.contact+.1);assert.equal(s.delegations,1);const work=s.work;run(s,.5);assert.equal(s.work,work);
});
test('A pranzo gli NPC continuano e nascono in inseguimento a velocità normale',()=>{
 const a=fresh(),b=fresh();a.minute=779.99;b.minute=700;a.player.x=b.player.x=400;a.player.y=b.player.y=400;
 const n=D.spawn(a),m=D.spawn(b);Object.assign(n,{x:100,y:400,ttl:100});Object.assign(m,{x:100,y:400,ttl:100});
 run(a,.5);run(b,.5);assert.ok(D.lunch(a));assert.equal(n.mode,'chase');assert.equal(n.targetId,'player');assert.equal(n.x,m.x);assert.equal(n.y,m.y);
 const spawned=D.spawn(a);assert.equal(spawned.mode,'chase');
 const s=fresh(),dev=s.developers[0];s.minute=780;s.developers=[dev];Object.assign(dev,dev.seat,{active:true,mode:'eating',coffeeAt:Infinity});s.random=()=>.1;
 const visitor=D.spawn(s);Object.assign(visitor,{x:dev.x+45,y:dev.y,ttl:100,contactLimit:.3});assert.equal(visitor.targetId,dev.id);
 run(s,3);assert.equal(dev.receivedDelegations,1);assert.equal(s.delegations,0);
});
test('Una spiegazione in corso non termina a pranzo e blocca la produttività',()=>{
 const s=fresh();s.minute=779;Object.assign(s.player,D.desk);s.working=true;const n=D.spawn(s);Object.assign(n,D.desk,{ttl:100});D.update(s,{},dt);assert.equal(n.mode,'explaining');const work=s.work;
 run(s,.3);assert.ok(D.lunch(s));assert.equal(n.mode,'explaining');assert.ok(n.contact>.3);assert.equal(s.work,work);
});
test('Il collega urgente conclude la spiegazione prima di lasciarti uscire',()=>{
 const s=fresh(5);s.phase='closing';s.minute=1080;s.work=0;s.player.x=610;s.player.y=574;const n=D.spawn(s,true);
 D.update(s,{},dt);assert.equal(n.mode,'explaining');assert.equal(s.phase,'closing');run(s,n.contactLimit+.1);assert.equal(s.delegations,1);assert.ok(s.work>0);assert.equal(s.phase,'closing');assert.notEqual(n.mode,'explaining');
});
test('Disturbatore da sviluppatore a player, arretrati separati e disperazione',()=>{
 const s=fresh();const dev=s.developers.at(-1);s.developers=[dev];Object.assign(dev,dev.home,{active:true,mode:'working',coffeeAt:Infinity});Object.assign(s.player,D.desk);s.working=true;
 const n=D.spawn(s);Object.assign(n,{x:dev.x,y:dev.y,targetId:dev.id,ttl:100,contactLimit:1});D.update(s,{},dt);
 assert.equal(n.mode,'explaining');assert.equal(dev.mode,'listening');assert.equal(dev.interruptedBy,n.id);assert.equal(D.playerIsDisturbed(s),false);const work=s.work;run(s,.4);assert.ok(s.work<work);assert.equal(dev.x,dev.home.x);
 run(s,.7);assert.equal(dev.receivedDelegations,1);assert.ok(dev.extraWork>0);assert.ok(dev.despair>0);assert.equal(s.delegations,0);assert.equal(n.mode,'handoff');assert.equal(n.targetId,'player');assert.equal(dev.interruptedBy,null);
 for(let i=0;i<600&&n.mode!=='explaining';i++)D.update(s,{},dt);assert.equal(n.mode,'explaining');assert.equal(n.targetId,'player');const before=s.work;run(s,n.contactLimit-n.contact+.1);assert.equal(s.delegations,1);assert.ok(s.work>before);assert.ok(s.player.despair>0);
});
test('Una conversazione rivolta a un collega non blocca l’uscita del player',()=>{
 const s=fresh();const dev=s.developers[0];s.developers=[dev];Object.assign(dev,dev.home,{active:true,mode:'working',coffeeAt:Infinity});const n=D.spawn(s);Object.assign(n,{x:dev.x,y:dev.y,targetId:dev.id,ttl:100});D.update(s,{},dt);assert.equal(n.mode,'explaining');
 s.phase='closing';s.minute=1080;s.work=0;s.player.x=610;s.player.y=574;D.update(s,{},dt);assert.equal(s.phase,'won');
});
test('Lavoro a pranzo, penalità esatta −0,25%, caffè e reset',()=>{
 const s=fresh();s.minute=780;Object.assign(s.player,D.desk);D.interact(s);assert.equal(s.working,true);run(s,1);assert.ok(Math.abs(s.work-(480-1.5*s.rules.efficiency))<1e-6);
 s.minute=839.99;D.update(s,{},dt);assert.equal(s.hungerPenalty,true);assert.ok(Math.abs(D.productivity(s)-s.rules.efficiency*.9975)<1e-12);const work=s.work;run(s,1);assert.ok(Math.abs(work-s.work-6*D.productivity(s))<1e-6);
 s.coffeeUntil=s.minute+120;assert.ok(Math.abs(D.productivity(s)-s.rules.efficiency*1.5*.9975)<1e-12);
 const fed=fresh();fed.minute=839.99;fed.ate=true;D.update(fed,{},dt);assert.equal(fed.hungerPenalty,false);assert.equal(D.productivity(fed),fed.rules.efficiency);assert.equal(D.create().hungerPenalty,false);
});
test('Animazione di disperazione sia per il player sia per gli sviluppatori',()=>{
 const frames=[],elements={},hands=[],labels=[];let state;
 const context=new Proxy({measureText:t=>({width:t.length*7}),fillRect(...args){if(this.fillStyle==='#efb28a')hands.push(args);},fillText(text){labels.push(text);}},{get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
 const el=id=>elements[id]||(elements[id]={classList:{toggle(){}},focus(){},getContext:()=>context});const wrapped={...D,create(...args){state=D.create(...args);return state;}};
 vm.runInNewContext(source('game.js'),{OfficeSim:S,OfficeDay:wrapped,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLButtonElement:class{},requestAnimationFrame:f=>frames.push(f)});
 state.phase='running';state.spawnIn=1e6;state.player.despair=1.8;state.player.lastDelegation=42;frames.shift()(16);assert.equal(hands.length,2);assert.ok(labels.includes('NOOO! +42 MIN?!'));const pose=JSON.stringify(hands);hands.length=0;run(state,.2);frames.shift()(20);assert.notEqual(JSON.stringify(hands),pose);
 state.player.despair=0;const dev=state.developers[0];Object.assign(dev,dev.home,{active:true,mode:'working',despair:1.8,lastDelegation:55});hands.length=0;labels.length=0;frames.shift()(30);assert.equal(hands.length,2);assert.ok(labels.includes('NOOO! +55 MIN?!'));
});
test('Visita a un solo sviluppatore: ignora il player vicino ed esce',()=>{
 const s=fresh(5),dev=s.developers.at(-1);s.developers=[dev];Object.assign(dev,dev.home,{active:true,mode:'working',coffeeAt:Infinity});s.random=()=>.1;
 const n=D.spawn(s);n.contactLimit=.3;assert.equal(n.audience,'team');assert.equal(n.targetId,dev.id);assert.ok(D.canTalk(n,s.player));
 for(let i=0;i<2400&&s.npcs.includes(n);i++){D.update(s,{},dt);assert.equal(D.playerIsDisturbed(s),false);assert.notEqual(n.targetId,'player');}
 assert.equal(dev.receivedDelegations,1);assert.equal(s.delegations,0);assert.equal(s.work,480);assert.equal(s.npcs.includes(n),false);assert.deepEqual([...n.visitedRecipients],[dev.id]);
});
test('Visita a più sviluppatori consecutivi senza cercare il player',()=>{
 const s=fresh(5);s.developers=[s.developers[4],s.developers[3],s.developers[1]];for(const d of s.developers)Object.assign(d,d.home,{active:true,mode:'working',coffeeAt:Infinity});s.random=()=>.1;
 const n=D.spawn(s);n.contactLimit=.3;assert.equal(n.audience,'team');s.random=()=>.8;
 for(let i=0;i<3600&&s.npcs.includes(n);i++){D.update(s,{},dt);assert.equal(D.playerIsDisturbed(s),false);assert.notEqual(n.targetId,'player');}
 assert.equal(s.developers.every(d=>d.receivedDelegations===1),true);assert.equal(n.visitedRecipients.length,3);assert.equal(new Set(n.visitedRecipients).size,3);assert.equal(s.delegations,0);assert.equal(s.npcs.includes(n),false);
});
test('Se i destinatari NPC escono, il visitatore dedicato non ripiega sul player',()=>{
 const s=fresh(5),dev=s.developers.at(-1);s.developers=[dev];Object.assign(dev,dev.home,{active:true,mode:'working',coffeeAt:Infinity});s.random=()=>.1;const n=D.spawn(s);assert.equal(n.audience,'team');
 s.phase='closing';s.minute=1080;D.update(s,{},dt);assert.equal(n.mode,'exit');assert.equal(D.playerIsDisturbed(s),false);assert.equal(s.delegations,0);
});
test('Il player trasferisce lavoro solo dopo due secondi, senza duplicarlo',()=>{
 const s=fresh();const d=s.developers[0];s.developers=[d];Object.assign(d,{x:150,y:400,active:true,mode:'working',coffeeAt:Infinity});Object.assign(s.player,{x:150,y:400});s.random=()=>.8;
 D.interact(s);assert.ok(s.playerDelegation);assert.equal(d.interruptedBy,'player');const amount=s.playerDelegation.amount;run(s,1);assert.equal(s.work,480);assert.equal(d.extraWork,0);
 run(s,1.1);assert.equal(s.playerDelegation,null);assert.equal(s.work,480-amount);assert.equal(s.passedWork,amount);assert.equal(d.extraWork,amount);assert.equal(d.receivedDelegations,1);assert.equal(d.interruptedBy,null);
 D.interact(s);run(s,.2);assert.equal(s.passedWork,amount);
});
test('Allontanarsi annulla la delega e libera il collega; non si delega oltre il residuo',()=>{
 const s=fresh();const d=s.developers[0];s.developers=[d];Object.assign(d,{x:150,y:400,active:true,mode:'working',coffeeAt:Infinity});Object.assign(s.player,{x:150,y:400});s.random=()=>.8;
 D.delegateWork(s);run(s,.2);run(s,.5,{right:true,run:true});assert.equal(s.playerDelegation,null);assert.equal(d.interruptedBy,null);assert.equal(s.work,480);assert.equal(d.extraWork,0);
 Object.assign(d,{x:300,y:400,mode:'working'});Object.assign(s.player,{x:300,y:400});s.work=20;assert.equal(D.delegateWork(s),true);run(s,2.1);assert.equal(s.work,0);assert.equal(d.extraWork,20);
});
test('Rifiuto: cuffie o saltelli, fuga più rapida della corsa e ritorno alla routine',()=>{
 for(const style of ['music','hop']){
 const s=fresh(),d=s.developers[0];s.developers=[d];Object.assign(d,{x:300,y:450,active:true,mode:'working',coffeeAt:Infinity});Object.assign(s.player,{x:280,y:450});let rolls=[.1,style==='music'?.1:.8];s.random=()=>rolls.length?rolls.shift():.5;
 assert.equal(D.delegateWork(s),true);assert.equal(d.mode,'fleeing');assert.equal(d.escapeStyle,style);assert.equal(s.playerDelegation,null);const start={x:d.x,y:d.y};run(s,.25);
 assert.ok(Math.hypot(d.x-start.x,d.y-start.y)>190*.25);assert.equal(S.blocked(d.x,d.y),false);assert.equal(s.work,480);assert.equal(D.delegateWork(s),false);
 for(let i=0;i<240;i++){D.update(s,{},dt);assert.equal(S.blocked(d.x,d.y),false);}assert.notEqual(d.mode,'fleeing');assert.equal(d.interruptedBy,null);
 }
});
test('Rendering delle fughe con cuffie, note e saltelli',()=>{
 const frames=[],elements={},labels=[];let state;const context=new Proxy({measureText:t=>({width:t.length*7}),fillText:t=>labels.push(t)},{get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
 const el=id=>elements[id]||(elements[id]={classList:{toggle(){}},focus(){},getContext:()=>context});const wrapped={...D,create(...args){state=D.create(...args);return state;}};
 vm.runInNewContext(source('game.js'),{OfficeSim:S,OfficeDay:wrapped,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLButtonElement:class{},requestAnimationFrame:f=>frames.push(f)});
 const d=state.developers[0];Object.assign(d,{active:true,mode:'fleeing',x:300,y:450,escapeStyle:'music'});frames.shift()(16);assert.ok(labels.includes('NON TI SENTOOO!'));assert.ok(labels.includes('♪'));
 d.escapeStyle='hop';frames.shift()(20);assert.ok(labels.includes('HO UNA CALL!'));
});
test('Call programmate obbligatorie: ritorno al PC, blocco movimento e 60–180 minuti una sola volta',()=>{
 for(const roll of [0,.5,1]){
 const s=fresh();s.nextCallIndex=0;s.minute=629.99;s.player.x=300;s.player.y=450;D.update(s,{},dt);assert.equal(s.call.status,'pending');assert.equal(s.nextCallIndex,1);
 D.interact(s);assert.equal(s.call.status,'pending');Object.assign(s.player,D.desk);D.interact(s);assert.equal(s.call.status,'active');const work=s.work;
 D.interact(s);run(s,1,{right:true,down:true,run:true});assert.equal(s.player.x,D.desk.x);assert.equal(s.player.y,D.desk.y);assert.equal(s.work,work);assert.equal(s.working,false);
 s.random=()=>roll;run(s,5.1,{left:true,run:true});assert.equal(s.call,null);assert.equal(s.callsCompleted,1);assert.equal(s.work,work+Math.round(60+120*roll));const debt=s.work;run(s,.2);assert.equal(s.work,debt);
 s.minute=930;D.update(s,{},dt);assert.equal(s.call.status,'pending');assert.equal(s.nextCallIndex,2);
 }
});
test('In call il disturbatore aspetta senza timeout né progresso e poi riprende',()=>{
 const s=fresh();Object.assign(s.player,D.desk);const n=D.spawn(s);Object.assign(n,D.desk,{ttl:.01,contactLimit:20});D.update(s,{},dt);assert.equal(n.mode,'explaining');const contact=n.contact,ttl=n.ttl;
 s.call={status:'pending',remaining:6};D.interact(s);run(s,2);assert.equal(n.mode,'waitingCall');assert.equal(n.contact,contact);assert.equal(n.ttl,ttl);assert.equal(n.moving,false);assert.equal(D.playerIsDisturbed(s),false);
 run(s,4.1);assert.equal(s.call,null);assert.equal(n.mode,'explaining');assert.ok(n.contact>contact);assert.equal(s.callsCompleted,1);
});
test('Le call impediscono l’uscita e non sospendono le deleghe dirette agli sviluppatori',()=>{
 const s=fresh();s.phase='closing';s.minute=1080;s.work=0;s.player.x=610;s.player.y=574;s.call={status:'pending',remaining:6};D.update(s,{},dt);assert.equal(s.phase,'closing');assert.ok(s.message.includes('call'));
 const a=fresh(),d=a.developers[0];a.developers=[d];Object.assign(d,d.home,{active:true,mode:'working',coffeeAt:Infinity});Object.assign(a.player,D.desk);a.call={status:'pending',remaining:6};D.interact(a);
 const n=D.spawn(a);Object.assign(n,{x:d.x,y:d.y,targetId:d.id,audience:'team',ttl:100,contactLimit:.2});run(a,.5);assert.equal(d.receivedDelegations,1);assert.equal(a.call.status,'active');assert.equal(a.delegations,0);
});
test('Interfaccia call: avviso, pulsante e animazioni di attesa',()=>{
 const frames=[],elements={},labels=[];let state;const context=new Proxy({measureText:t=>({width:t.length*7}),fillText:t=>labels.push(t)},{get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
 const el=id=>elements[id]||(elements[id]={classList:{toggle(){}},focus(){},getContext:()=>context});const wrapped={...D,create(...args){state=D.create(...args);return state;}};
 vm.runInNewContext(source('game.js'),{OfficeSim:S,OfficeDay:wrapped,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLButtonElement:class{},requestAnimationFrame:f=>frames.push(f)});
 state.phase='running';state.nextCallIndex=2;state.spawnIn=Infinity;Object.assign(state.player,D.desk);state.call={status:'pending',remaining:6};frames.shift()(16);assert.equal(el('#call-notice').hidden,false);assert.ok(el('#action').textContent.includes('Partecipa'));
 assert.ok(labels.some(t=>t.includes('DRIIIN')||t.includes('PRONTOOO')));
 el('#action').onclick();const n=D.spawn(state);Object.assign(n,D.desk);run(state,.2);frames.shift()(20);assert.equal(el('#action').disabled,true);assert.ok(el('#call-notice').textContent.includes('IN CORSO'));assert.ok(labels.includes('IN CALL · ASCOLTO'));assert.ok(labels.some(t=>t.includes('orologio')));
});
test('Visitatore dal portone raggiunge il programmatore lontano anche dopo la pazienza',()=>{
 const s=fresh(),d=s.developers[0];s.developers=[d];
 Object.assign(d,d.home,{active:true,mode:'working',coffeeAt:Infinity});
 Object.assign(s.player,{x:900,y:450});s.random=()=>.1;
 const n=D.spawn(s);assert.equal(n.audience,'team');assert.equal(n.targetId,d.id);
 n.ttl=.1;
 for(let i=0;i<2400&&s.npcs.includes(n);i++)D.update(s,{},dt);
 assert.equal(d.receivedDelegations,1);assert.equal(s.delegations,0);
 assert.equal(s.npcs.includes(n),false);
});
test('Porta: quattro spinte animate, un solo NPC di panico e nessun lavoro aggiunto',()=>{
 for(const roll of [.1,.3,.6,.9]){
  const s=fresh();s.phase='closing';s.minute=1080;s.work=20;s.random=()=>roll;
  Object.assign(s.player,{x:610,y:574});D.update(s,{},dt);
  const style=s.player.knockback.style;assert.equal(style,['roll','backroll','spin','knees'][Math.floor(roll*4)]);
  assert.equal(s.npcs.filter(n=>n.doorGuard).length,1);const guard=s.npcs.find(n=>n.doorGuard);
  assert.equal(guard.mode,'doorPush');assert.ok(guard.phrase.includes('!!!'));
  run(s,1.3,{down:true,run:true});assert.equal(s.player.knockback,null);assert.ok(s.player.y<510);
  assert.equal(S.blocked(s.player.x,s.player.y),false);assert.equal(s.work,20);assert.equal(s.delegations,0);
  assert.equal(guard.mode,'panic');assert.equal(guard.x,610);assert.equal(guard.y,560);assert.equal(guard.moving,false);
  Object.assign(s.player,{x:610,y:574});D.update(s,{},dt);assert.equal(s.npcs.filter(n=>n.doorGuard).length,1);
  run(s,1.3);s.work=0;Object.assign(s.player,{x:610,y:574});D.update(s,{},dt);assert.equal(s.phase,'won');
 }
});
test('Chi spinge aspetta la fine della caduta, urla fermo e poi esce anche con arretrato',()=>{
 const s=fresh();s.phase='closing';s.minute=1080;s.work=100;
 Object.assign(s.player,{x:610,y:574});D.update(s,{},dt);
 const guard=s.npcs.find(n=>n.doorGuard),phrase=guard.phrase;
 run(s,1);assert.ok(s.player.knockback);assert.equal(guard.mode,'doorPush');
 assert.equal(guard.x,610);assert.equal(guard.y,560);
 run(s,.3);assert.equal(s.player.knockback,null);assert.equal(guard.mode,'panic');
 run(s,1,{left:true});assert.equal(guard.mode,'panic');assert.equal(guard.phrase,phrase);
 assert.equal(guard.x,610);assert.equal(guard.y,560);assert.equal(guard.moving,false);
 run(s,1.5);assert.equal(s.npcs.includes(guard),false);assert.equal(s.work,100);
});
test('Prima delle 18 la porta non spinge il player',()=>{
 const s=fresh();s.minute=1000;s.player.x=610;s.player.y=574;D.update(s,{},dt);
 assert.equal(s.player.knockback,undefined);assert.equal(s.npcs.some(n=>n.doorGuard),false);
});
test('Rendering: capriole, trottola e frenata sulle ginocchia',()=>{
 const frames=[],elements={},labels=[],rotations=[];let state;
 const context=new Proxy({measureText:t=>({width:t.length*7}),fillText:t=>labels.push(t),rotate:a=>rotations.push(a)},{get:(t,p)=>p in t?t[p]:()=>{},set:(t,p,v)=>(t[p]=v,true)});
 const el=id=>elements[id]||(elements[id]={classList:{toggle(){}},focus(){},getContext:()=>context});
 const wrapped={...D,create(...args){state=D.create(...args);return state;}};
 vm.runInNewContext(source('game.js'),{OfficeSim:S,OfficeDay:wrapped,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},HTMLButtonElement:class{},requestAnimationFrame:f=>frames.push(f)});
 for(const [style,text] of [['roll','CAPRIOLA'],['backroll','ROTOLAMENTO'],['spin','TROTTOLA'],['knees','GINOCCHIA']]){
  state.npcs=[{doorGuard:true,urgent:true,mode:'doorPush',x:610,y:560,phrase:'DEVI FINIRE!!!'}];
  labels.length=0;state.player.knockback={style,elapsed:.3,duration:1.2};frames.shift()(16);
  assert.ok(labels.some(t=>t.includes(text)));assert.equal(el('#action').disabled,true);
  assert.equal(labels.includes('DEVI FINIRE!!!'),false);
 }
 assert.equal(rotations.length,4);assert.ok(rotations[0]>0);assert.ok(rotations[1]<0);
 state.player.knockback=null;state.npcs[0].mode='panic';frames.shift()(16);assert.ok(labels.includes('DEVI FINIRE!!!'));
});
console.log(count+' test completati.');

