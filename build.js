const fs=require('fs'), zlib=require('zlib'), terser=require('terser');
(async()=>{
  const html=fs.readFileSync('index.html','utf8');
  const css=html.match(/<style>([\s\S]*?)<\/style>/)[1]
    .replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,>])\s*/g,'$1')
    .replace(/;}/g,'}').replace(/\n+/g,'').replace(/\s{2,}/g,' ').trim();
  const js=['data.js','engine.js','app.js','roster.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  const min=await terser.minify(js,{compress:{passes:3},mangle:{toplevel:true},format:{comments:false}});
  if(min.error) throw min.error;
  const full=html.replace(/<style>[\s\S]*?<\/style>/,'<style>'+css+'</style>')
    .replace(/\n\s*\n/g,'\n')
    .replace(/<script src="data.js"><\/script>\s*<script src="engine.js"><\/script>/,'<script>'+min.code+'<\/script>')
    .replace(/\s*<script src="app.js"><\/script>\s*<script src="roster.js"><\/script>/,'');
  fs.mkdirSync('dist',{recursive:true});
  fs.writeFileSync('dist/_full.html',full);
  const b64=zlib.gzipSync(Buffer.from(full,'utf8'),{level:9}).toString('base64');
  const loader='<!DOCTYPE html>\n<html lang="fr"><head><meta charset="utf-8">'
+'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
+'<meta name="theme-color" content="#0B0F0C"><meta name="apple-mobile-web-app-capable" content="yes">'
+'<meta name="apple-mobile-web-app-title" content="Mathhammer">'
+'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
+'<title>Mathhammer — Nécrons</title><link rel="manifest" href="manifest.json"><link rel="icon" href="icon.svg">'
+'<link rel="apple-touch-icon" href="icon.svg">'
+'<style>html,body{margin:0;background:#0B0F0C;color:#9BE85C;font-family:-apple-system,system-ui,sans-serif}'
+'#boot{padding:44px 20px;text-align:center;font-size:12px;letter-spacing:.14em;text-transform:uppercase}</style>'
+'</head><body><div id="boot">Réveil des tombes…</div>\n<script>\nvar B="'+b64+'";\n'
+'(async function(){try{if(!self.DecompressionStream)throw 0;'
+'var bin=Uint8Array.from(atob(B),function(c){return c.charCodeAt(0)});'
+'var t=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();'
+'document.open();document.write(t);document.close();}'
+'catch(e){document.getElementById("boot").innerHTML='
+'"Navigateur trop ancien pour cette version.<br>Mets-le à jour, ou ouvre la page dans un Chrome / Safari récent.";}})();\n'
+'<\/script></body></html>';
  fs.writeFileSync('dist/index.html',loader);
  for(const f of ['manifest.json','icon.svg']) fs.copyFileSync(f,'dist/'+f);
  fs.writeFileSync('dist/sw.js', fs.readFileSync('sw.js','utf8')
    .replace(/const ASSETS = \[[^\]]*\];/,'const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];')
    .replace(/necrons-v\d/,'necrons-v4'));
  console.log('app', full.length, 'o | chargeur', loader.length, 'o');
})();
