// Run after replacing product PNGs: node scripts/build-card-assets.cjs
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'quiz-data.js'),'utf8'),context);
const files=vm.runInContext('personalities.map(p=>p.image)',context);
const images=Object.fromEntries(files.map(file=>{
 if(typeof file!=='string'||path.basename(file)!==file)throw Error('Expected a product PNG filename');
 const bytes=fs.readFileSync(path.join(root,file));
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error(`Invalid PNG: ${file}`);
 return [file,`data:image/png;base64,${bytes.toString('base64')}`];
}));
fs.writeFileSync(path.join(root,'card-assets.js'),'// Original PNGs embedded for self-contained offline PNG share cards.\nconst PRODUCT_CARD_IMAGES = '+JSON.stringify(images)+';\nconst AD_MILK_CARD_IMAGE = PRODUCT_CARD_IMAGES["ad-milk.png"];\n');
console.log(`Embedded ${files.length} original PNGs for offline share cards.`);
