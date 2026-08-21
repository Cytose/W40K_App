/* Deux sorties, une seule commande.
   - dist/ est le site tel qu'il est deploye : les sources telles quelles,
     un fichier par role, servies par HTTP. C'est ce que Vercel publie
     (voir vercel.json#outputDirectory).
   - dist/_full.html est l'application repliee en un seul fichier, recopiee
     sur Necron_Aide_Jeu.html a la racine : c'est la version hors-ligne,
     qu'on ouvre d'un double-clic sans reseau ni serveur.
   Le chargeur compresse, lui, sort sous dist/hors-ligne.html : il ne doit
   surtout pas occuper dist/index.html, qui est la porte d'entree du site. */
const fs=require('fs'), zlib=require('zlib'), crypto=require('crypto'), terser=require('terser');
const SOURCES=['index.html','data.js','engine.js','app.js','roster.js'];
const STATIQUES=['manifest.json','icon.svg'];
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
  fs.writeFileSync('dist/hors-ligne.html',loader);

  /* le site : les sources telles quelles, plus le fichier autonome a
     telecharger depuis la page */
  for(const f of SOURCES.concat(STATIQUES)) fs.copyFileSync(f,'dist/'+f);
  fs.writeFileSync('dist/Necron_Aide_Jeu.html',full);
  /* et la meme a la racine, comme l'annonce l'en-tete : c'est CE fichier
     que le depot suit et que la verification hors-ligne ouvre. Sans cette
     ligne il restait fige a sa derniere ecriture manuelle, et la suite
     hors-ligne validait une version vieille de treize chantiers. */
  fs.writeFileSync('Necron_Aide_Jeu.html',full);

  /* Le service worker sert le cache hors-ligne. Son nom de cache porte
     l'empreinte des sources : un deploiement qui change quoi que ce soit
     invalide l'ancien cache au lieu de le laisser resservir la version
     precedente. */
  const sig=crypto.createHash('sha256')
    .update(SOURCES.map(f=>fs.readFileSync(f)).reduce((a,b)=>Buffer.concat([a,b])))
    .digest('hex').slice(0,8);
  fs.writeFileSync('dist/sw.js', fs.readFileSync('sw.js','utf8')
    .replace(/necrons-v\w+/,'necrons-'+sig));
  console.log('site', SOURCES.length+STATIQUES.length+2, 'fichiers | empreinte', sig,
              '| autonome', full.length, 'o | chargeur', loader.length, 'o');
})();
