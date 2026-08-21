(function(){
"use strict";
const el = id => document.getElementById(id);
const {scaleDice, analytic, simulateCombined, simulate, seuilTues, auMoins} = ENG;
const {S, unitRow, unitWeps, parseFlags, antiDe, antiActif, libelleAnti,
       drawBars, binned, pct, num, rendSeuils} = SIM;

/* ==========================================================
   ETAT DE LA LISTE
   ========================================================== */
const RKEY = "mathhammer.roster.v1";   /* ancien format, une seule liste */
const LKEY = "mathhammer.lists.v1";

/* Une liste : {id, nom, cap, detach:[], units:[], nextId}
   units : {id,name,size,lo:[{w,n}],chars:[{name,w}],sel,grp,enh} */
let LISTS = [];
let R = null;                         // la liste ouverte
let nextId = 1;                       // compteur d'unites de la liste ouverte
let phase = "T";
let situ = {};                        // conditions situationnelles cochees

const listeVierge = (nom, cap) => ({
  id: "l" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36),
  nom: nom || "Nouvelle liste", cap: cap || 2000, detach: [], fd: "", units: [], nextId: 1
});

function saveR(){
  if(R){ R.nextId = nextId; }
  try{ localStorage.setItem(LKEY, JSON.stringify({ v:1, actif: R ? R.id : null, listes: LISTS })); }catch(e){}
}

/* remet une liste d'aplomb : champs manquants des versions precedentes */
/* le pack de faction nomme en francais des optimisations que le
   catalogue nommait en anglais : les listes deja enregistrees
   retrouvent la leur */
function migreEnh(nom){
  if(!nom) return nom;
  if(typeof ENH_ANCIENS !== "undefined" && ENH_ANCIENS[nom]) return ENH_ANCIENS[nom];
  return nom;
}

/* unites d'une liste enregistree qui n'existent plus dans la table :
   on les retire, mais on le dit — une unite qui disparait en silence
   fausse le total sans prevenir */
let RETIREES = [];
let MIGRE = false;

function normaliseListe(L){
  L.detach = L.detach || []; L.units = L.units || [];
  L.cap = L.cap || 2000; L.nom = L.nom || "Liste"; L.nextId = L.nextId || 1;
  if(!L.id) L.id = listeVierge().id;
  L.units = L.units.filter(ru => {
    if(unitRow(ru.name)) return true;
    RETIREES.push(ru.name);
    return false;
  });
  L.units.forEach(ru => {
    /* le personnage rattache passe lui aussi aux emplacements */
    (ru.chars || []).forEach(c=>{
      if(c.lo) return;
      const sl = armSlots(c.name);
      c.lo = [];
      if(c.w !== undefined && c.w !== null){
        let vs = -1, vo = -1, taille = 1e9;
        sl.forEach((x, si) => x.o.forEach((o, oi) => {
          if(o.indexOf(c.w) >= 0 && o.length < taille){ taille = o.length; vs = si; vo = oi; }
        }));
        if(vs >= 0) c.lo.push({s:vs, o:vo});
      }
      sl.forEach((x, si)=>{ if(x.min >= 1 && !c.lo.some(l => l.s === si)) c.lo.push({s:si, o:0}); });
      delete c.w;
      MIGRE = true;
    });
    ru.chars = (ru.chars || []).filter(c => {
      if(unitRow(c.name)) return true;
      RETIREES.push(c.name);
      return false;
    });
  });
  L.units.forEach(ru => {
    ru.chars = ru.chars || []; ru.lo = ru.lo || [];
    if(ru.sel === undefined) ru.sel = true;
    if(!ru.grp) ru.grp = nomGroupe();
    if(ru.enh === undefined) ru.enh = null;
    ru.enh = migreEnh(ru.enh);
    if(ru.enhP === undefined) ru.enhP = "";
    /* l'armement se decrit desormais par emplacement. On convertit
       l'ancienne repartition, qui ne connaissait que des armes : chaque
       ligne rejoint la premiere option qui contient son arme. */
    const slots = armSlots(ru.name);
    if(ru.lo.some(l => l.s === undefined)){
      const neuf = [];
      ru.lo.forEach(l => {
        if(l.s !== undefined){ neuf.push(l); return; }
        /* on retient l'option la plus simple qui contient cette arme :
           une ancienne ligne « griffes » devient l'option griffes seules,
           pas griffes plus rayon dimensionnel */
        let vs = -1, vo = -1, taille = 1e9;
        slots.forEach((sl, si) => sl.o.forEach((o, oi) => {
          if(o.indexOf(l.w) >= 0 && o.length < taille){ taille = o.length; vs = si; vo = oi; }
        }));
        if(vs >= 0){
          const ex = neuf.find(x => x.s === vs && x.o === vo);
          if(ex) ex.n += l.n; else neuf.push({s:vs, o:vo, n:l.n});
        }
      });
      ru.lo = neuf;
      MIGRE = true;
    }
    ru.lo = ru.lo.filter(l => l.n > 0 && slots[l.s] && slots[l.s].o[l.o]);
    /* un emplacement obligatoire couvre tout l'effectif */
    slots.forEach((sl, si)=>{
      if(sl.min < 1) return;
      const lot = loSlot(ru, si), tot = lot.reduce((a, l) => a + l.n, 0);
      if(tot < ru.size){
        if(lot.length) lot[0].n += ru.size - tot;
        else ru.lo.push({s:si, o:0, n:ru.size});
        MIGRE = true;
      }
    });
    if(!ru.id) ru.id = L.nextId++;
  });
  return L;
}

function ouvre(L){ R = L; nextId = L.nextId || 1; }

function loadR(){
  let actif = null;
  try{
    const o = JSON.parse(localStorage.getItem(LKEY) || "null");
    if(o && Array.isArray(o.listes)){ LISTS = o.listes; actif = o.actif; }
  }catch(e){}

  /* reprise de l'ancien format : la liste unique devient la premiere */
  if(!LISTS.length){
    let ancienne = null;
    try{
      const o = JSON.parse(localStorage.getItem(RKEY) || "null");
      if(o && o.R) ancienne = Object.assign(listeVierge("Ma liste", 2000), {
        detach: o.R.detach || [], units: o.R.units || [], nextId: o.nextId || 1
      });
    }catch(e){}
    LISTS = [ancienne || listeVierge("Ma liste", 2000)];
    actif = LISTS[0].id;
  }
  LISTS.forEach(normaliseListe);
  ouvre(LISTS.find(x => x.id === actif) || LISTS[0]);
  /* premier lancement, ou reprise de l'ancien format : on fixe l'etat
     tout de suite plutot que d'attendre la premiere modification */
  if(!localStorage.getItem(LKEY) || MIGRE){ saveR(); MIGRE = false; }
  if(RETIREES.length){
    const uniques = RETIREES.filter((x,i) => RETIREES.indexOf(x) === i);
    saveR();
    setTimeout(()=> toast(
      uniques.join(", ") + (uniques.length > 1 ? " ne sont plus dans la table" : " n'est plus dans la table") +
      " : retiré" + (uniques.length > 1 ? "s" : "") + " de tes listes.", "", null), 900);
    RETIREES = [];
  }
}

/* ---- gestion des listes ---- */
function nouvelleListe(){
  const L = listeVierge("Liste " + (LISTS.length + 1), R ? R.cap : 2000);
  LISTS.push(L); ouvre(L); saveR(); renderList();
}
function dupliqueListe(){
  if(!R) return;
  const copie = JSON.parse(JSON.stringify(R));
  copie.id = listeVierge().id;
  copie.nom = R.nom + " (copie)";
  LISTS.push(copie); ouvre(copie); saveR(); renderList();
}
function supprimeListe(){
  if(!R || LISTS.length < 2){
    alert("C'est ta seule liste : crées-en une autre avant de supprimer celle-ci.");
    return;
  }
  if(!confirm("Supprimer « " + R.nom + " » et ses " + R.units.length + " unité" +
    (R.units.length > 1 ? "s" : "") + " ? C'est définitif.")) return;
  const i = LISTS.indexOf(R);
  LISTS.splice(i, 1);
  ouvre(LISTS[Math.max(0, i - 1)]);
  saveR(); renderList();
}
/* le simulateur pioche ici : unites de la liste ouverte, avec la taille
   et l'arme retenues, plus les personnages rattaches */
/* Les profils d'une unite de la liste pour une phase donnee, sans toucher
   a la phase courante de l'ecran « Tir cumule » : le simulateur choisit la
   sienne de son cote. */
/* Les aptitudes qui ne valent que sous condition — la cible tient un
   objectif, l'unite a charge, la figurine est abimee. L'application ne
   peut pas les deviner : elle les nomme, dit a qui elles s'appliquent,
   et attend que le joueur les declare. Les appliquer d'office ferait
   mentir chaque calcul dans le sens de l'attaquant. */
function conditionsDe(ru, ph){
  const port = (ph === "C") ? "C" : "T";
  const out = [];
  const tbl = (typeof APTIS_COND !== "undefined") ? APTIS_COND : {};
  const ajoute = (fig, a, i)=>{
    if(a.port && a.port !== port) return;
    out.push({ id: fig + "|" + a.nom + "|" + i, sur: fig, nom: a.nom,
               quand: a.quand, texte: a.texte,
               champ: a.champ, mot: a.mot, val: a.val });
  };
  (tbl[ru.name] || []).forEach((a, i) => ajoute(ru.name, a, i));
  ru.chars.forEach(c => (tbl[c.name] || []).forEach((a, i) => ajoute(c.name, a, i)));

  /* les auras d'une autre figurine de l'armee : la source doit y etre */
  const armee = (typeof AURAS_ARMEE !== "undefined") ? AURAS_ARMEE : [];
  armee.forEach((a, i)=>{
    const presente = R.units.some(x => x.name === a.source ||
                                       x.chars.some(c => c.name === a.source));
    if(!presente) return;
    if(a.port && a.port !== port) return;
    if(a.kw && a.kw.length && !a.kw.some(k => groupeA(ru, k))) return;
    /* certaines auras excluent au lieu d'inclure : la Folie Meurtriere
       du Nekrosor vaut pour toute l'armee SAUF les MONSTRES et les
       TITANESQUES. Sans cette ligne, un Monolithe recevrait des
       Touches Soutenues qu'il n'a pas. */
    if(a.sauf && a.sauf.some(k => groupeA(ru, k))) return;
    out.push({ id: "aura|" + a.source + "|" + i, sur: "", nom: a.nom,
               quand: a.quand, texte: a.texte,
               champ: a.champ, mot: a.mot, val: a.val });
  });

  /* le malus des figurines abimees : un etat de partie, jamais un
     automatisme — l'application ignore combien il reste de PV */
  const ab = (typeof ABIMEES !== "undefined") ? ABIMEES : {};
  [ru.name].concat(ru.chars.map(c => c.name)).forEach(nom=>{
    if(!ab[nom]) return;
    out.push({ id: "abime|" + nom, sur: nom, nom: "Figurine abîmée",
               quand: nom + " est à " + ab[nom] + " PV ou moins",
               texte: "Tant que cette figurine a " + ab[nom] +
                      " points de vie ou moins, à chaque attaque qu'elle fait, retranchez 1 du jet de touche.",
               champ: "hitMod", val: -1 });
  });
  return out;
}

function profilsPhase(ru, ph){
  const avant = phase;
  phase = (ph === "C") ? "C" : "T";
  const out = unitProfiles(ru);
  phase = avant;
  return out;
}

window.ROSTER = {
  /* ---- ce que le simulateur charge : une unite entiere, tous profils ----
     Les armes de l'escouade et celles des personnages rattaches, avec les
     octrois du detachement deja appliques. C'est la meme construction que
     le tir cumule, offerte a l'onglet Attaque pour qu'il puisse mesurer
     une unite complete et non une seule arme. */
  simUnite: function(id, ph){
    if(!R) return null;
    const ru = R.units.find(u => String(u.id) === String(id));
    if(!ru) return null;
    return {
      id: ru.id, nom: nomRepere(ru), unite: ru.name, taille: ru.size,
      persos: ru.chars.map(c => c.name), armes: armementCourt(ru),
      profils: profilsPhase(ru, ph).map(p => Object.assign({}, p)),
      conditions: conditionsDe(ru, ph)
    };
  },
  /* Les stratagemes de mes detachements qui touchent la sequence
     d'attaque, pour l'unite chargee et la phase choisie. */
  stratsSimu: function(nomUnite, persos, ph){
    if(!R || typeof STRAT_SIMU === "undefined") return [];
    const noms = [nomUnite].concat(persos || []).filter(Boolean);
    const porte = k => noms.some(n => porteMot(k, n));
    return STRAT_SIMU.filter(st=>{
      if(R.detach.indexOf(st.detach) < 0) return false;
      if(st.ph !== "TC" && st.ph !== (ph || "T")) return false;
      if(st.unites.length && !st.unites.some(u => noms.indexOf(u) >= 0)) return false;
      if((st.sauf || []).some(k => porte(k))) return false;
      return true;
    }).map(st => ({ nom:st.nom, pc:st.pc, aide:st.aide, effet:st.effet,
                    detach:nomDetach(st.detach) }));
  },
  /* Les regles de detachement en vigueur, dites en clair : elles
     s'appliquent sans qu'on les coche, et rien ne le montrait. */
  reglesDetach: function(){
    if(!R) return [];
    return R.detach.map(n=>{ const d = detachRow(n); return d ? {
      detach: nomDetach(d[0]), nom: d[3], texte: d[4],
      conditionnel: !!d[6] } : null; }).filter(Boolean);
  },
  /* Les conditions de detachement : sept regles qui ne valent que si
     quelque chose est vrai ce tour-ci. Le simulateur les propose avec
     les autres retouches de partie ; elles ne touchent que les unites
     de la liste, jamais une arme mesuree seule. */
  situations: function(){ return situationsDetach(); },
  poseSituation: function(cle, on){ situ[cle] = !!on; },
  /* l'inventaire des unites de la liste, avec de quoi montrer d'avance
     combien de profils chacune apporte dans chaque phase */
  simListe: function(){
    if(!R) return null;
    return { nom: R.nom, unites: R.units.map(ru => ({
      id: ru.id, nom: nomRepere(ru), unite: ru.name, taille: ru.size,
      persos: ru.chars.map(c => c.name), armes: armementCourt(ru),
      enh: ru.enh ? nomEnh(ru.enh) : "",
      cat: (typeof categorie === "function") ? categorie(ru.name) : "",
      nT: profilsPhase(ru, "T").length,
      nC: profilsPhase(ru, "C").length })) };
  },
  /* Le cote CIBLE d'une unite de la liste : ses caracteristiques
     defensives telles qu'elles seront reellement en jeu — l'effectif
     choisi, et l'insensibilite qu'un Technomancien rattache donne au
     groupe. Le catalogue seul ne connait ni l'un ni l'autre. */
  simCible: function(id){
    if(!R) return null;
    const ru = R.units.find(x => x.id === id); if(!ru) return null;
    const u = unitRow(ru.name); if(!u) return null;
    /* le plus resistant du groupe porte les caracteristiques : c'est lui
       qu'on doit abattre en dernier, et c'est sur lui qu'on repartit les
       blessures allouees */
    let fnp = u[8] || 0, inv = u[4] || 0;
    const auras = (typeof AURAS_PERSO !== "undefined") ? AURAS_PERSO : {};
    ru.chars.forEach(c => (auras[c.name] || []).forEach(a=>{
      if(a.champ === "fnp") fnp = Math.max(fnp, a.val);
      /* Orikan donne une invulnerable 4+ a l'unite qu'il mene : une
         unite qui n'en avait pas en gagne une, une qui en avait une
         moins bonne l'ameliore. 0 veut dire « aucune ». */
      else if(a.champ === "inv") inv = inv ? Math.min(inv, a.val) : a.val;
    }));
    /* la Necrodermis et les aptitudes du meme genre retranchent un degat */
    const red = /Necrodermis|Implacable Resilience|Quantum Shielding|-1 D.g.t/i
                  .test(String(u[11] || "")) ? 1 : 0;
    return { tough: u[2], sv: u[3], inv: inv, wounds: u[5],
             models: ru.size + ru.chars.length,
             fnp: fnp, dmgRed: red };
  },
  /* crochet de verification : le total en points, et le detail unite par
     unite avec le rang de chaque copie */
  points: function(){
    if(!R) return null;
    const rg = rangsArmee();
    return {
      total: totalPoints(),
      unites: R.units.map(ru=>{
        const u = unitRow(ru.name);
        return { nom: ru.name, taille: ru.size, rang: rg["u" + ru.id],
                 pts: u ? ptsPour(u, ru.size, rg["u" + ru.id]) : 0,
                 persos: ru.chars.map((c, i)=>{
                   const cu = unitRow(c.name);
                   return { nom: c.name, rang: rg["c" + ru.id + "." + i],
                            pts: cu ? ptsPour(cu, cu[6][0], rg["c" + ru.id + "." + i]) : 0 };
                 }) };
      })
    };
  },
  actives: function(){
    if(!R) return null;
    const out = [];
    R.units.forEach(ru=>{
      out.push({ nom: ru.name, taille: ru.size, arme: armePrincipale(ru),
                 groupe: nomAffiche(ru), perso: false });
      ru.chars.forEach(c => out.push({ nom: c.name, taille: 1, arme: armePersoPrincipale(c),
                 groupe: nomAffiche(ru), perso: true }));
    });
    return { liste: R.nom, unites: out };
  },
  /* crochet de verification : les profils reellement construits pour une
     unite de la liste, octrois compris */
  profils: function(id, ph){
    const ru = R && R.units.find(x => x.id === id);
    if(!ru) return null;
    const av = phase; phase = ph || phase;
    const out = unitProfiles(ru).map(p => ({
      label:p.label, kind:p.kind, attacks:p.attacks, bs:p.bs, str:p.str,
      ap:p.ap, dmg:p.dmg, critH:p.critH, critW:p.critW, hitMod:p.hitMod,
      sustainedOn:p.sustainedOn, lethal:p.lethal
    }));
    phase = av;
    return out;
  },
  /* les aptitudes octroyees a une arme, pour les tests */
  octrois: function(id, porteur, i){
    const ru = R && R.units.find(x => x.id === id);
    if(!ru) return null;
    const w = unitWeps(porteur || ru.name)[i];
    return w ? octroisArme(ru, porteur, w).map(o => o.nom + " (" + o.source + ")" +
      (o.mot ? " → " + o.mot : " → " + o.champ + " " + o.val)) : null;
  }
};

function ouvreListe(id){
  const L = LISTS.find(x => x.id === id); if(!L) return;
  ouvre(L); saveR();
  /* la partie suit la liste : on va chercher la sienne */
  loadG();
  renderList();
  if(window.__relitUniteChargee) window.__relitUniteChargee();
}

/* ==========================================================
   QUELLE LISTE EST EN SERVICE
   Le simulateur et l'ecran de partie travaillent sur une liste, celle
   qui est ouverte. Tant qu'il n'y en avait qu'une, ca allait de soi ;
   des qu'il y en a trois, il faut pouvoir le dire et le voir. Le nom
   s'affiche en tete des deux ecrans et se change d'une touche.
   ========================================================== */
function ouvreChoixListe(){
  el("listActTitle").textContent = "Quelle liste ?";
  const host = el("listActList");
  host.innerHTML = "";
  if(!LISTS.length){
    host.innerHTML = '<div class="sheet-empty">Aucune liste. Crées-en une dans l\'onglet Listes.</div>';
    openSheet("sheetListAct"); return;
  }
  LISTS.forEach(L=>{
    const g = partieEnCours(L.id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (L === R ? " sel" : "");
    b.innerHTML = '<span class="oi"><span class="o1">' + L.nom + '</span>' +
      '<span class="o2">' + L.units.length + ' unité' + (L.units.length > 1 ? 's' : '') +
      ' · ' + pointsDe(L) + ' / ' + L.cap + ' pts' +
      (L.detach.length ? ' · ' + L.detach.map(nomDetach).join(" · ") : '') + '</span>' +
      (g ? '<span class="o4">Partie en cours — round ' + g.tour + ', ' +
           (g.moi ? "ton tour" : "tour adverse") + '</span>' : '') + '</span>' +
      (L === R ? '<span class="otag">EN SERVICE</span>' : '');
    b.addEventListener("click", ()=>{
      closeSheet("sheetListAct");
      if(L !== R) ouvreListe(L.id);
    });
    host.appendChild(b);
  });
  openSheet("sheetListAct");
}
function renderBarreListe(){
  const n = R ? R.nom : "aucune liste";
  const pts = R ? pointsDe(R) + " / " + R.cap + " pts" : "";
  ["Sim", "Play"].forEach(k=>{
    const nom = el("ln" + k), sub = el("lp" + k);
    if(nom) nom.textContent = n;
    if(sub) sub.textContent = LISTS.length > 1
      ? pts + " · " + LISTS.length + " listes" : pts;
  });
}

/* ==========================================================
   GROUPES RATTACHES
   Une unite de la liste porte un nom de groupe fabrique tout
   seul : c'est ce nom qu'on annonce en partie (« la Phalange
   d'Obsidienne tire »), sans avoir a le saisir. On peut le
   reecrire a la main ou en retirer un autre au hasard.
   ========================================================== */
const auHasard = t => t[Math.floor(Math.random() * t.length)];
function nomGroupe(){
  return auHasard(GRPN.forme) + " " + auHasard(GRPN.qualif) + " " + auHasard(GRPN.origine);
}

/* un personnage ne peut rejoindre que les unites listees par sa
   regle Leader ; une escorte suit sa propre liste */
function peutRejoindre(perso, unite){
  const l = ATTACH[perso] || RETINUE[perso];
  return !l ? null : l.indexOf(unite) >= 0;
}

/* ce qu'un groupe porte deja : un chef, un soutien, une escorte */
const roleDe = nom => (unitRow(nom) || [])[9] || (RETINUE[nom] ? "Escorte" : "");
const compteRole = (ru, role) => ru.chars.filter(c => roleDe(c.name) === role).length;
const aCryptek = ru => ru.chars.some(c => has("cryptek", c.name));

/* pourquoi ce personnage ne peut pas rejoindre ce groupe, "" s'il le peut.
   Une escorte Cryptek pose une double condition : elle ne se greffe que sur
   une unite deja menee par un CRYPTEK, et une seule a la fois. */
function refusAttache(nom, ru){
  if(ru.chars.some(c => c.name === nom)) return "déjà dans ce groupe";
  const role = roleDe(nom);
  if(role !== "Leader" && role !== "Support" && role !== "Escorte")
    return "ne peut rejoindre aucune unité";
  if(role === "Leader" && compteRole(ru, "Leader")) return "un seul chef par unité";
  if(role === "Support" && compteRole(ru, "Support")) return "un seul soutien par unité";
  if(role === "Escorte"){
    if(!aCryptek(ru)) return "exige un CRYPTEK dans l'unité";
    if(compteRole(ru, "Escorte")) return "une seule escorte par unité";
  }
  return "";
}

/* mots-cles portes par le groupe : ceux de l'unite plus ceux de
   chaque personnage rattache — c'est ce qui decide si un
   stratageme CRYPTEK ou NOBLE peut viser le groupe */
function motsClesGroupe(ru){
  const out = [];
  const ajoute = (nom, source) => {
    Object.keys(KW).forEach(k => {
      if(has(k, nom) && !out.some(o => o.kw === k)) out.push({kw:k, source:source});
    });
  };
  ajoute(ru.name, "");
  ru.chars.forEach(c => ajoute(c.name, c.name));
  return out;
}

const socle = nom => (BASES && BASES[nom]) || "";

/* L'armement d'une unite se lit dans ARMEMENT : des armes portees
   d'office par chaque figurine, et des emplacements de choix. Une
   option d'emplacement peut donner plusieurs armes a la fois — un
   Triarch Praetorian prend soit son rod of covenant, soit le couple
   voidblade et particle caster — et une unite peut avoir plusieurs
   emplacements independants. Une unite absente de la table porte
   toutes ses armes d'office. */
const armRow   = nom => (typeof ARMEMENT !== "undefined" && ARMEMENT[nom]) || null;
const armFixes = nom => { const a = armRow(nom); return a ? a.f : unitWeps(nom).map((w, i) => i); };
const armSlots = nom => { const a = armRow(nom); return a ? a.s : []; };
const aDesChoix = nom => armSlots(nom).length > 0;

/* ce que l'unite a retenu dans un emplacement */
/* Certaines options ne sont ouvertes qu'a une figurine — « 1 figurine peut
   remplacer sa faucheuse Gauss jumelée par 1 Isolateur transdimensionnel ».
   0 ou absent vaut « sans limite ». */
const optMax = (sl, oi) => (sl && sl.omax && sl.omax[oi]) || 0;
const loSlot = (ru, si) => (ru.lo || []).filter(l => l.s === si);
const totalSlot = (ru, si) => loSlot(ru, si).reduce((a, l) => a + l.n, 0);

/* combien de figurines portent chaque arme, par indice */
function portParArme(ru){
  const out = {}, slots = armSlots(ru.name);
  armFixes(ru.name).forEach(i => { out[i] = ru.size; });
  (ru.lo || []).forEach(l => {
    const s = slots[l.s]; if(!s || l.n <= 0) return;
    const o = s.o[l.o]; if(!o) return;
    o.forEach(i => { out[i] = (out[i] || 0) + l.n; });
  });
  return out;
}
/* Un personnage rattache porte lui aussi des armes d'office et fait ses
   propres choix d'emplacement — un Overlord prend sa lame et sa fleche
   tachyon, ou sa faux, ou son baton. Il tient une seule figurine, donc
   chaque arme compte pour une. */
function portParArmePerso(c){
  const out = {}, slots = armSlots(c.name);
  armFixes(c.name).forEach(i => { out[i] = 1; });
  (c.lo || []).forEach(l => {
    const sl = slots[l.s]; if(!sl) return;
    const o = sl.o[l.o]; if(!o) return;
    o.forEach(i => { out[i] = (out[i] || 0) + 1; });
  });
  return out;
}
/* les groupes d'arme qu'il porte, pour l'affichage */
function groupesPortes(nom, port){
  const vus = {}, out = [];
  Object.keys(port).forEach(k=>{
    const i = +k;
    const g = groupeDe(nom, i);
    const cle = g ? g.base : String(i);
    if(vus[cle]) return;
    vus[cle] = 1;
    out.push(g || {libelle: (unitWeps(nom)[i] || [])[1] || "?", profils: [{w: unitWeps(nom)[i], i: i}], base: cle});
  });
  return out;
}

/* la meme chose ramenee au groupe d'arme : un baton de lumiere qui donne
   un tir et une frappe ne compte qu'une fois */
function portParGroupe(ru){
  const par = portParArme(ru), out = {};
  Object.keys(par).forEach(i => {
    const g = groupeDe(ru.name, +i);
    if(g) out[g.base] = Math.max(out[g.base] || 0, par[i]);
  });
  return out;
}
/* armement de depart d'un personnage : la premiere option de chaque
   emplacement obligatoire */
function loPersoParDefaut(nom){
  const out = [];
  armSlots(nom).forEach((sl, si)=>{ if(sl.min >= 1) out.push({s:si, o:0}); });
  return out;
}
/* son arme la plus parlante, pour la passerelle vers le simulateur */
function armePersoPrincipale(c){
  const port = portParArmePerso(c);
  const k = Object.keys(port);
  return k.length ? +k[0] : 0;
}

/* l'arme la plus portee de l'unite, pour ouvrir le simulateur dessus */
function armePrincipale(ru){
  const port = portParArme(ru);
  let mieux = 0, meilleur = -1;
  Object.keys(port).forEach(k=>{ if(port[k] > mieux){ mieux = port[k]; meilleur = +k; } });
  return meilleur < 0 ? 0 : meilleur;
}

/* armement de depart : la premiere option de chaque emplacement
   obligatoire, rien dans les emplacements facultatifs */
function loParDefaut(nom, taille){
  const out = [];
  armSlots(nom).forEach((sl, si)=>{
    if(sl.min < 1) return;
    /* la premiere option ouverte a toute l'escouade : une option plafonnee
       a une figurine ne peut pas etre l'armement de depart */
    let oi = sl.o.findIndex((o, k) => !optMax(sl, k));
    if(oi < 0) oi = 0;
    out.push({s:si, o:oi, n:taille});
  });
  return out;
}

/* libelle d'une option : les armes qu'elle donne, groupes compris */
function libelleOption(nom, opt, sl, oi){
  if(sl && sl.onom && sl.onom[oi]) return sl.onom[oi];
  const wl = unitWeps(nom), vus = {}, bouts = [];
  opt.forEach(i => {
    const g = groupeDe(nom, i);
    const cle = g ? g.base : String(i);
    if(vus[cle]) return;
    vus[cle] = 1;
    bouts.push(g ? g.libelle : (wl[i] ? wl[i][1] : "?"));
  });
  return bouts.join(" + ") || "Sans arme";
}

/* ameliorations ouvertes par les detachements retenus */
const enhDispo = () => ENHANCEMENTS.filter(e => R.detach.indexOf(e[2]) >= 0);
const enhRow = nom => ENHANCEMENTS.find(e => e[0] === nom);

/* la phrase de restriction, telle qu'elle est ecrite sur la fiche */
const enhRestriction = e => {
  const m = e && e[3] && e[3].match(/^[^.]*(?:seulement|only)\./);
  return m ? m[0] : "";
};
/* la cible admise : une figurine du groupe, ou l'unite elle-meme */
const enhCible = e => (e && e[4]) || {c:"f", k:[]};

/* Qui, dans ce groupe, peut porter cette amelioration. Le porteur ""
   designe l'unite elle-meme : les ameliorations du pack de faction
   visent parfois l'unite — « Unite d'IMMORTELS seulement » — et non
   une figurine. Un Heros Epique n'en recoit jamais. */
function porteursPossibles(ru, e){
  if(!e) return [];
  const t = enhCible(e);
  const convient = nom => !t.k.length ||
    t.k.some(k => (KW[k] ? has(k, nom) : k === nom));
  const out = [];
  if(t.c === "u"){
    if(convient(ru.name)) out.push("");
    return out;
  }
  const uu = unitRow(ru.name);
  if(uu && uu[9] && !has("epic", ru.name) && convient(ru.name)) out.push("");
  ru.chars.forEach(c=>{
    const cu = unitRow(c.name);
    if(cu && cu[9] && !has("epic", c.name) && convient(c.name)) out.push(c.name);
  });
  return out;
}
/* le porteur retenu, ou null si l'amelioration ne peut aller nulle part */
function porteurRetenu(ru){
  const e = ru.enh && enhRow(ru.enh); if(!e) return null;
  const ok = porteursPossibles(ru, e);
  if(!ok.length) return null;
  return ok.indexOf(ru.enhP || "") >= 0 ? (ru.enhP || "") : ok[0];
}
const nomPorteur = (ru, p) => (p === "" || p === undefined || p === null) ? ru.name : p;
function enhPts(ru){
  const e = ru.enh && enhRow(ru.enh);
  return e && typeof e[1] === "number" ? e[1] : 0;
}

const KWSET = {};
Object.keys(KW).forEach(k => KWSET[k] = new Set(KW[k]));
const has = (kw, name) => KWSET[kw] ? KWSET[kw].has(name) : false;
const detachRow = n => DETACHMENTS.find(d => d[0] === n);
/* nom francais officiel du detachement, le nom du catalogue sinon */
const nomDetach = n => { const d = detachRow(n); return (d && d[7]) || n; };
/* Disposition de force : la mission qu'un detachement fait pencher.
   Relevee sur le Munitorum Field Manual, qui l'imprime en anglais —
   on la rend telle quelle plutot que d'en traduire une version qui
   n'existerait dans aucun livre. */
const dispoDetach = n => { const d = detachRow(n); return (d && d[8]) || ""; };
const CATMAP = {};
CAT.forEach(([n, c]) => CATMAP[n] = c);
const categorie = n => CATMAP[n] || "Autre";
/* un nom de groupe ne vaut que pour un ensemble : seule, une unite
   s'annonce par son propre nom */
const estGroupe = ru => ru.chars.length > 0;
const nomAffiche = ru => (estGroupe(ru) && ru.grp) ? ru.grp : ru.name;

/* ==========================================================
   POINTS & VALIDATION
   ========================================================== */
/* Rang de chaque unite de l'armee parmi ses homonymes. Une entree du pave
   est une unite ; chaque personnage rattache en est une autre, prise
   separement. Le total ne depend pas de l'ordre — payer deux fois le
   premier palier et une fois le second donne la meme somme quel que soit
   le rang qu'on attribue a qui — mais l'ordre de la liste donne un rang
   stable a afficher. */
function rangsArmee(L){
  const vus = {}, rang = {};
  (L || R).units.forEach(ru=>{
    vus[ru.name] = (vus[ru.name] || 0) + 1;
    rang["u" + ru.id] = vus[ru.name];
    (ru.chars || []).forEach((c, i)=>{
      vus[c.name] = (vus[c.name] || 0) + 1;
      rang["c" + ru.id + "." + i] = vus[c.name];
    });
  });
  return rang;
}
const rangUnite = ru => rangsArmee()["u" + ru.id] || 1;
/* rang qu'aurait une copie supplementaire : c'est le prix que paiera le
   joueur s'il ajoute cette unite maintenant, donc celui que le catalogue
   doit afficher */
function rangProchain(nom, L){
  let n = 1;
  ((L || R).units || []).forEach(ru=>{
    if(ru.name === nom) n++;
    (ru.chars || []).forEach(c => { if(c.name === nom) n++; });
  });
  return n;
}

function unitPoints(ru){
  const u = unitRow(ru.name); if(!u) return 0;
  const rg = rangsArmee();
  let p = ptsPour(u, ru.size, rg["u" + ru.id]);
  ru.chars.forEach((c, i) => {
    const cu = unitRow(c.name);
    if(cu) p += ptsPour(cu, cu[6][0], rg["c" + ru.id + "." + i]);
  });
  return p + enhPts(ru);
}
const totalPoints = () => R.units.reduce((a,ru) => a + unitPoints(ru), 0);
const totalDP = () => R.detach.reduce((a,n) => { const d = detachRow(n); return a + (d ? d[1] : 0); }, 0);
/* budget de Points de Detachement : 3 a 2000 pts, au prorata ailleurs
   (1 par tranche de 500 pts, minimum 1) */
const capDP = () => Math.max(1, Math.round((R.cap || 2000) / 2000 * 3));
/* ameliorations : deux a 1000 points, quatre a 2000, au prorata ailleurs */
const capEnhancements = () => Math.max(1, Math.round((R.cap || 2000) / 500));

function validate(){
  const w = [];
  const pts = totalPoints(), cap = R.cap || 2000;
  if(pts > cap) w.push("Liste à <b>" + pts + " pts</b> : " + (pts-cap) +
    " pts au-dessus du plafond de " + cap + ".");
  const dp = totalDP(), dpMax = capDP();
  if(dp > dpMax) w.push("<b>" + dp + " PD</b> utilisés sur " + dpMax + " disponibles à " + cap + " pts.");
  const tags = {};
  R.detach.forEach(n => { const d = detachRow(n); if(d && d[2]){ (tags[d[2]] = tags[d[2]] || []).push(n); } });
  Object.keys(tags).forEach(t => { if(tags[t].length > 1)
    w.push("Tag <b>" + t + "</b> en double : " + tags[t].join(" + ") + " ne sont pas combinables."); });

  const count = {};
  R.units.forEach(ru => { count[ru.name] = (count[ru.name]||0) + 1; });
  Object.keys(count).forEach(n => {
    const lim = has("epic", n) ? 1 : (has("battleline", n) ? 6 : 3);
    if(count[n] > lim) w.push("<b>" + n + "</b> ×" + count[n] + " : maximum " + lim +
      (lim===1 ? " (Epic Hero)" : lim===6 ? " (Battleline)" : " (règle des trois)") + ".");
  });
  R.units.forEach(ru => {
    const nom = estGroupe(ru) && ru.grp ? ru.grp + " (" + ru.name + ")" : ru.name;
    const led = compteRole(ru, "Leader"), sup = compteRole(ru, "Support"),
          esc = compteRole(ru, "Escorte");
    if(led > 1) w.push("<b>" + nom + "</b> : " + led + " chefs, un seul est autorisé.");
    if(sup > 1) w.push("<b>" + nom + "</b> : " + sup + " soutiens, un seul est autorisé.");
    if(esc > 1) w.push("<b>" + nom + "</b> : " + esc + " escortes, une seule est autorisée.");
    /* une escorte Cryptek reste suspendue au CRYPTEK qui l'a fait venir */
    if(esc && !aCryptek(ru)){
      const e = ru.chars.filter(c => roleDe(c.name) === "Escorte").map(c => c.name).join(", ");
      w.push("<b>" + e + "</b> sur " + nom + " : une escorte Cryptek exige un CRYPTEK dans l'unité, " +
        "or il n'y en a plus.");
    }
    armSlots(ru.name).forEach((sl, si)=>{
      const tot = totalSlot(ru, si);
      if(tot > ru.size)
        w.push("<b>" + nom + "</b> : " + tot + " armes réparties pour " + ru.size + " figurines.");
      else if(sl.min >= 1 && tot < ru.size)
        w.push("<b>" + nom + "</b> : " + (ru.size - tot) + " figurine" + (ru.size - tot > 1 ? "s" : "") +
          " sans arme sur " + ru.size + ".");
    });
    ru.chars.forEach(c => {
      if(peutRejoindre(c.name, ru.name) === false)
        w.push("<b>" + c.name + "</b> ne peut pas rejoindre <b>" + ru.name +
          "</b> : sa règle Leader ne cite pas cette unité.");
    });
    if(ru.enh && R.detach.indexOf((enhRow(ru.enh)||[])[2]) < 0)
      w.push("Amélioration <b>" + ru.enh + "</b> sur " + ru.name +
        " : elle appartient à un détachement que tu n'as pas pris.");
    if(ru.enh){
      const e = enhRow(ru.enh);
      if(e && !porteursPossibles(ru, e).length)
        w.push("Amélioration <b>" + ru.enh + "</b> sur " + ru.name + " : " +
          (enhRestriction(e) || "personne dans ce groupe ne peut la porter."));
    }
  });
  const enhs = R.units.map(x => x.enh).filter(Boolean);
  enhs.forEach((e, i) => { if(enhs.indexOf(e) !== i)
    w.push("Amélioration <b>" + e + "</b> prise deux fois : une seule par armée."); });
  const capEnh = capEnhancements();
  if(enhs.length > capEnh) w.push("<b>" + enhs.length + " améliorations</b> : " + capEnh +
    " au maximum à " + cap + " pts.");
  return w;
}

/* ==========================================================
   REGLES DE DETACHEMENT
   ========================================================== */
const SITU_LABEL = {
  canoptek_rr : "Unité entièrement dans la Matrice de Puissance (relance totale)",
  obj_hit1    : "Cible à portée d'un marqueur d'objectif",
  destroyer_ap1: "Cible éligible la plus proche",
  noble_wound1: "Cible désignée par Worthy Foes",
  cryptek_anti: "Aptitude choisie : Anti-Infanterie 3+",
  monster_ap1 : "Cible « unravelling » à 6\" d'un MONSTRE",
  tomb_hit1   : "Tomb Blades arrivées par ingress ce tour"
};
function activeRules(){
  const out = [];
  R.detach.forEach(n => { const d = detachRow(n); if(d && d[5]) out.push(d); });
  return out;
}
/* ==========================================================
   OCTROIS D'APTITUDES D'ARME
   Un profil d'arme n'est pas figé : le détachement retenu et
   les personnages rattachés lui ajoutent des aptitudes que la
   fiche technique ne porte pas. La lance plasmique d'un
   Plasmancien gagne [ASSAUT] sous le Conclave de Crypteks, et
   les fusils gauss d'une escouade d'Immortels le gagnent sous
   la Main de la Dynastie.
   ========================================================== */
/* un mot-cle exige : soit un groupe de KW, soit un nom d'unite */
const porteMot = (k, nom) => (typeof KW !== "undefined" && KW[k]) ? has(k, nom) : k === nom;
/* le groupe entier porte-t-il ce mot-cle ? un Plasmancien rattache rend
   CRYPTEK l'unite qu'il mene */
const groupeA = (ru, k) => porteMot(k, ru.name) || ru.chars.some(c => porteMot(k, c.name));

/* Ce qui s'ajoute a une arme donnee. `porteur` est le nom de la figurine
   qui la porte — "" pour l'escouade elle-meme. */
function octroisArme(ru, porteur, w){
  if(!ru) return [];
  const out = [], fig = porteur || ru.name;
  const tbl = (typeof OCTROIS_DETACH !== "undefined") ? OCTROIS_DETACH : {};
  R.detach.forEach(dn=>{
    (tbl[dn] || []).forEach(o=>{
      if(o.port && o.port !== w[2]) return;
      /* « figurine » ne vise que le porteur ; « unite » vise tout le groupe
         des lors qu'un de ses membres remplit la condition */
      const ok = o.qui === "figurine"
        ? (!o.kw.length || o.kw.some(k => porteMot(k, fig)))
        : (!o.kw.length || o.kw.some(k => groupeA(ru, k)));
      if(ok) out.push({ mot:o.mot, champ:o.champ, val:o.val,
                        nom:o.nom, texte:o.texte, source:nomDetach(dn) });
    });
  });
  /* « tant que cette figurine mene une unite » : seul un personnage
     rattache remplit la condition, jamais une figurine seule */
  const auras = (typeof AURAS_PERSO !== "undefined") ? AURAS_PERSO : {};
  ru.chars.forEach(c=>{
    (auras[c.name] || []).forEach(a=>{
      if(a.port && a.port !== w[2]) return;
      out.push({ mot:a.mot, champ:a.champ, val:a.val,
                 nom:a.nom, texte:a.texte, source:c.name });
    });
  });
  /* L'aptitude de la fiche elle-meme. Les Immortels relancent leurs
     blessures de 1 sans que rien ne soit coche, parce que leur fiche le
     dit : c'est une propriete du profil, pas une case a penser. Elle ne
     vaut que pour les armes du porteur — le Plasmancien rattache a des
     Immortels ne devient pas Immortel. */
  const fiches = (typeof APTIS_UNITE !== "undefined") ? APTIS_UNITE : {};
  (fiches[fig] || []).forEach(a=>{
    if(a.port && a.port !== w[2]) return;
    out.push({ mot:a.mot, champ:a.champ, val:a.val,
               nom:a.nom, texte:a.texte, source:fig });
  });
  /* Et celles dont la condition porte sur la CIBLE. Rien a cocher :
     l'application connait les mots-cles de la cible, elle sait donc
     toute seule si la regle s'applique. Changer de cible suffit a les
     faire apparaitre ou disparaitre du profil — c'est le comportement
     qu'on attend d'un « contre les VEHICULES ». */
  const vs = (typeof APTIS_CIBLE !== "undefined") ? APTIS_CIBLE : {};
  const kwC = S.kwCible || {};
  (vs[fig] || []).forEach(a=>{
    if(a.port && a.port !== w[2]) return;
    if(a.arme && a.arme !== w[1]) return;
    if(!(a.vs || []).some(k => kwC[k])) return;
    out.push({ mot:a.mot, champ:a.champ, val:a.val,
               nom:a.nom, texte:a.texte,
               source:(a.source || fig) + " · " + libelleCible(a.vs) });
  });
  return out;
}
/* « Véhicule ou Monstre », pour dire d'ou vient l'octroi */
function libelleCible(kws){
  const tbl = (typeof MOTS_CIBLE !== "undefined") ? MOTS_CIBLE : [];
  const noms = (kws || []).map(k => (tbl.find(x => x[0] === k) || [k, k])[1]);
  return noms.length ? "cible " + noms.join(" ou ") : "";
}
/* les mots-cles octroyes, ajoutes a la chaine de drapeaux de l'arme */
function drapeauxAvecOctrois(ru, porteur, w){
  const base = String(w[8] || "");
  const ajouts = octroisArme(ru, porteur, w)
    .filter(o => o.mot && !parseFlags(base)[o.mot])
    .map(o => o.mot);
  return ajouts.length ? (base ? base + " " : "") + ajouts.join(" ") : base;
}

/* applique les regles de detachement a un profil deja construit */
function applyDetach(prof, ru){
  const n = ru.name, ledBy = ru.chars.length > 0;
  activeRules().forEach(d => {
    const key = d[5], cond = d[6];
    if(cond && !situ[key]) return;
    switch(key){
      case "led_hit1":
        if(ledBy || (unitRow(n)||[])[9]) prof.hitMod = Math.max(prof.hitMod, 1);
        break;
      case "canoptek_rr":
        if(has("canoptek", n) || has("cryptek", n)) prof.rrH = situ.canoptek_rr ? "failed" : "ones";
        break;
      case "obj_hit1":
        if(!has("monster", n)) prof.hitMod = Math.max(prof.hitMod, 1);
        break;
      case "destroyer_ap1":
        if(has("destroyer", n) && prof.kind === "T") prof.ap = Math.min(5, prof.ap + 1);
        break;
      case "noble_wound1":
        if(has("noble", n) || has("lychguard", n) || has("triarch", n)) prof.wndMod = Math.max(prof.wndMod, 1);
        break;
      case "destroyer_str2":
        if(has("destroyer", n)) prof.str += 2;
        break;
      case "cryptek_anti":
        if(groupeA(ru, "cryptek")) prof.critW = Math.min(prof.critW, 3);
        break;
      case "monster_ap1":
        prof.ap = Math.min(5, prof.ap + 1);
        break;
      case "tomb_hit1":
        if(has("tombblade", n)) prof.hitMod = Math.max(prof.hitMod, 1);
        break;
    }
  });
  return prof;
}
/* la regle canoptek_rr s'applique meme hors condition (relance des 1) */
function preApply(prof, ru){
  R.detach.forEach(dn=>{
    const d = detachRow(dn); if(!d) return;
    if(d[5] === "canoptek_rr" && (has("canoptek", ru.name) || has("cryptek", ru.name)))
      prof.rrH = "ones";
  });
  return prof;
}

/* ==========================================================
   CONSTRUCTION DES PROFILS D'ATTAQUE
   ========================================================== */
function tgtFields(){
  return {tough:S.tough, sv:S.sv, inv:S.inv, wounds:S.wounds, models:S.models,
          fnp:S.fnp, dmgRed:S.dmgRed, cover:S.cover};
}
/* « ratés » vaut mieux que « les 1 », qui vaut mieux que rien */
const RANG_RR = {none:0, ones:1, failed:2};
const mieuxRr = (a, b) => (RANG_RR[a] || 0) >= (RANG_RR[b] || 0) ? a : b;

function weaponProfile(unitName, w, bearers, ru){
  /* les aptitudes octroyees comptent comme si la fiche les portait */
  const porteur = (ru && unitName !== ru.name) ? unitName : "";
  const f = parseFlags(ru ? drapeauxAvecOctrois(ru, porteur, w) : w[8]);
  const p = Object.assign({}, tgtFields(), {
    label: (ru ? "" : "") + w[1],
    kind: w[2],
    attacks: scaleDice(w[3], bearers),
    bs: w[4], str: w[5], ap: w[6], dmg: w[7],
    torrent: !!f.torrent, lethal: !!f.lethal, dev: !!f.dev,
    sustainedOn: !!f.sust, sustainedN: f.sust ? String(f.sust) : "1",
    blast: !!f.blast,
    /* l'assaut ne change rien a la sequence d'attaque — le moteur
       l'ignore — mais il se lit sur la ligne du profil : c'est lui
       qu'un detachement comme le Conclave de Crypteks accorde, et le
       joueur doit pouvoir verifier qu'il est bien arrive */
    assault: !!f.assault, heavy: !!f.heavy, pistol: !!f.pistol,
    precision: !!f.precision, oneshot: !!f.oneshot, extra: !!f.extra,
    /* Ignore le couvert etait dans le catalogue depuis le debut — six
       armes le portent — mais ne quittait jamais la fiche : le moteur
       accordait le couvert a la cible malgre lui. */
    ignoresCover: !!f.ignorescover,
    /* le tir indirect n'est pas automatique : l'arme le permet, le
       joueur decide s'il tire a couvert ou a vue. */
    indirectCap: !!f.indirect,
    rapidOn: !!f.rf, rapidN: f.rf ? Math.min(120, (+f.rf) * bearers) : 1,
    meltaOn: !!f.melta, meltaN: f.melta ? +f.melta : 2,
    twin: !!f.twin,
    /* Anti-X est conditionne par ce qu'est la cible : l'accorder sans
       condition surestime l'arme partout ailleurs. Les mots-cles de la
       cible suffisent a trancher — rien a cocher. */
    critH: 6, critW: antiActif(antiDe(f), S.kwCible) ? antiDe(f).seuil : 6,
    /* garde sous la main de quoi l'expliquer sur la ligne de profil,
       y compris quand l'aptitude ne joue pas : une arme qui perd son
       Anti-X doit le montrer, pas disparaitre en silence */
    anti: antiDe(f),
    hitMod: 0, wndMod: 0, rrH: "none", rrW: f.twin ? "failed" : "none"
  });
  if(ru){
    preApply(p, ru); applyDetach(p, ru);
    /* les octrois qui touchent un champ du profil, et non un mot-cle :
       le Heraut de la Destruction d'un Plasmancien abaisse le seuil de
       touche critique de toute l'unite a 5 */
    octroisArme(ru, porteur, w).forEach(o=>{
      if(o.champ === "critH") p.critH = Math.min(p.critH, o.val);
      else if(o.champ === "critW") p.critW = Math.min(p.critW, o.val);
      else if(o.champ === "fnp") p.fnpAllie = Math.max(p.fnpAllie || 0, o.val);
      /* une relance octroyee ne peut qu'ameliorer celle de l'arme :
         une arme jumelee garde sa relance complete meme si la fiche
         n'offre que les 1 */
      else if(o.champ === "rrH") p.rrH = mieuxRr(p.rrH, o.val);
      else if(o.champ === "rrW") p.rrW = mieuxRr(p.rrW, o.val);
      else if(o.champ === "hitMod") p.hitMod = Math.max(-1, Math.min(1, p.hitMod + o.val));
      else if(o.champ === "wndMod") p.wndMod = Math.max(-1, Math.min(1, p.wndMod + o.val));
      else if(o.champ === "apMod") p.apMod = (p.apMod || 0) + o.val;
      else if(o.champ === "strMod") p.str = Math.max(1, p.str + o.val);
    });
    /* on garde la trace de qui a donne quoi : un crit 5+ qui apparait
       sans nom ne se verifie pas, et un joueur qui ne peut pas verifier
       ne fait pas confiance au chiffre */
    p.octrois = octroisArme(ru, porteur, w).map(o => ({
      nom:o.nom, source:o.source, mot:o.mot, champ:o.champ, val:o.val }));
  }
  return p;
}
/* tous les profils d'une unite de la liste pour la phase courante */
function unitProfiles(ru){
  const list = unitWeps(ru.name), out = [];
  let matched = 0;
  const port = portParArme(ru);
  Object.keys(port).forEach(k=>{
    const i = +k, w = list[i], n = port[i];
    if(!w || w[2] !== phase || n <= 0) return;
    matched++;
    const p = weaponProfile(ru.name, w, n, ru);
    p.label = w[1] + " ×" + n;
    p.porteur = ru.name;
    out.push(p);
  });
  /* au corps a corps, toute figurine sans arme de melee choisie se bat
     avec l'arme de melee par defaut de sa datasheet */
  if(phase === "C" && !matched){
    const i = list.findIndex(w => w[2] === "C");
    if(i >= 0){
      const p = weaponProfile(ru.name, list[i], ru.size, ru);
      p.label = list[i][1] + " ×" + ru.size;
      p.porteur = ru.name;
      out.push(p);
    }
  }
  /* le personnage rattache apporte tout son armement, pas une seule arme */
  ru.chars.forEach(c=>{
    const cl = unitWeps(c.name), portC = portParArmePerso(c);
    Object.keys(portC).forEach(k=>{
      const i = +k, w = cl[i], n = portC[i];
      if(!w || w[2] !== phase || n <= 0) return;
      const p = weaponProfile(c.name, w, n, ru);
      p.label = c.name + " — " + w[1] + (n > 1 ? " ×" + n : "");
      p.porteur = c.name;
      out.push(p);
    });
  });
  return out;
}

/* ==========================================================
   ECRAN « MA LISTE »
   ========================================================== */
/* points d'une liste quelconque, sans passer par la liste ouverte */
function pointsDe(L){
  const rg = rangsArmee(L);
  return L.units.reduce((a,ru)=>{
    const u = unitRow(ru.name); if(!u) return a;
    let n = ptsPour(u, ru.size, rg["u" + ru.id]);
    ru.chars.forEach((c, i) => {
      const cu = unitRow(c.name);
      if(cu) n += ptsPour(cu, cu[6][0], rg["c" + ru.id + "." + i]);
    });
    const e = ru.enh && enhRow(ru.enh);
    return a + n + (e && typeof e[1] === "number" ? e[1] : 0);
  }, 0);
}

/* ==========================================================
   ENCAISSER
   Le calcul du simulateur, rôles inversés : l'unité de la liste
   devient la cible, l'attaquant est un archétype d'arme. On ne
   cherche pas la justesse d'une liste adverse, seulement à
   savoir si une unité tient un volume de tir donné.
   ========================================================== */
let defUnite = null, defMenace = 0, defTireurs = 10;

function defCible(){
  /* l'unite choisie, a defaut la premiere de la liste */
  if(defUnite){
    const u = unitRow(defUnite.nom);
    if(u) return {u:u, taille:defUnite.taille, nom:defUnite.nom};
  }
  const ru = R && R.units[0];
  if(ru){ const u = unitRow(ru.name); if(u) return {u:u, taille:ru.size, nom:ru.name}; }
  const u = unitRow("Immortals");
  return u ? {u:u, taille:10, nom:"Immortals"} : null;
}

function renderDef(){
  const host = el("defQuick"); if(!host) return;

  /* --- qui encaisse : les unites de la liste, puis un repli */
  host.innerHTML = "";
  const cible = defCible();
  const r = window.ROSTER && window.ROSTER.actives();
  const wrap = document.createElement("div");
  wrap.className = "chips tight";
  const vus = new Set();
  const proposer = (nom, taille) => {
    const cle = nom + "|" + taille;
    if(vus.has(cle)) return;
    vus.add(cle);
    const u = unitRow(nom); if(!u) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (cible && cible.nom === nom && cible.taille === taille ? " on" : "");
    b.innerHTML = nom + ' ×' + taille;
    b.addEventListener("click", ()=>{ defUnite = {nom:nom, taille:taille}; renderDef(); });
    wrap.appendChild(b);
  };
  if(r && r.unites.length) r.unites.forEach(x => proposer(x.nom, x.taille));
  else UNITS.slice(0, 8).forEach(u => proposer(u[0], u[6][u[6].length-1]));
  host.appendChild(wrap);

  if(!cible){ el("defProf").textContent = ""; return; }
  const u = cible.u;
  el("defProf").innerHTML = '<span class="stat">×' + cible.taille + ' · E' + u[2] +
    ' · Svg ' + u[3] + '+' + (u[4] ? ' / ' + u[4] + '++' : '') + ' · ' + u[5] + ' PV' +
    (u[8] ? ' · Insensible ' + u[8] + '+' : '') + '</span>' +
    '<span class="kw">' + (cible.taille * u[5]) + ' PV au total</span>';

  /* --- ce qu'elle recoit */
  const th = el("defThreats");
  th.innerHTML = "";
  MENACES.forEach((m, i)=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (i === defMenace ? " on" : "");
    b.textContent = m[0];
    b.addEventListener("click", ()=>{ defMenace = i; renderDef(); });
    th.appendChild(b);
  });
  const m = MENACES[defMenace];
  const f = parseFlags(m[6]);
  el("defThreatProf").innerHTML =
    '<span class="stat">A ' + m[1] + ' · ' + (f.torrent ? 'auto' : m[2] + '+') +
    ' · F' + m[3] + ' · PA ' + (m[4] ? '-' + m[4] : '0') + ' · D ' + m[5] + '</span>' +
    (m[6] ? '<span class="kw">' + motsArme(m[6]) + '</span>' : '') +
    '<span class="warn">' + m[7] + '</span>';

  /* --- resultat : le moteur, cible et attaquant echanges */
  const prof = {
    attacks: scaleDice(m[1], defTireurs),
    bs: m[2] || 4, str: m[3], ap: m[4], dmg: m[5],
    tough: u[2], sv: u[3], inv: u[4] || 0, wounds: u[5],
    models: cible.taille, fnp: u[8] || 0, dmgRed: 0, cover: false,
    torrent: !!f.torrent, lethal: !!f.lethal, dev: !!f.dev,
    sustainedOn: !!f.sust, sustainedN: f.sust || "1",
    blast: !!f.blast, rapidOn: false, rapidN: 0,
    meltaOn: !!f.melta, meltaN: f.melta || 0,
    critH: 6, critW: 6, hitMod: 0, wndMod: 0, rrH: "none", rrW: "none"
  };
  const sim = simulate(prof, 20000);
  const pv = cible.taille * u[5];
  const perte = sim.meanSlain, reste = Math.max(0, cible.taille - perte);
  /* « effacee » = il tombe AU MOINS autant de figurines que l'unite en
     compte. La distribution n'est pas plafonnee a l'effectif — le tir
     continue sur des figurines fraiches — donc lire la seule case
     « exactement N » jetait toutes les surtues et sous-estimait la
     probabilite, d'autant plus que le volume de tir montait. */
  const efface = auMoins(sim.slainDist, cible.taille);
  /* combien de tireurs pour effacer l'unite une fois sur deux :
     dichotomie sur 1..60, six essais au lieu de soixante */
  const efface50 = n => auMoins(simulate(Object.assign({}, prof, {attacks: scaleDice(m[1], n)}), 2500)
                                  .slainDist, cible.taille) >= 0.5;
  let seuil = null;
  if(efface50(60)){
    let bas = 1, haut = 60;
    while(bas < haut){
      const mid = (bas + haut) >> 1;
      if(efface50(mid)) haut = mid; else bas = mid + 1;
    }
    seuil = bas;
  }

  el("defSum").innerHTML =
    '<div class="sum hero"><div class="k">Figurines perdues</div><div class="v">' + num(perte) + '</div></div>' +
    '<div class="sum"><div class="k">Il en reste</div><div class="v">' + num(reste) + '</div></div>' +
    '<div class="sum"><div class="k">Unité effacée</div><div class="v">' + pct(efface) + '</div></div>';

  el("defSub").textContent = "Sur " + sim.N.toLocaleString("fr-FR") +
    " simulations de la salve, figurines perdues par l'unité.";
  drawBars(el("defBars"), binned(sim.slainDist, cible.taille), "var(--cyan)", (i,v)=>
    "<b>" + i + "</b> figurine" + (i>1?"s":"") + " perdue" + (i>1?"s":"") +
    "<br>probabilité <b>" + pct(v) + "</b>");
  el("defNote").innerHTML =
    '<b>' + defTireurs + ' × ' + m[0] + '</b> sur <b>' + cible.nom + ' ×' + cible.taille + '</b> (' + pv + ' PV) : ' +
    num(sim.meanDealt) + ' PV encaissés en moyenne' +
    (sim.meanRaw > sim.meanDealt + 0.05 ? ', ' + num(sim.meanRaw - sim.meanDealt) + ' perdus en surtue' : '') + '. ' +
    (seuil ? 'Il en faudrait <b>' + seuil + '</b> pour l\'effacer une fois sur deux.'
           : 'Moins d\'une chance sur deux de l\'effacer, même à 60 tireurs.');
}

/* ==========================================================
   INDEX DES LISTES
   L'axe s'ouvre ici : on voit ce qu'on a, on entre dans l'une
   d'elles pour la modifier.
   ========================================================== */
/* ==========================================================
   PAVÉ DE L'ÉDITEUR
   Une longue page qu'on déroule se prête mal à la construction
   d'une liste : on cherche une unité parmi d'autres, on la règle,
   on revient. Le pavé pose chaque unité sur sa case ; toucher une
   case ouvre son panneau, le retour ramène au pavé.
   ========================================================== */
const PANNEAUX = ["cardSettings", "cardDetach", "cardUnits", "cardStrat", "cardArms", "cardPartage"];
let unitOuverte = null;          /* id de l'unite affichee seule */

function pointsUnite(ru){
  const u = unitRow(ru.name); if(!u) return 0;
  const rg = rangsArmee();
  let p = ptsPour(u, ru.size, rg["u" + ru.id]);
  ru.chars.forEach((c, i) => {
    const cu = unitRow(c.name);
    if(cu) p += ptsPour(cu, cu[6][0], rg["c" + ru.id + "." + i]);
  });
  const e = ru.enh && enhRow(ru.enh);
  return p + (e && typeof e[1] === "number" ? e[1] : 0);
}

/* une unite dont le rattachement ou l'amelioration cloche merite d'etre
   signalee sur sa case, sans avoir a l'ouvrir */
function uniteSuspecte(ru){
  if(compteRole(ru, "Leader") > 1 || compteRole(ru, "Support") > 1) return true;
  if(compteRole(ru, "Escorte") > 1) return true;
  if(compteRole(ru, "Escorte") && !aCryptek(ru)) return true;
  if(ru.chars.some(c => peutRejoindre(c.name, ru.name) === false)) return true;
  if(ru.enh && !porteurRetenu(ru)) return true;
  /* une escouade a moitie equipee est la faute la plus courante :
     elle merite le meme signal que les autres */
  if(armSlots(ru.name).some((sl, si)=>{
       const tot = totalSlot(ru, si);
       if(tot > ru.size || (sl.min >= 1 && tot < ru.size)) return true;
       return sl.o.some((opt, oi)=>{
         const m = optMax(sl, oi);
         const l = (ru.lo || []).find(x => x.s === si && x.o === oi);
         return m > 0 && l && l.n > m;
       });
     })) return true;
  return false;
}

let modeRange = false;

/* ==========================================================
   GLISSER-DEPOSER DU PAVE
   Les fleches deplacaient d'un cran a la fois : reculer une
   unite de six rangs demandait six appuis. On attrape la case
   et on la pose ou on veut.

   Pointer Events plutot que l'API drag-and-drop du HTML : cette
   derniere n'existe pas sur mobile, et c'est au doigt que le
   pave se manipule. Le meme code sert donc a la souris.
   ========================================================== */
let glisse = null;   /* {el, px, py, bouge, x, y} */

/* la case sous le pointeur, la case attrapee mise a part */
function caseSous(g, x, y){
  g.el.style.pointerEvents = "none";
  const sous = document.elementFromPoint(x, y);
  g.el.style.pointerEvents = "";
  const c = sous && sous.closest ? sous.closest(".tile") : null;
  return (c && c !== g.el && !c.classList.contains("add")
          && c.parentNode === g.el.parentNode) ? c : null;
}

function poseGlisse(g){
  g.el.style.transform = "translate(" + (g.x - g.px) + "px," + (g.y - g.py) + "px)";
}

/* Reordonner le DOM en cours de route donne le retour visuel — les autres
   cases s'ecartent — mais deplace aussi la case attrapee dans le flux. On
   rattrape l'ecart sur l'origine pour qu'elle ne saute pas hors du doigt. */
function rangeSous(g){
  const cible = caseSous(g, g.x, g.y);
  if(!cible) return;
  /* La moitie de case survolee decide du cote ou le trou s'ouvre — a gauche
     de la case si le pointeur est sur sa moitie gauche, a droite sinon. Se
     fier au sens du deplacement donnait un resultat dependant du chemin
     parcouru : la case atterrissait un cran a cote de la ou on visait. */
  const rc = cible.getBoundingClientRect();
  const ref = (g.x > rc.left + rc.width / 2) ? cible.nextSibling : cible;
  if(ref === g.el || ref === g.el.nextSibling) return;

  const cases = Array.prototype.slice.call(g.el.parentNode.children);
  const avant = cases.map(c => c.getBoundingClientRect());
  g.el.parentNode.insertBefore(g.el, ref);

  /* la case attrapee a bouge dans le flux : on decale son origine d'autant
     pour qu'elle reste exactement sous le doigt */
  const iEl = cases.indexOf(g.el), rEl = g.el.getBoundingClientRect();
  g.px += rEl.left - avant[iEl].left;
  g.py += rEl.top - avant[iEl].top;
  poseGlisse(g);

  /* les autres cases sautent d'une place : on les repart de leur ancienne
     position et on les laisse revenir. Sans ca le pave clignote. */
  cases.forEach((c, i)=>{
    if(c === g.el) return;
    const r = c.getBoundingClientRect();
    const dx = avant[i].left - r.left, dy = avant[i].top - r.top;
    if(!dx && !dy) return;
    c.style.transition = "none";
    c.style.transform = "translate(" + dx + "px," + dy + "px)";
    void c.offsetWidth;
    requestAnimationFrame(()=>{ c.style.transition = ""; c.style.transform = ""; });
  });
}

/* Le doigt immobile en haut ou en bas de l'ecran ne produit plus d'evenement :
   le defilement de bord tourne donc sur sa propre boucle. */
function boucleBord(){
  if(!glisse || !glisse.bouge) return;
  const g = glisse, h = window.innerHeight, marge = 90;
  let d = 0;
  if(g.y < marge) d = -Math.ceil((marge - g.y) / 6);
  else if(g.y > h - marge) d = Math.ceil((g.y - (h - marge)) / 6);
  if(d){
    const av = window.scrollY;
    window.scrollBy(0, d);
    /* la page a defile sous la case : son origine suit */
    g.py -= window.scrollY - av;
    poseGlisse(g);
    rangeSous(g);
  }
  requestAnimationFrame(boucleBord);
}

function finGlisse(){
  const g = glisse;
  if(!g) return;
  glisse = null;
  g.el.style.transform = "";
  g.el.classList.remove("glisse");
  Array.prototype.slice.call(g.el.parentNode ? g.el.parentNode.children : [])
    .forEach(c => { c.style.transition = ""; c.style.transform = ""; });
  const pad = el("pad");
  if(pad) pad.classList.remove("glissant");
  if(!g.bouge) return;
  /* l'ordre du DOM fait foi */
  const rang = {};
  Array.prototype.slice.call(g.el.parentNode.children).forEach((x, i)=>{
    if(x.dataset && x.dataset.uid) rang[x.dataset.uid] = i;
  });
  R.units.sort((a, b) => (rang[a.id] === undefined ? 1e6 : rang[a.id]) -
                         (rang[b.id] === undefined ? 1e6 : rang[b.id]));
  saveR(); renderList();
}

/* Rend une case attrapable. Le seuil de 8 px distingue un glissement d'un
   appui : sans lui, le moindre tremblement au moment de toucher une fleche
   demarrerait un deplacement. */
function armeGlisse(b){
  b.addEventListener("pointerdown", e=>{
    if(!modeRange || glisse) return;
    if(e.button !== undefined && e.button !== 0) return;
    if(e.target.closest("button") !== b) return;   /* pas sur les fleches */
    glisse = { el:b, px:e.clientX, py:e.clientY, x:e.clientX, y:e.clientY, bouge:false };
    try{ b.setPointerCapture(e.pointerId); }catch(_){}
  });
  b.addEventListener("pointermove", e=>{
    const g = glisse;
    if(!g || g.el !== b) return;
    g.x = e.clientX; g.y = e.clientY;
    if(!g.bouge){
      if(Math.abs(g.x - g.px) + Math.abs(g.y - g.py) < 8) return;
      g.bouge = true;
      b.classList.add("glisse");
      const pad = el("pad");
      if(pad) pad.classList.add("glissant");
      requestAnimationFrame(boucleBord);
    }
    e.preventDefault();
    poseGlisse(g);
    rangeSous(g);
  });
  b.addEventListener("pointerup", finGlisse);
  b.addEventListener("pointercancel", finGlisse);
  /* un glissement ne doit pas se terminer en clic sur la case */
  b.addEventListener("click", e=>{ if(modeRange) e.preventDefault(); });
}

/* Affichage du pave. Trois etats, tous d'affichage seul : jamais
   enregistres, jamais partages, sans effet sur la liste elle-meme.
   Le mode « Reorganiser » les ignore tous : on ne deplace pas une case
   dans un pave filtre ou replie, sous peine de la poser ailleurs qu'ou
   on croit. */
let padGroupe = false;
let padQ = "";
let padRoleOuvert = "";

/* Une case du pave portait le nom, les points et l'effectif — et un grand
   vide au milieu. « +1 perso » ne disait pas qui, et deux Destroyers Lourds
   identiques etaient indiscernables. Ces trois ou quatre lignes disent ce
   qu'on cherche justement a verifier d'un coup d'oeil avant une partie. */
function detailCase(ru){
  const out = [];
  ru.chars.forEach(c => out.push({ cl: "dp", t: c.name }));
  if(ru.enh) out.push({ cl: "de", t: nomEnh(ru.enh) });
  const i = armePrincipale(ru), wl = unitWeps(ru.name);
  if(wl && wl[i]){
    const g = groupeDe(ru.name, i);
    out.push({ cl: "dw", t: g ? g.libelle : wl[i][1] });
  }
  return out;
}
/* le nom d'affichage d'une optimisation, sans son « (Aura) » ni sa
   parenthese de type : la case n'a pas la place */
const nomEnh = n => String(n).replace(/\s*\([^)]*\)\s*$/, "");

/* L'armement d'une unite en une ligne : « 2× Destructeur gauss ·
   1× Exterminateur enmitique ». C'est souvent la seule chose qui
   distingue deux escouades du meme nom et du meme effectif, et ni le
   comparateur ni le selecteur d'unite ne le montraient : trois
   Destroyers Lourds a grosse arme et trois a arme de saturation
   s'affichaient exactement pareil. */
function armementCourt(ru){
  const wl = unitWeps(ru.name), port = portParArme(ru), vus = {}, out = [];
  Object.keys(port).map(Number).sort((a,b) => a - b).forEach(i=>{
    const n = port[i], w = wl[i];
    if(!n || !w) return;
    const g = groupeDe(ru.name, i);
    if(g){ if(vus[g.base]) return; vus[g.base] = 1; }
    out.push({ gen: w[1] === "Close combat weapon",
               t: n + "\u00d7 " + (g ? g.libelle : w[1]) });
  });
  /* « Close combat weapon » est l'arme de melee par defaut : toute
     figurine la porte, aucune unite ne s'en distingue. On la tait quand
     il reste autre chose a dire, et on la garde quand c'est tout ce que
     l'unite a — les Ecorcheurs n'ont que leurs griffes. */
  const utiles = out.filter(x => !x.gen);
  return (utiles.length ? utiles : out).map(x => x.t).join(" · ");
}
/* Et quand deux unites de la liste portent quand meme le meme nom
   affiche, on les numerote : « #1 », « #2 ». Sans reperage, choisir
   l'une ou l'autre revient a tirer au sort. */
function numeroDoublon(ru, L){
  const src = ((L || R) || {}).units || [];
  const nom = nomAffiche(ru);
  const lot = src.filter(x => nomAffiche(x) === nom);
  return lot.length < 2 ? "" : " #" + (lot.indexOf(ru) + 1);
}
const nomRepere = ru => nomAffiche(ru) + numeroDoublon(ru);

function renderPad(){
  const gu = el("padUnits"), gt = el("padTools");
  if(!gu || !gt) return;

  const pad = el("pad");
  if(pad) pad.classList.toggle("range", modeRange);
  const cpt = el("padCount");
  if(cpt) cpt.textContent = modeRange
    ? "Glisse une case à sa place — l'ordre commande le tir cumulé"
    : R.units.length + " unité" + (R.units.length > 1 ? "s" : "");
  const br = el("btnReorder");
  if(br){
    br.textContent = modeRange ? "Terminé" : "Réorganiser";
    br.classList.toggle("on", modeRange);
    br.disabled = R.units.length < 2;
  }

  /* les commandes d'affichage n'ont de sens qu'a partir de quelques cases,
     et disparaissent pendant la reorganisation */
  const bg = el("btnPadGrp");
  if(bg){
    bg.hidden = modeRange || R.units.length < 4;
    bg.classList.toggle("on", padGroupe);
    bg.textContent = padGroupe ? "À plat" : "Par rôle";
  }
  const pf = el("padFind");
  if(pf) pf.hidden = modeRange || R.units.length < 6;
  const pq = el("padQ");
  if(pq && pq.value !== padQ) pq.value = padQ;
  const pqc = el("btnPadQClear");
  if(pqc) pqc.hidden = !padQ;

  gu.innerHTML = "";
  /* Le filtre porte sur ce qu'on a sous les yeux : le nom de l'unite, celui
     du groupe qu'on lui a donne, et celui des personnages rattaches — on
     cherche « overlord » pour retrouver l'escouade qu'il mene. */
  const q = modeRange ? "" : norm(padQ.trim());
  const retenue = ru => !q || norm(ru.name).includes(q) ||
    norm(ru.grp || "").includes(q) || ru.chars.some(c => norm(c.name).includes(q));
  const dessine = (ru, iu)=>{
    const u = unitRow(ru.name); if(!u) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tile" + (uniteSuspecte(ru) ? " warnmark" : "");
    b.dataset.uid = ru.id;
    /* le rang ne s'affiche que la ou il change le prix : sur une unite a
       tarif fixe, « 2e copie » serait du bruit */
    const rg = rangUnite(ru);
    const rang = (prixEvolue(u) && rg > 1) ? rg + "\u1d49 copie" : "";
    b.innerHTML =
      (estGroupe(ru) && ru.grp ? '<span class="tg">' + ru.grp + '</span>' : '') +
      '<span class="tn">' + ru.name + '</span>' +
      '<span class="td">' + detailCase(ru).map(d =>
        '<span class="' + d.cl + '">' + d.t + '</span>').join("") + '</span>' +
      '<span class="tb"><span class="tp">' + pointsUnite(ru) + '<small>points</small></span>' +
      '<span class="tx">×' + ru.size + (rang ? '<br>' + rang : '') + '</span></span>' +
      (uniteSuspecte(ru) ? '<span class="tmark"></span>' : '');
    if(modeRange){
      const mv = document.createElement("span");
      mv.className = "tmove";
      const fl = (txt, delta, off) => {
        const x = document.createElement("button");
        x.type = "button"; x.textContent = txt; x.disabled = off;
        x.setAttribute("aria-label", delta < 0 ? "Avancer" : "Reculer");
        x.addEventListener("click", e=>{
          e.stopPropagation();
          const j = iu + delta;
          if(j < 0 || j >= R.units.length) return;
          R.units.splice(j, 0, R.units.splice(iu, 1)[0]);
          saveR(); renderList();
        });
        return x;
      };
      mv.appendChild(fl("◀", -1, iu === 0));
      mv.appendChild(fl("▶", 1, iu === R.units.length - 1));
      b.appendChild(mv);
      armeGlisse(b);
    } else {
      appuiLong(b, ()=> ouvreActionsUnite(ru));
      b.addEventListener("click", ()=> ouvrePanneau("cardUnits", ru.id));
    }
    gu.appendChild(b);
  };

  const vues = R.units.map((ru, iu)=>({ru, iu})).filter(x => retenue(x.ru));
  if(padGroupe && !modeRange){
    /* regroupe par role, dans l'ordre du catalogue ; a l'interieur d'un
       role, l'ordre de la liste est conserve */
    /* Replie d'office, et un seul role ouvert a la fois. Le laisser tout
       ouvert allongeait le pave au lieu de le raccourcir : chaque en-tete
       prend une ligne entiere et un role a une seule unite laisse deux
       colonnes vides. Plie, c'est la repartition de l'armee en cinq
       lignes — combien d'unites, combien de points par role — et on
       n'ouvre que celui qu'on vient regler. */
    const parRole = {};
    vues.forEach(x => (parRole[categorie(x.ru.name)] = parRole[categorie(x.ru.name)] || []).push(x));
    CAT_ORDRE.forEach(cat=>{
      const lot = parRole[cat]; if(!lot || !lot.length) return;
      const ouvert = !!q || padRoleOuvert === cat;
      const pts = lot.reduce((a, x) => a + pointsUnite(x.ru), 0);
      const t = document.createElement("button");
      t.type = "button"; t.className = "padrole" + (ouvert ? " on" : "");
      t.innerHTML = '<span class="rchev">' + (ouvert ? "▾" : "▸") + '</span>' +
        '<span class="rnom">' + cat + '</span>' +
        '<span class="rcnt">' + lot.length + ' · ' + pts + ' pts</span>';
      t.addEventListener("click", ()=>{
        padRoleOuvert = (padRoleOuvert === cat) ? "" : cat;
        renderPad();
      });
      gu.appendChild(t);
      if(ouvert) lot.forEach(x => dessine(x.ru, x.iu));
    });
  } else {
    vues.forEach(x => dessine(x.ru, x.iu));
  }
  if(q && !vues.length){
    const v = document.createElement("div");
    v.className = "padvide";
    v.textContent = "Aucune unité de ta liste ne correspond à « " + padQ.trim() + " ».";
    gu.appendChild(v);
  }
  const hint = el("padHint");
  if(hint) hint.hidden = modeRange || !R.units.length ||
    (padGroupe && !q && !padRoleOuvert);
  if(modeRange){ gt.innerHTML = ""; return; }
  if(q){ if(hint) hint.hidden = true; gt.innerHTML = ""; return; }
  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "tile add";
  plus.hidden = modeRange;
  plus.innerHTML = "+<br>Unité";
  plus.addEventListener("click", openUnitPick);
  gu.appendChild(plus);

  const dp = totalDP(), dpMax = capDP();
  const outils = [
    ["cardDetach",   "◈", "Détachements", dp + " / " + dpMax + " PD"],
    ["cardStrat",    "⚡", "Stratagèmes",  stratsListe().length + " fiches"],
    ["cardArms",     "⌖", "Armement",     WEAPONS.length ? R.units.length + " unité" + (R.units.length > 1 ? "s" : "") : ""],
    ["cardPartage",  "⇪", "Partager",     R.units.length ? "texte, QR, fichier" : "liste vide"],
    ["cardSettings", "⚙", "Réglages",     R.cap + " pts"]
  ];
  gt.innerHTML = "";
  outils.forEach(([id, ic, nom, compl])=>{
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tile tool";
    b.innerHTML = '<span class="ti2">' + ic + '</span><span class="tn">' + nom + '</span>' +
      (compl ? '<span class="tc">' + compl + '</span>' : '');
    b.addEventListener("click", ()=> ouvrePanneau(id));
    gt.appendChild(b);
  });
}

function ouvrePanneau(id, uid){
  unitOuverte = uid || null;
  el("pad").hidden = true;
  el("btnBackPad").hidden = false;
  majRetour();
  PANNEAUX.forEach(p=>{
    const c = el(p); if(!c) return;
    c.hidden = (p !== id);
    c.classList.remove("collapsed");
  });
  let titre = "Retour au pavé";
  if(uid){
    const ru = R.units.find(x => x.id === uid);
    if(ru) titre = nomAffiche(ru);
  }
  el("panelTitle").textContent = titre;
  renderList();
  window.scrollTo(0, 0);
}

function fermePanneau(){
  unitOuverte = null; modeRange = false;
  el("pad").hidden = false;
  el("btnBackPad").hidden = true;
  majRetour();
  PANNEAUX.forEach(p => { const c = el(p); if(c) c.hidden = true; });
  renderList();
  window.scrollTo(0, 0);
}

/* actions de cycle de vie d'une liste : elles vivent la ou l'on choisit sa
   liste, pas dans l'editeur — celui-ci ne porte que ce qui la qualifie */
function ouvreActions(L){
  el("listActTitle").textContent = L.nom;
  const host = el("listActList");
  host.innerHTML = "";
  const item = (titre, sous, action, danger) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.innerHTML = '<span class="oi"><span class="o1"' + (danger ? ' style="color:var(--warn)"' : '') +
      '>' + titre + '</span><span class="o2">' + sous + '</span></span>';
    b.addEventListener("click", ()=>{ closeSheet("sheetListAct"); action(); });
    host.appendChild(b);
  };
  item("Ouvrir", "Modifier cette liste", ()=> ouvreEditeur(L.id));
  if(L !== R) item("Mettre en service",
    "C'est elle que le simulateur et l'écran de partie utiliseront",
    ()=> ouvreListe(L.id));
  item("Dupliquer", "Une copie de « " + L.nom + " », unités comprises",
    ()=>{ ouvre(L); dupliqueListe(); ouvreEditeur(); });
  if(LISTS.length > 1)
    item("Supprimer", L.units.length + " unité" + (L.units.length > 1 ? "s" : "") + " perdue" +
      (L.units.length > 1 ? "s" : "") + ", définitivement",
      ()=>{ ouvre(L); supprimeListe(); renderIndex(); }, true);
  else
    item("Supprimer", "Impossible : c'est ta seule liste", ()=>{}, false);
  openSheet("sheetListAct");
}

/* appui long (ou clic droit) sur une case du pave : dupliquer, consulter
   ou retirer sans avoir a ouvrir l'unite */
function ouvreActionsUnite(ru){
  el("listActTitle").textContent = nomAffiche(ru);
  const host = el("listActList");
  host.innerHTML = "";
  const item = (titre, sous, action, danger) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "opt";
    b.innerHTML = '<span class="oi"><span class="o1"' + (danger ? ' style="color:var(--warn)"' : '') +
      '>' + titre + '</span><span class="o2">' + sous + '</span></span>';
    b.addEventListener("click", ()=>{ closeSheet("sheetListAct"); action(); });
    host.appendChild(b);
  };
  item("Régler", "Effectif, armement, personnages", ()=> ouvrePanneau("cardUnits", ru.id));
  item("Fiche", "Profil, armes et aptitudes de " + ru.name, ()=> ouvreFiche(ru.name));
  item("Dupliquer", "Une seconde, armement et rattachements compris", ()=>{
    const copie = JSON.parse(JSON.stringify(ru));
    copie.id = nextId++;
    if(estGroupe(copie)) copie.grp = nomGroupe();
    R.units.splice(R.units.indexOf(ru) + 1, 0, copie);
    saveR(); renderList();
    toast(ru.name + " dupliqué.", "", null);
  });
  item("Retirer", pointsUnite(ru) + " pts rendus au budget", ()=> retireUnite(ru), true);
  openSheet("sheetListAct");
}

/* pose l'appui long sur un element : 480 ms suffisent a distinguer
   l'intention d'un simple toucher, et le clic droit fait pareil */
function appuiLong(elem, action){
  let t = null, bouge = false;
  const stop = ()=>{ clearTimeout(t); t = null; };
  elem.addEventListener("pointerdown", e=>{
    if(e.button && e.button !== 0) return;
    bouge = false;
    t = setTimeout(()=>{ t = null; if(!bouge){ elem.dataset.longp = "1"; action(); } }, 480);
  });
  elem.addEventListener("pointermove", ()=>{ bouge = true; stop(); });
  ["pointerup","pointercancel","pointerleave"].forEach(n => elem.addEventListener(n, stop));
  elem.addEventListener("contextmenu", e=>{ e.preventDefault(); action(); });
  elem.addEventListener("click", e=>{
    if(elem.dataset.longp){ delete elem.dataset.longp; e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
}

function renderIndex(){
  const host = el("listCards"); if(!host) return;
  host.innerHTML = "";
  if(!LISTS.length){
    host.innerHTML = '<div class="empty" style="padding:16px 4px">Aucune liste. Crées-en une pour commencer.</div>';
    return;
  }
  LISTS.forEach(L=>{
    const p = pointsDe(L), over = p > L.cap;
    const rangee = document.createElement("div");
    rangee.className = "lrow";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lcard" + (L === R ? " on" : "");
    b.innerHTML =
      '<span class="li"><b>' + L.nom + '</b>' +
      '<i>' + L.units.length + ' unité' + (L.units.length > 1 ? 's' : '') +
        ' · ' + L.detach.length + ' détachement' + (L.detach.length > 1 ? 's' : '') + '</i>' +
      '<span class="det">' + (L.detach.map(nomDetach).join(" · ") || "aucun détachement") + '</span>' +
      (L === R ? '<span class="lserv">En service — simulateur et partie</span>' : '') + '</span>' +
      '<span class="lp' + (over ? ' over' : '') + '"><b>' + p + '</b><i>/ ' + L.cap + ' pts</i></span>';
    b.addEventListener("click", ()=> ouvreEditeur(L.id));
    const m = document.createElement("button");
    m.type = "button";
    m.className = "lmore";
    m.setAttribute("aria-label", "Actions sur « " + L.nom + " »");
    m.textContent = "⋯";
    m.addEventListener("click", e => { e.stopPropagation(); ouvreActions(L); });
    rangee.appendChild(b); rangee.appendChild(m);
    host.appendChild(rangee);
  });
}

/* ==========================================================
   LISTE EN LECTURE
   Ce qu'on regarde en partie : les groupes, leurs figurines et
   leur armement, sans rien pouvoir modifier par megarde.
   ========================================================== */
/* ==========================================================
   SUIVI DE PARTIE
   Le tour, la phase, les points de commandement, ce qu'il
   reste de chaque unite et le score. Tout est enregistre :
   fermer l'application au milieu d'une partie ne perd rien.
   ========================================================== */
const GKEY = "mathhammer.partie.v1";
const PHASES = [["cmd","Cmdt"],["mvt","Mvt"],["tir","Tir"],["chg","Charge"],["cbt","Combat"]];
const PHASE_LONG = {cmd:"Commandement", mvt:"Mouvement", tir:"Tir", chg:"Charge", cbt:"Combat"};
const RAPPELS = {
  cmd: "Gagne 1 PC. Étape d'Ébranlement : jet pour les unités sous la moitié de leur effectif. Fin de phase, Protocoles de Réanimation : chaque unité amie qui a l'aptitude et se trouve sur le champ de bataille soigne D3 points de vie.",
  mvt: "Mouvement normal, Avance (+D6, plus de tir sauf armes d'Assaut), ou Rester Immobile (+1 pour toucher aux armes Lourdes). Étape des Renforts : Frappe en Profondeur à plus de 9\" de tout ennemi.",
  tir: "Une unité au contact ne tire qu'avec ses Pistolets. Rapid Fire double dans la moitié de la portée, Melta ajoute ses dégâts. Vérifie la portée avant de désigner la cible : la colonne Po est sur chaque fiche.",
  chg: "2D6, il faut atteindre le contact. Une unité qui a Avancé ou Est Restée Immobile ne charge pas. Surveillance : ton adversaire peut dépenser 1 PC pour tirer.",
  cbt: "Les unités qui ont chargé frappent en premier, puis alternance en commençant par le joueur dont c'est le tour. Une figurine doit être au contact ou à 2\" d'une figurine de son unité qui l'est."
};
let G = null;
/* le catalogue de strategemes montre-t-il tout, ou seulement ce qui se
   joue a cet instant ? etat d'affichage, le temps de la session */
let stratTout = false;

/* Un round de bataille, c'est deux tours : le mien puis celui d'en face,
   cinq phases chacun. L'application ignorait a qui etait le tour, alors
   que la moitie des strategemes se jouent chez l'adversaire — sans cette
   information, aucun filtre n'a de sens.
   « use » retient ce qui a deja servi : cle -> numero de round, pour les
   aptitudes une-fois-par-tour, ou true pour une-fois-par-partie. */
const partieVierge = () => ({ liste: R ? R.id : "", tour: 1, moi: true,
  phase: "cmd", pc: 0, prim: 0, sec: 0, u: {}, journal: [], use: {} });

/* Une partie par liste, et non plus une seule pour toutes. Avant, la
   partie etait enregistree seule : ouvrir une autre liste la remettait
   a zero sans prevenir, et revenir a la premiere ne la rendait pas.
   Deux parties en cours sur deux listes se detruisaient l'une l'autre.
   Elles sont desormais rangees par identifiant de liste ; changer de
   liste change de partie, et chacune retrouve la sienne intacte. */
let PARTIES = null;
function loadParties(){
  PARTIES = {};
  let o = null;
  try{ o = JSON.parse(localStorage.getItem(GKEY) || "null"); }catch(e){}
  if(!o) return;
  if(o.v === 2 && o.parties && typeof o.parties === "object"){ PARTIES = o.parties; return; }
  /* ancien format : la partie unique rejoint la liste qui la portait,
     et on reecrit aussitot. Laisser l'ancien bloc en place, c'est
     risquer de le relire un jour comme la partie de toutes les listes. */
  if(o.u){
    PARTIES[o.liste || ""] = o;
    try{ localStorage.setItem(GKEY, JSON.stringify({ v:2, parties: PARTIES })); }catch(e){}
  }
}
function saveG(){
  if(!PARTIES) loadParties();
  if(G) PARTIES[G.liste || ""] = G;
  try{ localStorage.setItem(GKEY, JSON.stringify({ v:2, parties: PARTIES })); }catch(e){}
}
function loadG(){
  if(!PARTIES) loadParties();
  const id = R ? R.id : "";
  G = PARTIES[id] || null;
  if(!G || !G.u) G = partieVierge();
  /* une partie enregistree avant que le tour ait un camp */
  if(G.moi === undefined) G.moi = true;
  if(!G.use) G.use = {};
  G.liste = id;
  PARTIES[id] = G;
}
/* y a-t-il quelque chose a perdre dans la partie d'une liste ? sert a
   dire, dans le choix de liste, laquelle a une partie en cours */
function partieEnCours(id){
  if(!PARTIES) loadParties();
  const g = PARTIES[id];
  if(!g || !g.u) return null;
  if(g.tour > 1 || !g.moi || g.phase !== "cmd" || g.pc || g.prim || g.sec) return g;
  if(g.journal && g.journal.length) return g;
  /* « u » ne prouve rien : l'ecran cree l'etat de chaque unite des
     qu'il l'affiche, meme sans un point de vie perdu. Ce qui compte,
     c'est qu'une unite soit descendue sous son maximum. */
  const L = LISTS.find(x => x.id === id);
  if(L && L.units.some(ru=>{
    const e = g.u[ru.id]; if(!e) return false;
    if(e.pv < pvMax(ru)) return true;
    return (e.c || []).some((v, i) => v < pvMaxChar((ru.chars[i] || {}).name));
  })) return g;
  return null;
}

const pvMax = ru => { const u = unitRow(ru.name); return u ? ru.size * u[5] : 0; };
const pvMaxChar = nom => { const u = unitRow(nom); return u ? u[5] : 0; };

/* etat d'une unite, cree a la demande pour suivre les ajouts de liste */
function etat(ru){
  let e = G.u[ru.id];
  if(!e){ e = G.u[ru.id] = { pv: pvMax(ru), c: ru.chars.map(c => pvMaxChar(c.name)) }; }
  if(e.c.length !== ru.chars.length) e.c = ru.chars.map((c,i) => e.c[i] !== undefined ? e.c[i] : pvMaxChar(c.name));
  return e;
}

function noteJournal(txt){
  G.journal.unshift({ t: G.tour, p: G.phase, x: txt });
  if(G.journal.length > 60) G.journal.length = 60;
}

const d3 = () => 1 + Math.floor(Math.random() * 3);

/* ---------- avancer dans la partie ----------
   Cmdt, Mvt, Tir, Charge, Combat, puis on passe la main ; apres le
   Combat adverse, round suivant. Le point de commandement se gagne au
   debut de MON commandement seulement : je ne compte pas ceux d'en
   face. */
function phaseSuivante(){
  const i = PHASES.findIndex(x => x[0] === G.phase);
  if(i < PHASES.length - 1){ G.phase = PHASES[i + 1][0]; saveG(); return; }
  if(G.moi){
    G.moi = false; G.phase = "cmd";
    noteJournal("Au tour de l'adversaire");
  } else {
    G.moi = true; G.phase = "cmd";
    G.tour = Math.min(9, G.tour + 1);
    G.pc++;
    noteJournal("Round " + G.tour + " — ton tour, +1 PC (total " + G.pc + ")");
  }
  saveG();
}
function phasePrecedente(){
  const i = PHASES.findIndex(x => x[0] === G.phase);
  if(i > 0){ G.phase = PHASES[i - 1][0]; saveG(); return; }
  if(!G.moi){ G.moi = true; G.phase = "cbt"; }
  else if(G.tour > 1){ G.moi = false; G.phase = "cbt"; G.tour--; }
  saveG();
}
const nomMoment = () => "Round " + G.tour + " · " +
  (G.moi ? "ton tour" : "tour adverse") + " · " + PHASE_LONG[G.phase];

/* ==========================================================
   CE QUI SE DECLENCHE MAINTENANT

   L'application connait la phase, le camp, la liste et le
   detachement. Elle peut donc dire ce qui se joue a cet
   instant precis au lieu de tout afficher tout le temps.

   Regle de prudence : en cas de doute on MONTRE. Cacher un
   strategeme dont on avait besoin coute une partie ; en
   montrer un de trop coute une ligne.
   ========================================================== */
const concerne = (m, ph, camp) => {
  if(m.camp && m.camp !== camp) return false;
  if(!m.ph) return true;                      /* « n'importe quelle phase » */
  return m.ph.split(" ").indexOf(ph) >= 0;
};

/* Le moment d'un strategeme, lu sur sa phrase de declenchement. Elle
   peut en citer deux — « a votre phase de Tir ou a la phase de Combat » :
   chaque morceau porte son propre camp, et un morceau sans « votre » ni
   « adverse » vaut pour les deux tours. */
const MOTS_PH = [[/commandement/i,"cmd"],[/mouvement/i,"mvt"],[/\btir\b/i,"tir"],
                 [/charge/i,"chg"],[/combat/i,"cbt"]];
function momentStrat(st){
  const t = String(st[4] || "");
  if(/n'importe quelle phase/i.test(t)) return [{ph:"", camp:""}];
  const out = [];
  t.split(/\bou\b/).forEach(seg=>{
    const camp = /adverse/i.test(seg) ? "adv" : (/votre/i.test(seg) ? "moi" : "");
    MOTS_PH.forEach(([r, k])=>{ if(r.test(seg)) out.push({ph:k, camp:camp}); });
  });
  return out.length ? out : [{ph:"", camp:""}];
}
const stratMaintenant = st => momentStrat(st).some(m => concerne(m, G.phase, G.moi ? "moi" : "adv"));

/* clef de suivi : ce qui a deja servi */
const dejaFait = cle => {
  const v = G.use[cle];
  return v === true || v === G.tour;
};
function marqueFait(cle, uniq){
  if(!uniq) return;
  G.use[cle] = (uniq === "partie") ? true : G.tour;
}

/* Tout ce qui se declenche a cet instant, tire de la liste ouverte. */
function declenchements(){
  const camp = G.moi ? "moi" : "adv", out = [];
  const tblM = (typeof MOMENTS !== "undefined") ? MOMENTS : {};
  const tblA = (typeof APTITUDES !== "undefined") ? APTITUDES : {};

  /* la regle de faction et celles des detachements pris */
  ((typeof MOMENTS_ARMEE !== "undefined") ? MOMENTS_ARMEE : []).forEach((m, i)=>{
    if(m.detach && R.detach.indexOf(m.detach) < 0) return;
    if(!concerne(m, G.phase, camp)) return;
    out.push({cle:"armee" + i, nom:m.nom, source:m.source, texte:m.texte,
              pos:m.pos, uniq:"", qui:"", ph:m.ph});
  });

  /* les aptitudes des figurines qui sont dans la liste */
  const vues = {};
  const ajoute = nom => {
    if(vues[nom]) return; vues[nom] = 1;
    (tblA[nom] || []).forEach(([apt, txt])=>{
      const m = tblM[nom + "|" + apt];
      if(!m || !concerne(m, G.phase, camp)) return;
      out.push({cle: nom + "|" + apt, nom: apt, source: nom, texte: txt,
                pos: m.pos, uniq: m.uniq, qui: nom, ph: m.ph});
    });
  };
  R.units.forEach(ru=>{ ajoute(ru.name); ru.chars.forEach(c => ajoute(c.name)); });

  /* en debut de phase d'abord, en fin de phase en dernier : c'est
     l'ordre dans lequel on les jouera */
  const rang = {debut:0, "":1, fin:2};
  out.sort((a, b) => (rang[a.pos] || 1) - (rang[b.pos] || 1));
  return out;
}

function renderMaintenant(){
  const host = el("gmaintenant"); if(!host) return;
  host.innerHTML = "";
  if(!R){ return; }
  const lot = declenchements();
  const strats = stratsListe().filter(stratMaintenant);
  if(!lot.length && !strats.length) return;
  

  const box = document.createElement("div");
  box.className = "maint";
  const tete = document.createElement("div");
  tete.className = "mtete";
  tete.innerHTML = "<b>Maintenant</b><span>" + nomMoment() + "</span>";
  box.appendChild(tete);

  const POS = {debut:"début de phase", fin:"fin de phase", "":""};
  /* Une aptitude « a n'importe quelle phase » se declenche aux dix phases
     du round : la montrer en entier partout noie celles qui ne valent
     qu'ici. Elle passe donc en pied de bloc, sur une ligne. */
  const ici = lot.filter(x => x.ph !== "");
  const partout = lot.filter(x => x.ph === "");
  ici.forEach(x=>{
    const fait = dejaFait(x.cle);
    const d = document.createElement("div");
    d.className = "mit" + (fait ? " fait" : "");
    d.innerHTML = '<div class="mh"><b>' + x.nom + '</b>' +
      '<i>' + x.source + (POS[x.pos] ? " · " + POS[x.pos] : "") +
      (x.uniq === "partie" ? " · une fois par partie"
        : x.uniq === "tour" ? " · une fois par tour" : "") + '</i></div>' +
      '<p class="mtx">' + x.texte + '</p>';
    /* un texte de dix lignes noie les trois autres aptitudes de la phase :
       il se replie, et s'ouvre d'une touche quand on en a besoin */
    const tx = d.querySelector(".mtx");
    if(x.texte.length > 190){
      tx.classList.add("clos");
      tx.addEventListener("click", ()=> tx.classList.toggle("clos"));
    }
    if(x.uniq){
      const b = document.createElement("button");
      b.type = "button"; b.className = "mfait";
      b.textContent = fait ? "Utilisée" : "Marquer utilisée";
      b.addEventListener("click", ()=>{
        if(dejaFait(x.cle)) delete G.use[x.cle];
        else { marqueFait(x.cle, x.uniq); noteJournal(x.nom + " — " + x.source); }
        saveG(); renderPartie();
      });
      d.appendChild(b);
    }
    box.appendChild(d);
  });

  if(partout.length){
    const zone = document.createElement("div");
    zone.className = "mtout";
    zone.innerHTML = '<span class="mk">À n\'importe quel moment</span>';
    partout.forEach(x=>{
      const fait = dejaFait(x.cle);
      const l = document.createElement("button");
      l.type = "button";
      l.className = "mune" + (fait ? " fait" : "");
      l.title = x.texte;
      l.innerHTML = '<b>' + x.nom + '</b><i>' + x.source +
        (x.uniq === "partie" ? " · 1×partie" : x.uniq === "tour" ? " · 1×tour" : "") + '</i>';
      l.addEventListener("click", ()=>{
        if(!x.uniq) return;
        if(dejaFait(x.cle)) delete G.use[x.cle];
        else { marqueFait(x.cle, x.uniq); noteJournal(x.nom + " — " + x.source); }
        saveG(); renderPartie();
      });
      zone.appendChild(l);
    });
    box.appendChild(zone);
  }

  if(strats.length){
    const sep = document.createElement("div");
    sep.className = "msep";
    sep.textContent = strats.length + " stratagème" + (strats.length > 1 ? "s" : "") +
      " se joue" + (strats.length > 1 ? "nt" : "") + " à ce moment — voir plus bas";
    box.appendChild(sep);
  }
  host.appendChild(box);
}

function renderPartie(){
  /* changer de liste, c'est changer de partie — mais on va chercher
     celle de la nouvelle liste au lieu d'en repartir de zero */
  if(!G || G.liste !== (R ? R.id : "")) loadG();
  const bar = el("gbar"); if(!bar) return;
  if(!R){ bar.innerHTML = ""; return; }

  const vivantes = R.units.filter(ru => etat(ru).pv > 0).length;
  bar.innerHTML =
    '<div class="gc"><div class="gk">Round</div><div class="gv">' + G.tour + '<small style="font-size:11px;color:var(--tx3)"> / 5</small></div></div>' +
    '<div class="gc"><div class="gk">Tour</div><div class="gv gcamp" style="font-size:13px;padding:4px 0 2px">' +
      (G.moi ? "le tien" : "adverse") + '</div></div>' +
    '<div class="gc"><div class="gk">PC</div><div class="gv">' + G.pc + '</div>' +
      '<div class="gpm"><button type="button" data-pc="-1">−</button><button type="button" data-pc="1">+</button></div></div>' +
    '<div class="gc"><div class="gk">Debout</div><div class="gv">' + vivantes + '<small style="font-size:11px;color:var(--tx3)"> / ' + R.units.length + '</small></div></div>';
  bar.querySelectorAll("[data-pc]").forEach(b => b.addEventListener("click", ()=>{
    G.pc = Math.max(0, G.pc + parseInt(b.dataset.pc, 10));
    saveG(); renderPartie();
  }));

  const ph = el("gphases");
  ph.innerHTML = "";
  ph.classList.toggle("adv", !G.moi);
  PHASES.forEach(([k, lbl])=>{
    const b = document.createElement("button");
    b.type = "button"; b.textContent = lbl;
    b.className = k === G.phase ? "on" : "";
    /* toucher une phase y va directement, sans changer de camp ni de
       round : c'est le bouton « Phase suivante » qui fait avancer la
       partie, pour qu'un doigt qui derape ne fasse pas gagner un PC */
    b.addEventListener("click", ()=>{ G.phase = k; saveG(); renderPartie(); });
    ph.appendChild(b);
  });

  /* la barre d'avancement : d'ou l'on est, et le pas suivant */
  const av = el("gavance");
  if(av){
    av.innerHTML = "";
    const prec = document.createElement("button");
    prec.type = "button"; prec.className = "gprev";
    prec.textContent = "‹"; prec.title = "Phase précédente";
    prec.disabled = G.tour === 1 && G.moi && G.phase === "cmd";
    prec.addEventListener("click", ()=>{ phasePrecedente(); renderPartie(); });
    const ou = document.createElement("span");
    ou.className = "gou"; ou.textContent = nomMoment();
    const suiv = document.createElement("button");
    suiv.type = "button"; suiv.className = "gnext";
    const i = PHASES.findIndex(x => x[0] === G.phase);
    suiv.innerHTML = i < PHASES.length - 1
      ? "Phase suivante<small>" + PHASE_LONG[PHASES[i + 1][0]] + "</small>"
      : (G.moi ? "Passer la main<small>tour adverse</small>"
               : "Round suivant<small>ton tour · +1 PC</small>");
    suiv.addEventListener("click", ()=>{ phaseSuivante(); renderPartie(); });
    av.appendChild(prec); av.appendChild(ou); av.appendChild(suiv);
  }

  renderMaintenant();
  const rap = el("grappel");
  rap.innerHTML = "<b>" + PHASE_LONG[G.phase] + "</b>" + RAPPELS[G.phase];

  /* --- etat des unites --- */
  const host = el("gunits"); host.innerHTML = "";
  if(!R.units.length){ host.innerHTML = '<div class="empty">La liste ouverte est vide.</div>'; }
  R.units.forEach(ru=>{
    const u = unitRow(ru.name); if(!u) return;
    const e = etat(ru), max = pvMax(ru);
    const figs = u[5] > 0 ? Math.ceil(e.pv / u[5]) : 0;
    const row = document.createElement("div");
    row.className = "grow" + (e.pv <= 0 ? " mort" : "");
    const gn = document.createElement("div");
    gn.className = "gn";
    gn.innerHTML = '<b>' + nomAffiche(ru) + '</b><i>' + (e.pv > 0
      ? figs + " figurine" + (figs > 1 ? "s" : "") + " sur " + ru.size
      : "détruite") + '</i>';
    gn.querySelector("b").addEventListener("click", ()=> ouvreFiche(ru.name));
    const pv = document.createElement("span");
    pv.className = "gpv" + (e.pv <= max / 2 ? " bas" : "");
    pv.textContent = e.pv + "/" + max;
    const gb = document.createElement("div");
    gb.className = "gb";
    const bt = (txt, delta) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = txt;
      b.addEventListener("click", ()=>{
        if(delta === null){ e.pv = max; e.c = ru.chars.map(c => pvMaxChar(c.name)); }
        else e.pv = Math.max(0, Math.min(max, e.pv + delta));
        if(e.pv === 0) noteJournal(nomAffiche(ru) + " détruite");
        saveG(); renderPartie();
      });
      return b;
    };
    gb.appendChild(bt("−5", -5)); gb.appendChild(bt("−1", -1));
    gb.appendChild(bt("+1", 1)); gb.appendChild(bt("⟲", null));
    row.appendChild(gn); row.appendChild(pv); row.appendChild(gb);
    host.appendChild(row);

    ru.chars.forEach((c, i)=>{
      const cu = unitRow(c.name); if(!cu) return;
      const cmax = pvMaxChar(c.name);
      const sr = document.createElement("div");
      sr.className = "grow gsub" + (e.c[i] <= 0 ? " mort" : "");
      const n2 = document.createElement("div");
      n2.className = "gn";
      n2.innerHTML = '<b style="color:var(--cyan)">' + c.name + '</b><i>' +
        (e.c[i] > 0 ? (roleDe(c.name) || "personnage") : "détruit") + '</i>';
      n2.querySelector("b").addEventListener("click", ()=> ouvreFiche(c.name));
      const p2 = document.createElement("span");
      p2.className = "gpv" + (e.c[i] <= cmax / 2 ? " bas" : "");
      p2.textContent = e.c[i] + "/" + cmax;
      const b2 = document.createElement("div");
      b2.className = "gb";
      [["−1",-1],["+1",1],["⟲",null]].forEach(([t,d])=>{
        const b = document.createElement("button");
        b.type = "button"; b.textContent = t;
        b.addEventListener("click", ()=>{
          e.c[i] = d === null ? cmax : Math.max(0, Math.min(cmax, e.c[i] + d));
          if(e.c[i] === 0) noteJournal(c.name + " détruit");
          saveG(); renderPartie();
        });
        b2.appendChild(b);
      });
      sr.appendChild(n2); sr.appendChild(p2); sr.appendChild(b2);
      host.appendChild(sr);
    });
  });

  /* --- score --- */
  const sc = el("gscore"); sc.innerHTML = "";
  const ligne = (lbl, clef, pas) => {
    const r = document.createElement("div");
    r.className = "srow";
    const t = document.createElement("span"); t.textContent = lbl;
    const moins = document.createElement("button"); moins.type = "button"; moins.textContent = "−";
    const v = document.createElement("b"); v.textContent = G[clef];
    const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+";
    moins.addEventListener("click", ()=>{ G[clef] = Math.max(0, G[clef] - pas); saveG(); renderPartie(); });
    plus.addEventListener("click", ()=>{ G[clef] += pas; saveG(); renderPartie(); });
    r.appendChild(t); r.appendChild(moins); r.appendChild(v); r.appendChild(plus);
    sc.appendChild(r);
  };
  ligne("Primaire", "prim", 5);
  ligne("Secondaire", "sec", 1);
  const tot = document.createElement("div");
  tot.className = "srow";
  tot.innerHTML = '<span style="color:var(--glow);font-weight:700">Total</span><b style="color:var(--glow)">' +
    (G.prim + G.sec) + '</b>';
  sc.appendChild(tot);

  /* --- stratagemes jouables --- */
  const gs = el("gstrat"); gs.innerHTML = "";
  const tous = stratsListe();
  const ici = tous.filter(stratMaintenant);
  /* on n'affiche que ceux qui se jouent a ce moment ; le reste est a une
     touche, parce qu'une lecture de moment reste une lecture et qu'un
     strategeme cache est un strategeme perdu */
  const lot = stratTout ? tous : ici;
  const barF = document.createElement("div");
  barF.className = "mfiltre";
  barF.innerHTML = '<span>' + (stratTout
      ? tous.length + " fiches, tous moments confondus"
      : ici.length + " jouable" + (ici.length > 1 ? "s" : "") + " maintenant")
    + '</span>';
  const bt = document.createElement("button");
  bt.type = "button"; bt.className = "ghost";
  bt.textContent = stratTout ? "Ce moment" : "Tout voir";
  bt.addEventListener("click", ()=>{ stratTout = !stratTout; renderPartie(); });
  barF.appendChild(bt);
  gs.appendChild(barF);
  if(!lot.length){
    const v = document.createElement("div");
    v.className = "empty"; v.style.padding = "12px 4px";
    v.textContent = "Aucun stratagème ne se joue à ce moment.";
    gs.appendChild(v);
  }
  lot.forEach(st=>{
    const cout = st[3] || 1;
    const d = document.createElement("div");
    d.className = "grow";
    const n = document.createElement("div");
    n.className = "gn";
    const provenance = st[1] === "Core" ? "Stratagème de base"
      : nomDetach(st[1]) + (st[2] ? " · " + st[2] : "");
    const horsMoment = stratTout && !stratMaintenant(st);
    n.innerHTML = '<b>' + st[0] + '</b><i>' + provenance + ' · ' + cout + ' PC' +
      (horsMoment ? ' · ' + (st[4] || "") : "") + '</i>';
    if(horsMoment) d.classList.add("hors");
    const b = document.createElement("button");
    b.type = "button"; b.className = "gplay"; b.textContent = "Jouer";
    b.disabled = G.pc < cout;
    b.addEventListener("click", ()=>{
      G.pc -= cout;
      noteJournal(st[0] + " (−" + cout + " PC, reste " + G.pc + ")");
      saveG(); renderPartie();
    });
    d.appendChild(n); d.appendChild(b);
    gs.appendChild(d);
  });

  /* --- journal --- */
  const jr = el("gjournal");
  jr.innerHTML = G.journal.length
    ? G.journal.map(j => '<div class="je"><b>T' + j.t + ' · ' + (PHASE_LONG[j.p] || j.p) + '</b> — ' + j.x + '</div>').join("")
    : '<div class="empty" style="padding:12px 4px">Rien encore.</div>';
}

function renderPlay(){
  const host = el("playList"); if(!host) return;
  host.innerHTML = "";
  if(!R || !R.units.length){
    host.innerHTML = '<div class="empty" style="padding:16px 4px">La liste ouverte est vide.</div>';
    return;
  }
  const tete = document.createElement("div");
  tete.className = "ptsbar";
  const p = pointsDe(R);
  tete.innerHTML =
    '<div class="c ' + (p > R.cap ? "over" : "ok") + '"><div class="k">' + R.nom +
      '</div><div class="v">' + p + ' <small style="font-size:11px;color:var(--tx3)">/ ' + R.cap + '</small></div></div>' +
    '<div class="c"><div class="k">Détachement</div><div class="v">' + totalDP() + ' / ' + capDP() + '</div></div>' +
    '<div class="c"><div class="k">Unités</div><div class="v">' + R.units.length + '</div></div>';
  host.appendChild(tete);

  R.units.forEach(ru=>{
    const u = unitRow(ru.name); if(!u) return;
    const wl = unitWeps(ru.name);
    const g = document.createElement("div");
    g.className = "pgrp";
    let html = '<h4>' + nomAffiche(ru) + '</h4>';
    const sc = socle(ru.name);
    /* une fortification ne bouge pas : son mouvement se note « — » */
    const mv = u[1] ? 'M' + u[1] + '"' : 'M —';
    html += '<div class="pu"><b>' + ru.name + '</b><i>×' + ru.size + ' · ' + mv + ' · E' + u[2] +
      ' · Svg ' + u[3] + '+' + (u[4] ? '/' + u[4] + '++' : '') + ' · ' + u[5] + ' PV' +
      (sc ? ' · socle ' + sc + ' mm' : '') + '</i>';
    const portU = portParArme(ru), vusG = {};
    Object.keys(portU).forEach(k=>{
      const i = +k, n = portU[i];
      if(!n) return;
      const g = groupeDe(ru.name, i);
      if(g){ if(vusG[g.base]) return; vusG[g.base] = 1; }
      const profils = g ? g.profils : (wl[i] ? [{w:wl[i]}] : []);
      profils.forEach(p=>{ const w = p.w;
        html += '<span class="pw">×' + n + ' ' + w[1] + ' — ' + portee(w) + ' A' + w[3] + ' ' + w[4] +
          '+ F' + w[5] + ' PA' + (w[6] ? '-' + w[6] : '0') + ' D' + w[7] + '</span>'; });
    });
    html += '</div>';
    ru.chars.forEach(c=>{
      const cu = unitRow(c.name);
      if(!cu) return;
      const cws = [];
      const portC = portParArmePerso(c), clc = unitWeps(c.name);
      Object.keys(portC).forEach(k => { if(clc[+k]) cws.push(clc[+k]); });
      html += '<div class="pu"><b style="color:var(--glow)">' + c.name + '</b><i>' +
        (roleDe(c.name) || '') + ' · E' + cu[2] + ' · ' + cu[5] + ' PV' +
        (socle(c.name) ? ' · socle ' + socle(c.name) + ' mm' : '') + '</i>' +
        cws.map(cw => '<span class="pw">' + cw[1] + ' — ' + portee(cw) + ' A' + cw[3] + ' ' + cw[4] +
          '+ F' + cw[5] + ' PA' + (cw[6] ? '-' + cw[6] : '0') + ' D' + cw[7] + '</span>').join('') + '</div>';
    });
    if(ru.enh){
      const e = enhRow(ru.enh);
      const p = porteurRetenu(ru);
      html += '<div class="pu"><b style="color:var(--cyan)">' + ru.enh + '</b><i>' +
        (e && typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') +
        (p === null ? '' : ' · portée par ' + nomPorteur(ru, p)) + '</i>' +
        (e && e[3] ? '<p class="fiche-note" style="margin:4px 0 0">' + e[3] + '</p>' : '') + '</div>';
    }
    const kws = motsClesGroupe(ru);
    if(kws.length) html += '<div class="pu"><div class="kwline" style="margin:0">' +
      kws.map(k => '<span class="gkw' + (k.source ? ' gkwadd' : '') + '">' + k.kw.toUpperCase() + '</span>').join("") +
      '</div></div>';
    g.innerHTML = html;
    /* en partie, on veut la regle sous les yeux : toucher l'unite ouvre sa fiche,
       toucher un personnage rattache ouvre la sienne */
    g.querySelectorAll(".pu").forEach((bloc, i) => {
      const cible = i === 0 ? ru.name : (ru.chars[i-1] ? ru.chars[i-1].name : null);
      if(!cible || !unitRow(cible)) return;
      bloc.classList.add("tap");
      bloc.addEventListener("click", ()=> ouvreFiche(cible));
    });
    host.appendChild(g);
  });
}

function renderLists(){
  const nom = el("listName"), cap = el("listCap");
  if(nom && document.activeElement !== nom) nom.value = R.nom;
  if(cap && document.activeElement !== cap) cap.value = R.cap;
  const hint = el("detHint");
  if(hint) hint.textContent = capDP() + " Points de Détachement à " + R.cap +
    " pts. Deux détachements ne peuvent pas partager le même tag d'exclusivité.";
}

function renderPtsBar(){
  const pts = totalPoints(), dp = totalDP();
  const b = el("ptsbar");
  if(!b) return;
  const cap = R.cap || 2000, dpMax = capDP();
  b.innerHTML =
    '<div class="c ' + (pts>cap?"over":(pts?"ok":"")) + '"><div class="k">Points</div><div class="v">' +
      pts + ' <small style="font-size:11px;color:var(--tx3)">/ ' + cap + '</small></div></div>' +
    '<div class="c ' + (dp>dpMax?"over":"") + '"><div class="k">Détachement</div><div class="v">' + dp + ' / ' + dpMax + '</div></div>' +
    '<div class="c"><div class="k">Unités</div><div class="v">' + R.units.length + '</div></div>';
}
/* la Disposition de Force se choisit parmi celles du detachement retenu.
   Le catalogue ne les porte pas : on laisse la saisir, plutot que d'en
   inventer une liste. */
function renderDispo(){
  const z = el("listDispo"); if(!z) return;
  if(document.activeElement !== z) z.value = R.fd || "";
}

function renderDetach(){
  const host = el("detList"); host.innerHTML = "";
  /* plus de budget ou plus rien de compatible : on ferme la porte
     plutot que de proposer un choix qui ne menerait qu'a une alerte */
  const b = el("btnAddDetach");
  if(b){
    const libre = DETACHMENTS.some(d => !detachBloque(d));
    b.disabled = !libre;
    b.textContent = libre ? "+ Ajouter un détachement"
      : (capDP() - totalDP() > 0 ? "Aucun détachement compatible" : "Budget de détachement épuisé");
  }
  if(!R.detach.length){ host.innerHTML = '<div class="empty" style="padding:14px 4px">Aucun détachement choisi.</div>'; return; }
  R.detach.forEach((n,i)=>{
    const d = detachRow(n); if(!d) return;
    const div = document.createElement("div");
    div.className = "runit";
    div.innerHTML =
      '<div class="rhead"><div class="rn"><b>' + nomDetach(d[0]) + '</b><i>' + d[3] + ' · ' + d[1] + ' PD</i></div>' +
      (d[8] ? '<span class="dispo">' + d[8] + '</span>' : '') +
      '<button class="xbtn" type="button">×</button></div>' +
      '<p class="hint" style="margin-top:7px">' + d[4] + '</p>';
    div.querySelector(".xbtn").addEventListener("click", ()=>{ R.detach.splice(i,1); saveR(); renderList(); });
    host.appendChild(div);
  });
}
function stepper(get, set, min, max){
  const w = document.createElement("span");
  w.className = "stepper";
  const mk = (t, delta) => {
    const b = document.createElement("button");
    b.type="button"; b.textContent=t;
    b.addEventListener("click", ()=>{
      const v = Math.max(min, Math.min(max, get() + delta));
      set(v); saveR(); renderList();
    });
    return b;
  };
  const val = document.createElement("span");
  val.textContent = get();
  w.appendChild(mk("−",-1)); w.appendChild(val); w.appendChild(mk("+",1));
  return w;
}
/* Quel membre du groupe on regle en ce moment : "" pour l'escouade, sinon
   le nom du personnage rattache. Un groupe de trois membres tenait sur un
   panneau qu'il fallait parcourir en entier pour trouver la bonne arme ;
   on n'en montre plus qu'un a la fois. Etat d'affichage, pas de donnee :
   il ne part ni dans la sauvegarde ni dans le lien de partage. */
let vueMembre = {};
const membreVu = ru => {
  const v = vueMembre[ru.id] || "";
  return (v && ru.chars.some(c => c.name === v)) ? v : "";
};

function renderRoster(){
  const host = el("rosterList"); host.innerHTML = "";
  if(!R.units.length){
    host.innerHTML = '<div class="empty">Ta liste est vide.<br>Ajoute une unité pour commencer.</div>';
    return;
  }
  /* le pave ouvre une unite a la fois : on ne rend que celle-la */
  const vues = unitOuverte ? R.units.filter(x => x.id === unitOuverte) : R.units;
  if(!vues.length){ fermePanneau(); return; }
  vues.forEach((ru)=>{
    const ui = R.units.indexOf(ru);
    const u = unitRow(ru.name); if(!u) return;
    const wl = unitWeps(ru.name);
    const div = document.createElement("div");
    div.className = "runit";

    /* une unite seule n'est pas un groupe : le nom n'apparait qu'une fois
       un personnage rattache, puisque c'est ce qui en fait un ensemble */
    if(ru.chars.length){
      const gh = document.createElement("div");
      gh.className = "ghead";
      const gi = document.createElement("input");
      gi.type = "text"; gi.className = "gname"; gi.value = ru.grp || "";
      gi.setAttribute("aria-label", "Nom du groupe");
      gi.addEventListener("change", ()=>{ ru.grp = gi.value.trim() || nomGroupe(); saveR(); renderList(); });
      const gr = document.createElement("button");
      gr.type="button"; gr.className="xbtn"; gr.textContent="⟳"; gr.title="Un autre nom";
      gr.addEventListener("click", ()=>{ ru.grp = nomGroupe(); saveR(); renderList(); });
      gh.appendChild(gi); gh.appendChild(gr);
      div.appendChild(gh);
    }

    /* Une case par membre du groupe : l'escouade, puis chaque personnage.
       On regle un membre a la fois au lieu de derouler le groupe entier. */
    const vu = membreVu(ru);
    if(ru.chars.length){
      const mb = document.createElement("div");
      mb.className = "membres";
      const case1 = (nom, cle, sous) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "membre" + (cle === vu ? " on" : "");
        b.innerHTML = '<span class="mn">' + nom + '</span><span class="ms">' + sous + '</span>';
        b.addEventListener("click", ()=>{ vueMembre[ru.id] = cle; renderList(); });
        mb.appendChild(b);
      };
      const rgM = rangsArmee();
      case1(ru.name, "", "×" + ru.size + " · " + ptsPour(u, ru.size, rgM["u" + ru.id]) + " pts");
      ru.chars.forEach((c, i)=>{
        const cu = unitRow(c.name);
        case1(c.name, c.name, (roleDe(c.name) || "Personnage") +
          (cu ? " · " + ptsPour(cu, cu[6][0], rgM["c" + ru.id + "." + i]) + " pts" : ""));
      });
      div.appendChild(mb);
    }

    if(vu === ""){
    const head = document.createElement("div");
    head.className = "rhead";
    const sc = socle(ru.name);
    head.innerHTML = '<div class="rn"><b>' + ru.name + '</b><i>×' + ru.size + ' · E' + u[2] +
      ' · Svg ' + u[3] + '+' + (u[4] ? '/' + u[4] + '++' : '') + ' · ' + u[5] + ' PV · socle ' +
      (sc ? sc + ' mm' : '—') + '</i></div>' +
      '<span class="rpts">' + unitPoints(ru) + ' pts</span>';
    div.appendChild(head);

    if(u[6].length > 1){
      const sc = document.createElement("div");
      sc.className = "chips tight";
      u[6].forEach(sz=>{
        const b = document.createElement("button");
        b.type="button"; b.className = "chip" + (sz===ru.size ? " on" : "");
        const pSz = ptsPour(u, sz, rangUnite(ru));
        b.textContent = "×" + sz + (pSz ? " · " + pSz + " pts" : "");
        b.addEventListener("click", ()=>{
          ru.size = sz;
          /* chaque emplacement se replie sur le nouvel effectif */
          armSlots(ru.name).forEach((sl, si)=>{
            const lot = loSlot(ru, si);
            let tot = lot.reduce((a, l) => a + l.n, 0);
            for(let k = lot.length - 1; k >= 0 && tot > sz; k--){
              const baisse = Math.min(lot[k].n, tot - sz);
              lot[k].n -= baisse; tot -= baisse;
            }
            if(sl.min >= 1 && tot < sz){
              if(lot.length) lot[0].n += sz - tot;
              else ru.lo.push({s:si, o:0, n:sz});
            }
          });
          ru.lo = ru.lo.filter(l => l.n > 0);
          saveR(); renderList();
        });
        sc.appendChild(b);
      });
      div.appendChild(sc);
    }


    /* Les armes d'office se listent sans compteur : toutes les figurines
       les ont. Seules les armes au choix se repartissent — cinq fusils
       gauss et cinq tesla sur dix Immortals — et le bandeau ne parle que
       de celles-la. */
    /* Detail d'un lot d'armes, pour la ligne : « tir A2 F5 PA-1 D1 ». */
    const detailDe = indices => {
      if(!indices || !indices.length) return "";
      const vus = {}, bouts = [];
      indices.forEach(i=>{
        const g = groupeDe(ru.name, i);
        const cle = g ? g.base : String(i);
        if(vus[cle]) return;
        vus[cle] = 1;
        (g ? g.profils : (wl[i] ? [{w:wl[i]}] : [])).forEach(pr =>
          bouts.push((pr.w[2] === "C" ? "càc" : "tir") + " A" + pr.w[3] + " F" + pr.w[5] +
            " PA" + (pr.w[6] ? "-" + pr.w[6] : "0") + " D" + pr.w[7]));
      });
      return bouts.join("  ·  ");
    };

    /* Les armes portees d'office se listent sans compteur : toutes les
       figurines les ont, il n'y a rien a decider. */
    armFixes(ru.name).forEach(i=>{
      const g = groupeDe(ru.name, i);
      if(g && g.principal !== i) return;      /* un seul rang par arme */
      const row = document.createElement("div");
      row.className = "lo lo-fixe";
      row.innerHTML = '<span class="ln">' + (g ? g.libelle : (wl[i] ? wl[i][1] : "?")) +
        ' <em>' + detailDe([i]) + '</em></span>' +
        '<span class="lofix">' + (ru.size > 1 ? "toutes les figurines" : "d'office") + '</span>';
      div.appendChild(row);
    });

    /* Un emplacement de choix par bloc. Toutes ses options sont visibles
       avec leur compteur : une option peut donner plusieurs armes a la
       fois, et une unite peut avoir plusieurs emplacements independants,
       ce qu'une repartition unique ne savait pas exprimer. */
    armSlots(ru.name).forEach((sl, si)=>{
      const pris = () => totalSlot(ru, si);
      const reste = ru.size - pris();
      const rep = document.createElement("div");
      rep.className = "repart" + (reste === 0 ? " ok" : (sl.min >= 1 || reste < 0 ? " todo" : ""));
      rep.innerHTML = '<b>' + pris() + ' / ' + ru.size + '</b> figurine' + (ru.size > 1 ? 's' : '') +
        (sl.min >= 1 ? '' : ' · facultatif') +
        (reste < 0 ? ' · <span>' + (-reste) + ' de trop</span>'
                   : (sl.min >= 1 && reste > 0 ? ' · <span>' + reste + ' sans arme</span>' : ''));
      div.appendChild(rep);

      sl.o.forEach((opt, oi)=>{
        const ligne = () => ru.lo.find(l => l.s === si && l.o === oi);
        const n = () => { const l = ligne(); return l ? l.n : 0; };
        const omax = optMax(sl, oi);
        const pose = v => {
          let plafond = Math.max(0, n() + (ru.size - pris()));
          if(omax) plafond = Math.min(plafond, omax);
          const val = Math.max(0, Math.min(v, plafond));
          const l = ligne();
          if(l){ l.n = val; if(!val) ru.lo.splice(ru.lo.indexOf(l), 1); }
          else if(val) ru.lo.push({s:si, o:oi, n:val});
        };
        const row = document.createElement("div");
        row.className = "lo" + (n() ? " lo-on" : "") + (omax && n() > omax ? " lo-trop" : "");
        row.innerHTML = '<span class="ln">' + libelleOption(ru.name, opt, sl, oi) +
          (omax ? ' <b class="omax">' + omax + ' max</b>' : '') +
          ' <em>' + detailDe(opt) + '</em></span>';
        if(ru.size === 1 && sl.min >= 1){
          /* une figurine seule ne repartit rien : elle choisit */
          const b = document.createElement("button");
          b.type = "button"; b.className = "chip" + (n() ? " on" : "");
          b.textContent = n() ? "prise" : "prendre";
          b.addEventListener("click", ()=>{
            ru.lo = ru.lo.filter(l => l.s !== si);
            ru.lo.push({s:si, o:oi, n:1});
            saveR(); renderList();
          });
          row.appendChild(b);
        } else {
          row.appendChild(stepper(n, pose, 0, omax ? Math.min(omax, ru.size) : ru.size));
        }
        div.appendChild(row);
      });
    });
    }   /* fin de la branche « escouade » */

    /* Le membre choisi seulement : son en-tete, puis son armement. */
    ru.chars.filter(c => c.name === vu).forEach((c)=>{
      const ci = ru.chars.indexOf(c);
      const cu = unitRow(c.name) || [];
      const scc = socle(c.name);
      const hors = peutRejoindre(c.name, ru.name) === false;
      const head = document.createElement("div");
      head.className = "rhead";
      head.innerHTML = '<div class="rn"><b>' + c.name +
        (hors ? ' <b class="alerte" title="Ce personnage ne figure pas dans la liste des unités qu\'il peut rejoindre">!</b>' : '') +
        '</b><i>' + (roleDe(c.name) || "Personnage") +
        (cu[2] ? ' · E' + cu[2] + ' · Svg ' + cu[3] + '+' + (cu[4] ? '/' + cu[4] + '++' : '') +
                 ' · ' + cu[5] + ' PV' : '') +
        (scc ? ' · socle ' + scc + ' mm' : '') + '</i></div>' +
        '<span class="rpts">' + ptsPour(cu, cu[6][0], rangsArmee()["c" + ru.id + "." + ci]) + ' pts</span>';
      div.appendChild(head);
      /* ce qu'il apporte au groupe, en plus de ses armes */
      const auras = (typeof AURAS_PERSO !== "undefined" && AURAS_PERSO[c.name]) || [];
      auras.forEach(a=>{
        const r = document.createElement("div");
        r.className = "aura";
        r.innerHTML = '<b>' + a.nom + '</b>' + a.texte;
        div.appendChild(r);
      });

      /* son armement : les armes d'office, puis un choix par emplacement.
         Un Overlord dans un groupe doit pouvoir prendre sa faux ou son
         baton, comme s'il jouait seul. */
      const detailC = indices => {
        const vus = {}, bouts = [];
        indices.forEach(i=>{
          const g = groupeDe(c.name, i);
          const cle = g ? g.base : String(i);
          if(vus[cle]) return; vus[cle] = 1;
          (g ? g.profils : (unitWeps(c.name)[i] ? [{w:unitWeps(c.name)[i]}] : [])).forEach(pr =>
            bouts.push((pr.w[2] === "C" ? "càc" : "tir") + " A" + pr.w[3] + " F" + pr.w[5] +
              " PA" + (pr.w[6] ? "-" + pr.w[6] : "0") + " D" + pr.w[7]));
        });
        return bouts.join("  ·  ");
      };
      const fixesC = armFixes(c.name).filter(i=>{
        const g = groupeDe(c.name, i);
        return !g || g.principal === i;
      });
      fixesC.forEach(i=>{
        const g = groupeDe(c.name, i);
        const r = document.createElement("div");
        r.className = "lo lo-fixe";
        r.innerHTML = '<span class="ln">' + (g ? g.libelle : (unitWeps(c.name)[i]||[])[1]) +
          ' <em>' + detailC([i]) + '</em></span><span class="lofix">d\'office</span>';
        div.appendChild(r);
      });
      armSlots(c.name).forEach((sl, si)=>{
        sl.o.forEach((opt, oi)=>{
          const pris = (c.lo || []).some(l => l.s === si && l.o === oi);
          const r = document.createElement("div");
          r.className = "lo" + (pris ? " lo-on" : "");
          r.innerHTML = '<span class="ln">' + libelleOption(c.name, opt) +
            ' <em>' + detailC(opt) + '</em></span>';
          const b = document.createElement("button");
          b.type = "button"; b.className = "chip" + (pris ? " on" : "");
          b.textContent = pris ? "prise" : "prendre";
          b.addEventListener("click", ()=>{
            c.lo = (c.lo || []).filter(l => l.s !== si);
            if(!pris || sl.min >= 1) c.lo.push({s:si, o:oi});
            saveR(); renderList();
          });
          r.appendChild(b);
          div.appendChild(r);
        });
      });
      const det = document.createElement("button");
      det.type = "button"; det.className = "btn danger detache";
      det.textContent = "Détacher " + c.name;
      det.addEventListener("click", ()=>{
        ru.chars.splice(ci, 1);
        vueMembre[ru.id] = "";
        saveR(); renderList();
      });
      div.appendChild(det);
    });

    /* amelioration portee par le groupe */
    if(ru.enh){
      const e = enhRow(ru.enh);
      const row = document.createElement("div");
      row.className = "lo";
      const ok = porteursPossibles(ru, e);
      const p = porteurRetenu(ru);
      row.innerHTML = '<span class="ln" style="color:var(--cyan,#5CE8E8)">' + ru.enh +
        ' <em>' + (e && typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') +
        (e ? ' · ' + nomDetach(e[2]) : '') +
        (p === null
          ? ' · <b class="alerte">' + (enhRestriction(e) || "aucun porteur possible") + '</b>'
          : ' · portée par ' + nomPorteur(ru, p)) + '</em></span>';
      /* plusieurs figurines eligibles : on tourne entre elles */
      if(ok.length > 1){
        const nx = document.createElement("button");
        nx.className="xbtn"; nx.type="button"; nx.textContent="⟳";
        nx.title = "Changer de porteur";
        nx.addEventListener("click", ()=>{
          const i = ok.indexOf(p === null ? ok[0] : p);
          ru.enhP = ok[(i + 1) % ok.length];
          saveR(); renderList();
        });
        row.appendChild(nx);
      }
      const rm = document.createElement("button");
      rm.className="xbtn"; rm.type="button"; rm.textContent="×";
      rm.addEventListener("click", ()=>{ ru.enh = null; ru.enhP = ""; saveR(); renderList(); });
      row.appendChild(rm);
      div.appendChild(row);
    }

    /* Ce que le groupe gagne en jeu, quel que soit le membre affiche : un
       Plasmancien rattache abaisse le seuil de touche critique de toute
       l'unite, et cela ne se lit sur aucune ligne d'arme. */
    const vusOct = {}, octGrp = [];
    [{n:ru.name, p:""}].concat(ru.chars.map(c => ({n:c.name, p:c.name}))).forEach(m=>{
      unitWeps(m.n).forEach(w => octroisArme(ru, m.p, w).forEach(o=>{
        const k = o.nom + "|" + o.source;
        if(vusOct[k]) return;
        vusOct[k] = 1; octGrp.push(o);
      }));
    });
    if(octGrp.length){
      const ob = document.createElement("div");
      ob.className = "octbloc";
      ob.innerHTML = '<div class="eqt">Ce que le groupe reçoit</div>' + octGrp.map(o=>{
        const effet = o.mot ? '[' + motsArme(o.mot).toUpperCase() + ']'
          : (o.champ === "critH" ? 'Critique Touche ' + o.val + '+'
          :  o.champ === "critW" ? 'Critique Blessure ' + o.val + '+'
          :  o.champ === "fnp"   ? 'Insensible à la Douleur ' + o.val + '+'
          :  o.champ + ' ' + o.val);
        return '<div class="oct"><span class="oe">' + effet + '</span>' +
          '<span class="oi2"><b>' + o.nom + '</b>' + o.texte + '</span>' +
          '<span class="os">' + o.source + '</span></div>';
      }).join("");
      div.appendChild(ob);
    }

    /* mots-cles du groupe : ceux apportes par un personnage sont signales */
    const kws = motsClesGroupe(ru);
    if(kws.length){
      const kwl = document.createElement("div");
      kwl.className = "kwline";
      kwl.innerHTML = kws.map(k => '<span class="gkw' + (k.source ? ' gkwadd' : '') + '"' +
        (k.source ? ' title="apporté par ' + k.source + '"' : '') + '>' + k.kw.toUpperCase() + '</span>').join("");
      div.appendChild(kwl);
    }

    /* Équipement — les armes de tir se répartissent entre figurines, les
       armes de mêlée sont portées par toutes : elles n'apparaissaient donc
       nulle part tant qu'on ne les avait pas ajoutées à la main. */
    const eq = document.createElement("div");
    eq.className = "eqbloc";
    /* une arme équipée met tous ses profils à disposition : le nombre de
       porteurs vaut donc pour chacun d'eux */
    /* Le recapitulatif annoncait « personnages rattaches compris » alors
       qu'il ne lisait que les armes de l'escouade : la faux d'un Overlord
       et la lance d'un Plasmancien n'y figuraient nulle part. Il balaie
       maintenant l'escouade puis chaque personnage, en nommant le porteur
       quand ce n'est pas l'escouade elle-meme. */
    const lignes = [];
    /* toute l'armurerie de la fiche, pas seulement ce qui est equipe :
       une option laissee de cote reste grisee, on voit ce qu'on n'a pas
       pris autant que ce qu'on porte */
    const verse = (nom, port, source) => {
      groupesArmes(nom).forEach(g =>{
        let n = 0;
        g.profils.forEach(pr => { n = Math.max(n, port[pr.i] || 0); });
        g.profils.forEach(pr => lignes.push({ w:pr.w, n:n, source:source,
          /* une arme qui porte deja l'aptitude ne la recoit pas deux fois */
          octrois: octroisArme(ru, source, pr.w)
            .filter(o => o.mot && !parseFlags(pr.w[8] || "")[o.mot]) }));
      });
    };
    verse(ru.name, portParArme(ru), "");
    ru.chars.forEach(c => verse(c.name, portParArmePerso(c), c.name));

    const tir = lignes.filter(x => x.w[2] === "T"), cac = lignes.filter(x => x.w[2] === "C");
    const table = (titre, lot) => {
      if(!lot.length) return "";
      let h = '<div class="eqt">' + titre + '</div><div class="eqwrap"><table class="arms">' +
        '<thead><tr><th style="text-align:left">Arme</th><th>Po</th><th>A</th><th>CT</th><th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
      lot.forEach(x=>{
        const w = x.w;
        /* Les aptitudes ne se lisaient plus a bout portant : elles passent en
           pastilles. Celles qu'un detachement ou un personnage accorde sont
           marquees a part — elles ne figurent pas sur la fiche technique. */
        const chip = (t, cls, titre) => '<span class="wk' + (cls ? ' ' + cls : '') + '"' +
          (titre ? ' title="' + titre.replace(/"/g, "&quot;") + '"' : '') + '>' + t + '</span>';
        const propres = (w[8] ? motsArme(w[8]) : "").split(" · ").filter(Boolean)
          .map(t => chip(t, "", glossaireDe(t)));
        const donnes = (x.octrois || []).map(o =>
          chip(motsArme(o.mot), "wkadd", o.nom + " — " + o.texte + " (" + o.source + ")"));
        const mots = propres.concat(donnes).join("");
        h += '<tr class="' + (x.n ? '' : 'off') + '"><td class="an">' +
          (x.n ? '<b class="q">×' + x.n + ' </b>' : '') + w[1] +
          (x.source ? '<span class="src">' + x.source + '</span>' : '') +
          (mots ? '<span class="wks">' + mots + '</span>' : '') + '</td>' +
          '<td>' + portee(w) + '</td>' +
          '<td>' + w[3] + '</td><td>' + w[4] + '+</td><td>' + w[5] + '</td>' +
          '<td>' + (w[6] ? '-' + w[6] : '0') + '</td><td>' + w[7] + '</td></tr>';
      });
      return h + '</tbody></table></div>';
    };
    eq.innerHTML = table("Tir", tir) + table("Corps à corps", cac) +
      '<p class="hint">Tout l\'armement du groupe, personnages rattachés compris. ' +
      'Le nombre en tête est le nombre de figurines qui portent l\'arme' +
      (ru.chars.length ? ', et le nom celui du personnage qui la porte' : '') + '.</p>';
    div.appendChild(eq);

    const add = document.createElement("div");
    add.className = "addrow";
    const bw = document.createElement("button");
    bw.type="button"; bw.textContent="+ Arme";
    bw.hidden = true;   /* les options s'affichent toutes, il n'y a plus rien a ajouter */
    const bc = document.createElement("button");
    bc.type="button"; bc.textContent="+ Personnage";
    bc.addEventListener("click", ()=> openCharPick(ru));
    const be = document.createElement("button");
    be.type="button"; be.textContent = ru.enh ? "⇄ Amélioration" : "+ Amélioration";
    be.addEventListener("click", ()=> openEnhPick(ru));
    add.appendChild(bw); add.appendChild(bc); add.appendChild(be);
    div.appendChild(add);

    /* dupliquer une fois l'unite reglee : c'est la qu'on veut la seconde,
       avec son armement et ses rattachements, pas une unite vierge */
    const pied = document.createElement("div");
    pied.className = "unitfoot";
    const fic = document.createElement("button");
    fic.type = "button"; fic.className = "btn";
    fic.textContent = "Fiche";
    fic.addEventListener("click", ()=> ouvreFiche(ru.name));
    const dup = document.createElement("button");
    dup.type = "button"; dup.className = "btn";
    dup.textContent = "Dupliquer";
    dup.addEventListener("click", ()=>{
      const copie = JSON.parse(JSON.stringify(ru));
      copie.id = nextId++;
      if(estGroupe(copie)) copie.grp = nomGroupe();
      R.units.splice(R.units.indexOf(ru) + 1, 0, copie);
      saveR(); ouvrePanneau("cardUnits", copie.id);
    });
    const del = document.createElement("button");
    del.type = "button"; del.className = "btn danger";
    del.textContent = "Retirer";
    /* plus de confirmation : le bandeau d'annulation la remplace, et il
       coute moins cher qu'une boite de dialogue a chaque retrait */
    del.addEventListener("click", ()=>{ retireUnite(ru); fermePanneau(); });
    pied.appendChild(fic); pied.appendChild(dup); pied.appendChild(del);
    div.appendChild(pied);
    host.appendChild(div);
  });
}
/* ==========================================================
   STRATAGEMES
   Ceux des detachements retenus, puis ceux de base. Le texte
   n'est renseigne que pour ce qui a pu etre verifie.
   ========================================================== */
/* ==========================================================
   STRATAGEMES SAISIS A LA MAIN
   Le texte officiel ne figure ni dans le catalogue BattleScribe
   ni dans le fichier de systeme, et la presse specialisee n'en
   donne que des paraphrases : hors de question de les inscrire
   ici. On offre donc de le saisir, en anglais, et de le garder.
   ========================================================== */
const SKEY = "mathhammer.strats.v1";
let SUSER = { fiches: {}, ajouts: [] };
function loadS(){
  try{
    const o = JSON.parse(localStorage.getItem(SKEY) || "null");
    if(o && o.fiches) SUSER = { fiches: o.fiches, ajouts: o.ajouts || [] };
  }catch(e){}
}
function saveS(){ try{ localStorage.setItem(SKEY, JSON.stringify(SUSER)); }catch(e){} }
const clefStrat = (det, nom) => det + "|" + nom;

/* la table de base, completee de ce qui a ete saisi */
function stratsDe(g){
  const lot = STRATS.filter(x => x[1] === g).map(x => x.slice());
  SUSER.ajouts.filter(a => a[1] === g).forEach(a => lot.push(a.slice()));
  return lot.map(x=>{
    const f = SUSER.fiches[clefStrat(x[1], x[0])];
    if(f){
      if(f.cp !== undefined && f.cp !== "") x[3] = parseInt(f.cp, 10) || 1;
      if(f.type) x[2] = f.type;
      x[4] = f.quand || x[4]; x[5] = f.cible || x[5]; x[6] = f.effet || x[6];
      x[7] = f.restric !== undefined ? f.restric : x[7];
      x.saisi = true;
    }
    return x;
  });
}
/* tous les stratagemes utilisables par la liste ouverte */
const stratsListe = () => R.detach.concat(["Core"]).reduce((a, g) => a.concat(stratsDe(g)), []);

function renderStrats(){
  const host = el("stratList"); if(!host) return;
  host.innerHTML = "";
  const groupes = R.detach.slice();
  groupes.push("Core");
  let rien = true;
  groupes.forEach(g=>{
    const lot = stratsDe(g);
    if(!lot.length) return;
    rien = false;
    const sep = document.createElement("div");
    sep.className = "stratsep";
    sep.textContent = g === "Core" ? "Stratagèmes de base" : nomDetach(g);
    host.appendChild(sep);
    lot.forEach(x=>{
      const [nom, det, type, cp, quand, cible, effet, restric] = x;
      const d = document.createElement("div");
      d.className = "strat";
      const t = document.createElement("button");
      t.type = "button";
      t.innerHTML = '<span class="sn"><b>' + nom + '</b><i>' +
        (det === "Core" ? "Stratagème de base"
          : (type ? "Stratagème de " + type + " · " + nomDetach(det) : nomDetach(det))) +
        (x.saisi ? ' <span class="smod">saisi</span>' : '') +
        '</i></span><span class="cp">' + cp + ' PC</span>';
      const body = document.createElement("div");
      body.className = "sbody";
      const rendu = ()=>{
        body.innerHTML = effet
          ? '<dl><dt>Quand</dt><dd>' + quand + '</dd><dt>Cible</dt><dd>' + (cible || "—") +
            '</dd><dt>Effet</dt><dd>' + effet + '</dd>' +
            (restric ? '<dt>Restrictions</dt><dd>' + restric + '</dd>' : '') + '</dl>'
          : '<p class="vide">Texte non renseigné. Recopie-le depuis ta fiche : il restera sur cet appareil.</p>';
        const b = document.createElement("button");
        b.type = "button"; b.className = "ghost";
        b.style.cssText = "margin:6px 11px 10px";
        b.textContent = effet ? "Corriger le texte" : "Saisir le texte";
        b.addEventListener("click", ()=> edite());
        body.appendChild(b);
      };
      const edite = ()=>{
        const f = SUSER.fiches[clefStrat(det, nom)] || {};
        body.innerHTML = "";
        const box = document.createElement("div");
        box.className = "sedit";
        box.innerHTML =
          '<label>Coût en PC</label><input type="number" min="0" max="9" value="' + cp + '" data-f="cp">' +
          '<label>Type</label><input type="text" value="' + (type && type !== "Core" ? type : "") +
            '" placeholder="Tactique de Bataille, Fait Épique…" data-f="type">' +
          '<label>Quand</label><textarea data-f="quand" placeholder="When…">' + (quand || "") + '</textarea>' +
          '<label>Cible</label><textarea data-f="cible" placeholder="Target…">' + (cible || "") + '</textarea>' +
          '<label>Effet</label><textarea data-f="effet" placeholder="Effet…">' + (effet || "") + '</textarea>' +
          '<label>Restrictions</label><textarea data-f="restric" placeholder="Restrictions…">' + (restric || "") + '</textarea>';
        const row = document.createElement("div");
        row.className = "addrow";
        const ok = document.createElement("button");
        ok.type = "button"; ok.textContent = "Enregistrer";
        ok.addEventListener("click", ()=>{
          const v = {};
          box.querySelectorAll("[data-f]").forEach(i => v[i.dataset.f] = i.value.trim());
          SUSER.fiches[clefStrat(det, nom)] = v;
          saveS(); renderStrats(); renderPartie();
          toast(nom + " enregistré.", "", null);
        });
        const non = document.createElement("button");
        non.type = "button"; non.textContent = "Annuler";
        non.addEventListener("click", rendu);
        row.appendChild(ok); row.appendChild(non);
        box.appendChild(row);
        body.appendChild(box);
      };
      rendu();
      t.addEventListener("click", ()=> d.classList.toggle("open"));
      d.appendChild(t); d.appendChild(body);
      host.appendChild(d);
    });
  });
  if(rien) host.innerHTML = '<div class="empty">Choisis un détachement pour voir ses stratagèmes.</div>';
}

/* ==========================================================
   ARMEMENT A PLAT
   Tous les profils de la liste dans un seul tableau, comme le
   « Show All Weapons » de WarOrgan : en partie on cherche une
   arme, pas une unite.
   ========================================================== */
let armMode = "prises";
/* ==========================================================
   ARMES À PLUSIEURS PROFILS
   Un bâton de lumière donne un tir ET une frappe ; un rayon
   thermique donne deux modes de tir. Porter l'arme, c'est
   disposer de tous ses profils : le choix du mode se fait au
   moment d'attaquer, pas au moment de s'équiper.
   ========================================================== */
const baseArme = n => String(n).toLowerCase()
  .replace(/\s*\((tir|càc|cac|c'tan)\)\s*$/i, '')
  .replace(/\s*[×x]\s*\d+\s*$/i, '')
  .replace(/\s*[—-]\s*.+$/, '')
  .trim();

/* [{base, libelle, profils:[{w, i}], principal}] pour une unité */
function groupesArmes(nom){
  const wl = unitWeps(nom), vus = {}, out = [];
  wl.forEach((w, i)=>{
    const b = baseArme(w[1]);
    if(vus[b] === undefined){
      vus[b] = out.length;
      const lbl = w[1].replace(/\s*\((tir|càc|cac)\)\s*$/i, '')
                      .replace(/\s*[×x]\s*\d+\s*$/i, '')
                      .replace(/\s*[—-]\s*.+$/, '').trim();
      out.push({ base: b, libelle: lbl || w[1], profils: [], principal: i });
    }
    out[vus[b]].profils.push({ w: w, i: i });
  });
  return out;
}
/* le groupe auquel appartient un profil donné */
function groupeDe(nom, i){
  const g = groupesArmes(nom);
  return g.find(x => x.profils.some(p => p.i === i)) || null;
}

/* ==========================================================
   FICHE D'UNITE
   Le profil complet, armes portee comprise, aptitudes et
   mots-cles : ce qu'on consulte avant d'ajouter une unite et
   ce qu'on relit en partie.
   ========================================================== */
/* une arme de melee n'a pas de portee : quand un profil de cac herite
   du champ de son jumeau de tir — la lance plasmique donne les deux —
   c'est « càc » qu'il faut lire */
const portee = w => w[2] === "C" ? "càc" : (w[9] || "—");
const aptitudesDe = nom => (typeof APTITUDES !== "undefined" && APTITUDES[nom]) || [];
const transportDe = nom => (typeof TRANSPORTS !== "undefined" && TRANSPORTS[nom]) || "";

/* la definition officielle d'une aptitude d'arme, pour l'infobulle des
   pastilles : « Touches Soutenues 2 » se cherche sous « Touches Soutenues » */
function glossaireDe(mot){
  const clef = String(mot).replace(/\s+[\dD]+\+?$/, "").replace(/^Anti-X.*/, "Anti-X");
  return (typeof GLOSSAIRE !== "undefined" && GLOSSAIRE[clef]) || "";
}

/* les mots-cles d'arme effectivement portes par l'unite, pour ne
   derouler que le glossaire qui la concerne */
function motsUtiles(nom){
  const out = [];
  unitWeps(nom).forEach(w => {
    motsArme(w[8]).split(" · ").forEach(m => {
      if(!m) return;
      const clef = m.replace(/\s+[\dD]+\+?$/, "");
      if(GLOSSAIRE[clef] && out.indexOf(clef) < 0) out.push(clef);
    });
  });
  return out;
}

function ouvreFiche(nom){
  const u = unitRow(nom); if(!u) return;
  el("ficheTitle").textContent = nom;
  const host = el("ficheBody");
  const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  let h = "";

  const tailles = u[6], pmin = ptsPour(u, tailles[0], 1),
        pmax = ptsPour(u, tailles[tailles.length-1], 1);
  h += '<p class="fiche-note">' + categorie(nom) + '  ·  ×' + tailles.join(" / ") +
       '  ·  ' + (pmin === pmax ? pmin + " pts" : pmin + "–" + pmax + " pts") +
       (socle(nom) ? '  ·  socle ' + socle(nom) + ' mm' : '') + '</p>';
  /* Prix par palier : le MFM renchérit les copies suivantes, et une fiche
     qui n'annoncerait que la premiere ferait mentir le budget. */
  if(prixEvolue(u)){
    h += '<p class="fiche-pal"><b>Le prix monte avec le nombre de copies</b>' +
      paliersPts(u).map((pl, i, tt)=>{
        const fin = tt[i+1] ? tt[i+1][0] - 1 : 0;
        const quand = fin === pl[0] ? pl[0] + (pl[0] === 1 ? "\u02b3\u1d49" : "\u1d49") :
                      fin ? "1\u02b3\u1d49 \u00e0 " + fin + "\u1d49" :
                      pl[0] + "\u1d49" + " et suivantes";
        return '<span>' + quand + ' : ' +
          tailles.map(t => "\u00d7" + t + " " + (pl[1][String(t)] || 0) + " pts").join("  \u00b7  ") +
          '</span>';
      }).join("") + '</p>';
  }

  const cel = (v, l) => '<div><b>' + v + '</b><i>' + l + '</i></div>';
  h += '<div class="fiche-prof">' +
    cel(u[1] ? u[1] + '"' : "—", "M") + cel(u[2], "E") +
    cel(u[3] + "+", "SVG") + cel(u[4] ? u[4] + "++" : "—", "INVU") +
    cel(u[5], "PV") + cel(u[13] || "—", "CD") + cel(u[12] || 0, "CO") + '</div>';

  const wl = unitWeps(nom);
  const table = (titre, lot) => {
    if(!lot.length) return "";
    let t = '<div class="fiche-sec">' + titre + '</div><div class="eqwrap"><table class="arms">' +
      '<thead><tr><th style="text-align:left">Arme</th><th>Po</th><th>A</th><th>CT</th>' +
      '<th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
    lot.forEach(w => {
      const mots = w[8] ? motsArme(w[8]) : "";
      t += '<tr><td class="an">' + esc(w[1]) +
        (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
        '<td>' + portee(w) + '</td><td>' + w[3] + '</td><td>' + w[4] + '+</td>' +
        '<td>' + w[5] + '</td><td>' + (w[6] ? "-" + w[6] : "0") + '</td><td>' + w[7] + '</td></tr>';
    });
    return t + '</tbody></table></div>';
  };
  h += table("Tir", wl.filter(w => w[2] === "T"));
  h += table("Corps à corps", wl.filter(w => w[2] === "C"));

  const apts = aptitudesDe(nom);
  if(apts.length){
    h += '<div class="fiche-sec">Aptitudes</div>';
    apts.forEach(a => h += '<div class="fiche-apt"><b>' + esc(a[0]) + '</b><p>' + esc(a[1]) + '</p></div>');
  }
  if(u[8]) h += '<div class="fiche-apt"><b>Feel No Pain ' + u[8] + '+</b><p>' +
    esc(GLOSSAIRE["Feel No Pain"] || "") + '</p></div>';

  const tr = transportDe(nom);
  if(tr) h += '<div class="fiche-sec">Transport</div><div class="fiche-apt"><p>' + esc(tr) + '</p></div>';

  if(typeof FACTION !== "undefined" && FACTION.length){
    h += '<div class="fiche-sec">Règle de faction</div>';
    FACTION.forEach(f => h += '<div class="fiche-apt"><b>' + esc(f[0]) + '</b><p>' + esc(f[1]) + '</p></div>');
  }

  const kws = [];
  Object.keys(KW).forEach(k => { if(has(k, nom)) kws.push(k); });
  if(u[9]) kws.unshift(u[9].toLowerCase());
  if(kws.length) h += '<div class="fiche-sec">Mots-clés</div><div class="fiche-kw">' +
    kws.map(k => '<span>' + esc(k) + '</span>').join("") + '</div>';

  const glo = motsUtiles(nom);
  if(glo.length){
    h += '<div class="fiche-sec">Mots-clés d\'arme</div>';
    glo.forEach(k => h += '<div class="fiche-glo"><b>' + esc(k) + '</b><p>' +
      esc(GLOSSAIRE[k]) + '</p></div>');
  }

  if(u[11]) h += '<div class="fiche-sec">Note</div><p class="fiche-note">' + esc(u[11]) + '</p>';

  host.innerHTML = h;
  host.scrollTop = 0;
  openSheet("sheetFiche");
}

function motsArme(flags){
  const f = parseFlags(flags), k = [];
  if(f.lethal)  k.push("Touches Fatales");
  if(f.dev)     k.push("Blessures Dévastatrices");
  if(f.torrent) k.push("Torrent");
  if(f.blast)   k.push("Déflagration");
  if(f.twin)    k.push("Jumelé");
  if(f.sust)    k.push("Touches Soutenues " + f.sust);
  if(f.rf)      k.push("Tir Rapide " + f.rf);
  if(f.melta)   k.push("Fusion " + f.melta);
  const anti = antiDe(f);
  if(anti)      k.push(libelleAnti(anti));
  if(f.assault) k.push("Assaut");
  if(f.heavy)   k.push("Lourd");
  if(f.precision) k.push("Précision");
  if(f.hazard)  k.push("À Risque");
  if(f.pistol)  k.push("Pistolet");
  if(f.indirect) k.push("Tir Indirect");
  if(f.ignorescover) k.push("Ignore le Couvert");
  if(f.extra)   k.push("Attaques Bonus");
  if(f.oneshot) k.push("Tir Unique");
  return k.join(" · ");
}
function renderArms(){
  const host = el("armList"); if(!host) return;
  host.innerHTML = "";
  if(!R.units.length){
    host.innerHTML = '<div class="empty">Ta liste est vide.</div>';
    return;
  }
  R.units.forEach(ru=>{
    const wl = unitWeps(ru.name); if(!wl.length) return;
    /* combien de figurines portent chaque arme, personnages compris */
    const prisG = portParGroupe(ru);

    const lignes = [];
    groupesArmes(ru.name).forEach(g => g.profils.forEach(p=>{
      const n = prisG[g.base] || 0, w = p.w;
      if(armMode === "prises" && !n) return;
      if(armMode === "tir" && w[2] !== "T") return;
      if(armMode === "cac" && w[2] !== "C") return;
      lignes.push({w:w, n:n, unite:ru.name});
    }));
    /* armes des personnages rattaches : celle qui est selectionnee */
    ru.chars.forEach(c=>{
      const portC = portParArmePerso(c);
      groupesArmes(c.name).forEach(g => g.profils.forEach(p=>{
        const equipee = g.profils.some(x => portC[x.i] > 0), w = p.w;
        if(armMode === "prises" && !equipee) return;
        if(armMode === "tir" && w[2] !== "T") return;
        if(armMode === "cac" && w[2] !== "C") return;
        lignes.push({w:w, n:equipee ? 1 : 0, unite:c.name, perso:true});
      }));
    });
    if(!lignes.length) return;

    const g = document.createElement("div");
    g.className = "armgrp";
    g.innerHTML = '<h4>' + nomAffiche(ru) + (estGroupe(ru) ? ' <span>· ' + ru.name + '</span>' : '') +
      ' <span>×' + ru.size + '</span></h4>';
    const wrap = document.createElement("div");
    wrap.className = "armwrap";
    let html = '<table class="arms"><thead><tr><th style="text-align:left">Arme</th>' +
      '<th>Po</th><th>A</th><th>CT</th><th>F</th><th>PA</th><th>D</th></tr></thead><tbody>';
    lignes.forEach(L=>{
      const w = L.w, mots = w[8] ? motsArme(w[8]) : "";
      html += '<tr class="' + (L.n ? '' : 'off') + '"><td class="an">' +
        (L.n ? '<b class="q">' + (L.perso ? '' : '×' + L.n + ' ') + '</b>' : '') + w[1] +
        (w[2] === "C" ? ' <em style="color:var(--tx3)">càc</em>' : '') +
        (L.perso ? ' <em style="color:var(--tx3)">· ' + L.unite + '</em>' : '') +
        (mots ? '<span class="n">' + mots + '</span>' : '') + '</td>' +
        '<td>' + portee(w) + '</td>' +
        '<td>' + w[3] + '</td><td>' + w[4] + '+</td><td>' + w[5] + '</td>' +
        '<td>' + (w[6] ? '-' + w[6] : '0') + '</td><td>' + w[7] + '</td></tr>';
    });
    wrap.innerHTML = html + '</tbody></table>';
    g.appendChild(wrap);
    host.appendChild(g);
  });
  if(!host.children.length) host.innerHTML = '<div class="empty">Rien à afficher avec ce filtre.</div>';
}

function renderWarn(){
  const w = validate(), host = el("rosterWarn");
  host.innerHTML = w.length ? '<div class="warnbox">' + w.join("<br>") + '</div>' : "";
}

/* ==========================================================
   CE QU'IL RESTE A FAIRE
   validate() dit ce qui est illegal ; ceci dit ce qui est
   simplement inacheve. Rien ici n'empeche de jouer — ce sont
   les choses qu'on decouvre trop tard, une fois la liste
   imprimee et la partie commencee : des points jamais
   depenses, une optimisation ouverte et jamais prise, un
   personnage laisse seul quand il pouvait mener une escouade.
   ========================================================== */
let todoOuvert = false;

function bilanListe(){
  const out = [];
  if(!R.units.length) return out;

  /* le detachement conditionne les optimisations et les stratagemes :
     sans lui, la moitie de la liste ne veut rien dire */
  if(!R.detach.length)
    out.push({cl:"tdo-det", t:"Aucun détachement", d:"Il commande les optimisations, les stratagèmes et les mots-clés d'armes.", go:"cardDetach"});
  else {
    const dp = totalDP(), dpMax = capDP();
    if(dp < dpMax)
      out.push({cl:"tdo-det", t:(dpMax - dp) + " PD non dépensé" + (dpMax - dp > 1 ? "s" : ""),
                d:"Tu peux encore prendre un détachement.", go:"cardDetach"});
  }

  const pts = totalPoints(), cap = R.cap || 2000;
  if(pts < cap){
    const reste = cap - pts;
    /* dire ce qui rentre encore vaut mieux qu'un nombre nu */
    /* combien d'unites rentrent encore : le chiffre ne dit quelque chose
       que quand le reste commence a serrer — a mille points de marge,
       « cinquante unites rentrent » n'apprend rien */
    const rentre = UNITS.filter(u => !u[10] && ptsPour(u, u[6][0], rangProchain(u[0])) <= reste).length;
    out.push({cl:"tdo-pts", t:reste + " pts inutilisés sur " + cap,
              d:!rentre ? "Plus aucune unité du catalogue ne tient dans ce reste."
                : rentre <= 12 ? "Il ne reste que " + rentre + " unité" + (rentre > 1 ? "s" : "") +
                    " du catalogue à tenir dans ce budget."
                : "De quoi ajouter encore plusieurs unités."});
  }

  /* optimisations ouvertes par les detachements et jamais prises */
  if(R.detach.length){
    const prises = R.units.filter(ru => ru.enh).length;
    const dispo = enhDispo();
    const posables = dispo.filter(e => R.units.some(ru => !ru.enh && porteursPossibles(ru, e).length));
    if(dispo.length && posables.length && prises < dispo.length)
      out.push({cl:"tdo-enh", t:posables.length + " optimisation" + (posables.length > 1 ? "s" : "") +
                  " disponible" + (posables.length > 1 ? "s" : "") + (prises ? " en plus" : ""),
                d:prises ? prises + " déjà prise" + (prises > 1 ? "s" : "") + " dans la liste."
                         : "Tes détachements en ouvrent, aucune n'est prise."});
  }

  /* un personnage seul dans son coin qui pouvait mener une escouade */
  const seuls = R.units.filter(ru => {
    if(ru.chars.length || ru.size !== 1) return false;
    const r = roleDe(ru.name);
    if(r !== "Leader" && r !== "Support") return false;
    return R.units.some(x => x !== ru && peutRejoindre(ru.name, x.name) === true);
  });
  seuls.forEach(ru=>{
    const cibles = R.units.filter(x => x !== ru && peutRejoindre(ru.name, x.name) === true)
                          .map(x => nomAffiche(x));
    out.push({cl:"tdo-att", t:ru.name + " est seul",
              d:"Peut rejoindre " + cibles.slice(0,3).join(", ") +
                (cibles.length > 3 ? " et " + (cibles.length - 3) + " autres." : "."), uid:ru.id});
  });

  /* emplacements d'armement facultatifs jamais servis */
  R.units.forEach(ru=>{
    const libres = armSlots(ru.name).filter((sl, si) => sl.min < 1 && !totalSlot(ru, si)).length;
    if(libres) out.push({cl:"tdo-arm", t:nomAffiche(ru) + " : " + libres + " option d'armement non prise" +
                  (libres > 1 ? "s" : ""),
                d:"Ces emplacements sont facultatifs — mais gratuits.", uid:ru.id});
  });

  return out;
}

function renderTodo(){
  const host = el("rosterTodo"); if(!host) return;
  const lot = bilanListe();
  if(!lot.length){ host.innerHTML = ""; return; }
  host.innerHTML = "";
  const t = document.createElement("button");
  t.type = "button"; t.className = "todobar" + (todoOuvert ? " on" : "");
  t.innerHTML = '<span class="tchev">' + (todoOuvert ? "▾" : "▸") + '</span>' +
    '<span class="tt">' + lot.length + ' chose' + (lot.length > 1 ? 's' : '') + ' à finir</span>' +
    '<span class="tc">' + lot.slice(0,2).map(x => x.t).join(" · ") + '</span>';
  t.addEventListener("click", ()=>{ todoOuvert = !todoOuvert; renderTodo(); });
  host.appendChild(t);
  if(!todoOuvert) return;
  const box = document.createElement("div");
  box.className = "todobox";
  lot.forEach(x=>{
    const l = document.createElement(x.go || x.uid ? "button" : "div");
    l.className = "todo " + x.cl;
    if(x.go || x.uid) l.type = "button";
    l.innerHTML = '<b>' + x.t + '</b><i>' + x.d + '</i>';
    if(x.go) l.addEventListener("click", ()=> ouvrePanneau(x.go));
    else if(x.uid) l.addEventListener("click", ()=> ouvrePanneau("cardUnits", x.uid));
    box.appendChild(l);
  });
  host.appendChild(box);
}
function renderList(){
  renderLists(); renderPtsBar(); renderDetach(); renderRoster(); renderWarn(); renderTodo();
  renderStrats(); renderArms(); renderIndex(); renderPad(); renderPartie();
  renderBarreListe();
  renderDispo();
  if(el("cardPartage") && !el("cardPartage").hidden) renderPartage();
  if(window.__relitUniteChargee) window.__relitUniteChargee();
}

/* ---------- ajout d'unite / arme / personnage via la feuille ---------- */
let pickMode = null, pickTarget = null;
/* ==========================================================
   ANNULATION
   Une suppression d'unite se reprend : on garde la derniere
   et on l'offre pendant quelques secondes.
   ========================================================== */
let toastT = null;
function toast(txt, libelle, action){
  const t = el("toast"); if(!t) return;
  el("toastTxt").textContent = txt;
  const b = el("toastAct");
  b.textContent = libelle || "";
  b.onclick = null;
  if(action) b.onclick = ()=>{ cacheToast(); action(); };
  t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(cacheToast, action ? 7000 : 3000);
}
function cacheToast(){ const t = el("toast"); if(t) t.classList.remove("on"); clearTimeout(toastT); }

/* retire une unite en gardant de quoi la remettre a sa place */
function retireUnite(ru){
  const i = R.units.indexOf(ru);
  if(i < 0) return;
  const copie = JSON.parse(JSON.stringify(ru));
  R.units.splice(i, 1);
  saveR(); renderList();
  toast(ru.name + " retiré de la liste.", "Annuler", ()=>{
    R.units.splice(Math.min(i, R.units.length), 0, copie);
    saveR(); renderList();
  });
}

function openSheet(id){ el(id).classList.add("open"); document.body.style.overflow="hidden"; }
function closeSheet(id){ el(id).classList.remove("open"); document.body.style.overflow=""; }

let derniereAjoutee = null, ajoutees = 0;
/* le compteur du catalogue : combien la liste pese deja, ce qu'il reste */
function majBudgetPick(){
  const bar = el("uBudget"); if(!bar) return;
  if(pickMode !== "unit" || !R){ bar.hidden = true; return; }
  const pts = totalPoints(), cap = R.cap || 2000, reste = cap - pts;
  bar.hidden = false;
  bar.classList.toggle("over", reste < 0);
  bar.innerHTML = '<b>' + pts + '</b><span class="pb2">/ ' + cap + ' pts  ·  ' +
    (reste >= 0 ? reste + ' restants' : (-reste) + ' de trop') + '</span>' +
    '<span class="pb2" style="text-align:right;flex:0 0 auto">' + R.units.length +
    ' unité' + (R.units.length > 1 ? 's' : '') + '</span>';
}

function openUnitPick(){
  window.__rosterPick = true; pickMode = "unit"; pickTarget = null;
  derniereAjoutee = null; ajoutees = 0;
  catOuverte = "";
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openCmpPick(src){
  window.__rosterPick = true; pickMode = "cmp:" + src; pickTarget = null;
  catOuverte = "";
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openCharPick(ru){
  window.__rosterPick = true; pickMode = "char"; pickTarget = ru;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
function openEnhPick(ru){
  window.__rosterPick = true; pickMode = "enh"; pickTarget = ru;
  el("uSearch").value = ""; renderPick(); openSheet("sheetUnit");
}
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
/* Categorie ouverte du catalogue — une seule a la fois, et aucune a
   l'ouverture : le catalogue s'ouvre sur son sommaire. Etat d'affichage,
   remis a zero a chaque ouverture, jamais enregistre. */
let catOuverte = "";
function renderPick(){
  const q = norm(el("uSearch").value.trim());
  const host = el("uList"); host.innerHTML = "";
  const head = el("sheetUnit").querySelector("h3");
  el("uSearch").placeholder =
    pickMode === "enh" ? "Rechercher une amélioration…" :
    pickMode === "char" ? "Rechercher un personnage…" : "Rechercher une unité…";

  if(pickMode === "char"){
    head.textContent = "Rattacher à " + pickTarget.name;
    const cible = pickTarget.name;
    /* eligibles : personnages dont la regle Leader cite cette unite,
       plus les escortes qui peuvent s'y greffer */
    /* Seules les figurines qui ont l'aptitude Meneur ou Appui rejoignent une
       unite. La Catacomb Command Barge est un PERSONNAGE — elle peut porter
       une optimisation — mais c'est un VEHICULE : elle ne se rattache a
       personne, et elle n'a donc rien a faire dans cette liste. */
    const candidats = UNITS.filter(u =>
      (u[9] === "Leader" || u[9] === "Support" || RETINUE[u[0]]) &&
      (!q || norm(u[0]).includes(q)));
    const ok = candidats.filter(u => peutRejoindre(u[0], cible) === true);
    const inconnu = candidats.filter(u => peutRejoindre(u[0], cible) === null);
    const non = candidats.filter(u => peutRejoindre(u[0], cible) === false);

    const bouton = (u, etat) => {
      const refus = refusAttache(u[0], pickTarget);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt" + (etat === "non" || refus ? " opt-off" : "");
      if(refus) b.disabled = true;
      const role = u[9] || "Escorte";
      const sc = socle(u[0]);
      b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span><span class="o2">' +
        role + ' · E' + u[2] + ' · ' + u[5] + ' PV' + (sc ? ' · socle ' + sc + ' mm' : '') +
        ' · ' + ptsPour(u, u[6][0], rangProchain(u[0])) + ' pts' + (refus ? ' — ' + refus : '') + '</span></span>' +
        '<span class="otag">' + role.toUpperCase() + '</span>';
      if(!refus) b.addEventListener("click", ()=>{
        pickTarget.chars.push({name:u[0], lo: loPersoParDefaut(u[0])});
        closeSheet("sheetUnit"); saveR(); renderList();
      });
      const rangee = document.createElement("div");
      rangee.className = "optrow";
      const inf = document.createElement("button");
      inf.type = "button"; inf.className = "ibtn"; inf.textContent = "ⓘ";
      inf.title = "Voir la fiche de " + u[0];
      inf.addEventListener("click", e => { e.stopPropagation(); ouvreFiche(u[0]); });
      rangee.appendChild(b); rangee.appendChild(inf);
      return rangee;
    };
    const titre = t => {
      const d = document.createElement("div");
      d.className = "sheet-sep"; d.textContent = t; host.appendChild(d);
    };
    if(ok.length){ titre("Peuvent rejoindre " + cible); ok.forEach(u => host.appendChild(bouton(u, "ok"))); }
    if(inconnu.length){ titre("Sans règle de rattachement connue"); inconnu.forEach(u => host.appendChild(bouton(u, "?"))); }
    if(non.length){ titre("Hors règles — cette unité n'est pas dans leur liste"); non.forEach(u => host.appendChild(bouton(u, "non"))); }
    if(!host.children.length) host.innerHTML = '<div class="sheet-empty">Aucun personnage ne correspond.</div>';
    return;
  }
  if(pickMode === "enh"){
    head.textContent = "Amélioration — " + pickTarget.name;
    const dispo = enhDispo().filter(e => !q || norm(e[0]).includes(q));
    if(!R.detach.length){
      host.innerHTML = '<div class="sheet-empty">Choisis d\'abord un détachement : ' +
        'les améliorations en dépendent.</div>';
      return;
    }
    /* Un detachement n'en ouvre pas toujours quatre : ceux du pack de
       faction en donnent deux, et le Pantheon de Malheur aucune — il
       impose des Entraves Necrodermiques a la place. Le compte est donc
       affiche detachement par detachement, pour qu'un total inattendu
       ne passe pas pour un oubli. */
    const compte = document.createElement("div");
    compte.className = "enhcount";
    compte.innerHTML = R.detach.map(n=>{
      const k = ENHANCEMENTS.filter(e => e[2] === n).length;
      return '<span><b>' + k + '</b> ' + nomDetach(n) + '</span>';
    }).join("");
    host.appendChild(compte);
    /* une amelioration ne se prend qu'une fois dans l'armee */
    const prises = R.units.filter(x => x !== pickTarget).map(x => x.enh).filter(Boolean);
    /* celles que ce groupe peut vraiment porter d'abord : la fiche
       officielle limite chacune a une figurine ou a une unite precise */
    const lot = dispo.map(e => ({e:e, ok:porteursPossibles(pickTarget, e)}));
    const tri = lot.filter(x => x.ok.length).concat(lot.filter(x => !x.ok.length));
    let coupure = false;
    tri.forEach(x=>{
      const e = x.e, deja = prises.indexOf(e[0]) >= 0;
      if(!x.ok.length && !coupure){
        coupure = true;
        const sep = document.createElement("div");
        sep.className = "sheet-sep";
        sep.textContent = "Hors de portée de ce groupe";
        host.appendChild(sep);
      }
      const b = document.createElement("button");
      b.type="button";
      b.className = "opt" + (deja || !x.ok.length ? " opt-off" : "") +
        (pickTarget.enh === e[0] ? " sel" : "");
      const porte = x.ok.length
        ? ' · portée par ' + nomPorteur(pickTarget, x.ok[0])
        : ' · ' + (enhRestriction(e) || "aucun porteur possible ici");
      /* le texte en entier : c'est ce qu'elle fait qui decide du choix,
         pas son nom. La phrase de restriction se detache du reste. */
      const txt = e[3] || "", res = enhRestriction(e);
      const corps = res && txt.indexOf(res) === 0 ? txt.slice(res.length).trim() : txt;
      b.innerHTML = '<span class="oi"><span class="o1">' + e[0] + '</span><span class="o2">' +
        (typeof e[1] === "number" ? e[1] + ' pts' : 'coût inconnu') + ' · ' + nomDetach(e[2]) +
        (deja ? ' · déjà prise ailleurs' : porte) + '</span>' +
        (res ? '<span class="o4">' + res + '</span>' : '') +
        (corps ? '<span class="o3">' + corps + '</span>' : '') + '</span>';
      b.addEventListener("click", ()=>{
        if(pickTarget.enh === e[0]){ pickTarget.enh = null; pickTarget.enhP = ""; }
        else { pickTarget.enh = e[0]; pickTarget.enhP = x.ok[0] || ""; }
        closeSheet("sheetUnit"); saveR(); renderList();
      });
      host.appendChild(b);
    });
    if(!tri.length) host.innerHTML =
      '<div class="sheet-empty">Aucune amélioration pour les détachements retenus.</div>';
    return;
  }
  if(pickMode && pickMode.indexOf("cmp:") === 0){
    const fromRoster = pickMode === "cmp:roster";
    head.textContent = fromRoster ? "Comparer — depuis ma liste" : "Comparer — catalogue";
    /* Depuis la liste, on choisit une UNITE, pas une fiche : c'est
       l'unite entiere qui entre en comparaison, avec son armement, ses
       personnages et son detachement. Deux escouades identiques menees
       par deux personnages differents sont donc deux entrees distinctes,
       et c'est exactement ce qu'on veut mesurer. */
    if(fromRoster){
      const deja = new Set(CMP.filter(c => c.src === "roster").map(c => String(c.id)));
      R.units.filter(ru => !q || norm(nomAffiche(ru)).includes(q) || norm(ru.name).includes(q) ||
                           norm(armementCourt(ru)).includes(q) ||
                           ru.chars.some(c => norm(c.name).includes(q)))
        .forEach(ru=>{
          const u = unitRow(ru.name); if(!u) return;
          const nT = profilsPhase(ru, "T").length, nC = profilsPhase(ru, "C").length;
          const b = document.createElement("button");
          b.type="button"; b.className="opt" + (deja.has(String(ru.id)) ? " sel" : "");
          b.innerHTML = '<span class="oi"><span class="o1">' + nomRepere(ru) + '</span>' +
            '<span class="o2">' + ru.name + ' ×' + ru.size +
            (ru.chars.length ? ' · ' + ru.chars.map(c=>c.name).join(", ") : '') +
            (ru.enh ? ' · ' + nomEnh(ru.enh) : '') +
            ' · ' + pointsUnite(ru) + ' pts</span>' +
            '<span class="oarm">' + (armementCourt(ru) || '—') + '</span>' +
            '<span class="o2">' + nT + ' profil' + (nT>1?'s':'') +
            ' de tir, ' + nC + ' au corps à corps</span></span>' +
            (deja.has(String(ru.id)) ? '<span class="otag">DÉJÀ LÀ</span>' : '');
          b.addEventListener("click", ()=>{
            if(deja.has(String(ru.id))) return;
            CMP.push({src:"roster", id:ru.id});
            closeSheet("sheetUnit"); saveCmp(); renderCmpList();
          });
          host.appendChild(b);
        });
      if(!host.children.length) host.innerHTML =
        '<div class="sheet-empty">Ta liste est vide, ou rien ne correspond.</div>';
      return;
    }
    UNITS.map(u => ({name:u[0], size:u[6][u[6].length-1], w:0}))
      .filter(c => !q || norm(c.name).includes(q)).forEach(c=>{
      const u = unitRow(c.name); if(!u) return;
      const b = document.createElement("button");
      b.type="button"; b.className="opt";
      b.innerHTML = '<span class="oi"><span class="o1">' + c.name + '</span><span class="o2">×' + c.size +
        ' · ' + ptsPour(u, c.size, 1) + ' pts · E' + u[2] + ' · Svg ' + u[3] + '+</span></span>';
      b.addEventListener("click", ()=>{
        CMP.push({name:c.name, size:c.size, w:c.w|0});
        closeSheet("sheetUnit"); saveCmp(); renderCmpList();
      });
      host.appendChild(b);
    });
    if(!host.children.length) host.innerHTML = '<div class="sheet-empty">Rien à ajouter ici.</div>';
    return;
  }
  head.textContent = "Ajouter une unité";
  majBudgetPick();
  /* rangé par grande catégorie : on cherche « un véhicule », « un héros »,
     rarement un nom précis dans une liste de cinquante-deux entrées.
     La recherche prend aussi les mots-cles et le role : « canoptek »,
     « leader », « battleline » ramenent ce qu'il faut. */
  const retenues = UNITS.filter(u => !q || norm(u[0]).includes(q) ||
    unitWeps(u[0]).some(w => norm(w[1]).includes(q)) || norm(categorie(u[0])).includes(q) ||
    norm(u[9] || "").includes(q) ||
    Object.keys(KW).some(k => has(k, u[0]) && norm(k).includes(q)));
  const parCat = {};
  retenues.forEach(u => (parCat[categorie(u[0])] = parCat[categorie(u[0])] || []).push(u));
  const bouton = u => {
    const b = document.createElement("button");
    b.type="button"; b.className="opt";
    /* la taille minimale est celle qu'on prend le plus souvent, et surtout
       la moins chere : poser d'office la plus grande faisait croire toute
       l'armee hors de prix. Le prix s'annonce en fourchette. */
    const sz = u[6][0];
    /* le prix annonce est celui que coutera cette copie-ci : le MFM
       facture au rang, et afficher le tarif de la premiere quand on en a
       deja deux fausserait le budget au moment meme du choix */
    const rgN = rangProchain(u[0]);
    const pmin = ptsPour(u, u[6][0], rgN), pmax = ptsPour(u, u[6][u[6].length-1], rgN);
    const monte = pmin > ptsPour(u, u[6][0], 1);
    const reste = (R.cap || 2000) - totalPoints();
    if(pmin > reste) b.classList.add("cher");
    b.innerHTML = '<span class="oi"><span class="o1">' + u[0] + '</span><span class="o2">×' + u[6].join("/") +
      ' · ' + (pmin === pmax ? pmin + ' pts' : pmin + '–' + pmax + ' pts') +
      (monte ? ' <b class="rang">' + rgN + 'ᵉ copie</b>' : '') +
      ' · E' + u[2] + ' · Svg ' + u[3] + '+</span></span>' +
      (u[10] ? '<span class="otag">LEGENDS</span>' : (u[9] ? '<span class="otag">' + u[9].toUpperCase() + '</span>' : ""));
    b.addEventListener("click", ()=>{
      const neuve = {id:nextId++, name:u[0], size:sz, lo:loParDefaut(u[0], sz), chars:[], sel:true,
        grp:nomGroupe(), enh:null};
      R.units.push(neuve);
      saveR(); renderList();
      /* on reste dans le catalogue : monter une liste, c'est poser dix
         unites d'affilee, pas ressortir dix fois. Le pave se remplit
         derriere et le budget se met a jour au-dessus. */
      b.classList.add("pose");
      setTimeout(()=> b.classList.remove("pose"), 700);
      majBudgetPick();
      derniereAjoutee = neuve.id; ajoutees++;
    });
    /* la fiche se consulte avant d'ajouter : c'est la qu'on decide */
    const rangee = document.createElement("div");
    rangee.className = "optrow";
    const inf = document.createElement("button");
    inf.type = "button"; inf.className = "ibtn"; inf.textContent = "ⓘ";
    inf.title = "Voir la fiche de " + u[0];
    inf.addEventListener("click", e => { e.stopPropagation(); ouvreFiche(u[0]); });
    rangee.appendChild(b); rangee.appendChild(inf);
    return rangee;
  };
  /* Cinquante-deux entrees a la file : on cherchait un vehicule en faisant
     defiler l'infanterie. Le catalogue s'ouvre donc plie — un sommaire de
     dix lignes qui tient dans l'ecran, ou l'on va droit au rayon voulu.
     Une seule categorie reste ouverte a la fois : ouvrir la suivante
     referme la precedente, pour n'avoir jamais ni a faire defiler ni a
     replier soi-meme. Une recherche en cours ouvre tout : filtrer pour
     ensuite deplier serait absurde. */
  CAT_ORDRE.forEach(cat=>{
    const lot = parCat[cat];
    if(!lot || !lot.length) return;
    const ouvert = !!q || catOuverte === cat;
    const sep = document.createElement("button");
    sep.type = "button";
    sep.className = "catbar" + (ouvert ? " on" : "");
    sep.innerHTML = '<span class="cchev">' + (ouvert ? "▾" : "▸") + '</span>' +
      '<span class="cnom">' + cat + '</span><span class="ccnt">' + lot.length + '</span>';
    sep.addEventListener("click", ()=>{
      catOuverte = (catOuverte === cat) ? "" : cat;
      renderPick();
      /* la barre touchee remonte en tete de zone visible : sans cela,
         ouvrir la derniere categorie deroule sous le pouce, hors ecran */
      const rouvre = host.querySelector(".catbar.on");
      if(rouvre && rouvre.scrollIntoView) rouvre.scrollIntoView({block:"start"});
    });
    host.appendChild(sep);
    if(ouvert) lot.forEach(u => host.appendChild(bouton(u)));
  });
  if(!host.querySelector(".catbar")) host.innerHTML =
    '<div class="sheet-empty">Aucune unité trouvée.</div>';
}

/* ==========================================================
   CONDITIONS DE DÉTACHEMENT
   Sept règles de détachement ne valent que si une condition est vraie
   ce tour-ci — « entièrement dans la Matrice de Puissance », « cible à
   portée d'un objectif ». Elles se cochaient dans l'écran « Tir cumulé »,
   qui n'existe plus ; elles rejoignent les retouches de partie du
   simulateur, aux côtés des aptitudes conditionnelles d'unité, qui sont
   exactement de la même nature.
   ========================================================== */
function situationsDetach(){
  if(!R) return [];
  return activeRules().filter(d => d[6]).map(d => ({
    cle: d[5], nom: SITU_LABEL[d[5]] || d[3], source: d[0], on: !!situ[d[5]]
  }));
}



/* ==========================================================
   ECRAN « COMPARER »
   ========================================================== */
/* Deux sortes d'entrees, et c'est tout l'interet :
   — {src:"roster", id}  une unite de la liste ouverte, ENTIERE : son
     armement reel, ses personnages rattaches, les octrois de son
     detachement. C'est ce qui permet de mettre face a face la meme
     escouade menee par un Plasmancien et par un Psychomancien, et de
     voir ce que chaque aura rapporte vraiment.
   — {name, size, w}     une unite du catalogue, une arme a la fois,
     hors de toute liste : la mesure brute d'une fiche. */
let CMP = [];
let cmpPhaseV = "T";

function loadCmp(){ try{ CMP = JSON.parse(localStorage.getItem("mathhammer.cmp.v1") || "[]"); }catch(e){ CMP = []; } }
function saveCmp(){ try{ localStorage.setItem("mathhammer.cmp.v1", JSON.stringify(CMP)); }catch(e){} }

/* l'unite de la liste derriere une entree — absente si elle a ete
   retiree de la liste depuis qu'on l'a mise en comparaison */
function cmpUnite(c){
  if(c.src !== "roster" || !R) return null;
  return R.units.find(u => String(u.id) === String(c.id)) || null;
}
function cmpProfiles(c){
  if(c.src === "roster"){
    const ru = cmpUnite(c);
    return ru ? profilsPhase(ru, cmpPhaseV) : [];
  }
  const list = unitWeps(c.name);
  let w = list[c.w];
  if(!w || w[2] !== cmpPhaseV) w = list.find(x => x[2] === cmpPhaseV);
  if(!w) return [];
  const pseudo = {name:c.name, chars: el("cmpLed").checked ? [{name:"—"}] : []};
  const p = weaponProfile(c.name, w, c.size, pseudo);
  p.label = w[1];
  return [p];
}
function cmpPoints(c){
  if(c.src === "roster"){
    const ru = cmpUnite(c);
    return ru ? pointsUnite(ru) : 0;
  }
  const u = unitRow(c.name);
  return u ? ptsPour(u, c.size, 1) : 0;
}
function cmpNom(c){
  if(c.src === "roster"){
    const ru = cmpUnite(c);
    return ru ? nomRepere(ru) : "unité retirée";
  }
  return c.name;
}
function renderCmpList(){
  const host = el("cmpList"); host.innerHTML = "";
  if(!CMP.length){
    host.innerHTML = '<div class="empty">Ajoute au moins deux unités à comparer.</div>';
    renderCmp(); return;
  }
  CMP.forEach((c,i)=>{
    const row = document.createElement("div");
    row.className = "cmprow";
    const rm = document.createElement("button");
    rm.className="xbtn"; rm.type="button"; rm.textContent="×";
    rm.addEventListener("click", ()=>{ CMP.splice(i,1); saveCmp(); renderCmpList(); });

    /* une unite de la liste : rien a regler ici, tout vient de la liste.
       Changer son armement ou son personnage se fait dans l'editeur, et
       la comparaison suit. */
    if(c.src === "roster"){
      const ru = cmpUnite(c);
      if(!ru){
        row.classList.add("mort");
        row.innerHTML = '<span class="cn"><b>Unité retirée de la liste</b>' +
          '<i>elle ne peut plus être comparée</i></span>';
        row.appendChild(rm); host.appendChild(row); return;
      }
      const n = cmpProfiles(c).length;
      const arm = armementCourt(ru);
      row.innerHTML = '<span class="cn"><b>' + nomRepere(ru) + '</b><i>' +
        ru.name + ' ×' + ru.size +
        (ru.chars.length ? ' · ' + ru.chars.map(x=>x.name).join(", ") : '') +
        (ru.enh ? ' · ' + nomEnh(ru.enh) : '') +
        ' · ' + cmpPoints(c) + ' pts</i>' +
        (arm ? '<u>' + arm + '</u>' : '') +
        (n ? '' : '<u class="rien">aucune arme pour cette phase</u>') + '</span>';
      row.appendChild(rm); host.appendChild(row); return;
    }

    const u = unitRow(c.name); if(!u) return;
    const list = unitWeps(c.name);
    let w = list[c.w]; if(!w || w[2] !== cmpPhaseV) w = list.find(x=>x[2]===cmpPhaseV);
    row.innerHTML = '<span class="cn"><b>' + c.name + '</b><i>×' + c.size + ' · ' +
      (w ? w[1] : "aucune arme pour cette phase") + ' · ' + cmpPoints(c) + ' pts</i></span>';
    const nx = document.createElement("button");
    nx.className="xbtn"; nx.type="button"; nx.textContent="⟳"; nx.title="Arme suivante";
    nx.addEventListener("click", ()=>{
      const idxs = list.map((x,j)=>[x,j]).filter(([x])=>x[2]===cmpPhaseV).map(([,j])=>j);
      if(!idxs.length) return;
      const cur = idxs.indexOf(c.w);
      c.w = idxs[(cur + 1) % idxs.length];
      saveCmp(); renderCmpList();
    });
    const sz = document.createElement("button");
    sz.className="xbtn"; sz.type="button"; sz.textContent="±"; sz.title="Taille suivante";
    sz.addEventListener("click", ()=>{
      const k = u[6].indexOf(c.size);
      c.size = u[6][(k + 1) % u[6].length];
      saveCmp(); renderCmpList();
    });
    if(u[6].length > 1) row.appendChild(sz);
    row.appendChild(nx); row.appendChild(rm);
    host.appendChild(row);
  });
  /* la case « menées par un personnage » ne sert qu'aux entrées du
     catalogue : une unité de la liste porte ses vrais personnages */
  const lab = el("cmpLed").closest("label");
  if(lab) lab.hidden = !CMP.some(c => c.src !== "roster");
  renderCmp();
}
/* Les deux mesures d'une unite, cote a cote sur une seule ligne. Elles
   occupaient deux graphiques empiles, donc deux fois le nom de chaque
   unite et deux titres : sur telephone il fallait faire defiler pour
   comparer une unite a elle-meme. Chaque colonne garde sa propre
   echelle — la plus longue barre d'une colonne est celle qui gagne sur
   cette mesure — et un espace insecable colle l'unite a son nombre. */
function duoBars(host, rows){
  const maxA = Math.max.apply(null, rows.map(r => r.brut)) || 1;
  const maxB = Math.max.apply(null, rows.map(r => r.eff)) || 1;
  const col = (v, max, cls, unite) =>
    '<div class="c2c' + cls + '"><span class="c2v">' + num(v) +
    '<small>\u00a0' + unite + '</small></span>' +
    '<div class="c2t"><div class="c2f" style="width:' +
    Math.max(1.5, v/max*100) + '%"></div></div></div>';
  host.innerHTML =
    '<div class="c2th"><span>Puissance brute</span><span>Pour 100 points</span></div>' +
    rows.map(r =>
      '<div class="c2r"><div class="c2n"><b>' + r.n + '</b><i>' + r.p + ' pts</i></div>' +
      '<div class="c2g">' + col(r.brut, maxA, "", "PV") +
                            col(r.eff, maxB, " b", "PV") + '</div></div>').join("");
}
function renderCmp(){
  const hostD = el("cmpDuo"), hostT = el("cmpTable");
  const vide = () => { hostD.innerHTML = hostT.innerHTML = "";
                       el("cmpDetSub").textContent = ""; };
  if(CMP.length < 1){ vide(); el("cmpNote").textContent = ""; return; }
  const vivantes = CMP.filter(c => c.src !== "roster" || cmpUnite(c));
  if(!vivantes.length){
    vide();
    el("cmpNote").textContent = "Les unités comparées ont toutes quitté la liste.";
    return;
  }
  const res = [];
  /* une entree dont l'unite a quitte la liste n'a plus rien a dire : on
     la garde dans la liste du haut, pour que le joueur la voie et la
     retire, mais elle ne vient pas fausser le verdict d'un zero */
  CMP.filter(c => c.src !== "roster" || cmpUnite(c)).forEach(c=>{
    const ps = cmpProfiles(c);
    if(!ps.length){ res.push({n:cmpNom(c), pts:cmpPoints(c), dmg:0, slain:0, wipe:0, eff:0, none:true}); return; }
    const sim = simulateCombined(ps, 20000);
    const pts = cmpPoints(c);
    res.push({n:cmpNom(c), pts, dmg:sim.meanDealt, raw:sim.meanRaw, slain:sim.meanSlain,
              wipe:auMoins(sim.slainDist, S.models), eff: pts ? sim.meanRaw/pts*100 : 0});
  });
  const byEff = res.slice().sort((a,b)=> b.eff - a.eff);
  duoBars(hostD, byEff.map(r=>({n:r.n, brut:r.raw||0, eff:r.eff, p:r.pts})));

  /* « Efface » ne veut rien dire sans dire de quoi : on met l'effectif
     de la cible dans l'en-tete, et le detail au survol. */
  const cible = SIM.tgtName + " ×" + S.models;
  el("cmpDetSub").textContent =
    "Contre " + cible + ". « Dégâts » = puissance brute, avant plafonnement par les PV de la cible. " +
    "« Figs » = figurines réellement couchées. « Efface » = probabilité de coucher les " +
    S.models + " figurines de la cible en une activation.";
  let html = '<table><thead><tr><th>Unité</th><th>Pts</th><th>Dégâts</th><th>Figs</th>' +
    '<th title="Probabilité de coucher les ' + S.models + ' figurines de la cible">Efface ×' +
    S.models + '</th><th>/100 pts</th></tr></thead><tbody>';
  byEff.forEach(r=>{
    html += "<tr><td>" + r.n + "</td><td>" + r.pts + "</td><td>" + num(r.raw||0) + "</td><td>" +
      num(r.slain) + "</td><td>" + pct(r.wipe||0) + "</td><td>" + num(r.eff) + "</td></tr>";
  });
  hostT.innerHTML = html + "</tbody></table>";

  if(byEff.length >= 2 && byEff[0].eff > 0){
    const g = byEff[0], b = byEff[byEff.length-1];
    const ratio = b.eff > 0 ? (g.eff/b.eff) : 0;
    el("cmpNote").innerHTML = "Contre cette cible, <b>" + g.n + "</b> rend <b>" + num(g.eff) +
      " PV pour 100 pts</b>" + (ratio > 1.05 ? ", soit " + num(ratio) + "× mieux que " + b.n : "") +
      ". « Dégâts » est la puissance brute avant plafonnement par les PV de la cible : c'est la bonne mesure pour comparer, la surtue dépendant de l'ordre de tir.";
  } else el("cmpNote").textContent = "";
}

/* ==========================================================
   ÉCRAN « COMBIEN IL EN FAUT »
   La question qu'on se pose devant un char : est-ce que ce que j'ai
   suffit à le coucher ce tour-ci, et sinon combien il m'en faut de
   plus. Le tir cumulé d'avant y repondait mal — il donnait un total,
   pas un seuil. Ici les unites tirent dans l'ordre sur le meme vivier
   de figurines, et on lit apres chaque activation ce qui reste debout
   et la chance d'avoir tout couche.

   Une entree porte un multiplicateur : « ×3 » fait tirer trois
   escouades identiques, de quoi eprouver un effectif qu'on n'a pas
   encore achete.
   ========================================================== */
const GRPKEY = "mathhammer.grp.v1";
let GRP = [];              /* [{id, n}] — unites de la liste, et combien */
let grpPhaseV = "T";

function loadGrp(){ try{ GRP = JSON.parse(localStorage.getItem(GRPKEY) || "[]"); }catch(e){ GRP = []; }
  if(!Array.isArray(GRP)) GRP = []; }
function saveGrp(){ try{ localStorage.setItem(GRPKEY, JSON.stringify(GRP)); }catch(e){} }
const grpUnite = g => (R && R.units.find(u => String(u.id) === String(g.id))) || null;

function renderGrpList(){
  const host = el("grpList"); if(!host) return;
  host.innerHTML = "";
  const vivantes = GRP.filter(g => grpUnite(g));
  if(vivantes.length !== GRP.length){ GRP = vivantes; saveGrp(); }
  if(!GRP.length){
    host.innerHTML = '<div class="empty">Ajoute une unité : on regardera combien d\'activations il faut pour coucher la cible.</div>';
    renderGrp(); return;
  }
  GRP.forEach((g,i)=>{
    const ru = grpUnite(g);
    const prof = profilsPhase(ru, grpPhaseV);
    const row = document.createElement("div");
    row.className = "cmprow";
    const arm = armementCourt(ru);
    row.innerHTML = '<span class="cn"><b>' + nomRepere(ru) + (g.n > 1 ? ' ×' + g.n : '') + '</b>' +
      '<i>' + ru.name + ' ×' + ru.size +
      (ru.chars.length ? ' · ' + ru.chars.map(c=>c.name).join(", ") : '') +
      ' · ' + (pointsUnite(ru) * g.n) + ' pts</i>' +
      (arm ? '<u>' + arm + '</u>' : '') +
      (prof.length ? '' : '<u class="rien">aucune arme pour cette phase</u>') + '</span>';
    const moins = document.createElement("button");
    moins.className="xbtn"; moins.type="button"; moins.textContent="−"; moins.title="Une de moins";
    moins.addEventListener("click", ()=>{
      if(g.n > 1){ g.n--; } else { GRP.splice(i,1); }
      saveGrp(); renderGrpList();
    });
    const plus = document.createElement("button");
    plus.className="xbtn"; plus.type="button"; plus.textContent="+"; plus.title="Une de plus";
    plus.addEventListener("click", ()=>{ g.n = Math.min(12, g.n + 1); saveGrp(); renderGrpList(); });
    const rm = document.createElement("button");
    rm.className="xbtn"; rm.type="button"; rm.textContent="×";
    rm.addEventListener("click", ()=>{ GRP.splice(i,1); saveGrp(); renderGrpList(); });
    row.appendChild(moins); row.appendChild(plus); row.appendChild(rm);
    host.appendChild(row);
  });
  renderGrp();
}
/* la feuille d'ajout : les unites de la liste, armement compris */
function ouvreGrpPick(){
  el("listActTitle").textContent = "Ajouter au tir groupé";
  const host = el("listActList");
  host.innerHTML = "";
  if(!R || !R.units.length){
    host.innerHTML = '<div class="sheet-empty">La liste en service est vide.</div>';
    openSheet("sheetListAct"); return;
  }
  R.units.forEach(ru=>{
    const nT = profilsPhase(ru, "T").length, nC = profilsPhase(ru, "C").length;
    const b = document.createElement("button");
    b.type="button"; b.className="opt";
    b.innerHTML = '<span class="oi"><span class="o1">' + nomRepere(ru) + '</span>' +
      '<span class="o2">' + ru.name + ' ×' + ru.size + ' · ' + pointsUnite(ru) + ' pts</span>' +
      '<span class="oarm">' + (armementCourt(ru) || '—') + '</span>' +
      '<span class="o2">' + nT + ' profil' + (nT>1?'s':'') + ' de tir, ' + nC + ' au corps à corps</span></span>';
    b.addEventListener("click", ()=>{
      closeSheet("sheetListAct");
      const d = GRP.find(g => String(g.id) === String(ru.id));
      if(d) d.n = Math.min(12, d.n + 1); else GRP.push({ id: ru.id, n: 1 });
      saveGrp(); renderGrpList();
    });
    host.appendChild(b);
  });
  openSheet("sheetListAct");
}

function renderGrp(){
  const esc = el("grpEsc"); if(!esc) return;
  const seuils = el("grpSeuils"), hist = el("grpHist");
  const vide = () => { esc.innerHTML = ""; seuils.innerHTML = ""; hist.innerHTML = "";
    el("grpVerdict").textContent = ""; el("grpSub").textContent = "";
    el("grpDistSub").textContent = ""; };

  /* chaque activation, dans l'ordre, autant de fois que demande */
  const pas = [];
  GRP.forEach(g=>{
    const ru = grpUnite(g); if(!ru) return;
    const prof = profilsPhase(ru, grpPhaseV);
    if(!prof.length) return;
    for(let k=0; k<g.n; k++) pas.push({ nom: nomRepere(ru), pts: pointsUnite(ru), prof: prof });
  });
  if(!pas.length){ vide(); return; }

  const M = S.models, PV = S.wounds;
  /* on relance le groupe apres chaque activation ajoutee : c'est le
     seul moyen d'avoir la vraie probabilite cumulee, la surtue de la
     premiere unite changeant ce qui reste a faire aux suivantes */
  const lignes = [];
  let pts = 0;
  for(let k=1; k<=pas.length; k++){
    const lot = [];
    for(let i=0;i<k;i++) pas[i].prof.forEach(pr => lot.push(Object.assign({}, pr, {
      tough:S.tough, sv:S.sv, inv:S.inv, wounds:PV, models:M,
      fnp:S.fnp, dmgRed:S.dmgRed, cover:S.cover })));
    const sim = simulateCombined(lot, 12000);
    pts += pas[k-1].pts;
    lignes.push({ nom: pas[k-1].nom, k: k, pts: pts,
                  dmg: sim.meanDealt, slain: sim.meanSlain,
                  efface: auMoins(sim.slainDist, M), sim: sim });
  }

  const seuil = lignes.find(l => l.efface >= 0.75);
  const moitie = lignes.find(l => l.efface >= 0.5);
  el("grpVerdict").innerHTML = seuil
    ? "Il en faut <b>" + seuil.k + "</b> pour coucher " + SIM.tgtName + " ×" + M +
      " <b>trois fois sur quatre</b>" + (moitie && moitie.k < seuil.k
        ? ", et " + moitie.k + " pour y arriver une fois sur deux." : ".")
    : (moitie
      ? "Il en faut <b>" + moitie.k + "</b> pour coucher " + SIM.tgtName + " ×" + M +
        " une fois sur deux ; aucun nombre testé ici n'y arrive trois fois sur quatre."
      : "Même à " + pas.length + " activation" + (pas.length>1?"s":"") +
        ", la cible tombe moins d'une fois sur deux. Ajoute-en.");
  el("grpSub").textContent = "Chaque ligne ajoute une activation à celles du dessus. « Efface » = " +
    (M > 1 ? "les " + M + " figurines de la cible sont couchées."
           : "la cible est couchée.");

  const max = Math.max.apply(null, lignes.map(l => l.efface)) || 1;
  esc.className = "esc";
  esc.innerHTML = lignes.map(l =>
    '<div class="er' + (l.efface >= 0.75 ? ' gagne' : '') + '">' +
    '<span class="ek">' + l.k + '</span>' +
    '<span class="en"><b>' + l.nom + '</b><i>' + l.pts + ' pts cumulés · ' +
      num(l.dmg) + ' PV' +
      /* « 2,0 figurines » sur une cible qui n'en a qu'une n'apprend
         rien : la simulation continue sur des figurines fraiches pour
         mesurer la puissance, pas pour compter des morts en trop */
      (M > 1 ? ' · ' + num(l.slain) + ' figurines' : '') + '</i></span>' +
    '<span class="ev"><b>' + pct(l.efface) + '</b><i>efface</i></span>' +
    '<span class="bar"><span style="width:' + Math.max(1.5, l.efface/max*100) + '%"></span></span>' +
    '</div>').join("");

  /* et le detail du groupe au complet */
  const der = lignes[lignes.length-1];
  el("grpDistSub").textContent = "Les " + pas.length + " activation" + (pas.length>1?"s":"") +
    " ensemble, sur " + der.sim.N.toLocaleString("fr-FR") + " simulations.";
  drawBars(hist, binned(der.sim.dmgDist, 26), "var(--glow)",
    (i, v) => i + " PV — " + pct(v));
  /* le tableau des seuils compte des figurines : sur une cible d'une
     seule figurine il ne dirait rien de plus que la colonne « efface » */
  if(M > 1) rendSeuils(seuils, der.sim.slainDist); else seuils.innerHTML = "";
}

/* ==========================================================
   PALMARÈS — ce qui marche le mieux contre cette cible
   Cent trente-six armes dans la faction. La question « avec quoi je
   perce ce char » ne se resout pas en les essayant une par une.
   L'ecran les passe toutes au moteur contre la cible du moment et les
   range, par arme ou par unite, en puissance brute ou au point.

   Chaque fiche est prise NUE : effectif maximum, sans detachement,
   sans personnage rattache, sans retouche. C'est une carte du terrain,
   pas un calcul de partie — l'onglet Attaque est la pour ca, et le dit.
   ========================================================== */
let topPhaseV = "T", topQuoiV = "arme", topOuV = "tout", topTriV = "brut";

/* combien de figurines peuvent porter chaque arme, au maximum */
function portMax(nom, taille){
  const out = {}, slots = armSlots(nom);
  armFixes(nom).forEach(i => { out[i] = taille; });
  slots.forEach((sl, si)=>{
    (sl.o || []).forEach((opt, oi)=>{
      const cap = optMax(sl, oi) || taille;
      (opt || []).forEach(i => { out[i] = Math.max(out[i] || 0, cap); });
    });
  });
  return out;
}
function palmares(){
  const rows = [];
  const dansLaListe = {};
  if(R) R.units.forEach(ru => { dansLaListe[ru.name] = true; });
  UNITS.forEach(u=>{
    const nom = u[0];
    if(topOuV === "liste" && !dansLaListe[nom]) return;
    const taille = u[6][u[6].length - 1];
    const wl = unitWeps(nom), port = portMax(nom, taille);
    const pts = ptsPour(u, taille, 1);
    const parUnite = [];
    Object.keys(port).map(Number).forEach(i=>{
      const w = wl[i], n = port[i];
      if(!w || !n || w[2] !== topPhaseV) return;
      const prof = Object.assign(weaponProfile(nom, w, n, null), {
        tough:S.tough, sv:S.sv, inv:S.inv, wounds:S.wounds, models:S.models,
        fnp:S.fnp, dmgRed:S.dmgRed, cover:S.cover, kind:w[2] });
      const a = analytic(prof);
      const g = groupeDe(nom, i);
      rows.push({ arme:(g ? g.libelle : w[1]), unite:nom, n:n, pts:pts,
                  dmg:a.rawDmg, mien:!!dansLaListe[nom] });
      parUnite.push(a.rawDmg);
    });
    if(topQuoiV === "unite" && parUnite.length){
      /* l'unite entiere : toutes ses armes de la phase, celles qui
         s'excluent comprises — c'est un plafond, pas un armement reel */
      rows.push({ arme:"", unite:nom, n:taille, pts:pts,
                  dmg:parUnite.reduce((x,y)=>x+y, 0), mien:!!dansLaListe[nom],
                  groupe:true, combien:parUnite.length });
    }
  });
  const gardes = topQuoiV === "unite" ? rows.filter(r => r.groupe) : rows;
  gardes.forEach(r => { r.eff = r.pts ? r.dmg / r.pts * 100 : 0; });
  const cle = topTriV === "eff" ? "eff" : "dmg";
  gardes.sort((a,b) => b[cle] - a[cle]);
  return gardes;
}
function renderTop(){
  const host = el("topList"); if(!host) return;
  const rows = palmares().slice(0, 40);
  const sousTitre = el("topSub");
  if(!rows.length){
    host.innerHTML = '<div class="empty">Rien à classer : aucune arme pour cette phase.</div>';
    if(sousTitre) sousTitre.textContent = "";
    return;
  }
  if(sousTitre) sousTitre.textContent =
    "Contre " + SIM.tgtName + " ×" + S.models + motsCibleEnClair().replace(/^ · /, ", ") +
    ". " + (topQuoiV === "unite"
      ? "Toutes les armes de la fiche pour cette phase, additionnées."
      : "Une ligne par arme, à l'effectif maximum de son unité.") +
    " Les quarante premières.";
  const cle = topTriV === "eff" ? "eff" : "dmg";
  const max = rows[0][cle] || 1;
  host.className = "top";
  host.innerHTML = rows.map((r, i)=>
    '<div class="tr' + (i < 3 ? ' podium' : '') + (r.mien ? ' mien' : '') + '">' +
    '<span class="rg">' + (i+1) + '</span>' +
    '<span class="tn"><b>' + (r.groupe ? r.unite : r.arme) + '</b>' +
    '<i>' + (r.groupe
      ? r.combien + ' arme' + (r.combien>1?'s':'') + ' · ×' + r.n + ' · ' + r.pts + ' pts'
      : r.unite + ' · ×' + r.n + ' · ' + r.pts + ' pts') + '</i></span>' +
    '<span class="tv"><b>' + num(r[cle]) + '</b><i>' +
      (topTriV === "eff" ? 'PV / 100 pts' : 'PV') + '</i></span>' +
    '<span class="bar"><span style="width:' +
      Math.max(1.5, (r[cle]/max)*100) + '%"></span></span></div>').join("");
}

/* ==========================================================
   IMPORT / EXPORT
   ========================================================== */
/* ==========================================================
   PARTAGE : texte, impression, sauvegarde, import
   ========================================================== */
/* le texte que les organisateurs de tournoi attendent : lisible,
   sans mise en forme, chaque unite avec son cout et son armement */
function listeEnTexte(L){
  L = L || R;
  const lignes = [];
  const pts = pointsDe(L);
  lignes.push(L.nom + " — Nécrons — " + pts + " / " + L.cap + " pts");
  lignes.push("Détachement : " + (L.detach.length ? L.detach.map(nomDetach).join(" + ") : "aucun"));
  if(L.fd) lignes.push("Disposition de Force : " + L.fd);
  lignes.push("");

  const parCat = {};
  L.units.forEach(ru => {
    const c = categorie(ru.name);
    (parCat[c] = parCat[c] || []).push(ru);
  });
  const rgExp = rangsArmee();
  CAT_ORDRE.forEach(cat => {
    const lot = parCat[cat]; if(!lot || !lot.length) return;
    lignes.push("+ " + cat.toUpperCase() + " +");
    lignes.push("");
    lot.forEach(ru => {
      const u = unitRow(ru.name); if(!u) return;
      const tete = (estGroupe(ru) && ru.grp ? ru.grp + " — " : "") +
        ru.name + " ×" + ru.size + " (" + pointsUnite(ru) + " pts)";
      lignes.push(tete);
      const wl = unitWeps(ru.name);
      const portE = portParArme(ru), vusE = {};
      Object.keys(portE).forEach(k => {
        const i = +k, n = portE[i], w = wl[i];
        if(!n || !w) return;
        const g = groupeDe(ru.name, i);
        if(g){ if(vusE[g.base]) return; vusE[g.base] = 1; }
        lignes.push("  • " + n + "× " + (g ? g.libelle : w[1]));
      });
      ru.chars.forEach((c, ic) => {
        const cu = unitRow(c.name); if(!cu) return;
        lignes.push("  ‣ " + c.name + " (" + ptsPour(cu, cu[6][0], rgExp["c" + ru.id + "." + ic]) + " pts)");
        groupesPortes(c.name, portParArmePerso(c)).forEach(g =>
          lignes.push("      • " + g.libelle));
      });
      if(ru.enh){
        const e = enhRow(ru.enh);
        const pe = porteurRetenu(ru);
        lignes.push("  ★ " + ru.enh + " (" + (e && typeof e[1] === "number" ? e[1] + " pts" : "coût inconnu") + ")" +
          (pe === null ? "" : " — " + nomPorteur(ru, pe)));
      }
      lignes.push("");
    });
  });
  lignes.push("Total : " + pts + " pts sur " + L.cap + ".");
  const av = validate();
  if(av.length) lignes.push("À vérifier : " + av.length + " avertissement" + (av.length > 1 ? "s" : "") +
    " dans l'application.");
  return lignes.join("\n");
}

function renderPartage(){
  const z = el("listTxt"); if(!z) return;
  z.textContent = listeEnTexte();
  const q = el("qrHost"); if(q){ q.hidden = true; q.innerHTML = ""; }
  const r = el("importRap"); if(r) r.innerHTML = "";
}

/* le presse-papier moderne n'existe pas partout : on retombe sur la
   selection quand il manque */
function copier(txt, quoi){
  const fini = ok => toast(ok ? quoi + " copié." : "Copie refusée par le navigateur — sélectionne le texte à la main.", "", null);
  if(navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(txt).then(()=> fini(true), ()=> fini(false));
  else {
    try{
      const t = document.createElement("textarea");
      t.value = txt; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      fini(document.execCommand("copy"));
      document.body.removeChild(t);
    }catch(e){ fini(false); }
  }
}

/* impression : on ouvre une fenetre propre plutot que d'imprimer
   l'application, dont la mise en page ne s'y prete pas */
function imprimeListe(){
  const w = window.open("", "_blank");
  if(!w){ toast("Le navigateur a bloqué la fenêtre d'impression.", "", null); return; }
  const esc = t => String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  w.document.write('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">' +
    '<title>' + esc(R.nom) + '</title><style>' +
    'body{font:13px/1.55 ui-monospace,Menlo,monospace;margin:26px;color:#111;max-width:720px}' +
    'h1{font-size:17px;letter-spacing:.04em;margin:0 0 14px;border-bottom:2px solid #111;padding-bottom:6px}' +
    'pre{white-space:pre-wrap;margin:0;font:inherit}' +
    '@page{margin:16mm}</style></head><body><h1>' + esc(R.nom) + '</h1><pre>' +
    esc(listeEnTexte()) + '</pre></body></html>');
  w.document.close();
  w.focus();
  setTimeout(()=>{ try{ w.print(); }catch(e){} }, 250);
}

/* sauvegarde de toutes les listes dans un fichier */
function sauvegardeTout(){
  const payload = { app: "necron-aide-jeu", v: 1, listes: LISTS, strats: SUSER };
  const blob = new Blob([JSON.stringify(payload, null, 1)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "listes-necrons.json";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast(LISTS.length + " liste" + (LISTS.length > 1 ? "s" : "") + " sauvegardée" +
    (LISTS.length > 1 ? "s" : "") + ".", "", null);
}

function rapport(lignes){
  const host = el("importRap"); if(!host) return;
  host.innerHTML = lignes.map(l =>
    '<div class="ir' + (l.warn ? " warn" : "") + '">' + l.txt + '</div>').join("");
}

/* ==========================================================
   QR CODE — encodeur autonome, mode octet, correction L.
   Ecrit ici plutot qu'importe : l'application n'a aucune
   dependance et doit tourner depuis un simple fichier.
   ========================================================== */
const QR = (function(){
  /* corps de Galois GF(256), polynome 0x11D */
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for(let i=0, x=1; i<255; i++){
    EXP[i] = x; LOG[x] = i;
    x <<= 1; if(x & 256) x ^= 0x11D;
  }
  for(let i=255; i<512; i++) EXP[i] = EXP[i-255];
  const mul = (a,b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;

  /* polynome generateur de n symboles de correction */
  function gen(n){
    let p = [1];
    for(let i=0; i<n; i++){
      const q = new Array(p.length + 1).fill(0);
      for(let j=0; j<p.length; j++){
        q[j] ^= p[j];                    /* x · p */
        q[j+1] ^= mul(p[j], EXP[i]);     /* α^i · p */
      }
      p = q;
    }
    return p;
  }
  function ecc(data, n){
    const g = gen(n), res = new Array(data.length + n).fill(0);
    for(let i=0; i<data.length; i++) res[i] = data[i];
    for(let i=0; i<data.length; i++){
      const c = res[i];
      if(!c) continue;
      for(let j=0; j<g.length; j++) res[i+j] ^= mul(g[j], c);
    }
    return res.slice(data.length);
  }

  /* niveau L : [symboles de correction par bloc, blocs G1, donnees G1, blocs G2, donnees G2] */
  const BLOCS = [null,
   [7,1,19,0,0],[10,1,34,0,0],[15,1,55,0,0],[20,1,80,0,0],[26,1,108,0,0],
   [18,2,68,0,0],[20,2,78,0,0],[24,2,97,0,0],[30,2,116,0,0],[18,2,68,2,69],
   [20,4,81,0,0],[24,2,92,2,93],[26,4,107,0,0],[30,3,115,1,116],[22,5,87,1,88],
   [24,5,98,1,99],[28,1,107,5,108],[30,5,120,1,121],[28,3,113,4,114],[28,3,107,5,108],
   [28,4,116,4,117],[28,2,111,7,112],[30,4,121,5,122],[30,6,117,4,118],[26,8,106,4,107],
   [28,10,114,2,115],[30,8,122,4,123],[30,3,117,10,118],[30,7,116,7,117],[30,5,115,10,116],
   [30,13,115,3,116],[30,17,115,0,0],[30,17,115,1,116],[30,13,115,6,116],[30,12,121,7,122],
   [30,6,121,14,122],[30,17,122,4,123],[30,4,122,18,123],[30,20,117,4,118],[30,19,118,6,119]];

  const ALIGN = [null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],
   [6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],
   [6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],
   [6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],
   [6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],
   [6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],
   [6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],
   [6,26,54,82,110,138,166],[6,30,58,86,114,142,170]];

  const donneesDe = v => { const b = BLOCS[v]; return b[1]*b[2] + b[3]*b[4]; };

  /* BCH : 10 bits pour le format, 12 pour la version */
  function bch(v, poly, n){
    let d = v << n;
    const lg = x => { let l = 0; while(x){ l++; x >>= 1; } return l; };
    const lp = lg(poly);
    while(lg(d) >= lp) d ^= poly << (lg(d) - lp);
    return d;
  }

  function encode(txt){
    const bytes = new TextEncoder().encode(txt);
    let v = 0;
    for(let i=1; i<=40; i++){
      const cc = i < 10 ? 8 : 16;
      if(donneesDe(i) * 8 >= 4 + cc + bytes.length * 8){ v = i; break; }
    }
    if(!v) throw new Error("trop long pour un QR code");

    /* flux binaire : mode octet, longueur, donnees, terminaison */
    const bits = [];
    const put = (val, n) => { for(let i=n-1; i>=0; i--) bits.push((val >> i) & 1); };
    put(4, 4);
    put(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(b => put(b, 8));
    const cap = donneesDe(v) * 8;
    for(let i=0; i<4 && bits.length < cap; i++) bits.push(0);
    while(bits.length % 8) bits.push(0);
    const mots = [];
    for(let i=0; i<bits.length; i+=8){
      let b = 0; for(let j=0; j<8; j++) b = (b << 1) | bits[i+j];
      mots.push(b);
    }
    const REMPLIS = [0xEC, 0x11];
    for(let i=0; mots.length < donneesDe(v); i++) mots.push(REMPLIS[i % 2]);

    /* decoupage en blocs, correction, entrelacement */
    const [nec, b1, d1, b2, d2] = BLOCS[v];
    const blocs = [], eccs = [];
    let p = 0;
    for(let i=0; i<b1; i++){ blocs.push(mots.slice(p, p+d1)); p += d1; }
    for(let i=0; i<b2; i++){ blocs.push(mots.slice(p, p+d2)); p += d2; }
    blocs.forEach(b => eccs.push(ecc(b, nec)));
    const flux = [];
    const maxD = Math.max(d1, d2);
    for(let i=0; i<maxD; i++) blocs.forEach(b => { if(i < b.length) flux.push(b[i]); });
    for(let i=0; i<nec; i++) eccs.forEach(e => flux.push(e[i]));

    /* trame */
    const n = v * 4 + 17;
    const m = [], res = [];
    for(let i=0; i<n; i++){ m.push(new Uint8Array(n)); res.push(new Uint8Array(n)); }
    const pose = (r, c, val) => { m[r][c] = val; res[r][c] = 1; };

    const reperes = (r, c) => {
      for(let i=-1; i<=7; i++) for(let j=-1; j<=7; j++){
        const y = r+i, x = c+j;
        if(y < 0 || y >= n || x < 0 || x >= n) continue;
        const bord = (i >= 0 && i <= 6 && (j === 0 || j === 6)) ||
                     (j >= 0 && j <= 6 && (i === 0 || i === 6));
        const coeur = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        pose(y, x, (bord || coeur) ? 1 : 0);
      }
    };
    reperes(0, 0); reperes(0, n-7); reperes(n-7, 0);

    /* les trois coins portent deja un repere : ces mires-la n'existent pas.
       Toutes les autres se posent, y compris sur la ligne de synchronisation. */
    const A = ALIGN[v], der = A[A.length-1];
    A.forEach(r => A.forEach(c => {
      if((r === 6 && c === 6) || (r === 6 && c === der) || (r === der && c === 6)) return;
      for(let i=-2; i<=2; i++) for(let j=-2; j<=2; j++)
        pose(r+i, c+j, (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) ? 1 : 0);
    }));

    for(let i=8; i<n-8; i++){ pose(6, i, i % 2 === 0 ? 1 : 0); pose(i, 6, i % 2 === 0 ? 1 : 0); }
    pose(n-8, 8, 1);

    /* emplacements du format, reserves avant le remplissage */
    for(let i=0; i<9; i++){ if(!res[8][i]) pose(8, i, 0); if(!res[i][8]) pose(i, 8, 0); }
    for(let i=0; i<8; i++){ if(!res[8][n-1-i]) pose(8, n-1-i, 0); if(!res[n-1-i][8]) pose(n-1-i, 8, 0); }
    if(v >= 7){
      const vb = (v << 12) | bch(v, 0x1F25, 12);
      for(let i=0; i<18; i++){
        const b = (vb >> i) & 1;
        pose(Math.floor(i/3), n-11 + (i%3), b);
        pose(n-11 + (i%3), Math.floor(i/3), b);
      }
    }

    /* remplissage en zigzag, de droite a gauche */
    let bit = 0, montant = true;
    const flot = [];
    flux.forEach(b => { for(let i=7; i>=0; i--) flot.push((b >> i) & 1); });
    for(let col = n-1; col > 0; col -= 2){
      if(col === 6) col--;
      for(let k=0; k<n; k++){
        const r = montant ? n-1-k : k;
        for(let d=0; d<2; d++){
          const c = col - d;
          if(res[r][c]) continue;
          m[r][c] = bit < flot.length ? flot[bit] : 0;
          bit++;
        }
      }
      montant = !montant;
    }

    /* masques : on garde celui qui penalise le moins */
    const MASQUES = [
      (r,c)=>(r+c)%2===0, (r)=>r%2===0, (r,c)=>c%3===0, (r,c)=>(r+c)%3===0,
      (r,c)=>(Math.floor(r/2)+Math.floor(c/3))%2===0, (r,c)=>(r*c)%2+(r*c)%3===0,
      (r,c)=>((r*c)%2+(r*c)%3)%2===0, (r,c)=>((r+c)%2+(r*c)%3)%2===0
    ];
    let best = null, bestP = Infinity;
    for(let k=0; k<8; k++){
      const g = m.map(l => Uint8Array.from(l));
      for(let r=0; r<n; r++) for(let c=0; c<n; c++)
        if(!res[r][c] && MASQUES[k](r,c)) g[r][c] ^= 1;
      /* format : 01 pour le niveau L, puis le numero de masque */
      const fb = (((1 << 3) | k) << 10 | bch((1 << 3) | k, 0x537, 10)) ^ 0x5412;
      for(let i=0; i<15; i++){
        const b = (fb >> i) & 1;
        /* copie verticale : colonne 8 en haut, puis en bas */
        if(i < 6) g[i][8] = b;
        else if(i < 8) g[i+1][8] = b;
        else g[n-15+i][8] = b;
        /* copie horizontale : ligne 8 a droite, puis a gauche */
        if(i < 8) g[8][n-1-i] = b;
        else if(i === 8) g[8][7] = b;
        else g[8][14-i] = b;
      }
      g[n-8][8] = 1;
      const p = penalite(g, n);
      if(p < bestP){ bestP = p; best = g; }
    }
    return best;
  }

  function penalite(g, n){
    let p = 0, sombres = 0;
    const serie = (get) => {
      for(let a=0; a<n; a++){
        let run = 1;
        for(let b=1; b<n; b++){
          if(get(a,b) === get(a,b-1)) run++;
          else { if(run >= 5) p += 3 + (run - 5); run = 1; }
        }
        if(run >= 5) p += 3 + (run - 5);
      }
    };
    serie((a,b)=>g[a][b]); serie((a,b)=>g[b][a]);
    for(let r=0; r<n-1; r++) for(let c=0; c<n-1; c++){
      const v = g[r][c];
      if(v === g[r][c+1] && v === g[r+1][c] && v === g[r+1][c+1]) p += 3;
    }
    const MOTIF = [1,0,1,1,1,0,1,0,0,0,0];
    const cherche = (get) => {
      for(let a=0; a<n; a++) for(let b=0; b+11<=n; b++){
        let ok = true;
        for(let i=0; i<11; i++) if(get(a,b+i) !== MOTIF[i]){ ok = false; break; }
        if(ok) p += 40;
        ok = true;
        for(let i=0; i<11; i++) if(get(a,b+i) !== MOTIF[10-i]){ ok = false; break; }
        if(ok) p += 40;
      }
    };
    cherche((a,b)=>g[a][b]); cherche((a,b)=>g[b][a]);
    for(let r=0; r<n; r++) for(let c=0; c<n; c++) if(g[r][c]) sombres++;
    p += Math.floor(Math.abs(sombres * 100 / (n*n) - 50) / 5) * 10;
    return p;
  }

  return { encode: encode };
})();

/* dessine la matrice dans un canvas, marge de quatre modules */
function dessineQR(txt, taille){
  const m = QR.encode(txt), n = m.length, q = 4, tot = n + q*2;
  const px = Math.max(1, Math.floor((taille || 560) / tot));
  const cv = document.createElement("canvas");
  cv.width = cv.height = tot * px;
  const g = cv.getContext("2d");
  g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = "#000";
  for(let r=0; r<n; r++) for(let c=0; c<n; c++)
    if(m[r][c]) g.fillRect((c+q)*px, (r+q)*px, px, px);
  return { canvas: cv, version: (n - 17) / 4 };
}

function exportImport(){
  const txt = JSON.stringify({nom:R.nom, cap:R.cap, detach:R.detach, units:R.units});
  const v = prompt("Copie ce texte pour sauvegarder ta liste, ou colle-en un autre pour l'importer " +
    "— la liste importée s'ajoutera aux tiennes :", txt);
  if(v === null || v === txt) return;
  try{
    const o = JSON.parse(v);
    if(!o || !Array.isArray(o.units)) throw 0;
    const L = listeVierge(o.nom || "Liste importée", o.cap || 2000);
    L.detach = o.detach || [];
    L.units = o.units;
    normaliseListe(L);
    LISTS.push(L); ouvre(L);
    saveR(); renderList();
  }catch(e){ alert("Liste illisible — rien n'a été modifié."); }
}

/* ==========================================================
   LIEN DE PARTAGE
   la liste tient dans l'URL : JSON reduit -> gzip -> base64url,
   ce qui permet de passer une liste d'un appareil a l'autre
   sans serveur ni compte.
   ========================================================== */
const B64A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function b64u(bytes){
  let s = "";
  for(let i=0; i<bytes.length; i+=3){
    const a = bytes[i], b = bytes[i+1], c = bytes[i+2];
    s += B64A[a >> 2] + B64A[((a & 3) << 4) | ((b || 0) >> 4)];
    if(b === undefined) break;
    s += B64A[((b & 15) << 2) | ((c || 0) >> 6)];
    if(c === undefined) break;
    s += B64A[c & 63];
  }
  return s;
}
function unb64u(str){
  const n = str.length, out = new Uint8Array(Math.floor(n * 3 / 4));
  let p = 0, buf = 0, bits = 0;
  for(let i=0; i<n; i++){
    const v = B64A.indexOf(str[i]);
    if(v < 0) throw 0;
    buf = (buf << 6) | v; bits += 6;
    if(bits >= 8){ bits -= 8; out[p++] = (buf >> bits) & 255; }
  }
  return out.subarray(0, p);
}

/* on ne transporte que ce qui n'est pas reconstructible : ni id ni points */
const packList = () => ({
  t: R.nom, p: R.cap,
  d: R.detach, f: R.fd || "",
  u: R.units.map(ru => ({ n: ru.name, s: ru.size, l: ru.lo, c: ru.chars, x: ru.sel ? 1 : 0,
    g: ru.grp || "", e: ru.enh || "", ep: ru.enhP || "" }))
});

async function encodeList(){
  const bytes = new TextEncoder().encode(JSON.stringify(packList()));
  if(self.CompressionStream){
    try{
      const buf = await new Response(new Blob([bytes]).stream()
        .pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
      return "1" + b64u(new Uint8Array(buf));
    }catch(e){}
  }
  return "0" + b64u(bytes);
}
async function decodeList(code){
  const raw = unb64u(code.slice(1));
  let bytes;
  if(code[0] === "1"){
    const buf = await new Response(new Blob([raw]).stream()
      .pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    bytes = new Uint8Array(buf);
  } else if(code[0] === "0"){ bytes = raw; }
  else throw 0;
  return JSON.parse(new TextDecoder().decode(bytes));
}

/* une liste recue arrive a cote des tiennes, elle n'en ecrase aucune */
function applyPacked(o){
  if(!o || !Array.isArray(o.u)) throw 0;
  const L = listeVierge(o.t || "Liste reçue", o.p || 2000);
  L.detach = Array.isArray(o.d) ? o.d : [];
  L.fd = o.f || "";
  L.units = o.u.map(u => ({
    id: L.nextId++, name: u.n, size: u.s, lo: u.l || [], chars: u.c || [], sel: u.x !== 0,
    grp: u.g || nomGroupe(), enh: migreEnh(u.e || null), enhP: u.ep || ""
  }));
  LISTS.push(L); ouvre(L);
  saveR(); renderList();
}

async function shareLink(){
  /* depuis un fichier ouvert en local, le lien porte un chemin file:// qui
     ne veut rien dire sur une autre machine : on renvoie vers l'export */
  if(location.protocol === "file:"){
    alert("Cette copie est ouverte depuis un fichier local : un lien de partage n'y " +
      "serait valable que sur cet ordinateur.\n\nUtilise « Exporter / importer la liste » " +
      "pour passer ta liste d'un appareil à l'autre, ou la sauvegarde en fichier.");
    return;
  }
  if(!R.units.length){ alert("Ta liste est vide — ajoute au moins une unité avant de la partager."); return; }
  let url;
  try{ url = location.href.replace(/#.*$/, "") + "#l=" + await encodeList(); }
  catch(e){ alert("Impossible de fabriquer le lien de partage."); return; }
  if(navigator.share){
    try{ await navigator.share({ title: "Ma liste Nécrons", url: url }); return; }
    catch(e){ if(e && e.name === "AbortError") return; }
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    try{
      await navigator.clipboard.writeText(url);
      alert("Lien copié. Ouvre-le sur l'autre appareil pour y charger la liste.");
      return;
    }catch(e){}
  }
  prompt("Copie ce lien pour ouvrir la liste sur un autre appareil :", url);
}

/* le lien, tel quel : le QR code et la copie s'en servent tous deux */
async function lienDeListe(){
  if(location.protocol === "file:") return "";
  if(!R.units.length) return "";
  try{ return location.href.replace(/#.*$/, "") + "#l=" + await encodeList(); }
  catch(e){ return ""; }
}

async function afficheQR(){
  const host = el("qrHost"); if(!host) return;
  const url = await lienDeListe();
  host.hidden = false;
  if(!url){
    host.innerHTML = '<p>' + (location.protocol === "file:"
      ? "Cette copie est ouverte depuis un fichier local : le lien n'aurait de sens que sur cet ordinateur. Sauvegarde tes listes dans un fichier pour les transporter."
      : "Ta liste est vide — ajoute au moins une unité.") + '</p>';
    return;
  }
  host.innerHTML = "";
  try{
    const q = dessineQR(url);
    host.appendChild(q.canvas);
    const p = document.createElement("p");
    p.textContent = "Version " + q.version + " · " + url.length +
      " caractères. Vise-le avec l'autre appareil pour y ouvrir la liste.";
    host.appendChild(p);
  }catch(e){
    host.innerHTML = '<p>Liste trop longue pour tenir dans un QR code (' + url.length +
      ' caractères). Passe par le lien ou par la sauvegarde en fichier.</p>';
  }
}

/* ==========================================================
   IMPORT BATTLESCRIBE
   Un .ros est du XML : on y cherche les selections qui portent
   un profil d'unite, on rapproche les noms de notre catalogue
   et on dit franchement ce qui n'a pas ete reconnu.
   ========================================================== */
function importeRos(txt){
  let doc;
  try{ doc = new DOMParser().parseFromString(txt, "application/xml"); }
  catch(e){ rapport([{txt:"Fichier illisible.", warn:true}]); return; }
  if(doc.querySelector("parsererror")){
    rapport([{txt:"Ce fichier n'est pas un XML valide. Un .rosz est une archive : décompresse-la d'abord, le .ros est dedans.", warn:true}]);
    return;
  }
  const nom = (doc.documentElement.getAttribute("name") || "Liste importée").trim();
  const cle = s => String(s).toLowerCase().replace(/\[legends\]/g, "").replace(/[^a-z0-9]/g, "");
  const catalogue = {};
  UNITS.forEach(u => catalogue[cle(u[0])] = u);

  const trouvees = [], inconnues = [];
  const selections = doc.getElementsByTagName("selection");
  for(let i=0; i<selections.length; i++){
    const sel = selections[i];
    const type = sel.getAttribute("type");
    if(type !== "unit" && type !== "model") continue;
    const n = (sel.getAttribute("name") || "").trim();
    if(!n) continue;
    const u = catalogue[cle(n)];
    /* une entree imbriquee dans une unite deja reconnue est une figurine
       de cette unite, pas une unite de plus */
    const parent = sel.parentNode && sel.parentNode.parentNode;
    const dansUnite = parent && parent.nodeName === "selection" &&
      (parent.getAttribute("type") === "unit" || parent.getAttribute("type") === "model");
    if(dansUnite) continue;
    if(u) trouvees.push({ u: u, n: parseInt(sel.getAttribute("number"), 10) || 1, brut: n });
    else if(inconnues.indexOf(n) < 0) inconnues.push(n);
  }

  if(!trouvees.length){
    rapport([{txt:"Aucune unité nécron reconnue dans ce fichier. Il vient peut-être d'une autre faction.", warn:true}]);
    return;
  }
  const L = listeVierge(nom, R.cap || 2000);
  L.nextId = 1;
  trouvees.forEach(t => {
    const u = t.u;
    /* la taille du .ros ne se lit pas de facon fiable : on prend la plus
       petite compatible et on laisse regler a la main */
    const sz = u[6][0];
    L.units.push({ id: L.nextId++, name: u[0], size: sz, lo:loParDefaut(u[0], sz),
      chars: [], sel: true, grp: "", enh: null });
  });
  normaliseListe(L);
  LISTS.push(L); ouvre(L);
  saveR(); renderList();
  const lignes = [{txt: "<b>" + L.units.length + " unité" + (L.units.length > 1 ? "s" : "") +
    "</b> importée" + (L.units.length > 1 ? "s" : "") + " dans « " + nom + " ». " +
    "Effectifs et armement sont posés au minimum : à régler unité par unité."}];
  if(inconnues.length) lignes.push({warn:true, txt: "<b>" + inconnues.length +
    " entrée" + (inconnues.length > 1 ? "s non reconnues" : " non reconnue") + "</b> : " +
    inconnues.slice(0, 12).join(", ") + (inconnues.length > 12 ? "…" : "") + "."});
  rapport(lignes);
}

async function readSharedLink(){
  const m = /[#&]l=([A-Za-z0-9\-_]+)/.exec(location.hash || "");
  if(!m) return;
  try{
    const o = await decodeList(m[1]);
    const n = (o.u || []).length;
    if(confirm("Ce lien contient « " + (o.t || "une liste") + " », " + n + " unité" +
      (n>1?"s":"") + ". L'ajouter à tes listes ? Les tiennes ne sont pas touchées."))
      applyPacked(o);
  }catch(e){ alert("Ce lien de partage est illisible — ta liste n'a pas été modifiée."); }
  /* on nettoie l'URL pour ne pas reproposer l'import a chaque rechargement */
  try{ history.replaceState(null, "", location.href.replace(/#.*$/, "")); }catch(e){}
}

/* ==========================================================
   INIT
   ========================================================== */
/* pourquoi ce detachement est indisponible, "" s'il l'est */
function detachBloque(d){
  if(R.detach.indexOf(d[0]) >= 0) return "déjà pris";
  const reste = capDP() - totalDP();
  if(d[1] > reste) return reste > 0
    ? "coûte " + d[1] + " PD, il n'en reste que " + reste
    : "plus de Points de Détachement";
  if(d[2] && R.detach.some(n => { const a = detachRow(n); return a && a[2] === d[2]; }))
    return "tag " + d[2] + " déjà utilisé";
  return "";
}

function initDetachSheet(){
  const host = el("dList"); host.innerHTML = "";
  const reste = capDP() - totalDP();
  const tete = document.createElement("div");
  tete.className = "sheet-sep";
  tete.textContent = reste > 0
    ? reste + " Point" + (reste > 1 ? "s" : "") + " de Détachement disponible" + (reste > 1 ? "s" : "")
    : "Budget de Points de Détachement épuisé";
  host.appendChild(tete);

  let dispo = 0;
  DETACHMENTS.forEach(d=>{
    const raison = detachBloque(d), pris = R.detach.indexOf(d[0]) >= 0;
    if(!raison) dispo++;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt" + (pris ? " sel" : "") + (raison ? " opt-off" : "");
    if(raison) b.disabled = true;
    b.innerHTML = '<span class="oi"><span class="o1">' + nomDetach(d[0]) + '</span>' +
      '<span class="o2">' + d[1] + ' PD · ' + d[3] + (d[2] ? ' · tag ' + d[2] : '') +
      (raison ? ' — ' + raison : '') + '</span></span>' +
      (d[8] ? '<span class="otag dispo">' + d[8] + '</span>' :
        (d[5] ? '<span class="otag">DÉS</span>' : ''));
    if(!raison) b.addEventListener("click", ()=>{
      R.detach.push(d[0]);
      closeSheet("sheetDetach"); saveR(); renderList();
    });
    host.appendChild(b);
  });
  if(!dispo){
    const m = document.createElement("div");
    m.className = "sheet-empty";
    m.textContent = reste > 0
      ? "Aucun détachement compatible avec ceux déjà pris."
      : "Retire un détachement pour en prendre un autre.";
    host.appendChild(m);
  }
}

/* ==========================================================
   NAVIGATION
   Trois axes : les listes, le simulateur, l'aide de jeu.
   L'axe des listes s'ouvre sur leur index ; on entre dans
   l'editeur en touchant une liste, on en ressort par la barre
   de retour.
   ========================================================== */
function vaVers(id){
  el("tabs").querySelectorAll("button").forEach(x=>x.classList.toggle("on", x.dataset.s === id));
  document.querySelectorAll(".screen").forEach(sc=>sc.classList.toggle("on", sc.id === id));
  window.scrollTo(0,0);
  el("headSum").style.display = (id === "scSim" && el("subAtk").classList.contains("on")) ? "" : "none";
  if(id === "scList") renderList();
  if(id === "scPlay") renderPlay();
  majRetour();
}
el("tabs").querySelectorAll("button").forEach(b=>
  b.addEventListener("click", ()=> vaVers(b.dataset.s)));

/* sous-onglets du simulateur */
el("simTabs").querySelectorAll("button").forEach(b=>{
  b.addEventListener("click", ()=>{
    el("simTabs").querySelectorAll("button").forEach(x=>x.classList.toggle("on", x===b));
    document.querySelectorAll("#scSim .sub").forEach(v=>v.classList.toggle("on", v.id === b.dataset.v));
    window.scrollTo(0,0);
    el("headSum").style.display = (b.dataset.v === "subAtk") ? "" : "none";
    if(b.dataset.v === "subCmp"){ syncTarget(); renderCmpList(); }
    if(b.dataset.v === "subGrp"){ syncTarget(); renderGrpList(); }
    if(b.dataset.v === "subTop"){ syncTarget(); renderTop(); }
    if(b.dataset.v === "subDef") renderDef();
  });
});

/* index <-> editeur */
function ouvreEditeur(id){
  if(id) ouvreListe(id);
  el("listIndex").hidden = true;
  el("listEditor").hidden = false;
  fermePanneau();
  majRetour();
}
function fermeEditeur(){
  el("listEditor").hidden = true;
  el("listIndex").hidden = false;
  majRetour();
  renderIndex(); window.scrollTo(0,0);
}
el("btnBackIndex").addEventListener("click", fermeEditeur);
el("btnBackPad").addEventListener("click", fermePanneau);
/* Le meme retour, mais dans l'en-tete collante : les barres de retour en
   place restent en haut du document et disparaissent des qu'on descend
   dans une unite. Celui-ci suit le pouce, comme « Enregistrer ». */
function majRetour(){
  const b = el("btnBack"); if(!b) return;
  const surListes = el("scList") && el("scList").classList.contains("on");
  const dansEditeur = surListes && !el("listEditor").hidden;
  const dansPanneau = dansEditeur && !el("btnBackPad").hidden;
  b.hidden = !dansEditeur;
  const hb = document.querySelector(".hbar");
  if(hb) hb.classList.toggle("retour", dansEditeur);
  if(!dansEditeur) return;
  b.querySelector(".bt").textContent = dansPanneau ? "Le pavé" : "Mes listes";
  b.setAttribute("aria-label", dansPanneau ? "Revenir au pavé" : "Revenir à mes listes");
}
el("btnBack").addEventListener("click", ()=>{
  if(el("listEditor").hidden) return;
  if(!el("btnBackPad").hidden) fermePanneau(); else fermeEditeur();
});
if(el("btnReorder")) el("btnReorder").addEventListener("click", ()=>{
  finGlisse();
  modeRange = !modeRange;
  /* on reorganise sur le pave entier : un filtre ou un repli fausserait
     la place ou la case retombe */
  if(modeRange) padQ = "";
  renderPad();
});
if(el("btnPadGrp")) el("btnPadGrp").addEventListener("click", ()=>{
  padGroupe = !padGroupe; renderPad();
});
if(el("padQ")) el("padQ").addEventListener("input", e=>{
  padQ = e.target.value; renderPad();
});
if(el("btnPadQClear")) el("btnPadQClear").addEventListener("click", ()=>{
  padQ = ""; renderPad();
  const c = el("padQ"); if(c) c.focus();
});
el("btnNewList2").addEventListener("click", ()=>{ nouvelleListe(); ouvreEditeur(); });
function syncTarget(){
  el("ptName5").textContent = SIM.tgtName;
  el("ptSub5").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models + motsCibleEnClair();
  el("ptName4").textContent = SIM.tgtName;
  el("ptSub4").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models + motsCibleEnClair();
  el("ptName3").textContent = SIM.tgtName;
  el("ptSub3").textContent = "E" + S.tough + " · Svg " + S.sv + "+" + (S.inv ? " / " + S.inv + "++" : "") +
    " · " + S.wounds + " PV × " + S.models + (S.fnp ? " · FNP " + S.fnp + "+" : "") +
    (S.dmgRed ? " · -" + S.dmgRed + " dégât" : "");
}

/* ce que la cible est, en clair, pour les ecrans qui n'ont pas la place
   d'afficher les pastilles */
function motsCibleEnClair(){
  const tbl = (typeof MOTS_CIBLE !== "undefined") ? MOTS_CIBLE : [];
  const v = tbl.filter(([k]) => (S.kwCible || {})[k]).map(x => x[1]);
  return v.length ? " · " + v.join(", ") : "";
}
el("pickTarget4").addEventListener("click", ()=> el("pickTarget").click());
el("pickTarget5").addEventListener("click", ()=> el("pickTarget").click());
[["topPhase","p",v=>{topPhaseV=v}], ["topQuoi","q",v=>{topQuoiV=v}],
 ["topOu","o",v=>{topOuV=v}], ["topTri","t",v=>{topTriV=v}]].forEach(([id, cle, pose])=>{
  const h = el(id); if(!h) return;
  h.querySelectorAll(".chip").forEach(b=>
    b.addEventListener("click", ()=>{
      pose(b.dataset[cle]);
      h.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
      renderTop();
    }));
});
el("btnGrpRoster").addEventListener("click", ouvreGrpPick);
el("grpPhase").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    grpPhaseV = b.dataset.p;
    el("grpPhase").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderGrpList();
  }));
["pickListeSim", "pickListePlay"].forEach(id=>{
  const b = el(id); if(b) b.addEventListener("click", ouvreChoixListe);
});
el("btnAddDetach").addEventListener("click", ()=>{ initDetachSheet(); openSheet("sheetDetach"); });
el("btnExport2").addEventListener("click", exportImport);
el("btnAddStrat").addEventListener("click", ()=>{
  if(!R.detach.length){ toast("Choisis d'abord un détachement.", "", null); return; }
  const nom = prompt("Nom du stratagème, tel qu'il figure sur ta fiche :", "");
  if(!nom || !nom.trim()) return;
  const det = R.detach.length === 1 ? R.detach[0]
    : (prompt("De quel détachement ?\n" + R.detach.join("\n"), R.detach[0]) || "").trim();
  if(R.detach.indexOf(det) < 0){ toast("Détachement inconnu.", "", null); return; }
  SUSER.ajouts.push([nom.trim(), det, "", 1, "", "", "", ""]);
  saveS(); renderStrats(); renderPartie();
  toast(nom.trim() + " ajouté — touche-le pour saisir son texte.", "", null);
});
if(el("listDispo")) el("listDispo").addEventListener("change", ()=>{
  R.fd = el("listDispo").value.trim(); saveR(); renderList();
});

/* boutons du suivi de partie */
el("btnReanime").addEventListener("click", ()=>{
  if(!R) return;
  let n = 0;
  R.units.forEach(ru=>{
    const e = etat(ru), max = pvMax(ru);
    if(e.pv <= 0 || e.pv >= max) return;
    const g = d3();
    e.pv = Math.min(max, e.pv + g);
    n++;
  });
  noteJournal(n ? "Réanimation de " + n + " unité" + (n > 1 ? "s" : "") : "Réanimation : rien à relever");
  saveG(); renderPartie();
  toast(n ? n + " unité" + (n > 1 ? "s réanimées" : " réanimée") + "." : "Aucune unité à réanimer.", "", null);
});
el("btnResetPV").addEventListener("click", ()=>{
  if(!R) return;
  R.units.forEach(ru=>{ const e = etat(ru); e.pv = pvMax(ru); e.c = ru.chars.map(c => pvMaxChar(c.name)); });
  noteJournal("Toutes les unités remises à neuf");
  saveG(); renderPartie();
});
el("btnNewGame").addEventListener("click", ()=>{
  if(!confirm("Repartir d'une partie vierge ? Le tour, les PC, le score et l'état des unités sont remis à zéro.")) return;
  G = partieVierge(); saveG(); renderPartie();
  toast("Nouvelle partie.", "", null);
});
el("btnCopyTxt").addEventListener("click", ()=> copier(listeEnTexte(), "Le texte de la liste"));
el("btnPrint").addEventListener("click", imprimeListe);
el("btnShare2").addEventListener("click", shareLink);
el("btnQR").addEventListener("click", afficheQR);
el("btnBackup").addEventListener("click", sauvegardeTout);
el("btnShareTxt").addEventListener("click", async ()=>{
  const txt = listeEnTexte();
  if(navigator.share){
    try{ await navigator.share({ title: R.nom, text: txt }); return; }
    catch(e){ if(e && e.name === "AbortError") return; }
  }
  copier(txt, "Le texte de la liste");
});

/* un seul champ de fichier sert aux deux entrees : on retient ce
   qu'on attend avant de l'ouvrir */
let attenteFichier = null;
el("btnRestore").addEventListener("click", ()=>{ attenteFichier = "json"; el("fileIn").click(); });
el("btnImportRos").addEventListener("click", ()=>{ attenteFichier = "ros"; el("fileIn").click(); });
el("fileIn").addEventListener("change", ()=>{
  const f = el("fileIn").files && el("fileIn").files[0];
  el("fileIn").value = "";
  if(!f) return;
  const fr = new FileReader();
  fr.onload = ()=>{
    const txt = String(fr.result || "");
    if(attenteFichier === "ros"){ importeRos(txt); return; }
    try{
      const o = JSON.parse(txt);
      const lot = Array.isArray(o) ? o : (o && o.listes);
      if(!Array.isArray(lot) || !lot.length) throw 0;
      let n = 0;
      lot.forEach(L => {
        if(!L || !Array.isArray(L.units)) return;
        const neuve = listeVierge(L.nom || "Liste restaurée", L.cap || 2000);
        neuve.detach = L.detach || [];
        neuve.units = L.units;
        normaliseListe(neuve);
        LISTS.push(neuve); n++;
      });
      if(!n) throw 0;
      /* les stratagemes saisis voyagent avec les listes : ils se completent,
         ce qui est deja saisi ici n'est pas ecrase */
      if(o && o.strats && o.strats.fiches){
        Object.keys(o.strats.fiches).forEach(k => { if(!SUSER.fiches[k]) SUSER.fiches[k] = o.strats.fiches[k]; });
        (o.strats.ajouts || []).forEach(a => {
          if(!SUSER.ajouts.some(x => x[0] === a[0] && x[1] === a[1])) SUSER.ajouts.push(a);
        });
        saveS();
      }
      saveR(); renderList(); renderIndex();
      rapport([{txt: "<b>" + n + " liste" + (n > 1 ? "s" : "") + "</b> restaurée" +
        (n > 1 ? "s" : "") + ". Rien n'a été écrasé : elles s'ajoutent aux tiennes."}]);
    }catch(e){
      rapport([{txt:"Ce fichier ne contient pas de listes lisibles.", warn:true}]);
    }
  };
  fr.readAsText(f);
});
if(el("listName")) el("listName").addEventListener("change", ()=>{
  R.nom = el("listName").value.trim() || "Liste"; saveR(); renderList();
});
if(el("listCap")) el("listCap").addEventListener("change", ()=>{
  const v = parseInt(el("listCap").value, 10);
  R.cap = (isFinite(v) && v >= 100) ? Math.min(10000, v) : 2000;
  saveR(); renderList();
});
if(el("defN")) el("defN").addEventListener("change", ()=>{
  const v = parseInt(el("defN").value, 10);
  defTireurs = (isFinite(v) && v > 0) ? Math.min(60, v) : 10;
  el("defN").value = defTireurs;
  renderDef();
});
if(el("armMode")) el("armMode").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    armMode = b.dataset.m;
    el("armMode").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderArms();
  }));

el("uSearch").addEventListener("input", ()=>{ if(window.__rosterPick && pickMode) renderPick(); });
document.querySelectorAll('[data-close="sheetUnit"]').forEach(b=>
  b.addEventListener("click", ()=>{
    /* on sort du catalogue : dire ce qu'on vient d'y poser, et proposer
       d'ouvrir la derniere si on n'en a pose qu'une */
    if(pickMode === "unit" && ajoutees){
      const id = derniereAjoutee;
      toast(ajoutees + " unité" + (ajoutees > 1 ? "s ajoutées" : " ajoutée") + " à la liste.",
        ajoutees === 1 ? "Régler" : "", ajoutees === 1 ? ()=> ouvrePanneau("cardUnits", id) : null);
    }
    pickMode = null; ajoutees = 0;
    const bar = el("uBudget"); if(bar) bar.hidden = true;
  }));

/* le simulateur possede sa propre liste d'unites : on remet son mode
   quand l'utilisateur rouvre la feuille depuis l'onglet Simulateur */
const origPick = el("pickUnit");
origPick.addEventListener("click", ()=>{ pickMode = null; window.__rosterPick = false; }, true);

/* la cible change dans l'onglet Simulateur -> repercuter ici */
const obs = new MutationObserver(()=>{
  if(el("subCmp").classList.contains("on")){ syncTarget(); renderCmpList(); }
  if(el("subGrp").classList.contains("on")){ syncTarget(); renderGrpList(); }
  if(el("subTop").classList.contains("on")){ syncTarget(); renderTop(); }
});
obs.observe(el("ptSub"), {childList:true, characterData:true, subtree:true});

// insere la barre de points sous l'en-tete
const bar = document.createElement("div");
bar.className = "ptsbar"; bar.id = "ptsbar";
el("listEditor").insertBefore(bar, el("listEditor").children[1] || null);

el("btnCmpRoster").addEventListener("click", ()=> openCmpPick("roster"));
el("btnCmpCat").addEventListener("click", ()=> openCmpPick("cat"));
el("cmpLed").addEventListener("change", renderCmpList);
el("pickTarget3").addEventListener("click", ()=> el("pickTarget").click());
el("cmpPhase").querySelectorAll(".chip").forEach(b=>
  b.addEventListener("click", ()=>{
    cmpPhaseV = b.dataset.p;
    el("cmpPhase").querySelectorAll(".chip").forEach(x=>x.classList.toggle("on", x===b));
    renderCmpList();
  }));

loadR(); loadCmp(); loadGrp(); loadS();
PANNEAUX.forEach(p => { const c = el(p); if(c) c.hidden = true; });
initDetachSheet();
renderList();
renderIndex();
renderCmpList();
renderGrpList();
syncTarget();
readSharedLink();
/* coller un lien dans un onglet deja ouvert ne recharge pas la page :
   le navigateur ne fait qu'un saut d'ancre, il faut l'ecouter */
window.addEventListener("hashchange", readSharedLink);
})();
