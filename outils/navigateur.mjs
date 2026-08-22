/* ============================================================
   OUVRIR UN NAVIGATEUR, DE MACHINE EN MACHINE

   Les suites d'integration ont besoin de Playwright et d'un Chromium.
   Ni l'un ni l'autre ne se trouve au meme endroit d'un poste a l'autre :
   ecrire le chemin en dur rend la suite injouable pour tout le monde
   sauf son auteur. On resout donc les deux par leur nom, avec repli sur
   les emplacements connus, et on dit clairement quoi faire si rien ne
   repond plutot que de laisser tomber une trace de pile.
   ============================================================ */
import fs from 'fs';

export async function chromium(){
  let pw = null;
  for (const ou of ['playwright', 'playwright-core',
                    '/home/claude/.npm-global/lib/node_modules/playwright/index.js']){
    try { pw = (await import(ou)).default || await import(ou); break; } catch { /* suivant */ }
  }
  if (!pw){
    console.error("Playwright est introuvable. Installe-le puis relance :\n" +
                  "  npm i -D playwright\n");
    process.exit(2);
  }
  const nav = pw.chromium || pw;
  /* le binaire : celui que Playwright connait, sinon ceux qu'on croise */
  const pistes = [process.env.CHROMIUM_BIN,
                  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
                  '/opt/pw-browsers/chromium/chrome'].filter(Boolean);
  const exe = pistes.find(p => { try { return fs.existsSync(p); } catch { return false; } });
  return exe ? nav.launch({ executablePath: exe }) : nav.launch();
}

/* l'adresse du site servi localement, surchargeable par l'environnement */
export const base = process.env.SITE || 'http://localhost:8099/';
