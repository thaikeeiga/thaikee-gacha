// Run with: node tests/quiz.test.cjs (Node built-ins only; no installation).
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(storage=new Map()){
 const elements=new Map(),timers=[],downloads=[];
 function element(){
  const attributes={},listeners={};let html='';
  const e={hidden:false,disabled:false,open:false,textContent:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},
   append(){},prepend(){},before(){},after(){},remove(){},focus(){},
   setAttribute(k,v){attributes[k]=v},getAttribute(k){return attributes[k]},removeAttribute(k){delete attributes[k]},
   addEventListener(k,fn){listeners[k]=fn},click(){if(!this.disabled){if(this.download)downloads.push(this);return listeners.click?.({target:this});}},
   getContext(){return {drawImage(image,x,y,width,height){assert.match(image.src,/^data:image\/svg\+xml/);assert.equal(width,1200);assert.equal(height,1520);}}},
   toBlob(callback,type){assert.equal(type,'image/png');callback(new Blob(['mock canvas output'],{type}));},
   showModal(){this.open=true},close(){this.open=false}};
  Object.defineProperty(e,'id',{set(value){elements.set(value,e)}});
  Object.defineProperty(e,'innerHTML',{get(){return html},set(value){html=value;for(const match of value.matchAll(/id="([^"]+)"/g))elements.set(match[1],element());}});
  return e;
 }
 const get=id=>{assert.ok(elements.has(id),`Missing DOM id: ${id}`);return elements.get(id)};
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const match of html.matchAll(/id="([^"]+)"/g))elements.set(match[1],element());
 const selectors=new Map();
 const doc={getElementById:id=>elements.get(id)||null,documentElement:{},body:element(),createElement:element,
  querySelector(selector){if(!selectors.has(selector))selectors.set(selector,element());return selectors.get(selector)},
  querySelectorAll(selector){if(selector==='[data-answer]')return [0,1,2,3].map(i=>{const e=element();e.dataset.answer=String(i);return e});return []}};
 class MockImage{set src(value){this._src=value;this.onload()}get src(){return this._src}}
 const context={document:doc,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:true}),setTimeout:fn=>timers.push(fn),Blob,File,URL,Image:MockImage,console};
 vm.createContext(context);
 // Real script order: catches references to globals in later scripts.
 for(const match of html.matchAll(/<script src="([^"]+)" defer><\/script>/g))vm.runInContext(fs.readFileSync(path.join(root,match[1]),'utf8'),context,{filename:match[1]});
 return {run:code=>vm.runInContext(code,context),get,timers,storage,downloads};
}
const app=boot();const {run,get,timers}=app;
assert.equal(run('quizStage'),'welcome');assert.equal(get('machine-stage').hidden,true);assert.match(get('welcome').innerHTML,/中文 · 开始游戏/);assert.match(get('welcome').innerHTML,/English · Start Game/);
get('start-en').click();assert.equal(run('promoLanguage'),'en');assert.equal(run('quizStage'),'quiz');assert.match(get('quiz').innerHTML,/QUESTION 1/);
run('spin()');assert.equal(run('state'),'idle');assert.equal(timers.length,0);
run('startQuiz();advanceQuestion()');assert.equal(run('questionIndex'),0);assert.match(get('quiz').innerHTML,/data-answer="3"/);assert.equal(get('machine-stage').hidden,true);
assert.equal(run('quizQuestions.length'),8);assert.equal(run('quizQuestions.every(q=>q.zh&&q.en&&q.options.length===4&&q.options.every(o=>o.length===2&&o.every(Boolean)))'),true);
assert.throws(()=>run('calculatePersonality([0])'));
assert.throws(()=>run('calculatePersonality([0,0,0,0,0,0,0,4])'));
assert.throws(()=>run('calculatePersonality(new Array(8))'));
const distribution=run(`(()=>{const counts=Array(personalities.length).fill(0);for(let n=0;n<65536;n++){const a=Array.from({length:8},(_,q)=>(n>>(q*2))&3);const result=calculatePersonality(a);if(result.index!==calculatePersonality(a).index)throw Error('Non deterministic');counts[result.index]++;}return counts})()`);
assert.ok(distribution.every(n=>n>0));assert.equal(distribution.length,9);console.log('All 65,536 combinations checked. Distribution:',Array.from(distribution).join(', '));
assert.equal(run('personalities.length'),9);
assert.equal(run('calculatePersonality([3,0,2,1,3,2,0,1]).index'),7);
// Every profile is still attainable with any single answer changed from its signature.
assert.equal(run(`personalities.every((p,index)=>p.signature.every((_,q)=>[0,1,2,3].every(option=>{const a=p.signature.slice();a[q]=option;return calculatePersonality(a).index===index})))`),true);
// Each ordinary personality has a natural, attainable maximum-score signature.
for(let target=0;target<9;target++){
 run('startQuiz()');
 for(let q=0;q<8;q++){
  const answer=run(`personalities[${target}].signature[${q}]`);
  run(`selectAnswer(${answer})`);
  if(q===3){const before=run('JSON.stringify(answers)');run("setPromoLanguage('en')");assert.equal(run('JSON.stringify(answers)'),before);assert.equal(run('questionIndex'),3);assert.match(get('quiz').innerHTML,/QUESTION 4/);run("setPromoLanguage('zh')");}
  get('quiz-next').click();
 }
 assert.equal(run('quizStage'),'machine');assert.equal(run('quizResult.index'),target);assert.equal(get('quiz').hidden,true);assert.equal(get('machine-stage').hidden,false);
 get('turn').click();get('turn').click();assert.equal(timers.length,1);timers.shift()();assert.equal(run('state'),'ready');assert.equal(run('chosen'),target);
 get('prize').click();get('prize').click();assert.equal(timers.length,1);timers.shift()();assert.equal(run('state'),'revealed');assert.equal(get('reveal').open,true);assert.equal(run('chosen===quizResult.index'),true);
 for(const lang of ['zh','en']){
  run(`setPromoLanguage('${lang}')`);assert.ok(get('result-description').textContent.length>20);assert.ok(get('personality-tags').innerHTML.includes('<span>'));
  if(!get('snack-details').hidden)get('find-snack').click();
  get('find-snack').click();assert.equal(get('snack-details').hidden,false);assert.match(get('snack-details').innerHTML,/thaikeeiga.com.au/);
  const card=run('buildSnackCard()');assert.match(card,/<svg xmlns=/);assert.ok(card.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').includes(run('brandMessage()')));
  const imageFile=run(`personalities[${target}].image`);
  assert.match(get('result-art').innerHTML,new RegExp(imageFile.replaceAll('.','\\.')));
  assert.ok(get('snack-details').innerHTML.includes(imageFile));assert.ok(get('cards').innerHTML.includes(imageFile));
  const original=fs.readFileSync(path.join(root,imageFile));assert.equal(original.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const embedded=run(`PRODUCT_CARD_IMAGES[personalities[${target}].image]`);
  assert.equal(embedded,`data:image/png;base64,${original.toString('base64')}`);assert.ok(card.includes(embedded));assert.match(card,/preserveAspectRatio="xMidYMid meet"/);
  for(const content of [card,get('cards').innerHTML,get('snack-details').innerHTML,get('rarity').textContent])assert.doesNotMatch(content,/百宝袋|Surprise Bag|Wild.?card|隐藏款|隐藏人格|SECRET SURPRISE/i);
  if(target===0){assert.match(card,/data:image\/png;base64,/);assert.match(card,/preserveAspectRatio="xMidYMid meet"/);assert.match(get('result-art').innerHTML,/ad-milk.png/);}
 }
 get('again').click();assert.equal(run('quizStage'),'quiz');assert.equal(run('quizResult'),null);assert.equal(get('machine-stage').hidden,true);
}
assert.equal(run('collected.size'),9);assert.equal(boot(app.storage).run('collected.size'),9);
const oldCollection=boot(new Map([['thaikee-personality-collection-v1','["ad-milk","surprise"]']]));
assert.equal(oldCollection.run('collected.size'),1);assert.equal(oldCollection.run("collected.has('surprise')"),false);assert.match(oldCollection.get('count').textContent,/1 \/ 9/);
assert.equal(boot(new Map([['thaikee-collection','[2]']])).run("collected.has('ad-milk')"),true);
assert.equal(run('snackProducts.length'),9);assert.equal(run('snackProducts.every(p=>!confirmedSale(p))'),true);
assert.equal(run("confirmedSale({saleStatus:'confirmed',confirmedAt:new Date().toISOString(),confirmedStore:'haymarket',confirmationSource:'Store confirmation'})"),true);
assert.equal(run("confirmedSale({saleStatus:'confirmed',confirmedAt:'2000-01-01',confirmedStore:'haymarket',confirmationSource:'Old check'})"),false);
run('startQuiz();selectAnswer(2);advanceQuestion()');get('quiz-back').click();assert.equal(run('questionIndex'),0);assert.equal(run('answers[0]'),2);
// Retaking during an animation must invalidate its old callbacks.
run("answers=personalities[0].signature.slice();quizResult=calculatePersonality(answers);quizStage='machine';spin();startQuiz()");
timers.shift()();assert.equal(run('state'),'idle');assert.equal(run('quizStage'),'quiz');assert.equal(get('machine-stage').hidden,true);
(async()=>{
 for(let i=0;i<9;i++){
  run(`chosen=${i};setPromoLanguage('en')`);await get('save-card').click();
  assert.equal(app.downloads.length,i+1);assert.equal(app.downloads[i].download,`THAI-KEE-card-${i+1}-en.png`);assert.equal(get('save-card').disabled,false);
  assert.equal(get('card-preview').hidden,false);assert.match(get('card-preview-image').src,/^blob:/);assert.equal(get('card-download').download,`THAI-KEE-card-${i+1}-en.png`);
  assert.equal(get('card-share').hidden,true);
 }
 run("var shareCalls=0; var navigator={canShare:({files})=>files.length===1&&files[0].type==='image/png',share:async()=>{shareCalls++}};updateCardPreview()");
 assert.equal(get('card-share').hidden,false);await get('card-share').click();assert.equal(run('shareCalls'),1);
 run("navigator.share=async()=>{throw Object.assign(new Error('cancelled'),{name:'AbortError'})}");
 const beforeCancel=get('save-status').textContent;await get('card-share').click();assert.equal(get('save-status').textContent,beforeCancel);
 run("navigator.share=async()=>{throw new Error('unsupported')}");await get('card-share').click();assert.match(get('save-status').textContent,/Touch and hold/);
 const priorCount=app.downloads.length;
 const saving=run('saveSnackCard()');run('startQuiz()');await saving;
 assert.equal(app.downloads.length,priorCount);assert.equal(get('card-preview').hidden,true);assert.equal(run('preparedCard'),null);
 console.log('PASS: unsupported share fallback, file sharing, cancellation, failed sharing guidance, retained image preview/direct download, stale export cancellation.');
 console.log('PASS: all 9 PNG paths/signatures/embedded original bytes; result, collection, product and card mapping; mocked PNG canvas export/download; 65,536 deterministic quiz outcomes and existing gameplay regressions.');
})().catch(error=>{console.error(error);process.exitCode=1});
