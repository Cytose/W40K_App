/* Service worker — cache app shell pour usage hors-ligne */
const CACHE = "w40k-app-v3";
const ASSETS = ["./", "./index.html", "./data.js", "./data-necrons.js", "./data-custodes.js", "./data-astra.js", "./data-worldeaters.js", "./data-sororitas.js", "./data-mechanicus.js", "./data-titanicus.js", "./data-aeldari.js", "./data-drukhari.js", "./data-agents.js", "./data-chevaliers.js", "./data-greyknights.js", "./data-spacemarines.js", "./data-blacktemplars.js", "./data-bloodangels.js", "./data-darkangels.js", "./data-deathwatch.js", "./data-spacewolves.js", "./data-csm.js", "./data-deathguard.js", "./data-thousandsons.js", "./data-emperorschildren.js", "./data-demons.js", "./data-chevalierschaos.js", "./data-orks.js", "./data-tau.js", "./data-tyranides.js", "./data-gsc.js", "./data-votann.js", "./engine.js", "./app.js", "./roster.js", "./layouts.js", "./plateau.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
