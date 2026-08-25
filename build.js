/* Deux sorties, une seule commande.
   - dist/ est le site tel qu'il est deploye : les sources telles quelles,
     un fichier par role, servies par HTTP. C'est ce que Vercel publie
     (voir vercel.json#outputDirectory).
   - dist/_full.html est l'application repliee en un seul fichier, recopiee
     sur W40K_App.html a la racine : c'est la version hors-ligne,
     qu'on ouvre d'un double-clic sans reseau ni serveur.
   Le chargeur compresse, lui, sort sous dist/hors-ligne.html : il ne doit
   surtout pas occuper dist/index.html, qui est la porte d'entree du site. */
const fs=require('fs'), zlib=require('zlib'), crypto=require('crypto'), terser=require('terser');
/* L'ordre compte : data.js pose le registre des factions, chaque
   data-<faction>.js s'y enregistre, et tout le reste lit les tables que
   l'adaptateur a mises en service. Une faction de plus, c'est une ligne
   de plus ici, une dans sw.js et une balise dans index.html. */
const SOURCES=['index.html','data.js','data-necrons.js','data-custodes.js','data-astra.js','data-worldeaters.js','engine.js','app.js','roster.js','layouts.js','plateau.js'];
/* les memes, moins la page : c'est ce qui part chez terser, dans cet
   ordre. Derive de SOURCES pour que les deux listes ne divergent pas. */
const JS=SOURCES.filter(f=>f.endsWith('.js'));
const STATIQUES=['manifest.json','icon.svg'];
(async()=>{
  /* L'empreinte se calcule d'abord : elle est ecrite DANS les sorties, pour
     qu'une copie ouverte trois semaines plus tard dise de quand elle date.
     Elle porte sur les sources telles qu'elles sont sur le disque — la
     substitution qui suit n'entre donc pas dans son propre calcul. */
  const sig=crypto.createHash('sha256')
    .update(SOURCES.map(f=>fs.readFileSync(f)).reduce((a,b)=>Buffer.concat([a,b])))
    .digest('hex').slice(0,8);
  const html=fs.readFileSync('index.html','utf8')
    .replace('<meta name="build" content="source">','<meta name="build" content="'+sig+'">');
  const css=html.match(/<style>([\s\S]*?)<\/style>/)[1]
    .replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,>])\s*/g,'$1')
    .replace(/;}/g,'}').replace(/\n+/g,'').replace(/\s{2,}/g,' ').trim();
  const js=JS.map(f=>fs.readFileSync(f,'utf8')).join('\n');
  const min=await terser.minify(js,{compress:{passes:3},mangle:{toplevel:true},format:{comments:false}});
  if(min.error) throw min.error;
  /* Les fonds de carte. Sur le site ils restent un fichier chacun, demande
     seulement quand on le regarde — trois megaoctets ne doivent pas partir
     a chaque ouverture de page. Dans le fichier autonome il n'y a plus de
     reseau : on les replie en data URI, ce qui pese, mais c'est le prix du
     hors-ligne. */
  const cartes={};
  if(fs.existsSync('cartes'))
    for(const f of fs.readdirSync('cartes').filter(f=>f.endsWith('.jpg')))
      cartes[f.replace(/\.jpg$/,'').replace('-','|')]=
        'data:image/jpeg;base64,'+fs.readFileSync('cartes/'+f).toString('base64');
  const bagage=Object.keys(cartes).length
    ? '<script>window.CARTES='+JSON.stringify(cartes)+'<\/script>' : '';

  /* La suite des balises de script, remplacee d'un bloc par le paquet
     minifie. Le motif se deduit de JS : deux listes ecrites a la main
     finissaient par diverger, et un fichier oublie ici partait du
     fichier autonome sans que rien ne le signale. */
  const balises=new RegExp(JS.map(f=>'<script src="'+f.replace(/\./g,'\\.')+'"><\\/script>').join('\\s*'));
  if(!balises.test(html)) throw new Error('index.html ne charge pas les scripts dans l\'ordre de SOURCES');
  const full=html.replace(/<style>[\s\S]*?<\/style>/,'<style>'+css+'</style>')
    .replace(/\n\s*\n/g,'\n')
    .replace(balises,bagage+'<script>'+min.code+'<\/script>');
  fs.mkdirSync('dist',{recursive:true});
  const b64=zlib.gzipSync(Buffer.from(full,'utf8'),{level:9}).toString('base64');
  const loader='<!DOCTYPE html>\n<html lang="fr"><head><meta charset="utf-8">'
+'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
+'<meta name="theme-color" content="#0B0F0C"><meta name="apple-mobile-web-app-capable" content="yes">'
+'<meta name="apple-mobile-web-app-title" content="W40K App">'
+'<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
+'<title>W40K App</title><link rel="manifest" href="manifest.json"><link rel="icon" href="icon.svg">'
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
  /* index.html part avec son empreinte injectee, pas la copie brute :
     le site deploye doit pouvoir dire sa version comme le fichier autonome */
  for(const f of SOURCES.concat(STATIQUES))
    if(f !== 'index.html') fs.copyFileSync(f,'dist/'+f);
  fs.writeFileSync('dist/index.html', fs.readFileSync('index.html','utf8')
    .replace('<meta name="build" content="source">','<meta name="build" content="'+sig+'">'));
  fs.writeFileSync('dist/W40K_App.html',full);
  if(fs.existsSync('cartes')){
    fs.mkdirSync('dist/cartes',{recursive:true});
    for(const f of fs.readdirSync('cartes').filter(f=>f.endsWith('.jpg')))
      fs.copyFileSync('cartes/'+f,'dist/cartes/'+f);
  }
  /* et la meme a la racine, comme l'annonce l'en-tete : c'est CE fichier
     que le depot suit et que la verification hors-ligne ouvre. Sans cette
     ligne il restait fige a sa derniere ecriture manuelle, et la suite
     hors-ligne validait une version vieille de treize chantiers. */
  fs.writeFileSync('W40K_App.html',full);

  /* Le service worker sert le cache hors-ligne. Son nom de cache porte
     l'empreinte des sources : un deploiement qui change quoi que ce soit
     invalide l'ancien cache au lieu de le laisser resservir la version
     precedente. */
  fs.writeFileSync('dist/sw.js', fs.readFileSync('sw.js','utf8')
    .replace(/w40k-app-\w+/,'w40k-app-'+sig));
  console.log('site', SOURCES.length+STATIQUES.length+2, 'fichiers | empreinte', sig,
              '| autonome', full.length, 'o | chargeur', loader.length, 'o |',
              Object.keys(cartes).length, 'fonds de carte');
})();
