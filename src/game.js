(() => {
'use strict';
const canvas=document.querySelector('#game'),c=canvas.getContext('2d'),sim=OfficeSim,world=sim.world,keys=new Set();let day=OfficeDay.create(),player=day.player,last=0,accumulator=0,workAnimation=0,started=false;
c.imageSmoothingEnabled=false;
const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
function label(text,x,y,color='#b7cab1',size=10){c.fillStyle=color;c.font=`${size}px monospace`;c.fillText(text,x,y);}
function shadow(o){rect(o.x+5,o.y+o.h-4,o.w,10,'#0002');}
function lunchSetting(){
 // The meal occupies the seat directly in front of the player.
 const x=OfficeDay.mealSeat.x,y=264;
 rect(x-26,y-15,60,32,'#e5d9b5');
 c.fillStyle='#f8f0d9';c.beginPath();c.ellipse(x,y,12,9,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#aebca7';c.lineWidth=2;c.stroke();
 rect(x-6,y-3,10,5,'#dba552');rect(x+1,y-5,5,4,'#769353');rect(x-5,y+3,7,2,'#c4774a');
 // Fork on the left, knife on the right.
 rect(x-19,y-7,2,18,'#849a93');rect(x-22,y-8,2,6,'#849a93');rect(x-16,y-8,2,6,'#849a93');rect(x-22,y-3,8,2,'#849a93');
 rect(x+17,y-8,4,10,'#c1ccc0');rect(x+18,y+2,2,9,'#6e827a');
 // Water bottle, with neck, cap and a paper label.
 rect(x+27,y-19,5,5,'#48736b');rect(x+26,y-14,7,5,'#8dc2b4');rect(x+24,y-9,11,19,'#70ac9e');rect(x+25,y-2,9,7,'#e2ebd2');rect(x+26,y-8,2,5,'#b8dcd0');
}

function developerMealSetting(dev,table){
 const x=dev.seat.x,y=dev.seat.facing==='up'?table.y+table.h-18:table.y+16;
 rect(x-19,y-10,40,22,'#e5d9b5');
 c.fillStyle='#f8f0d9';c.beginPath();c.ellipse(x,y,8,6,0,0,Math.PI*2);c.fill();
 rect(x-4,y-2,7,4,'#dba552');rect(x+1,y-4,4,3,'#769353');
 rect(x-14,y-5,2,13,'#849a93');rect(x+11,y-5,2,13,'#849a93');
 rect(x+17,y-11,4,3,'#48736b');rect(x+15,y-8,7,13,'#70ac9e');rect(x+16,y-2,5,4,'#e2ebd2');
}
function object(o){const {x,y,w,h,kind}=o;shadow(o);
if(kind==='wall'||kind==='partition'){rect(x,y,w,h,'#354c45');rect(x,y,w,5,'#789084');if(kind==='wall'&&y===0){rect(x,31,w,21,'#4c665a');for(let i=60;i<900;i+=180){rect(i,9,116,23,'#96b8ae');rect(i+3,12,110,15,'#a5c6b8');rect(i+56,9,3,23,'#526e61');}}return;}
if(kind==='desk'){rect(x,y,w,h,'#635345');rect(x,y,w,h-9,'#bdab83');rect(x+3,y+3,w-6,2,'#dfcfaa');rect(x+37,y+10,45,28,'#34494c');rect(x+41,y+13,37,19,'#82b5a5');rect(x+45,y+17,22,2,'#c6e2b8');rect(x+45,y+22,29,2,'#b0d0af');rect(x+55,y+38,10,4,'#465854');rect(x+37,y+45,43,10,'#e1dbc1');for(let a=0;a<5;a++)rect(x+41+a*7,y+48,4,2,'#8d998a');rect(x+94,y+18,9,12,'#e6dfc5');rect(x+15,y+22,12,20,'#f1e4b8');rect(x+45,y+73,34,23,'#334e4a');rect(x+42,y+84,40,7,'#50736b');return;}
if(kind==='plant'){rect(x+5,y+14,19,16,'#b08b69');rect(x+3,y+6,23,15,'#558354');rect(x+9,y,12,24,'#6d9c60');rect(x,y+11,28,7,'#83ad6c');return;}
if(kind==='coffee'){rect(x,y,w,h,'#a58b69');rect(x+8,y+2,38,39,'#354746');rect(x+12,y+6,30,10,'#4e6960');rect(x+17,y+19,20,15,'#172e2c');rect(x+23,y+26,9,8,'#ede2bf');rect(x+55,y+18,9,14,'#eadbb5');return;}
if(kind==='counter'){rect(x,y,w,h,'#8b7d64');rect(x,y,w,8,'#d7c5a0');rect(x+10,y+16,18,22,'#aa9879');rect(x+34,y+16,18,22,'#aa9879');return;}
if(kind==='fridge'){rect(x,y,w,h,'#d0d8c7');rect(x+3,y+3,w-6,h-7,'#b4c4b3');rect(x+2,y+24,w-4,3,'#819b8d');rect(x+34,y+32,4,16,'#526f65');return;}
if(kind==='table'){rect(x,y,w,h,'#a58b68');rect(x+3,y+3,w-6,h-10,'#dbc69a');rect(x+21,y+17,11,12,'#f0e4cb');rect(x+63,y+31,21,12,'#8ca876');if(day.sitting&&o.y===228)lunchSetting();for(const dev of day.developers)if(dev.active&&dev.mode==='eating'&&(dev.seat.y<330?228:358)===o.y)developerMealSetting(dev,o);for(const cx of [x+15,x+67]){rect(cx,y-23,26,17,'#698175');rect(cx,y+h+5,26,17,'#698175');}return;}
if(kind==='sofa'){rect(x,y,w,h,'#3a6562');rect(x+9,y+9,w-18,h-17,'#688e7b');rect(x,y,10,h,'#416c63');rect(x+w-10,y,10,h,'#416c63');rect(x+w/2,y+9,3,h-17,'#416c63');}
}
function person(actor=player){if(actor.mode==='waitingCall'){waitingPerson(actor);return;}if(actor===player&&day.call&&day.call.status==='active'){standupPerson();return;}if(actor.type==='developer'&&actor.mode==='fleeing'){escapingPerson(actor);return;}if(actor.despair>0){despairPerson(actor);return;}if(actor.type==='developer'&&actor.mode==='working'){workingPerson(actor,actor.anim);return;}if(actor===player&&day.phase==='standup'){standupPerson();return;}if(actor===player&&animatingWork()){workingPerson();return;}const p=actor;const x=Math.round(p.x),y=Math.round(p.y),walk=p.moving?Math.sin(p.steps)*2:0;c.fillStyle='#0003';c.beginPath();c.ellipse(x,y+3,12,5,0,0,Math.PI*2);c.fill();rect(x-7,y-8,6,11+Math.round(walk),'#263c48');rect(x+1,y-8,6,11-Math.round(walk),'#263c48');rect(x-8,y-21,16,15,actor.color||'#e3d7ad');if(actor.color&&actor.type!=='developer'){rect(x-3,y-21,6,10,'#e8e3d1');rect(x-1,y-20,2,12,'#974e4c');}rect(x-11,y-19,4,11,actor.type==='developer'?actor.color:'#b8ac89');rect(x+7,y-19,4,11,actor.type==='developer'?actor.color:'#b8ac89');rect(x-6,y-35,12,15,'#d7a77e');rect(x-7,y-37,14,7,'#49423a');if(p.facing==='up')rect(x-7,y-31,14,8,'#49423a');else{if(p.facing!=='right')rect(x-4,y-28,2,2,'#36392f');if(p.facing!=='left')rect(x+3,y-28,2,2,'#36392f');}if(p.facing==='down'&&actor.type!=='developer'){rect(x-1,y-20,3,10,'#7b6652');rect(x+4,y-16,3,4,'#b1cc88');}if(actor===player&&day.drinking>0)drinkingCup();if(actor.type==='developer'){if(actor.mode==='drinking')drinkingCup(actor);if(actor.mode==='eating'){const lift=Math.round(Math.sin(actor.anim*4)*3);rect(x+7,y-23-lift,5,7,actor.color);rect(x+6,y-28-lift,5,4,'#e7b089');}}}



function knockedPerson(){
 const hit=player.knockback,t=hit.elapsed/hit.duration,x=player.x,y=player.y;
 c.fillStyle='#0003';c.beginPath();c.ellipse(x,y+4,22,6,0,0,Math.PI*2);c.fill();
 // Dust and skid marks stay on the floor while the body tumbles.
 for(let i=0;i<4;i++){rect(x-19+i*11,y+10+i*4,5,3,'#e6dcc1');rect(x-13+i*8,y+17+i*5,2,8,'#76876d');}
 c.save();c.translate(x,y-14);
 if(hit.style==='spin'){c.rotate(t*Math.PI*8);c.scale(1,.7+.3*Math.abs(Math.cos(t*Math.PI*8)));}
 else if(hit.style!=='knees')c.rotate((hit.style==='backroll'?-1:1)*t*Math.PI*4);
 else c.rotate(Math.sin(t*Math.PI)*-.35);
 if(hit.style==='knees'){
  rect(-12,7,12,7,'#263c48');rect(3,7,12,7,'#263c48');rect(-10,-10,20,19,'#e3d7ad');
  rect(-21,0,12,5,'#e7b089');rect(9,0,12,5,'#e7b089');
 }else{
  rect(-9,0,7,12,'#263c48');rect(3,0,7,12,'#263c48');rect(-9,-15,18,18,'#e3d7ad');
  rect(-21,-12,12,5,'#e7b089');rect(9,-12,12,5,'#e7b089');
 }
 rect(-6,-29,12,15,'#d7a77e');rect(-7,-31,14,6,'#49423a');
 rect(-4,-23,2,3,'#36392f');rect(3,-23,2,3,'#36392f');rect(-2,-18,5,3,'#805343');
 c.restore();
 label(({roll:'CAPRIOLA DI STRAORDINARIO!',backroll:'ROTOLAMENTO ALL’INDIETRO!',spin:'TROTTOLA AZIENDALE!',knees:'FRENO A GINOCCHIA!!!'})[hit.style],x-88,y-62,'#8c3429',10);
}
function waitingPerson(actor){
 const t=actor.waitAnim||0;
 person({...actor,mode:'waitingPose',steps:t*15,moving:actor.moving||Math.sin(t*3)>.4});
 const x=Math.round(actor.x),y=Math.round(actor.y);
 if(actor.id%2){
  rect(x-13,y-20,8,4,actor.color);rect(x-13,y-23,5,4,'#e7b089');rect(x-11,y-22,3,2,'#dce2c9');
  label('Guardo solo l’orologio…',x-65,y-52,'#654c3f',9);
 }else{
  const lift=Math.round(Math.sin(t*5)*3);rect(x+9,y-21-lift,5,8,actor.color);rect(x+9,y-25-lift,5,4,'#e7b089');
  label('Toc toc… quando finisci?',x-67,y-52,'#654c3f',9);
 }
 for(let i=0;i<3;i++)if(t%1.5>i*.4)rect(x-5+i*5,y-44,2,2,'#654c3f');
}
function escapingPerson(actor){
 const hop=actor.escapeStyle==='hop'?Math.abs(Math.sin(actor.anim*13))*12:Math.sin(actor.anim*11)*2;
 person({...actor,mode:'escapePose',y:actor.y-hop});
 const x=Math.round(actor.x),y=Math.round(actor.y-hop);
 if(actor.escapeStyle==='music'){
  rect(x-8,y-39,16,3,'#eb7bd4');rect(x-10,y-36,4,12,'#684d9d');rect(x+6,y-36,4,12,'#684d9d');
  label('♪',x+15,y-39-Math.sin(actor.anim*7)*5,'#704485',18);label('♫',x-27,y-48+Math.sin(actor.anim*9)*4,'#704485',15);
  label('NON TI SENTOOO!',x-43,y-64,'#704485',10);
 }else{
  rect(x-18,y-24,8,4,actor.color);rect(x+10,y-29,8,4,actor.color);
  label('HO UNA CALL!',x-35,y-58,'#315d64',10);
  for(let i=0;i<3;i++)rect(x-24-i*5,y+i*5,7,2,'#e9eed0');
 }
}
function despairPerson(actor){
 const t=1.8-actor.despair,x=Math.round(actor.x),y=Math.round(actor.y),shake=Math.round(Math.sin(t*24)*2),bob=Math.round(Math.abs(Math.sin(t*12))*2),shirt=actor.color||'#e3d7ad';
 c.fillStyle='#0003';c.beginPath();c.ellipse(x,y+3,12,5,0,0,Math.PI*2);c.fill();
 rect(x-7,y-8,6,11,'#263c48');rect(x+1,y-8,6,11,'#263c48');
 rect(x-8,y-22+bob,16,16,shirt);
 rect(x-6+shake,y-37+bob,12,15,'#d7a77e');rect(x-7+shake,y-39+bob,14,6,'#49423a');
 rect(x-4+shake,y-29+bob,2,2,'#36392f');rect(x+3+shake,y-29+bob,2,2,'#36392f');rect(x-2+shake,y-24+bob,5,2,'#805343');
 // Both arms are raised, hands pressed to the sides of the head.
 rect(x-13,y-29+bob,5,14,shirt);rect(x+8,y-29+bob,5,14,shirt);
 rect(x-12+shake,y-35+bob,5,7,'#efb28a');rect(x+7+shake,y-35+bob,5,7,'#efb28a');
 rect(x+14+shake,y-32+Math.round(t*6)%8,2,4,'#87d4d4');
 const text='NOOO! +'+actor.lastDelegation+' MIN?!',w=text.length*6+20,bx=Math.max(4,Math.min(956-w,x-w/2)),by=Math.max(56,y-72);
 rect(bx,by,w,22,'#ffe5bc');rect(bx,by,w,2,'#d58c61');rect(x-3,by+22,6,5,'#ffe5bc');label(text,bx+9,by+15,'#8c3429',10);
}
function standupPerson(){
 const t=day.call&&day.call.status==='active'?OfficeDay.config.callDuration-day.call.remaining:Math.max(0,3-day.standup),x=Math.round(player.x),y=Math.round(player.y);
 const nod=Math.round(Math.sin(t*5)*1.5),head=y-35+nod,blink=t%1.5>1.35;
 c.fillStyle='#0003';c.beginPath();c.ellipse(x,y+3,12,5,0,0,Math.PI*2);c.fill();
 rect(x-7,y-8,6,11,'#263c48');rect(x+1,y-8,6,11,'#263c48');
 rect(x-8,y-21,16,15,'#e3d7ad');rect(x-11,y-19,4,11,'#b8ac89');rect(x+7,y-19,4,11,'#b8ac89');
 rect(x-1,y-20,3,10,'#7b6652');rect(x+4,y-16,3,4,'#b1cc88');
 rect(x-6,head,12,15,'#d7a77e');rect(x-7,head-2,14,7,'#49423a');
 rect(x-4,head+7,2,blink?1:2,'#36392f');rect(x+3,head+7,2,blink?1:2,'#36392f');
 // Red headband and padded earcups follow the nodding head.
 rect(x-8,head-4,16,3,'#e34b4b');rect(x-10,head-2,3,10,'#e34b4b');rect(x+7,head-2,3,10,'#e34b4b');
 rect(x-11,head+5,5,9,'#b82735');rect(x+6,head+5,5,9,'#b82735');
 rect(x-10,head+6,2,5,'#f97a71');rect(x+8,head+6,2,5,'#f97a71');
 rect(x+10,head+12,2,4,'#384840');rect(x+4,head+15,8,2,'#384840');rect(x+3,head+14,3,3,'#202e28');
 rect(x-74,y-74,148,23,'#203a31');
 for(let i=0;i<4;i++){const h=3+Math.round((Math.sin(t*9+i*1.7)+1)*3);rect(x-67+i*4,y-58-h,2,h,'#b7da88');}
 label('IN CALL · ASCOLTO',x-44,y-59,'#e5efcb',10);
}
function drinkingCup(actor=player){const player=actor;
 const progress=1-(actor.type==='developer'?actor.drinking:day.drinking)/OfficeDay.config.drinkDuration,lift=Math.sin(progress*Math.PI),x=player.x+12-Math.round(lift*7),y=player.y-18-Math.round(lift*11);
 rect(player.x+7,player.y-20,5,10,actor.color||'#b8ac89');rect(x-2,y+3,7,5,'#e7b089');
 rect(x,y,9,7,'#fff5df');rect(x+9,y+1,3,4,'#fff5df');rect(x+9,y+2,1,2,'#526b56');
 rect(x+1,y,7,2,'#7c5239');rect(x+2,y-5-Math.round(progress*3),1,3,'#e5e9d6');
}
function wrapText(text,x,y,maxWidth,size=13){
 c.font=size+'px monospace';let line='',row=0;
 for(const word of text.split(' ')){const next=line?line+' '+word:word;if(c.measureText(next).width>maxWidth&&line){label(line,x,y+row*21,'#eddbc3',size);row++;line=word;}else line=next;}
 if(line)label(line,x,y+row*21,'#eddbc3',size);
}
function animatingWork(){
 return !(day.call&&day.call.status==='active')&&['running','closing'].includes(day.phase)&&day.drinking<=0&&day.working&&day.work>0&&Math.hypot(player.x-OfficeDay.desk.x,player.y-OfficeDay.desk.y)<38&&player.despair<=0&&!OfficeDay.playerIsDisturbed(day);
}
function workingPerson(actor=player,t=workAnimation){
 const x=Math.round(actor.x),y=Math.round(actor.y);
 const usingMouse=t%4>=1.7,leftTap=Math.round(Math.sin(t*26)*2),rightTap=Math.round(Math.sin(t*26+Math.PI)*2);
 const mouseX=x+38+Math.round(Math.sin(t*8)*3),mouseY=y-32+Math.round(Math.cos(t*6)*2);
 // Seated back view: shoulders lean over the desk, arms reach the peripherals.
 rect(x-17,y-13,34,18,'#334e4a');rect(x-14,y-6,28,10,'#50736b');
 rect(x-7,y-10,5,12,'#263c48');rect(x+2,y-10,5,12,'#263c48');
 rect(x-9,y-29,18,19,actor.color||'#e3d7ad');rect(x-6,y-42,12,13,'#d7a77e');
 rect(x-7,y-44,14,13,'#49423a');rect(x-5,y-42,4,2,'#6c6151');
 // Left hand taps keys; the right alternates between typing and moving/clicking the mouse.
 rect(x-15,y-28,7,11,actor.color||'#b8ac89');rect(x-18,y-33+leftTap,6,10-leftTap,actor.color||'#b8ac89');
 rect(x-20,y-36+leftTap,8,5,'#e7b089');
 if(usingMouse){
  rect(x+9,y-26,9,7,actor.color||'#b8ac89');rect(x+16,y-29,mouseX-x-15,6,actor.color||'#b8ac89');
  rect(mouseX-2,mouseY-2,11,8,'#dde4cf');rect(mouseX+3,mouseY-1,1,3,'#7f9586');
  rect(mouseX-3,mouseY-5,9,6,'#e7b089');
  if(Math.sin(t*20)>.7)rect(mouseX+2,mouseY-4,3,2,'#f6d7a8');
  // Small cursor moving across the monitor accompanies the mouse gesture.
  rect(x-9+Math.round(Math.sin(t*4)*7),y-56+Math.round(Math.cos(t*3)*4),2,3,'#f1f2c9');
 }else{
  rect(x+8,y-28,7,11,actor.color||'#b8ac89');rect(x+13,y-33+rightTap,6,10-rightTap,actor.color||'#b8ac89');
  rect(x+12,y-36+rightTap,8,5,'#e7b089');rect(x+36,y-35,10,8,'#dde4cf');rect(x+40,y-34,1,3,'#7f9586');
  rect(x+14,y-34+rightTap,3,2,'#f6d7a8');
 }
 rect(x-18,y-34+leftTap,3,2,'#f6d7a8');
}
function render(){rect(0,0,960,600,'#a5aa88');for(let y=52;y<580;y+=24)for(let x=20;x<940;x+=24){rect(x,y,23,23,((x/24|0)+(y/24|0))%2?'#a8ae8d':'#a1a887');}rect(656,52,284,528,'#c0b18b');for(let y=52;y<580;y+=32)rect(656,y,284,1,'#b2a27e');rect(27,437,607,100,'#8d9f80');rect(32,443,596,2,'#b2bf96');label('PRODUCTIVITY DEPARTMENT',66,93,'#4c6656',12);label('BREAK ROOM',710,185,'#796d52',12);label('TAKE A BREATH.',740,541,'#796d52',10);label('AI TRANSFORMATION',77,472,'#455f50',11);label('Your future is being optimized.',77,490,'#5c7360',9);
const layers=world.objects.map(o=>({depth:o.y+o.h,draw:()=>object(o)}));for(const dev of day.developers)if(dev.active)layers.push({depth:dev.y,draw:()=>person(dev)});for(const npc of day.npcs)layers.push({depth:npc.y,draw:()=>person(npc)});layers.push({depth:player.y,draw:()=>player.knockback?knockedPerson():person()});layers.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());const colleague=OfficeDay.delegationCandidate(day);if(!(day.call&&day.call.status==='active')&&colleague&&day.work>0&&['running','closing'].includes(day.phase))label('[E] DELEGA',colleague.x-31,colleague.y-50,'#264e35',10);const near=nearby();if(near&&!day.sitting){label('[E]',player.x-10,player.y-46,'#263d32',11);}drawDay();document.querySelector('#zone').textContent=player.x>656?'SALA BREAK':'OPEN SPACE';}
function nearby(){return Math.hypot(player.x-OfficeDay.desk.x,player.y-OfficeDay.desk.y)<38||Math.hypot(player.x-OfficeDay.mealSeat.x,player.y-OfficeDay.mealSeat.y)<55||(player.x>688&&player.x<810&&player.y>125&&player.y<167);}
function loadDay(next){day=next;player=day.player;keys.clear();last=0;accumulator=0;workAnimation=0;canvas.focus();}
function interact(){if(!started)return;if(day.phase==='won'){loadDay(OfficeDay.nextLevel(day)||OfficeDay.create(day.random,1));return;}if(day.phase==='lost'){loadDay(OfficeDay.create(day.random,day.level));return;}OfficeDay.interact(day);}
const allowed=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyE']);
window.addEventListener('keydown',e=>{if(!started||!allowed.has(e.code)||e.target instanceof HTMLButtonElement)return;e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat)interact();});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0;accumulator=0;});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{if(!started)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);if(b.dataset.key==='KeyE')interact();});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(b.dataset.key));});
document.querySelector('#start').onclick=()=>{if(started)return;started=true;document.querySelector('#start-screen').hidden=true;document.querySelector('#game-screen').hidden=false;keys.clear();last=0;accumulator=0;canvas.focus();};
document.querySelector('#action').onclick=()=>{interact();canvas.focus();};
document.querySelector('#reset').onclick=()=>loadDay(OfficeDay.create(day.random,day.level));
document.querySelector('#next').onclick=()=>{if(day.phase==='won')loadDay(OfficeDay.nextLevel(day)||OfficeDay.create(day.random,1));};


function bubble(n){
 const shouting=n.urgent&&['chase','explaining','panic'].includes(n.mode),text=n.phrase;c.font=shouting?'bold 12px monospace':'10px monospace';
 const width=Math.ceil(c.measureText(text).width)+(shouting?42:16),height=shouting?44:22;
 const x=Math.max(shouting?12:5,Math.min(948-width,n.x-width/2)),y=Math.max(58,n.y-(shouting?92:68));
 if(shouting){
  c.beginPath();const cx=x+width/2,cy=y+height/2;
  for(let i=0;i<24;i++){const angle=i*Math.PI/12,factor=i%2?0.78:1,px=cx+Math.cos(angle)*width/2*factor,py=cy+Math.sin(angle)*height/2*factor;if(i===0)c.moveTo(px,py);else c.lineTo(px,py);}
  c.closePath();c.fillStyle='#fff3ba';c.fill();c.strokeStyle='#b33327';c.lineWidth=2;c.stroke();
  c.beginPath();c.moveTo(n.x-7,y+height-4);c.lineTo(n.x+3,y+height+10);c.lineTo(n.x+6,y+height-6);c.stroke();
  c.fillStyle='#99291e';c.fillText(text,x+(width-c.measureText(text).width)/2,y+height/2+4);
 }else{rect(x+2,y+2,width,height,'#0003');rect(x,y,width,height,['chase','explaining'].includes(n.mode)?'#fff1d6':'#dce8cc');rect(n.x-3,y+height,6,5,'#fff1d6');label(text,x+8,y+15,'#414136',10);}
}

function ringingPC(){
 if(!day.call||day.call.status!=='pending')return;
 const t=day.officeElapsed,shake=Math.round(Math.sin(t*45)*3),x=488+shake,y=292;
 // Redraw the monitor over its stationary version so the PC visibly rattles.
 rect(463,292,51,32,'#bdab83');rect(x-23,y,45,28,'#34494c');rect(x-19,y+3,37,19,'#82b5a5');
 rect(x-15,y+7,22,2,'#c6e2b8');rect(x-15,y+12,29,2,'#b0d0af');rect(x-5,y+28,10,4,'#465854');
 for(const side of [-1,1]){rect(488+side*31,y+4,2,17,'#b33327');rect(488+side*37,y+8,2,9,'#b33327');}
 const text=Math.sin(t*7)>0?'DRIIIN! ♪':'♪ PRONTOOO?';
 bubble({x:488,y:290,urgent:true,mode:'panic',phrase:text});
}
function drawDay(){
 ringingPC();
 c.strokeStyle='#d6ee9b';c.lineWidth=2;c.strokeRect(426,280,124,70);label('IL TUO PC · E',438,273,'#264e35',11);rect(580,580,60,20,'#b6c4a0');label(day.phase==='closing'?'USCITA ↓':'INGRESSO',580,559,'#2a4b38',10);if(day.phase==='closing'){c.strokeStyle=day.work<=0?'#e7f4a5':'#e8aa73';c.lineWidth=3;c.strokeRect(582,565,56,31);}
 if(day.working)label('LAVORO ×'+OfficeDay.productivity(day).toFixed(3),player.x-38,player.y-46,'#244932',10);
 
 const mealProgress=day.ate?1:Math.max(0,Math.min(1,day.meal/5)),mealPercent=day.ate?100:Math.min(99,Math.round(mealProgress*100));
 document.querySelector('#lunch-progress').value=mealProgress*5;
 document.querySelector('#lunch-label').textContent=day.ate?'Pranzo completato ✓':day.hungerPenalty?'Pranzo saltato · −0,25%':day.sitting?'Pranzo · '+mealPercent+'%':'Pranzo · siediti al tavolo';
 if(day.sitting){
  label(day.ate?'PRANZO COMPLETATO':'STAI MANGIANDO',player.x-48,player.y-47,'#314c36',10);
  rect(player.x-53,player.y+13,106,29,'#233c32');rect(player.x-49,player.y+17,98,8,'#4d6656');
  rect(player.x-49,player.y+17,Math.round(98*mealProgress),8,'#d6ee94');
  label(day.ate?'BUON PRANZO!':mealPercent+'% · resta seduto',player.x-45,player.y+36,'#edf3ce',9);
 }
 if(day.drinking>0)label('UN SORSO DI CAFFÈ…',player.x-52,player.y-48,'#244932',10);
 const action=document.querySelector('#action'),atDesk=Math.hypot(player.x-OfficeDay.desk.x,player.y-OfficeDay.desk.y)<38,atTable=Math.hypot(player.x-OfficeDay.mealSeat.x,player.y-OfficeDay.mealSeat.y)<55;
 action.textContent='E · '+(day.call&&day.call.status==='active'?'In call...':day.call&&atDesk?'Partecipa alla call':day.playerDelegation?'Interrompi delega':OfficeDay.delegationCandidate(day)&&day.work>0&&['running','closing'].includes(day.phase)?'Delega lavoro':day.phase==='won'?'Continua':day.phase==='lost'?'Riprova':day.phase==='standup'?'Standup…':day.drinking>0?'Bevendo…':atDesk?(day.phase==='arrival'?'Avvia standup':day.working?'Alzati dal PC':'Lavora al PC'):atTable&&OfficeDay.lunch(day)?(day.sitting?'Alzati dal tavolo':'Siediti e pranza'):player.x>688&&player.x<810&&player.y>125&&player.y<167?'Prendi un caffè':'Interagisci');
 action.disabled=!!player.knockback||day.phase==='standup'||day.drinking>0||!!(day.call&&day.call.status==='active');

 if(day.playerDelegation){
  const task=day.playerDelegation,dev=day.developers.find(d=>d.id===task.targetId);
  if(dev){rect(dev.x-25,dev.y+12,50,6,'#354b42');rect(dev.x-25,dev.y+12,Math.round(50*task.progress/task.duration),6,'#a9db78');label('DELEGA '+task.amount+' MIN',dev.x-48,dev.y-52,'#264e35',10);}
 }
 for(const n of day.npcs){
 if((!n.doorGuard||!player.knockback)&&(['chase','explaining','handoff','panic'].includes(n.mode)||(n.mode==='break'&&n.phrase.startsWith('Grazie'))))bubble(n);
 if(n.contact>0){rect(n.x-18,n.y+10,36,5,'#3c4035');rect(n.x-18,n.y+10,Math.round(36*n.contact/n.contactLimit),5,'#e58c69');}
 }
 
 document.querySelector('.live').textContent=OfficeDay.lunch(day)?'● PAUSA · TEMPO RALLENTATO':'● IN SERVIZIO';
 document.querySelector('#level-label').textContent='LIVELLO '+day.level+' / '+OfficeDay.levels.length+' · '+day.rules.name.toUpperCase();
 document.querySelector('.eyebrow').textContent='UN ALTRO SPLENDIDO LUNEDÌ · GIORNATA '+String(day.level).padStart(2,'0');
 document.querySelector('#event-popup').hidden=day.eventPopup<=0||day.phase!=='running';
 document.querySelector('.toolbar').classList.toggle('event-active',day.lastMinuteEvent&&['running','closing'].includes(day.phase));
 const callNotice=document.querySelector('#call-notice');callNotice.hidden=!day.call||!['running','closing'].includes(day.phase);
 callNotice.textContent=day.call?(day.call.status==='active'?'CALL IN CORSO · '+Math.ceil(day.call.remaining)+'s · Rimani al PC, i colleghi aspettano.':'CALL IN ARRIVO - '+Math.max(0,Math.ceil((day.call.deadline??day.minute+60)-day.minute))+' min per rispondere al PC con E. Puoi continuare le altre attivita.') : '';
 const emailNotice=document.querySelector('#email-notice');emailNotice.hidden=!day.email||day.email.remaining<=0;
 emailNotice.textContent=day.email?'ARRIVATA EMAIL! '+day.email.subject+' - Requisiti confusi, allegato immaginario. +'+day.email.amount+' min di lavoro. Produttivit\u00e0 -0,25: lavoro disordinato.':'';
 if(day.call&&day.call.status==='active'){
  rect(player.x-46,player.y+16,92,7,'#354b42');rect(player.x-46,player.y+16,Math.round(92*(1-day.call.remaining/OfficeDay.config.callDuration)),7,'#a9db78');
 }
 const exitNotice=document.querySelector('#exit-notice');exitNotice.hidden=day.phase!=='closing';
 document.querySelector('#exit-countdown').textContent=Math.max(0,Math.ceil(OfficeDay.config.exitDeadline-day.minute))+'s';
 document.querySelector('#exit-instruction').textContent=day.work<=0?'Zero arretrato: raggiungi subito la porta in basso!':'Finisci il lavoro al PC, poi raggiungi la porta in basso!';
 const nextButton=document.querySelector('#next');nextButton.hidden=day.phase!=='won';nextButton.textContent=day.level<OfficeDay.levels.length?'Livello successivo →':'Ricomincia campagna ↺';
 const fmt=m=>{const n=Math.ceil(m);return Math.floor(n/60)+'h '+String(n%60).padStart(2,'0')+'m';};
 const minute=Math.floor(day.minute);document.querySelector('#clock').textContent=String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');
 document.querySelector('#work').textContent=fmt(day.work);const bar=document.querySelector('#workbar');bar.max=Math.max(480,day.assigned);bar.value=day.work;
 const threatened=OfficeDay.playerIsDisturbed(day);
 const penalty=document.querySelector('#call-penalty');penalty.hidden=day.missedCalls===0;penalty.textContent='Lavoro disordinato: produttivit\u00e0 -'+(day.missedCalls*OfficeDay.config.missedCallPenalty).toFixed(2).replace('.',',');
 const activity=document.querySelector('#activity');activity.textContent=({arrival:'Vai al tuo PC',standup:'Standup…',won:'VITTORIA',lost:'SCONFITTA'})[day.phase]||(day.call?(day.call.status==='active'?'In call obbligatoria':'Call: torna al PC'):day.playerDelegation?'Stai delegando…':day.drinking>0?'Bevendo caffè':day.sitting?'A pranzo':player.despair>0?'Disperazione!':threatened?'Spiegazione in corso!' :day.working?'Al lavoro ×'+OfficeDay.productivity(day).toFixed(3):OfficeDay.lunch(day)?'Pausa 13–14':day.phase==='closing'?'Corri all’uscita!':'In movimento');activity.classList.toggle('danger',threatened||day.phase==='lost');
 document.querySelector('#buff').textContent=(day.minute<day.coffeeUntil?'×1.5 ('+Math.ceil(day.coffeeUntil-day.minute)+'m)':'Nessun caffè')+' / '+(day.ate?'mangiato':day.hungerPenalty?'saltato (−0,25%)':'da fare');document.querySelector('#message').textContent=day.message;

 if(day.phase==='won'||day.phase==='lost'){
  rect(166,182,628,254,'#142821f5');
  label(day.phase==='won'?(day.level===OfficeDay.levels.length?'CAMPAGNA COMPLETATA!':'USCITO IN TEMPO!'):'18:30 — ESCALATION!',210,224,'#d9e9b9',25);
  label(String(Math.floor(day.minute/60)).padStart(2,'0')+':'+String(Math.floor(day.minute%60)).padStart(2,'0')+' · Arretrato: '+fmt(day.work),210,257,'#d9e9b9',16);
  if(day.phase==='lost')wrapText(day.koReason||day.message,210,291,535,13);
  else wrapText('Hai lasciato l’ufficio con zero lavoro. La serata è salva!',210,291,535,13);
  label(day.delegations+' deleghe · Pranzo '+(day.ate?'completato':'saltato'),210,379,'#b9ccab',12);
  label(day.phase==='won'?(day.level<OfficeDay.levels.length?'E / Livello successivo: continua la campagna.':'E: ricomincia la campagna.'):'E / Riprova livello: riprova questa giornata.',210,408,'#b9ccab',12);
 }

}

function frame(time){if(!started){last=0;accumulator=0;requestAnimationFrame(frame);return;}if(!last)last=time;accumulator+=Math.min((time-last)/1000,0.1);last=time;const input={left:keys.has('KeyA')||keys.has('ArrowLeft'),right:keys.has('KeyD')||keys.has('ArrowRight'),up:keys.has('KeyW')||keys.has('ArrowUp'),down:keys.has('KeyS')||keys.has('ArrowDown'),run:keys.has('ShiftLeft')||keys.has('ShiftRight')};while(accumulator>=1/60){OfficeDay.update(day,input,1/60);if(animatingWork())workAnimation+=1/60;accumulator-=1/60;}render();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();






