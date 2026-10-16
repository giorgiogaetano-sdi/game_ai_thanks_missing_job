﻿﻿/* Pure simulation: no DOM or rendering. Future server can reuse this contract. */
(function(root){
  const world={width:960,height:600,spawn:{x:610,y:556},obstacles:[],objects:[]};
  function add(kind,x,y,w,h){const o={kind,x,y,w,h};world.objects.push(o);world.obstacles.push(o);return o;}
  add('wall',0,0,960,52);add('wall',0,52,20,548);add('wall',940,52,20,548);add('wall',0,580,580,20);add('wall',640,580,320,20);
  add('partition',644,52,12,270);add('partition',644,416,12,164);
  for(const y of [132,282])for(const x of [80,254,428])add('desk',x,y,120,66);
  add('coffee',712,77,74,48);add('fridge',858,72,46,68);add('counter',790,77,64,48);
  add('table',747,228,108,66);add('table',747,358,108,66);add('sofa',726,500,160,52);
  for(const p of [[34,65],[585,65],[35,519],[895,521]])add('plant',p[0],p[1],28,28);
  function createPlayer(){return {...world.spawn,facing:'down',moving:false,steps:0};}
  function blocked(x,y){const r=9;if(x-r<20||x+r>940||y-7<52||y+5>580)return true;return world.obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+5>o.y&&y-7<o.y+o.h);}
  function step(p,input,dt){let dx=Number(!!input.right)-Number(!!input.left),dy=Number(!!input.down)-Number(!!input.up);const len=Math.hypot(dx,dy);p.moving=!!len;if(!len)return;if(dx)p.facing=dx>0?'right':'left';else p.facing=dy>0?'down':'up';const speed=input.run?190:115;dx=dx/len*speed*dt;dy=dy/len*speed*dt;const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));for(let i=0;i<n;i++){if(!blocked(p.x+dx/n,p.y))p.x+=dx/n;if(!blocked(p.x,p.y+dy/n))p.y+=dy/n;}p.steps+=dt*(input.run?15:10);}
  root.OfficeSim={world,createPlayer,blocked,step};
})(typeof module!=='undefined'?module.exports:globalThis);


