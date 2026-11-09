'use strict';
const foods = personalities.map(p=>({...p,description:p.analysis[0]}));
const $ = id => document.getElementById(id);
const face = '<g fill="#35415b"><ellipse cx="45" cy="67" rx="2.4" ry="3.2"/><ellipse cx="75" cy="67" rx="2.4" ry="3.2"/></g><path d="M56 72q4 5 8 0" fill="none" stroke="#35415b" stroke-width="2" stroke-linecap="round"/><g fill="#f2a1ad" opacity=".8"><ellipse cx="37" cy="73" rx="6" ry="3"/><ellipse cx="83" cy="73" rx="6" ry="3"/></g>';
function art(food) {
 if(food.image) return `<img class="food-art product-art" src="${food.image}" alt="${food.name}" decoding="async">`;
 if(!food.type) return snackPackageArt(food);
 let body='';
 switch(food.type){
 case 'rice':body='<path d="M23 82Q14 80 22 64L49 24Q60 9 71 25L100 68Q109 86 92 88Z" fill="#fffdf0" stroke="#b9c6b8" stroke-width="2"/><path d="M45 65h30v25H45z" fill="#376451"/><path d="M50 70v15m5-14v13m10-12v12m5-13v13" stroke="#ffffff20"/>';break;
 case 'dumpling':body='<path d="M16 64Q18 41 34 36Q60 17 88 38Q104 45 105 66Q93 93 59 91Q26 91 16 64" fill="#ffe4be" stroke="#d4af85" stroke-width="2"/><path d="M18 61q13 1 15-22m1 0q13 13 15-9m1 0q10 17 19 0m1 0q0 22 15 9m1 1q2 20 17 22" fill="none" stroke="#d4af85" stroke-width="2"/>';break;
 case 'boba':body='<path d="M62 13l9-2 9 35-8 3z" fill="#d67d9f"/><path d="M31 39h59l-6 57H38z" fill="#e3bc96" stroke="#ad8d7b" stroke-width="2"/><path d="M32 40h57l-2 18H34z" fill="#fff4dc"/><rect x="26" y="33" width="69" height="10" rx="5" fill="#fff8ec" stroke="#ad8d7b" stroke-width="2"/><g fill="#65536b"><circle cx="46" cy="85" r="4"/><circle cx="59" cy="89" r="4"/><circle cx="74" cy="85" r="4"/><circle cx="52" cy="78" r="3"/><circle cx="68" cy="78" r="3"/></g>';break;
 case 'sushi':body='<path d="M23 44h75v35q-2 20-38 20T23 79z" fill="#365d51" stroke="#274a43" stroke-width="2"/><ellipse cx="60" cy="45" rx="38" ry="27" fill="#fff9e9" stroke="#315447" stroke-width="3"/><ellipse cx="60" cy="45" rx="23" ry="16" fill="#f7a58e"/><path d="M41 39l37 13m-30-23 32 15" stroke="#ffdebd" stroke-width="3"/><path d="M38 45q6 12 12 12" stroke="#9fc79e" stroke-width="5" fill="none"/>';break;
 case 'bao':body='<path d="M16 69Q17 43 41 30Q48 19 60 26Q73 18 79 31Q104 44 105 69Q105 95 61 96Q17 95 16 69" fill="#fff4e5" stroke="#d8bda2" stroke-width="2"/><path d="M39 34q17 4 21-6m0 0q2 13 20 8M60 29v17m0-17L47 45m14-17 12 17" fill="none" stroke="#dfc7b0" stroke-width="2" stroke-linecap="round"/>';break;
 case 'mango':body='<ellipse cx="60" cy="87" rx="49" ry="14" fill="#c7ddc5" stroke="#7fae91" stroke-width="2"/><path d="M18 77q0-25 28-30q28 3 27 30q-28 17-55 0" fill="#fff7dc" stroke="#e1c98d"/><path d="M42 65Q40 30 71 27Q101 30 100 62Q84 91 57 84Z" fill="#ffc94e" stroke="#dfa73d" stroke-width="2"/><path d="M56 45l34 21m-37-5 29 18M64 33l-8 41m23-39-13 46m25-36L80 77" fill="none" stroke="#ffeaa2" stroke-width="2"/><path d="M70 27q0-17 17-14q2 13-17 14" fill="#78b58b"/><path d="M18 24l3 7 8 2-8 3-3 8-2-8-8-3 8-2zM103 17l2 5 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#e4b447"/>';break;
 }
 return `<svg class="food-art" viewBox="0 0 120 115" role="img" aria-label="${food.name}"><ellipse cx="60" cy="102" rx="34" ry="4" fill="#204bce0c"/>${body}${face}</svg>`;
}
let collected = new Set();
try { const saved=JSON.parse(localStorage.getItem('thaikee-personality-collection-v1')||'[]'); if(Array.isArray(saved)) collected=new Set(saved.filter(id=>personalities.some(p=>p.id===id)));  } catch {}
// Only AD Milk has the same identity in the old six-character collection.
try { if(localStorage.getItem('thaikee-personality-collection-v1')===null){const old=JSON.parse(localStorage.getItem('thaikee-collection')||'[]');if(Array.isArray(old)&&old.includes(2))collected.add('ad-milk');} } catch {}
function renderCollection(){
 const en=typeof promoLanguage!=='undefined'&&promoLanguage==='en';
 $('cards').innerHTML=foods.map((f,i)=>`<article class="food-card ${collected.has(f.id)?'collected':''}"><span class="card-number">${String(i+1).padStart(2,'0')}</span>${art(f)}<h3>${en?f.en:f.name}</h3><p>${f.title[en?1:0]}</p></article>`).join('');
 $('count').textContent=`${collected.size} / ${foods.length} ${en?'COLLECTED':'已收集'}`;
}
const colors=['#f0a5bd','#a9c9e9','#ebce87','#b5d8c3','#c7b7e0'];
for(let i=0;i<19;i++){
 const ball=document.createElement('div');ball.className='capsule';
 const row=Math.floor(i/5),col=i%5;
 ball.style.cssText=`--cap:${colors[i%5]};--left:${col*53-7+(row%2?20:0)}px;--bottom:${row*45-8}px;--rotation:${(i*47)%110-55}deg;animation-delay:${i*.025}s`;
 $('capsules').append(ball);
}
let state='idle', chosen=0, isNew=false;
let quizResult=null;
let animationEpoch=0;
function spin(){
 if(state!=='idle'||quizResult===null||quizStage!=='machine')return;
 const epoch=++animationEpoch;
 state='spinning';chosen=quizResult.index;$('play').disabled=true;$('turn').disabled=true;
 $('status').textContent='咕噜咕噜……你的美味朋友正在赶来！';$('machine').classList.add('spinning');updateMachineText();
 setTimeout(()=>{if(epoch!==animationEpoch)return;$('machine').classList.remove('spinning');state='ready';$('prize').style.setProperty('--prize-color',foods[chosen].color);$('prize').hidden=false;$('status').textContent='叮！扭蛋掉出来啦，点击它打开惊喜。';$('play').textContent='OPEN CAPSULE ✦';$('play').disabled=false;updateMachineText();},1350);
}
function openPrize(){
 if(state!=='ready')return;const epoch=animationEpoch;state='opening';$('play').disabled=true;$('prize').classList.add('opening');
 setTimeout(()=>{
 if(epoch!==animationEpoch)return;
 const f=foods[chosen];isNew=!collected.has(f.id);collected.add(f.id);
 try{localStorage.setItem('thaikee-personality-collection-v1',JSON.stringify([...collected]));}catch{}
 renderCollection();$('result-art').innerHTML=art(f);$('result-name').textContent=f.name;$('result-number').textContent=`NO. ${String(chosen+1).padStart(2,'0')} / ${f.en}`;$('result-description').textContent=f.description;$('rarity').textContent='A LITTLE FRIEND FOUND YOU!';$('new-tag').textContent=isNew?'NEW FRIEND · 新朋友加入图鉴':'HELLO AGAIN · 熟悉的朋友也很可爱';renderResultPromotion();$('reveal').showModal();state='revealed';confetti();
 },450);
}
function reset(){
 if(typeof clearPreparedCard==='function')clearPreparedCard();
 animationEpoch++;$('machine').classList.remove('spinning');
 if($('reveal').open)$('reveal').close();state='idle';$('prize').hidden=true;$('prize').classList.remove('opening');$('turn').disabled=false;$('play').disabled=false;$('play').innerHTML='PLAY AGAIN <span>↻</span>';$('status').textContent='再转一次？下一位朋友正在等你。';if(typeof updateMachineText==='function')updateMachineText();
}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<26;i++){const piece=document.createElement('i');piece.className='confetti';piece.style.cssText=`left:${Math.random()*100}%;background:${colors[i%5]};animation-delay:${Math.random()*.4}s;rotate:${Math.random()*180}deg`;document.body.append(piece);setTimeout(()=>piece.remove(),2600);}}
$('turn').addEventListener('click',spin);$('play').addEventListener('click',()=>state==='ready'?openPrize():spin());$('prize').addEventListener('click',openPrize);$('again').addEventListener('click',()=>startQuiz());$('close').addEventListener('click',reset);$('reveal').addEventListener('cancel',event=>{event.preventDefault();reset();});$('reveal').addEventListener('click',event=>{if(event.target===$('reveal'))reset();});
