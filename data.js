/* ============================================================
   Socle commun — Warhammer 40 000, 11e édition

   Ce fichier ne connaît aucune faction. Il porte ce qui vaut pour
   toutes : le barème de points, les mots-clés de cible, les archétypes
   de menace, les catégories, les rôles tactiques, les Dispositions de
   Force, le glossaire des règles de base.

   Les tables propres à une faction — fiches, armes, détachements,
   stratagèmes, aptitudes — vivent dans un fichier par faction
   (data-necrons.js et compagnie), qui s'enregistre ci-dessous. À
   l'ouverture d'une liste, activeFaction() rebranche les noms globaux
   sur les tables de la faction voulue : le reste du code lit UNITS ou
   WEAPONS sans savoir qu'ils ont changé de source.
   ============================================================ */

/* ============================================================
   LE REGISTRE DES FACTIONS

   Chaque fichier de faction appelle enregistreFaction() avec ses 28
   tables. Une table oubliée arrête le chargement en la nommant : sans
   ce contrôle, elle vaudrait undefined et la faute se lirait vingt
   écrans plus loin, sur un symptôme sans rapport.

   La première faction enregistrée devient la faction active, pour que
   l'application soit utilisable avant même qu'une liste soit ouverte.
   ============================================================ */

/* les 28 noms qu'une faction doit fournir, dans l'ordre du fichier */
const TABLES_FACTION = [
    "UNITS",
    "ARMEMENT",
    "WEAPONS",
    "KW",
    "STRAT_SIMU",
    "APTIS_CIBLE",
    "DETACHMENTS",
    "ATTACH",
    "RETINUE",
    "ENHANCEMENTS",
    "ENH_ANCIENS",
    "SOCLES",
    "GRPN",
    "STRATS",
    "MOMENTS",
    "MOMENTS_ARMEE",
    "CAT",
    "COMPO",
    "ROLES_UNITE",
    "APTITUDES",
    "TRANSPORTS",
    "FACTION",
    "OCTROIS_DETACH",
    "APTIS_UNITE",
    "APTIS_COND",
    "AURAS_ARMEE",
    "ABIMEES",
    "AURAS_PERSO"
  ];

/* Et celles qu'une faction PEUT fournir, sans y être tenue : elles
   n'existent que là où la règle existe. Les Entraves Nécrodermiques
   n'ont de sens que chez les Nécrons ; une faction qui n'en a pas
   reçoit une table vide plutôt qu'un trou. La liste obligatoire dit ce
   qu'une faction est ; celle-ci, ce qu'elle a en propre. */
const TABLES_FACTION_OPT = {
    ENTRAVES   : {},   /* équipement imposé par un détachement */
    ENH_OTEES  : [],   /* optimisations que ce détachement retire */
    SITU_CHOIX : {}    /* conditions de détachement qui se choisissent */
  };

/* Déclarés en let, et non en const : ce sont eux que l'adaptateur
   rebranche. C'est le prix du procédé — on perd le filet du const sur
   des tables qu'on ne veut pourtant pas voir bouger ailleurs. La
   contrepartie est que les 142 lectures existantes n'ont pas bougé
   d'une ligne. */
let UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE, DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES, GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE, APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE, APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO;
/* les facultatives, mêmes règles */
let ENTRAVES, ENH_OTEES, SITU_CHOIX;

/* Index dérivés. Ils se calculent à partir des tables ci-dessus et
   doivent donc être refaits à chaque bascule — c'est la partie du
   procédé où l'on oublie quelque chose, alors ils sont réunis ici,
   dans la seule fonction qui les touche. */
let BASES, KWSET, CATMAP;

const FACTIONS = {};
const ORDRE_FACTIONS = [];
let FACTION_ACTIVE = "";
const FACTION_DEFAUT = "necrons";

function enregistreFaction(F){
  const manque = TABLES_FACTION.filter(n => !(n in F.tables));
  if(manque.length)
    throw new Error("faction « " + F.cle + " » : tables manquantes — " + manque.join(", "));
  if(!FACTIONS[F.cle]) ORDRE_FACTIONS.push(F.cle);
  FACTIONS[F.cle] = F;
  if(!FACTION_ACTIVE) activeFaction(F.cle);
}

/* la liste pour le sélecteur : [{cle, nom}], dans l'ordre d'enregistrement */
const listeFactions = () => ORDRE_FACTIONS.map(c => ({ cle: c, nom: FACTIONS[c].nom }));
const factionNom = c => (FACTIONS[c] && FACTIONS[c].nom) || "";

/* Rebranche les noms globaux. Écrit à la main, une ligne par table :
   une boucle sur TABLES_FACTION ne peut pas affecter des variables
   déclarées en let, et passer par globalThis les découplerait de leur
   déclaration. Trente lignes lisibles valent mieux qu'un tour de
   passe-passe. */
function activeFaction(cle){
  const F = FACTIONS[cle] || FACTIONS[FACTION_DEFAUT] || FACTIONS[ORDRE_FACTIONS[0]];
  if(!F) return "";
  const T = F.tables;
  UNITS          = T.UNITS;
  ARMEMENT       = T.ARMEMENT;
  WEAPONS        = T.WEAPONS;
  KW             = T.KW;
  STRAT_SIMU     = T.STRAT_SIMU;
  APTIS_CIBLE    = T.APTIS_CIBLE;
  DETACHMENTS    = T.DETACHMENTS;
  ATTACH         = T.ATTACH;
  RETINUE        = T.RETINUE;
  ENHANCEMENTS   = T.ENHANCEMENTS;
  ENH_ANCIENS    = T.ENH_ANCIENS;
  SOCLES         = T.SOCLES;
  GRPN           = T.GRPN;
  STRATS         = T.STRATS;
  MOMENTS        = T.MOMENTS;
  MOMENTS_ARMEE  = T.MOMENTS_ARMEE;
  CAT            = T.CAT;
  COMPO          = T.COMPO;
  ROLES_UNITE    = T.ROLES_UNITE;
  APTITUDES      = T.APTITUDES;
  TRANSPORTS     = T.TRANSPORTS;
  FACTION        = T.FACTION;
  OCTROIS_DETACH = T.OCTROIS_DETACH;
  APTIS_UNITE    = T.APTIS_UNITE;
  APTIS_COND     = T.APTIS_COND;
  AURAS_ARMEE    = T.AURAS_ARMEE;
  ABIMEES        = T.ABIMEES;
  AURAS_PERSO    = T.AURAS_PERSO;
  /* les facultatives : absentes, elles valent la table vide — le code
     qui les lit trouve un objet, jamais un trou */
  ENTRAVES       = T.ENTRAVES   || TABLES_FACTION_OPT.ENTRAVES;
  ENH_OTEES      = T.ENH_OTEES  || TABLES_FACTION_OPT.ENH_OTEES;
  SITU_CHOIX     = T.SITU_CHOIX || TABLES_FACTION_OPT.SITU_CHOIX;
  FACTION_ACTIVE = F.cle;
  reconstruitIndex();
  return F.cle;
}

/* BASES : ce que la fiche d'unité affiche, tiré de SOCLES. Un seul fait,
   une seule source — « 32 » pour un rond, « 120×92 » pour un ovale, vide
   pour une coque, qui n'a pas de socle à annoncer.
   KWSET : les mots-clés de détachement en Set, pour que has() réponde
   sans parcourir la table.
   CATMAP : la catégorie de chaque unité, par son nom. */
function reconstruitIndex(){
  BASES = {};
  for(const nom in SOCLES){
    const v = SOCLES[nom];
    BASES[nom] = (v === "coque") ? "" : v.replace("x", "\u00d7");
  }
  KWSET = {};
  Object.keys(KW).forEach(k => KWSET[k] = new Set(KW[k]));
  CATMAP = {};
  CAT.forEach(([n, c]) => CATMAP[n] = c);
}

const paliersPts = u => {
  const t = u && u[7];
  if(!t) return [[1, {}]];
  return Array.isArray(t) ? t : [[1, t]];
};
function baremePts(u, rang){
  const p = paliersPts(u);
  let bar = p[0][1];
  for(let i = 0; i < p.length; i++) if((rang || 1) >= p[i][0]) bar = p[i][1];
  return bar;
}
/* prix d'une unite pour un effectif et un rang donnes */
const ptsPour = (u, taille, rang) => baremePts(u, rang)[String(taille)] || 0;
/* le prix bouge-t-il d'un rang a l'autre ? sert a n'afficher le rang que
   la ou il change quelque chose */
const prixEvolue = u => paliersPts(u).length > 1;
const MOTS_CIBLE = [
  ["inf",   "Infanterie"],
  ["veh",   "Véhicule"],
  ["mon",   "Monstre"],
  /* MONTÉ n'était pas là, et l'[ANTI-MONTÉ 4+] du Conclave de Crypteks
     n'avait donc aucune cible à reconnaître : il ne pouvait jamais
     jouer. C'est un mot-clé de la cible comme les autres. */
  ["monte", "Monté"],
  ["perso", "Personnage"],
  ["vol",   "Volant"]
];
/* Ce que porte chaque archétype générique. Ce sont mes propres
   attributions, pas une source officielle : les archétypes eux-mêmes
   sont des approximations, et rien n'empêche de les corriger d'une
   touche sur l'écran. */
const KW_ARCHETYPE = {
  "Garde impérial"     : ["inf"],
  "Ork Boy"            : ["inf"],
  "Space Marine"       : ["inf"],
  "Marine Gravis"      : ["inf"],
  "Terminator"         : ["inf"],
  "Custodes"           : ["inf"],
  "Aeldari (Guardian)" : ["inf"],
  "Genestealer"        : ["inf"],
  "Guerrier tyranide"  : ["inf"],
  "Transport (T9)"     : ["veh"],
  "Char lourd (T11)"   : ["veh"],
  "Knight (T12)"       : ["veh"]
};
/* Et ce que porte une unité nécron, déduit de sa catégorie et des
   tables de mots-clés déjà en place. */
const KW_CATEGORIE = {
  "Epic Hero"  : ["perso"],
  "Personnage" : ["perso"],
  "Battleline" : ["inf"],
  "Infanterie" : ["inf"],
  "Bête"       : [],
  "Monté"      : ["monte"],
  "Véhicule"   : ["veh"],
  "Monstre"    : ["mon"],
  "Fortification" : [],
  "Autre"      : []
};

/* ============================================================
   APTITUDES DONT LA CONDITION PORTE SUR LA CIBLE
   Elles ne se cochent pas : l'application connaît les mots-clés de la
   cible, elle sait donc toute seule si la règle s'applique. Changer la
   cible suffit à les faire apparaître ou disparaître du profil.

   [arme]   le nom exact de l'arme, ou "" pour toutes celles de l'unité
   [vs]     les mots-clés de cible qui déclenchent — un seul suffit
   [champ]  ce qui change dans le profil, même vocabulaire qu'AURAS_PERSO
   ============================================================ */
const MENACES = [
["Fusil laser","1",4,3,0,"1","","Infanterie de masse — le volume avant tout"],
["Bolter","2",3,4,0,"1","","Infanterie lourde, la référence du jeu"],
["Bolter lourd","3",3,5,1,"2","sust:1","Arme d'appui d'escouade"],
["Fuseur","1",3,9,4,"D6","melta:2","Anti-blindage à courte portée"],
["Plasma surchargé","2",3,8,3,"2","","Polyvalent, mord sur presque tout"],
["Canon laser","1",3,12,3,"D6+1","","Anti-char, une frappe lourde à la fois"],
["Autocanon","2",3,9,1,"3","","Anti-véhicule léger et infanterie lourde"],
["Lance-flammes","D6",0,4,0,"1","torrent","Touche automatiquement, à bout portant"],
["Épée tronçonneuse","3",3,4,1,"1","","Mêlée d'infanterie de base"],
["Gantelet énergétique","3",4,8,2,"2","","Mêlée lourde, frappe les blindages"]
];

/* ============================================================
   QUAND CHAQUE APTITUDE SE DECLENCHE

   APTITUDES porte le texte ; ce tableau porte le moment. Les deux
   restent separes : le texte est la source, l'index n'en est qu'une
   lecture. La cle est « Unite|Aptitude », exactement les deux noms
   d'APTITUDES, pour qu'une faute de frappe se voie tout de suite.

   ph    : cmd, mvt, tir, chg, cbt — plusieurs separees par des espaces,
           ou "" pour « n'importe quelle phase »
   camp  : "moi" a mon tour, "adv" au tour adverse, "" aux deux
   pos   : "debut", "fin", ou "" quelque part dans la phase
   uniq  : "partie" une fois par bataille, "tour" une fois par tour

   Classement obtenu par analyse du texte puis relu ligne a ligne : sept
   entrees etaient fausses — le « jusqu'a la fin de la phase » d'un effet
   se lisait comme un declenchement en fin de phase, et le Heraut du
   Desespoir vise cinq phases quand l'analyse n'en voyait que deux.
   ============================================================ */
const CAT_ORDRE = ["Epic Hero","Personnage","Battleline","Infanterie","Bête","Monté","Véhicule","Monstre","Fortification","Autre"];

/* ============================================================
   UNITES MIXTES

   Une ligne d'UNITS decrit UNE figurine, et l'effectif la
   multiplie. Cela vaut pour une escouade uniforme, et pour elle
   seule. Le Roi Silencieux n'en est pas une : il tient 16 PV,
   chacun de ses deux Menhirs Triarcaux en tient 5. Sans ce
   tableau, l'application lui pretait trois figurines de 16 PV —
   48 au lieu de 26.

   L'ordre est celui dans lequel le defenseur sacrifie ses
   figurines : l'escorte d'abord, la figurine qui donne son nom a
   l'unite en dernier. Les autres caracteristiques (E, Svg, Invu)
   sont communes, sinon il faudrait les repeter ici.
   ============================================================ */
const ROLES = [
["garde",     "Garde arrière",     "Marquer",  "Tient mon objectif toute la partie et refuse les arrivées adverses. Pas cher, encaisse un peu, ne bouge jamais."],
["milieu",    "Preneur de milieu", "Marquer",  "Va prendre un objectif contesté et le garde sous le feu. Il lui faut du CO et de quoi survivre au contact."],
["actions",   "Faiseur d'actions", "Marquer",  "Fait les actions secondaires pendant que le reste se bat. Pas cher, mobile, CO correct, dégâts médiocres — et sacrifiable."],
["enclume",   "Enclume",           "Tenir",    "Encaisse la frappe adverse et immobilise ce qui la porte. Dure à tuer par le nombre, la sauvegarde ou la réanimation."],
["ecran",     "Écran",             "Tenir",    "Corps sacrifiables posés devant : interdit la frappe en profondeur, absorbe une charge, gagne un tour."],
["antichar",  "Anti-char",         "Détruire", "Perce les véhicules et les monstres : E9 et plus, sauvegarde 2-3+, beaucoup de PV. Il faut de la Force haute, de la PA et des dégâts par coup."],
["antielite", "Anti-élite",        "Détruire", "Efface l'infanterie lourde : 2 ou 3 PV, sauvegarde 2-3+, souvent une invulnérable. Il faut de la PA et des dégâts 2, pas du volume."],
["antimasse", "Anti-masse",        "Détruire", "Efface les hordes : 1 PV, sauvegarde 4-6+, beaucoup de corps. Il faut du volume d'attaques ; la PA et les dégâts se gaspillent."],
["marteau",   "Marteau",           "Détruire", "Gagne le corps à corps qu'on choisit. Ferme la distance, frappe le premier si possible, et rentabilise le tour où il arrive."],
["harcele",   "Harcèlement",       "Peser",    "Arrive de réserve ou par le flanc, menace l'arrière et force une réaction. Petite empreinte, mobilité, frappe en profondeur ou éclaireurs."],
["soutien",   "Soutien",           "Peser",    "Rend les autres meilleurs : auras, réanimation, réparation, relances. Se juge à ce qu'il ajoute, jamais à ce qu'il tue."],
["transport", "Transport",         "Peser",    "Amène l'enclume ou les faiseurs d'actions là où il faut avant le tour 3, et les protège en route."]
];
const ROLES_FAMILLES = ["Marquer","Tenir","Détruire","Peser"];

/* La suggestion du catalogue : ce que l'unité fait le plus souvent,
   le principal en premier. Elle ne s'impose pas — une liste peut
   confier n'importe quel métier à n'importe quelle unité, et c'est
   le joueur qui décide. Elle sert à ne pas partir de la page
   blanche sur cinquante et une fiches. */
const DISPO_FR = {
"Take and Hold"   : "Prendre et Tenir",
"Purge the Foe"   : "Purger l'Ennemi",
"Reconnaissance"  : "Reconnaissance",
"Disruption"      : "Perturbation",
"Priority Assets" : "Actifs Prioritaires"
};
const DISPO_ROLES = {
"Take and Hold"   : ["garde","milieu","enclume","ecran"],
"Purge the Foe"   : ["antichar","antielite","antimasse","marteau"],
"Reconnaissance"  : ["actions","harcele","transport"],
"Disruption"      : ["actions","harcele","ecran"],
"Priority Assets" : ["milieu","enclume","antichar","garde"]
};


/* ============================================================
   APTITUDES : les aptitudes propres a chaque unite.
   Texte anglais repris tel quel du catalogue BattleScribe — pas
   de traduction maison, une regle mal traduite se paie en partie.
   ============================================================ */
const GLOSSAIRE = {
 "Anti-X" : "[ANTI-X Y+] — À chaque attaque d'une arme [ANTI], si l'unité cible a le mot-clé indiqué par X, un jet de blessure non modifié de Y+ est une blessure critique.",
 "Assaut" : "[ASSAUT] — Les unités incluant une ou plusieurs figurines avec une arme d'[ASSAUT] peuvent tirer en utilisant le tir d'assaut.",
 "Déflagration" : "[DÉFLAGRATION] — Chaque fois que vous rassemblez les dés d'attaque pour une arme à [DÉFLAGRATION], ajoutez 1 dé d'attaque supplémentaire par tranche de 5 figurines qui étaient dans l'unité cible à l'étape Choisir les Cibles (arrondi à l'inférieur). Sous la forme [DÉFLAGRATION X], ajoutez plutôt X dés supplémentaires par tranche de 5 figurines.",
 "Blessures Dévastatrices" : "[BLESSURES DÉVASTATRICES] — À chaque attaque qui résulte en une blessure critique, la séquence d'attaque se termine et l'unité cible subit autant de blessures mortelles que la caractéristique D de l'arme, infligées après les dégâts normaux. Ces blessures mortelles peuvent endommager un maximum de 1 figurine par blessure critique ; les blessures mortelles restantes sont perdues.",
 "Attaques Bonus" : "[ATTAQUES BONUS] — Chaque fois qu'une unité qui contient une ou plusieurs figurines avec une arme à [ATTAQUES BONUS] combat, ces figurines effectuent des attaques avec ces armes en plus de toute autre. À l'étape Choisir les Armes, pour chacune de ces figurines, vous devez choisir toutes ses armes à [ATTAQUES BONUS] et, si possible, une de ses autres armes de mêlée.",
 "À Risque" : "[À RISQUE] — Chaque fois qu'une unité est choisie pour tirer ou pour combattre, après avoir résolu toutes ses attaques, faites autant de jets de risque pour elle que le nombre d'armes [À RISQUE] choisies à l'étape Choisir les Armes.",
 "Lourd" : "[LOURD] — À votre phase de Tir, à chaque attaque faite avec une arme [LOURDE], ajoutez 1 au jet de touche si l'unité attaquante est non engagée, n'a pas été placée sur le champ de bataille à ce tour, et si aucune de ses figurines ne s'est déplacée de plus de 3\" à ce tour.",
 "Ignore le Couvert" : "[IGNORE LE COUVERT] — À chaque attaque d'une arme qui [IGNORE LE COUVERT], la cible ne peut pas avoir le bénéfice du couvert contre l'attaque, y compris grâce à des règles qui le donnent, comme Discrétion.",
 "Tir Indirect" : "[TIR INDIRECT] — Les unités incluant une ou plusieurs figurines avec une arme à [TIR INDIRECT] peuvent tirer en utilisant le tir indirect.",
 "Lance" : "[LANCE] — À chaque attaque d'une arme [LANCE], si l'unité de la figurine qui attaque a effectué un mouvement de charge à ce tour, ajoutez 1 au jet de blessure.",
 "Touches Fatales" : "[TOUCHES FATALES] — À chaque attaque qui résulte en une touche critique, vous pouvez choisir que l'attaque blesse automatiquement la cible. Ce choix n'est pas obligatoire : il empêche l'attaque de résulter en une blessure critique, donc de déclencher [BLESSURES DÉVASTATRICES].",
 "Fusion" : "[FUSION X] — À chaque attaque d'une figurine avec une arme à [FUSION], si l'unité cible était à mi-portée ou moins de l'arme à l'étape Choisir les Cibles, jusqu'à ce que les attaques de l'unité attaquante aient été résolues, ajoutez X à la caractéristique de D de l'arme.",
 "Tir Unique" : "[TIR UNIQUE] — Chaque arme ayant cette aptitude peut seulement être choisie pour effectuer des attaques une seule fois par bataille. Si une figurine détruite est restituée à une unité, ses armes à [TIR UNIQUE] déjà utilisées ne peuvent pas l'être à nouveau.",
 "Pistolet" : "[PISTOLET] — [PISTOLET] et [COMBAT RAPPROCHÉ] sont identiques au regard des règles : les unités qui en portent peuvent tirer en utilisant le tir en combat rapproché. Quand vous utilisez un autre type de tir, chaque figurine choisit soit ses armes de combat rapproché, soit ses autres armes de tir.",
 "Précision" : "[PRÉCISION] — Au début de l'étape Ordre d'Allocation, si l'unité cible contient une ou plusieurs figurines de PERSONNAGE visibles d'une ou plusieurs figurines attaquantes, le joueur actif peut choisir 1 groupe d'allocation qui contient une de ces figurines de PERSONNAGE ; ce groupe devient le groupe d'allocation actuel jusqu'à ce que les attaques soient résolues ou que le groupe soit détruit.",
 "Tir Rapide" : "[TIR RAPIDE X] — Chaque fois que vous rassemblez les dés d'attaque d'une arme à [TIR RAPIDE], ajoutez X dés d'attaque supplémentaires si l'unité cible est à mi-portée ou moins de l'arme à l'étape Choisir les Cibles.",
 "Touches Soutenues" : "[TOUCHES SOUTENUES X] — À chaque attaque qui résulte en une touche critique, l'attaque résulte en autant de touches supplémentaires sur la cible que le X.",
 "Torrent" : "[TORRENT] — À chaque attaque d'une arme à [TORRENT], cette attaque touche automatiquement la cible.",
 "Jumelé" : "[JUMELÉ] — À chaque attaque d'une arme [JUMELÉE], vous pouvez relancer le jet de blessure.",
 "Psychique" : "[PSYCHIQUE] — À chaque attaque d'une arme [PSYCHIQUE], vous pouvez ignorer certains ou tous les modificateurs à la caractéristique de CT ou de CC de l'attaque, et certains ou tous les modificateurs au jet de touche. Ces attaques sont appelées des attaques psychiques.",
 "Frappe en Profondeur" : "Chaque fois que cette unité effectue un mouvement d'arrivée, si toutes ses figurines ont cette aptitude, elle peut être placée n'importe où sur le champ de bataille à plus de 8\" à l'horizontale des unités ennemies, y compris dans la zone de déploiement adverse.",
 "Destruction Néfaste" : "Destruction Néfaste X — Chaque fois qu'une figurine de cette unité est détruite, après que les unités embarquées ont fait leurs mouvements de débarquement d'urgence, jetez 1 D6. Sur un 6, chaque unité à 6\" ou moins de cette figurine subit autant de blessures mortelles que le X.",
 "Insensible à la Douleur" : "Insensible à la Douleur X+ — Chaque fois qu'une figurine avec cette aptitude est censée perdre un point de vie, jetez 1 D6 : sur X+, ce point de vie n'est pas perdu.",
 "Combat en Premier" : "Tant que toutes les figurines d'une unité ont cette aptitude, cette unité est une unité qui Combat en Premier et est résolue à l'étape correspondante de la phase de Combat.",
 "Pont de Tir" : "Pont de Tir X — À votre phase de Tir, chaque fois que ce TRANSPORT est choisi pour tirer, si une ou plusieurs unités y sont embarquées : choisissez jusqu'à X figurines embarquées, puis une arme de tir par figurine choisie (sauf les armes à [TIR UNIQUE]) ; jusqu'à ce que le TRANSPORT ait résolu toutes ses attaques, il a ces armes en plus des siennes ; jusqu'à la fin du tour, les unités embarquées ne sont pas éligibles pour tirer.",
 "Infiltrateurs" : "Pendant le déploiement, si toutes les figurines d'une unité ont cette aptitude, elle peut être placée n'importe où sur le champ de bataille à plus de 8\" à l'horizontale de la zone de déploiement adverse et des unités ennemies.",
 "Meneur" : "Les héros les plus puissants combattent en première ligne : voir Unités Attachées.",
 "Appui" : "On assigne parfois des combattants spécialisés aux escouades de première ligne : voir Unités Attachées.",
 "Agent Solitaire" : "Sauf si elle fait partie d'une unité attachée, cette unité n'est pas visible des figurines ennemies sauf si elles sont à 12\" ou moins d'elle, et elle ne peut pas être ciblée par des armes à [TIR INDIRECT] sauf si la figurine attaquante est à 12\" ou moins. Sous la forme Agent Solitaire X\", remplacez 12\" par X\".",
 "Éclaireurs" : "Éclaireurs X\" — À l'étape Résoudre les Aptitudes de Prébataille, si toutes les figurines d'une unité ont cette aptitude, vous pouvez soit la placer n'importe où entièrement dans votre zone de déploiement si elle est en réserve stratégique, soit lui faire effectuer un mouvement d'éclaireur de X\" maximum si elle est entièrement dans votre zone de déploiement. Après ce mouvement, l'unité doit être à plus de 8\" à l'horizontale des unités ennemies.",
 "Mouvement d'Éclaireur" : "Mouvement d'Éclaireur — DISTANCE MAXIMALE : le X\" d'Éclaireurs X\". ÉLIGIBLE SI : c'est l'étape Résoudre les Aptitudes de Prébataille, et votre unité est entièrement dans votre zone de déploiement. EFFET : votre unité se déplace comme décrit dans Mouvement. APRÈS LE MOUVEMENT : votre unité doit être à plus de 8\" à l'horizontale des unités ennemies.",
 "Discrétion" : "Si toutes les figurines d'une unité ont cette aptitude, à chaque attaque de tir qui cible l'unité, l'unité a le bénéfice du couvert contre l'attaque.",
 "Stationnaire" : "Chaque fois que cette unité décolle, ne soustrayez pas 2\" à la distance maximale.",
 "Marcheur Super-lourd" : "Chaque fois qu'une unité avec cette aptitude effectue un mouvement normal, d'avance ou de retraite, ses figurines peuvent se déplacer à travers les figurines (figurines TITANESQUES exclues) et à l'horizontale à travers des sections d'éléments de terrain de 4\" de hauteur ou moins. Avant de la déplacer, vous pouvez décider que toutes ses figurines aient le mot-clé MOBILE jusqu'à la fin du mouvement ; dans ce cas, à la fin du mouvement, jetez 1 D6 : sur 1, l'unité est ébranlée.",
 "Abattage" : "[ABATTAGE X] — Chaque fois que vous rassemblez les dés d'attaque pour une arme d'[ABATTAGE], si vous avez choisi une seule cible pour toutes les attaques de l'arme, ajoutez X dés d'attaque supplémentaires par tranche de 5 figurines qui étaient dans l'unité cible à l'étape Choisir les Cibles (arrondi à l'inférieur).",
 "Combat Rapproché" : "[COMBAT RAPPROCHÉ] — Les unités contenant une ou plusieurs figurines avec une arme de [COMBAT RAPPROCHÉ] peuvent tirer en utilisant le tir en combat rapproché. Quand vous utilisez un autre type de tir, pour chaque figurine de cette unité (sauf MONSTRE/VÉHICULE), vous pouvez choisir soit une ou plusieurs de ses armes de [COMBAT RAPPROCHÉ], soit une ou plusieurs de ses autres armes de tir."
};

/* ==========================================================
   OCTROIS — ce qui s'ajoute aux armes en cours de partie
   Un profil d'arme n'est pas figé : le détachement retenu et
   les personnages rattachés lui accordent des aptitudes que la
   fiche technique ne porte pas. Deux tables les décrivent.

   Chaque octroi a :
     - mot   : le mot-clé d'arme ajouté (clé de parseFlags)
     - champ : le champ de profil modifié, avec sa valeur
     - port  : "T" tir, "C" corps à corps, "" les deux
     - qui   : "unite" — toutes les armes du groupe
               "figurine" — seulement celles des figurines qui
               portent l'un des mots-clés listés dans `kw`
     - kw    : les mots-clés exigés ; vide = sans condition
     - texte : la phrase officielle, pour l'infobulle
   ========================================================== */
