'use strict';
// Maintain product mappings here. Never infer stock from a character draw.
// saleStatus: 'unconfirmed' | 'confirmed' | 'unavailable'.
// To enable shopping guidance, supply a current confirmedAt (ISO timestamp),
// a confirmedStore matching a store id below, and confirmationSource.
const snackProducts = personalities.map(p=>({zh:p.name,en:p.en,saleStatus:'unconfirmed',image:p.image,illustration:!p.image}));
// Addresses checked against https://thaikeeiga.com.au/ . No stock is implied.
const thaiKeeStores = [
  {id:'haymarket',name:'THAI KEE IGA Haymarket',address:'Market City, Level 1, 9–13 Hay St, Haymarket NSW'}
];
const promoText = {
 zh:{brand:'你的零食分身正在泰记等你！',find:'找到我的零食',discover:'在泰记发现更多',save:'保存我的卡片',saving:'正在保存…',saved:'卡片已下载',saveError:'保存失败，请重试。',stores:'THAI KEE 门店',unknown:'尚未确认在售，商品与库存请向门店咨询。',unavailable:'目前未在售，欢迎探索其他惊喜。',confirmed:'已确认在售门店：',shop:'到店寻找我的零食',official:'查看门店官网',illustration:'角色示意图 · 非商品实拍',product:'对应商品',again:'再玩一次 ↻',new:'新朋友加入图鉴',repeat:'又遇见你啦！',rarity:'发现你的零食分身！',foot:'一颗小扭蛋，一份好心情。'},
 en:{brand:'Your snack twin is waiting for you at THAI KEE!',find:'FIND MY SNACK',discover:'Discover more at THAI KEE',save:'SAVE MY CARD',saving:'SAVING…',saved:'Card downloaded',saveError:'Could not save. Please try again.',stores:'THAI KEE STORES',unknown:'Availability is unconfirmed. Ask the store about products and stock.',unavailable:'Currently unavailable. Explore more surprises in store.',confirmed:'Confirmed store: ',shop:'Find my snack in store',official:'Visit the official store website',illustration:'Character illustration · not a product photo',product:'YOUR MATCHING SNACK',again:'PLAY AGAIN ↻',new:'NEW FRIEND · Added to your collection',repeat:'HELLO AGAIN · A familiar little friend',rarity:'YOUR SNACK TWIN!',foot:'A little capsule, a little happiness.'}
};
let promoLanguage='zh';
try{promoLanguage=localStorage.getItem('thaikee-language')==='en'?'en':'zh';}catch{}
const tx=()=>promoText[promoLanguage];
const escapeXML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function confirmedSale(product,now=Date.now()){
 const timestamp=Date.parse(product.confirmedAt);
 return product.saleStatus==='confirmed' && thaiKeeStores.some(s=>s.id===product.confirmedStore) && typeof product.confirmationSource==='string' && product.confirmationSource.trim().length>0 && Number.isFinite(timestamp) && timestamp<=now && now-timestamp<7*24*60*60*1000;
}
function brandMessage(){return tx().brand;}
function bagArt(){return '<svg class="food-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 115" role="img" aria-label="THAI KEE Surprise Bag"><path d="M30 40h60l8 62H22z" fill="#204bce"/><path d="M43 44V29a17 17 0 0 1 34 0v15" fill="none" stroke="#ed9cb7" stroke-width="7"/><text x="60" y="68" text-anchor="middle" fill="#fffaf0" font-family="sans-serif" font-size="12" font-weight="bold">THAI KEE</text><text x="60" y="91" text-anchor="middle" fill="#ffc9d8" font-size="23">✦</text></svg>';}
function productArt(index){return art(foods[index]);}
const languageButton=document.createElement('button');languageButton.id='language-toggle';languageButton.className='language-toggle';document.querySelector('header').append(languageButton);
const resultLanguageButton=document.createElement('button');resultLanguageButton.className='language-toggle result-language';document.querySelector('.result').prepend(resultLanguageButton);
const promotion=document.createElement('section');promotion.className='snack-promotion';promotion.innerHTML='<p id="brand-message"></p><button class="primary" id="find-snack" aria-expanded="false" aria-controls="snack-details"></button><div id="snack-details" hidden></div>';
$('new-tag').after(promotion);
const saveButton=document.createElement('button');saveButton.id='save-card';saveButton.className='save-card';$('again').before(saveButton);
const saveStatus=document.createElement('p');saveStatus.id='save-status';saveStatus.setAttribute('role','status');saveButton.after(saveStatus);
const cardPreview=document.createElement('section');cardPreview.id='card-preview';cardPreview.hidden=true;
cardPreview.innerHTML='<p id="card-save-help"></p><img id="card-preview-image" alt=""><a id="card-download" class="save-card"></a><button id="card-share" class="save-card" hidden></button>';
saveStatus.after(cardPreview);
let preparedCard=null;
function cardSaveCopy(){return promoLanguage==='zh'?{help:'若未自动下载，请长按下方图片保存，或点击下载 / 系统分享。',download:'下载 PNG 图片',share:'系统分享 / 保存图片',alt:'THAI KEE 零食人格分享卡片',ready:'图片已生成，请选择保存方式。',shareError:'系统分享暂不可用，请长按图片保存。'}:{help:'If the download does not start, touch and hold the image to save it, or use Download / Share.',download:'Download PNG image',share:'Share / save image',alt:'THAI KEE snack personality share card',ready:'Your image is ready. Choose a way to save it.',shareError:'Sharing is unavailable. Touch and hold the image to save it.'};}
function clearPreparedCard(){
 if(preparedCard)URL.revokeObjectURL(preparedCard.url);
 preparedCard=null;cardPreview.hidden=true;$('card-preview-image').removeAttribute('src');
}
function updateCardPreview(){
 if(!preparedCard)return;
 const text=cardSaveCopy();$('card-save-help').textContent=text.help;
 $('card-preview-image').src=preparedCard.url;$('card-preview-image').alt=text.alt;
 $('card-download').href=preparedCard.url;$('card-download').download=preparedCard.filename;$('card-download').textContent=text.download;
 $('card-share').textContent=text.share;
 let canShare=false;
 try{canShare=!!(typeof navigator!=='undefined'&&navigator.share&&navigator.canShare&&typeof File!=='undefined'&&navigator.canShare({files:[new File([preparedCard.blob],preparedCard.filename,{type:'image/png'})]}));}catch{}
 $('card-share').hidden=!canShare;cardPreview.hidden=false;
}
$('card-share').addEventListener('click',async()=>{
 if(!preparedCard)return;
 try{await navigator.share({files:[new File([preparedCard.blob],preparedCard.filename,{type:'image/png'})]});}
 catch(error){if(error.name!=='AbortError')$('save-status').textContent=cardSaveCopy().shareError;}
});
function renderResultPromotion(){
 const t=tx(),f=foods[chosen],product=snackProducts[chosen],confirmed=confirmedSale(product);
 $('brand-message').textContent=brandMessage();
 $('result-image-note').hidden=!!f.image;
 $('result-image-note').textContent=promoLanguage==='zh'?'商品包装示意图 · 非实拍':'Product illustration · not a photo';
 // Discovery action is always safe; a purchasing CTA exists only for verified stock.
 $('find-snack').textContent=t.find;
 $('find-snack').setAttribute('aria-label',`${t.find} · ${$('find-snack').textContent}`);
 $('snack-details').hidden=true;$('find-snack').setAttribute('aria-expanded','false');
 const store=thaiKeeStores.find(s=>s.id===product.confirmedStore);
 const notice=confirmed?`${t.confirmed}${store.name} · ${product.confirmedAt.slice(0,10)}`:product.saleStatus==='unavailable'?t.unavailable:t.unknown;
 $('snack-details').innerHTML=`<span class="eyebrow">${t.product}</span><div class="snack-product-art">${productArt(chosen)}</div><h3>${escapeXML(product[promoLanguage])}</h3>${product.image?'':`<small>${t.illustration}</small>`}<p>${escapeXML(notice)}</p><h4>${t.stores}</h4>${thaiKeeStores.map(s=>`<address><strong>${s.name}</strong><br>${s.address}</address>`).join('')}<a href="https://thaikeeiga.com.au/" target="_blank" rel="noopener noreferrer">${confirmed?t.shop:t.official} ↗</a>`;
 $('save-card').textContent=t.save;$('save-status').textContent='';$('again').textContent=t.again;
 $('result-name').textContent=promoLanguage==='zh'?f.name:f.en;
 $('result-description').textContent=f.analysis[promoLanguage==='zh'?0:1];
 $('result-name').textContent=(promoLanguage==='zh'?f.name:f.en)+' · '+f.title[promoLanguage==='zh'?0:1];
 $('personality-tags').innerHTML=f.tags[promoLanguage==='zh'?0:1].map(tag=>`<span>${escapeXML(tag)}</span>`).join('');
 $('new-tag').textContent=isNew?t.new:t.repeat;$('rarity').textContent=t.rarity;
 $('result-footnote').textContent=t.foot;
 $('close').setAttribute('aria-label',promoLanguage==='zh'?'关闭':'Close');
 updateCardPreview();
}
function setPromoLanguage(lang){
 const expanded=!$('snack-details').hidden;
 promoLanguage=lang;document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 languageButton.textContent=lang==='zh'?'中文 / EN':'EN / 中文';languageButton.setAttribute('aria-label',lang==='zh'?'Switch to English':'切换中文');
 resultLanguageButton.textContent=languageButton.textContent;resultLanguageButton.setAttribute('aria-label',languageButton.getAttribute('aria-label'));
 try{localStorage.setItem('thaikee-language',lang);}catch{}
 renderResultPromotion();if(typeof renderQuizUI==='function')renderQuizUI();if(expanded){$('snack-details').hidden=false;$('find-snack').setAttribute('aria-expanded','true');}
}
$('find-snack').addEventListener('click',()=>{const details=$('snack-details');details.hidden=!details.hidden;$('find-snack').setAttribute('aria-expanded',String(!details.hidden));});
languageButton.addEventListener('click',()=>setPromoLanguage(promoLanguage==='zh'?'en':'zh'));
resultLanguageButton.addEventListener('click',()=>setPromoLanguage(promoLanguage==='zh'?'en':'zh'));
// Build a self-contained intermediate SVG, then rasterize it to a real PNG.
// All product photos are data URLs, so file:// needs no fetch or cross-origin canvas.
function buildSnackCard(){
 const f=foods[chosen],t=tx();let visual;
 if(f.image)visual=`<image href="${PRODUCT_CARD_IMAGES[f.image]}" x="165" y="135" width="270" height="270" preserveAspectRatio="xMidYMid meet"/>`;
 else visual=`<g transform="translate(165 135) scale(2.25)">${art(f).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`;
 const title=promoLanguage==='zh'?f.name:f.en;
 const lines=promoLanguage==='zh'?[brandMessage()]:['Your snack twin is waiting','for you at THAI KEE!'];
 return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760"><rect width="600" height="760" rx="32" fill="#fffaf0"/><rect x="18" y="18" width="564" height="724" rx="26" fill="none" stroke="#204bce" stroke-width="2"/><g text-anchor="middle" font-family="sans-serif" fill="#204bce"><text x="300" y="80" font-size="32" font-weight="bold">THAI KEE</text><text x="300" y="112" font-size="13" letter-spacing="3">MY LITTLE SNACK CARD</text>${visual}<text x="300" y="467" font-size="25" font-weight="bold">${escapeXML(title)}</text><text x="300" y="505" font-size="15">NO. ${String(chosen+1).padStart(2,'0')} · ${escapeXML(f.en)}</text><text x="300" y="535" font-size="16">${escapeXML(f.title[promoLanguage==='zh'?0:1])}</text><text x="300" y="562" font-size="12">${escapeXML(f.tags[promoLanguage==='zh'?0:1].join(' / '))}</text><path d="M85 580H515" stroke="#ffc9d8" stroke-width="2"/>${lines.map((line,i)=>`<text x="300" y="${620+i*32}" font-size="22">${escapeXML(line)}</text>`).join('')}<text x="300" y="696" font-size="11">${escapeXML(promoLanguage==='zh'?'娱乐试玩 · 商品与库存请向门店咨询':'Just for fun · Ask the store about availability')}</text></g></svg>`;
}
function snackCardPNG(svg){
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{
   try{
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1520;
    const context=canvas.getContext('2d');if(!context)throw new Error('Canvas unavailable');
    context.drawImage(image,0,0,canvas.width,canvas.height);
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export failed')),'image/png');
   }catch(error){reject(error);}
  };
  image.onerror=()=>reject(new Error('Card image could not be decoded'));
  image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 });
}
async function saveSnackCard(){
 if(saveButton.disabled)return;
 const epoch=animationEpoch,text=tx(),filename=`THAI-KEE-card-${chosen+1}-${promoLanguage}.png`;
 saveButton.disabled=true;saveButton.textContent=text.saving;$('save-status').textContent='';
 try{
  const blob=await snackCardPNG(buildSnackCard());
  if(epoch!==animationEpoch)return;
  clearPreparedCard();const url=URL.createObjectURL(blob);preparedCard={blob,url,filename};updateCardPreview();
  const link=document.createElement('a');link.href=url;link.download=filename;
  document.body.append(link);link.click();link.remove();
  $('save-status').textContent=cardSaveCopy().ready;
 }catch{$('save-status').textContent=text.saveError;}
 finally{saveButton.disabled=false;saveButton.textContent=tx().save;}
}
saveButton.addEventListener('click',saveSnackCard);
