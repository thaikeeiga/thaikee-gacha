// Checks real HTTP asset delivery under a GitHub Pages-style repository prefix.
// Node built-ins only. This is not a browser layout or touch simulation.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix='/thaikee-gacha/';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'quiz-data.js'),'utf8'),context);
const images=Array.from(vm.runInContext('personalities.map(p=>p.image)',context));
const resources=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('#'));
const filenames=fs.readdirSync(root);
for(const file of [...resources,...images]){
 assert.ok(!/^(?:\/|https?:|file:|[A-Z]:)/i.test(file),`Non-relative asset: ${file}`);
 assert.ok(filenames.includes(file.replace(/^\.\//,'')),`Missing or wrong-case filename: ${file}`);
}
assert.ok(fs.existsSync(path.join(root,'.nojekyll')));
assert.doesNotMatch(fs.readFileSync(path.join(root,'style.css'),'utf8'),/@import\s|url\(\s*['"]?https?:/);
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
 const filename=pathname.slice(prefix.length)||'index.html';
 if(!filenames.includes(filename)){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':filename.endsWith('.png')?'image/png':filename.endsWith('.js')?'text/javascript':filename.endsWith('.css')?'text/css':'text/html'});
 fs.createReadStream(path.join(root,filename)).pipe(res);
});
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 try{
  const base=`http://127.0.0.1:${server.address().port}${prefix}`;
  for(const file of ['index.html',...resources,...images]){
   const url=new URL(file,base);assert.ok(url.pathname.startsWith(prefix));
   const response=await fetch(url);assert.equal(response.status,200,`Failed asset: ${url.pathname}`);
   const bytes=Buffer.from(await response.arrayBuffer());assert.ok(bytes.length>0);
   if(file.endsWith('.png'))assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  }
  console.log('PASS: real HTTP subdirectory delivery, exact filename case, all 9 PNGs, local CSS/JS, no remote runtime dependencies, .nojekyll.');
 }finally{server.close();server.closeAllConnections();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
