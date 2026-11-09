'use strict';
let quizStage='welcome', answers=[], questionIndex=0;
const quizCopy={
 zh:{welcome:"你的零食人格是什么？",sub:'8 个生活小问题，找到藏在你心里的美味分身。',detail:'没有标准答案，凭第一感觉选择就好。完成测试，再转动扭蛋揭晓你的专属人格！',start:'START TEST · 开始测试',back:'上一题',next:'下一题',finish:'完成测试，前往扭蛋机',question:'第',of:'题 / 共 8 题',hint:'选择最像你的答案',intro:'你的答案，藏着一颗小小的惊喜。',ready:'专属人格已装进扭蛋！转动旋钮来揭晓。',spinning:'咕噜咕噜……你的专属零食人格正在赶来！',open:'叮！点击掉出的扭蛋，揭晓你的零食人格。',turn:'转动旋钮',openButton:'打开扭蛋',retake:'重新测试',collection:'零食人格图鉴',collectionSub:'每一种你，都有一点可爱。',collectionNote:'不同答案，发现不同的自己。',note:'今天会遇见<br>哪一种自己？',disclaimer:'仅供娱乐测试 · 不涉及付款或真实奖品',steps:['完成测试','转动旋钮','揭晓人格'],alt:'零食角色示意图 · 非商品实拍',close:'关闭结果'},
 en:{welcome:"What’s Your Snack Personality?",sub:'8 little life questions. One deliciously you result.',detail:'No right or wrong answers. Go with your first instinct, then turn the gacha to meet your snack twin!',start:'START TEST',back:'Back',next:'Next',finish:'Finish & meet the gacha',question:'QUESTION',of:'/ 8',hint:'Choose the answer that feels most like you',intro:'A little surprise, shaped by your answers.',ready:'Your snack twin is in the capsule. Turn to reveal!',spinning:'Rattle, rattle… your snack personality is on its way!',open:'Your capsule is here! Tap it to meet your snack twin.',turn:'TURN TO REVEAL',openButton:'OPEN CAPSULE',retake:'RETAKE TEST',collection:'Snack personality collection',collectionSub:'A little joy in every kind of you.',collectionNote:'Discover another side of you.',note:'Which side of you<br>will you meet today?',disclaimer:'Just for fun · No payments or real prizes',steps:['Take the test','Turn the knob','Meet your twin'],alt:'Snack illustration · not a product photo',close:'Close result'}
};
function snackPackageArt(food){
 const index=personalities.findIndex(p=>p.id===food.id);
 const label=['','POCKY','BANANA','WANT WANT','PANDA','KOPIKO','RAMUNE','CHOCO PIE','KOALA'][index]||'SNACK';
 const shape=index===6?'<path d="M47 13h26v17l9 17v52H38V47l9-17z" fill="'+food.color+'" stroke="#204bce" stroke-width="2"/><path d="M46 28h28M40 48h40" stroke="#fffaf0" stroke-width="5"/><circle cx="60" cy="34" r="4" fill="#fffaf0"/>':`<rect x="25" y="18" width="70" height="83" rx="9" fill="${food.color}" stroke="#204bce" stroke-width="2"/><path d="M29 23h62M29 96h62" stroke="#fffaf0" stroke-width="3"/>`;
 return `<svg class="food-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 115" role="img" aria-label="${food.en}">${shape}<rect x="29" y="40" width="62" height="42" rx="12" fill="#fffaf0"/><text x="60" y="54" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#204bce">${label}</text><g transform="translate(0 2)">${face}</g></svg>`;
}
function startQuiz(){
 reset();quizStage='quiz';answers=[];questionIndex=0;quizResult=null;
 renderQuizUI();$('question-title').focus();
}
function selectAnswer(value){
 if(quizStage!=='quiz'||!Number.isInteger(value)||value<0||value>3)return;
 answers[questionIndex]=value;renderQuizUI();
 // Keep keyboard focus on the selected answer after re-rendering.
 document.querySelector(`[data-answer="${value}"]`).focus();
}
function advanceQuestion(){
 if(quizStage!=='quiz'||!Number.isInteger(answers[questionIndex]))return;
 if(questionIndex<7){questionIndex++;renderQuizUI();$('question-title').focus();return;}
 quizResult=calculatePersonality(answers);chosen=quizResult.index;quizStage='machine';
 renderQuizUI();$('turn').focus();
}
function updateMachineText(){
 const t=quizCopy[promoLanguage];
 $('status').textContent=state==='spinning'?t.spinning:state==='ready'||state==='opening'?t.open:t.ready;
 $('play').textContent=state==='ready'?t.openButton:t.turn;
}
function renderQuizUI(){
 const en=promoLanguage==='en',t=quizCopy[promoLanguage];
 if(quizStage==='welcome')document.body.classList.add('language-entry');
 else document.body.classList.remove('language-entry');
 $('welcome').hidden=quizStage!=='welcome';$('quiz').hidden=quizStage!=='quiz';$('machine-stage').hidden=quizStage!=='machine';
 document.querySelector('.intro > p').textContent=t.intro;
 document.querySelector('.brand span').textContent=en?'THAI KEE · LITTLE JOYS EVERYDAY':'泰记 · LITTLE JOYS EVERYDAY';
 document.querySelector('.globe-label b').textContent=en?'BIG JOY':'大大开心';
 document.querySelector('.note-right > p').innerHTML=t.note;
 document.querySelector('.round-stamp').innerHTML=`${personalities.length} LITTLE<br><b>SNACK TWINS</b><br>TO MEET <span>✦</span>`;
 document.querySelector('.collection h2').textContent=t.collection;
 document.querySelector('.collection-note').textContent=t.collectionNote;
 document.querySelector('.collection .eyebrow').textContent=en?'MEET YOUR SNACK TWINS':'发现你的零食分身';
 document.querySelector('footer p').textContent=t.disclaimer;
 document.querySelector('.steps').innerHTML=t.steps.map((s,i)=>`<span><b>0${i+1}</b> ${s}</span>`).join('<i>·</i>');
 document.querySelector('.brand').setAttribute('aria-label',en?'THAI KEE home':'THAI KEE 首页');
 document.querySelector('.playground').setAttribute('aria-label',en?'Gacha reveal':'扭蛋揭晓');
 $('turn').setAttribute('aria-label',t.turn);$('prize').setAttribute('aria-label',t.openButton);
 $('welcome').innerHTML=`<div class="entry-logo" aria-label="THAI KEE">THAI KEE</div><h2 class="entry-title"><span lang="en">What's Your<br>Snack Personality?</span><span lang="zh-CN">测测你的零食人格！</span></h2><p class="entry-prompt"><span lang="en">Choose your language</span><span lang="zh-CN">请选择语言</span></p><div class="entry-actions"><button id="start-zh" class="primary" lang="zh-CN">中文 · 开始游戏</button><button id="start-en" class="primary" lang="en">English · Start Game</button></div>`;
 $('start-zh').addEventListener('click',()=>{setPromoLanguage('zh');startQuiz();});
 $('start-en').addEventListener('click',()=>{setPromoLanguage('en');startQuiz();});
 if(quizStage==='quiz'){
  const q=quizQuestions[questionIndex];
  $('quiz').innerHTML=`<div class="quiz-progress-label"><span>${t.question} ${questionIndex+1} ${t.of}</span><span>${Math.round(questionIndex/8*100)}%</span></div><progress max="8" value="${questionIndex}" aria-label="${en?'Test progress':'测试进度'}"></progress><h2 id="question-title" tabindex="-1">${en?q.en:q.zh}</h2><p class="quiz-hint">${t.hint}</p><div class="quiz-options" role="group" aria-label="${en?q.en:q.zh}">${q.options.map((o,i)=>`<button class="quiz-option ${answers[questionIndex]===i?'selected':''}" data-answer="${i}" aria-pressed="${answers[questionIndex]===i}"><b>${'ABCD'[i]}</b><span>${o[en?1:0]}</span></button>`).join('')}</div><div class="quiz-nav"><button id="quiz-back" class="save-card" ${questionIndex===0?'disabled':''}>← ${t.back}</button><button id="quiz-next" class="primary" ${answers[questionIndex]===undefined?'disabled':''}>${questionIndex===7?t.finish:t.next} →</button></div>`;
  document.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>selectAnswer(Number(button.dataset.answer))));
  $('quiz-next').addEventListener('click',advanceQuestion);
  $('quiz-back').addEventListener('click',()=>{if(questionIndex>0){questionIndex--;renderQuizUI();$('question-title').focus();}});
 }
 renderCollection();updateMachineText();
 // Retest is available after closing the result as well as inside it.
 if(!$('retake-test')){const button=document.createElement('button');button.id='retake-test';button.className='retake-test';document.querySelector('.game-guide').append(button);button.addEventListener('click',startQuiz);}
 $('retake-test').textContent=t.retake;
 $('again').textContent=t.retake;
}
setPromoLanguage(promoLanguage);
