const fs=require('fs'),zlib=require('zlib'),crypto=require('crypto');
const full=fs.readFileSync('dist/_full.html');
const b64=zlib.gzipSync(full,{level:9}).toString('base64');
fs.writeFileSync('dist/a.b64',b64);
const idx=`<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0B0F0C">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Mathhammer">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Mathhammer — Nécrons</title>
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icon.svg">
<link rel="apple-touch-icon" href="icon.svg">
<style>html,body{margin:0;background:#0B0F0C;color:#9BE85C;font-family:-apple-system,system-ui,sans-serif}
#boot{padding:44px 20px;text-align:center;font-size:12px;letter-spacing:.14em;text-transform:uppercase}</style>
</head><body><div id="boot">Réveil des tombes…</div>
<script>
(async function(){
  var o = document.getElementById("boot");
  try{
    if(!self.DecompressionStream) throw new Error("old");
    var B = await (await fetch("a.b64", {cache:"no-cache"})).text();
    var bin = Uint8Array.from(atob(B.trim()), function(c){ return c.charCodeAt(0); });
    var t = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
    document.open(); document.write(t); document.close();
  }catch(e){
    o.innerHTML = (e && e.message === "old")
      ? "Navigateur trop ancien.<br>Mets-le à jour, ou ouvre la page dans un Chrome / Safari récent."
      : "Chargement impossible.<br>Vérifie ta connexion et recharge la page.";
  }
})();
</script></body></html>
`;
fs.writeFileSync('dist/index.html',idx);
fs.writeFileSync('dist/sw.js', fs.readFileSync('sw.js','utf8')
  .replace(/const ASSETS = \[[^\]]*\];/,'const ASSETS = ["./", "./index.html", "./a.b64", "./manifest.json", "./icon.svg"];')
  .replace(/necrons-v\d/,'necrons-v5'));
console.log('index.html', idx.length, '| a.b64', b64.length, '| sha256', crypto.createHash('sha256').update(b64).digest('hex').slice(0,12));
