/* ============================================================
   Données Démons du Chaos — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py demons

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 61 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     52 fiches sur 62 en ont un. Les autres — des Legends, que le
     guide ne liste pas — sont posées sur un socle par défaut.
   · Les tables du simulateur — APTIS_COND, AURAS_ARMEE,
     AURAS_PERSO, OCTROIS_DETACH, STRAT_SIMU, MOMENTS, ABIMEES —
     sont vides. Elles traduisent une règle en code : aucune source
     ne les donne, il faut lire chaque règle et décider ce qu'elle
     fait au calcul. Le simulateur tourne donc sur les
     caractéristiques nues pour cette faction.
   · ARMEMENT est vide : toutes les armes de la fiche comptent, il
     n'y a pas de panachage. C'est faux pour les unités à choix
     d'arme, et c'est signalé plutôt que deviné.
   · Les aptitudes et les optimisations sont EN ANGLAIS, texte du
     catalogue. C'est la convention du dépôt : une règle mal
     traduite se paie en partie.
   ============================================================ */
(function(){
"use strict";

/* UNITS : [nom, M, E, Svg, Invu, PV, tailles[], points, fnp, rôle,
   legends, notes, CO, Cd] */
const UNITS = [
  ["Aetaos'rau'keres",12,10,6,4,24,[1],{"1": 315},0,"",1,"",6,"6+"],
  ["An'ggrath the Unbound",12,11,4,4,24,[1],{"1": 415},0,"",1,"",6,"6+"],
  ["Be'lakor",12,11,3,4,20,[1],{"1": 390},0,"",0,"",5,"6+"],
  ["Beasts of Nurgle",6,9,6,5,7,[1, 2],{"1": 80, "2": 150},0,"",0,"",3,"7+"],
  ["Bloodcrushers",10,7,3,5,4,[3, 6],[[1, {"3": 95, "6": 210}], [3, {"3": 135, "6": 250}]],0,"",0,"",2,"7+"],
  ["Bloodletters",8,4,7,5,1,[10],{"10": 110},0,"",0,"",2,"7+"],
  ["Bloodmaster",8,4,5,4,4,[1],{"1": 65},0,"Meneur",0,"",1,"7+"],
  ["Bloodthirster",12,11,3,4,18,[1],[[1, {"1": 320}], [3, {"1": 335}]],0,"",0,"",5,"6+"],
  ["Blue Horrors",6,3,7,4,1,[10],{"10": 125},0,"",0,"",1,"8+"],
  ["Burning Chariot",12,8,7,4,9,[1],{"1": 115},0,"",0,"",3,"7+"],
  ["Changecaster",6,3,6,4,3,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Contorted Epitome",9,6,5,4,8,[1],[[1, {"1": 115}], [3, {"1": 125}]],0,"Meneur",0,"",2,"7+"],
  ["Daemon Prince of Chaos",8,10,2,4,10,[1],{"1": 165},0,"",0,"",3,"6+"],
  ["Daemon Prince of Chaos with wings",12,9,2,4,10,[1],{"1": 190},0,"",0,"",3,"6+"],
  ["Daemonettes",9,3,7,5,1,[10],{"10": 100},0,"",0,"",2,"7+"],
  ["Epidemius",5,5,6,5,8,[1],{"1": 80},0,"Meneur",0,"",2,"7+"],
  ["Exalted Flamer",9,4,7,4,6,[1],{"1": 65},0,"Meneur",0,"",1,"7+"],
  ["Fateskimmer",12,7,6,4,9,[1],{"1": 95},0,"Meneur",0,"",3,"7+"],
  ["Feculent Gnarlmaw",0,9,4,0,9,[1],{"1": 100},0,"",0,"",0,"7+"],
  ["Fiends",12,5,7,5,4,[3, 6],[[1, {"3": 90, "6": 190}], [3, {"3": 115, "6": 215}]],0,"",0,"",2,"7+"],
  ["Flamers",9,4,7,4,3,[3, 6],{"3": 65, "6": 130},0,"",0,"",1,"7+"],
  ["Flesh Hounds",12,4,7,5,2,[5, 10],{"5": 80, "10": 150},0,"",0,"",1,"7+"],
  ["Fluxmaster",12,4,6,4,4,[1],{"1": 70},0,"Meneur",0,"",1,"7+"],
  ["Furies",12,3,7,5,1,[5, 10],{"5": 40, "10": 80},0,"",1,"",1,"8+"],
  ["Giant Chaos Spawn",10,8,4,5,10,[1],{"1": 130},0,"",1,"",3,"7+"],
  ["Great Unclean One",7,12,5,4,20,[1],[[1, {"1": 265}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Hellflayers",14,6,5,5,7,[1, 2],{"1": 80, "2": 160},0,"",0,"",3,"7+"],
  ["Herald of Slaanesh on Steed of Slaanesh",14,4,7,5,4,[1],{"1": 70},0,"Meneur",1,"",2,"7+"],
  ["Horticulous Slimux",6,10,3,4,10,[1],{"1": 120},0,"Meneur",0,"",2,"7+"],
  ["Infernal Enrapturess",9,3,7,5,3,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Kairos Fateweaver",12,10,6,4,20,[1],{"1": 305},0,"",0,"",5,"6+"],
  ["Karanak",12,4,7,4,5,[1],{"1": 70},0,"Meneur",0,"",3,"7+"],
  ["Keeper of Secrets",14,10,5,4,18,[1],[[1, {"1": 265}], [3, {"1": 280}]],0,"",0,"",5,"6+"],
  ["Lord of Change",12,10,6,4,18,[1],[[1, {"1": 320}], [3, {"1": 340}]],0,"",0,"",5,"6+"],
  ["Nurglings",5,3,7,5,4,[3, 6],{"3": 45, "6": 90},0,"",0,"",0,"8+"],
  ["Pink Horrors",6,3,7,4,1,[10],{"10": 150},0,"",0,"",1,"8+"],
  ["Plague Drones",10,8,6,5,5,[3, 6],{"3": 110, "6": 220},0,"",0,"",2,"7+"],
  ["Plague Toads",7,8,6,5,4,[3],{"3": 120},0,"",1,"",2,"7+"],
  ["Plaguebearers",5,5,7,5,2,[10],{"10": 115},0,"",0,"",2,"7+"],
  ["Pox Riders",7,8,6,5,5,[3],{"3": 160},0,"",1,"",2,"7+"],
  ["Poxbringer",5,5,7,5,5,[1],[[1, {"1": 60}], [3, {"1": 70}]],0,"Meneur",0,"",1,"7+"],
  ["Rendmaster on Blood Throne",8,9,4,4,9,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",3,"7+"],
  ["Rotigus",7,12,5,4,22,[1],{"1": 280},0,"",0,"",5,"6+"],
  ["Scabeiathrax the Bloated",7,12,5,4,22,[1],{"1": 275},0,"",1,"",5,"6+"],
  ["Screamers",14,4,6,4,3,[3, 6],{"3": 80, "6": 160},0,"",0,"",1,"7+"],
  ["Seekers",14,4,7,5,2,[5, 10],{"5": 85, "10": 155},0,"",0,"",1,"7+"],
  ["Shalaxi Helbane",14,10,3,4,20,[1],{"1": 315},0,"",0,"",5,"6+"],
  ["Skarbrand",10,11,3,4,20,[1],{"1": 330},0,"",0,"",5,"6+"],
  ["Skull Altar",0,12,3,0,10,[1],{"1": 105},0,"",0,"",0,"7+"],
  ["Skull Cannon",8,9,4,4,9,[1],{"1": 100},0,"",0,"",3,"7+"],
  ["Skullmaster",10,7,3,4,6,[1],{"1": 85},0,"Meneur",0,"",2,"7+"],
  ["Skulltaker",8,4,4,4,5,[1],{"1": 85},0,"Meneur",0,"",1,"7+"],
  ["Sloppity Bilepiper",5,5,7,5,5,[1],{"1": 55},0,"Meneur",0,"",1,"7+"],
  ["Spined Chaos Beast",10,10,4,5,12,[1],{"1": 145},0,"",1,"",4,"7+"],
  ["Spoilpox Scrivener",5,5,7,5,5,[1],{"1": 60},0,"Meneur",0,"",1,"6+"],
  ["Syll'esske",9,6,6,4,9,[1],{"1": 120},0,"Meneur",0,"",2,"6+"],
  ["The Blue Scribes",12,4,6,4,6,[1],{"1": 75},0,"",0,"",2,"8+"],
  ["The Changeling",6,3,7,4,5,[1],{"1": 105},0,"",0,"",1,"7+"],
  ["The Masque of Slaanesh",9,3,7,4,4,[1],{"1": 95},0,"",0,"",1,"7+"],
  ["Tormentbringer",14,6,5,4,12,[1],{"1": 135},0,"Meneur",0,"",3,"7+"],
  ["Tranceweaver",9,3,7,5,3,[1],{"1": 60},0,"Meneur",0,"",1,"7+"],
  ["Zarakynel",14,10,5,4,20,[1],{"1": 320},0,"",1,"",5,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Aetaos'rau'keres","➤ Bolt of Tzeentch - focused witchfire","T","9",2,10,2,"D3","hazardous psychic","24\""],
  ["Aetaos'rau'keres","➤ Bolt of Tzeentch - witchfire","T","9",2,10,1,"1","psychic","24\""],
  ["Aetaos'rau'keres","Staff of cataclysm","C","6",3,8,2,"3","psychic","càc"],
  ["Aetaos'rau'keres","Warpfire talons","C","12",3,4,1,"1","psychic","càc"],
  ["An'ggrath the Unbound","Bloodlash","T","9",2,8,0,"2","","12\""],
  ["An'ggrath the Unbound","➤ Axe of Khorne - strike","C","8",2,16,4,"D6+2","","càc"],
  ["An'ggrath the Unbound","➤ Axe of Khorne - sweep","C","16",2,10,2,"2","","càc"],
  ["Be'lakor","➤ Betraying Shades - focused witchfire","T","12",2,6,3,"1","dev hazardous ignorescover psychic","18\""],
  ["Be'lakor","➤ Betraying Shades - witchfire","T","9",2,5,2,"1","dev ignorescover psychic","18\""],
  ["Be'lakor","➤ The Blade of Shadows - strike","C","7",2,14,4,"D6+1","dev","càc"],
  ["Be'lakor","➤ The Blade of Shadows - sweep","C","14",2,8,3,"1","sust:1","càc"],
  ["Beasts of Nurgle","Putrid appendages","C","6",4,6,1,"2","dev","càc"],
  ["Bloodcrushers","Hellblade","C","2",3,5,2,"2","","càc"],
  ["Bloodcrushers","Juggernaut's bladed horn","C","4",4,6,1,"1","extra lance","càc"],
  ["Bloodletters","Hellblade","C","2",3,5,2,"2","","càc"],
  ["Bloodmaster","Blade of blood","C","5",2,6,2,"3","","càc"],
  ["Bloodthirster","Bloodflail","T","1",2,16,3,"D6+1","dev","12\""],
  ["Bloodthirster","Hellfire breath","T","D6",0,5,1,"1","ignorescover torrent","12\""],
  ["Bloodthirster","Lash of Khorne","T","6",2,8,1,"2","","12\""],
  ["Bloodthirster","➤ Axe of Khorne - strike","C","8",2,14,4,"D3+1","","càc"],
  ["Bloodthirster","➤ Axe of Khorne - sweep","C","16",2,8,2,"1","","càc"],
  ["Bloodthirster","➤ Great axe of Khorne - strike","C","7",2,16,4,"D6+2","","càc"],
  ["Bloodthirster","➤ Great axe of Khorne - sweep","C","14",2,10,2,"2","","càc"],
  ["Blue Horrors","Coruscating Blue flames","T","2",4,3,1,"1","pistol psychic","18\""],
  ["Blue Horrors","Coruscating Yellow flames (ref. only)","T","2",5,2,1,"1","pistol psychic","18\""],
  ["Blue Horrors","Blue claws","C","1",5,3,0,"1","","càc"],
  ["Blue Horrors","Yellow claws (ref. only)","C","2",5,2,0,"1","","càc"],
  ["Burning Chariot","➤ Fires of Tzeentch - blue fire","T","3",3,9,3,"3","ignorescover psychic","18\""],
  ["Burning Chariot","➤ Fires of Tzeentch - pink fire","T","2D6",0,5,1,"1","ignorescover psychic torrent","12\""],
  ["Burning Chariot","Flamer mouths","C","6",4,5,0,"1","","càc"],
  ["Burning Chariot","Screamer bites","C","6",3,6,2,"2","anti:4:mon anti:4:veh extra","càc"],
  ["Changecaster","➤ Arcane Fireball - focused witchfire","T","3",3,6,2,"D3","dev hazardous psychic","18\""],
  ["Changecaster","➤ Arcane Fireball - witchfire","T","3",3,5,1,"D3","psychic","18\""],
  ["Changecaster","Herald combat weapon","C","3",4,4,1,"1","psychic","càc"],
  ["Contorted Epitome","Coiled tentacles","C","D6",4,5,1,"2","extra","càc"],
  ["Contorted Epitome","Ravaging claws","C","8",2,4,1,"1","dev","càc"],
  ["Daemon Prince of Chaos","Infernal cannon","T","3",2,5,1,"2","","24\""],
  ["Daemon Prince of Chaos","➤ Hellforged weapons - strike","C","6",2,8,2,"3","","càc"],
  ["Daemon Prince of Chaos","➤ Hellforged weapons - sweep","C","14",2,6,0,"1","","càc"],
  ["Daemon Prince of Chaos with wings","Infernal cannon","T","3",2,5,1,"2","","24\""],
  ["Daemon Prince of Chaos with wings","➤ Hellforged weapons - strike","C","6",2,8,2,"3","","càc"],
  ["Daemon Prince of Chaos with wings","➤ Hellforged weapons - sweep","C","14",2,6,0,"1","","càc"],
  ["Daemonettes","Slashing claws","C","3",3,4,1,"1","dev","càc"],
  ["Epidemius","Balesword and nurgling attendants","C","D6+3",3,5,2,"2","lethal","càc"],
  ["Exalted Flamer","➤ Fires of Tzeentch - blue fire","T","3",3,9,3,"3","ignorescover psychic","18\""],
  ["Exalted Flamer","➤ Fires of Tzeentch - pink fire","T","2D6",0,5,1,"1","ignorescover psychic torrent","12\""],
  ["Exalted Flamer","Flamer mouths","C","4",4,5,0,"1","","càc"],
  ["Fateskimmer","➤ Arcane Fireball - focused witchfire","T","3",3,6,2,"D3","dev hazardous psychic","18\""],
  ["Fateskimmer","➤ Arcane Fireball - witchfire","T","3",3,5,1,"D3","psychic","18\""],
  ["Fateskimmer","Herald combat weapon","C","3",4,4,1,"1","psychic","càc"],
  ["Fateskimmer","Screamer bites","C","6",3,6,2,"2","anti:4:mon anti:4:veh extra","càc"],
  ["Fiends","Barbed tail and dissecting claws","C","5",3,5,2,"2","dev","càc"],
  ["Flamers","Flickering Flames","T","D6",0,4,1,"1","ignorescover psychic torrent","12\""],
  ["Flamers","Flamer mouths","C","3",4,4,0,"1","","càc"],
  ["Flesh Hounds","Burning roar","T","D6",0,4,0,"1","ignorescover torrent","12\""],
  ["Flesh Hounds","Gore-drenched fangs","C","3",3,5,1,"1","","càc"],
  ["Fluxmaster","➤ Arcane Fireball - focused witchfire","T","3",3,6,2,"D3","dev hazardous psychic","18\""],
  ["Fluxmaster","➤ Arcane Fireball - witchfire","T","3",3,5,1,"D3","psychic","18\""],
  ["Fluxmaster","Herald combat weapon","C","3",4,4,1,"1","psychic","càc"],
  ["Furies","Daemonic claws","C","2",4,4,0,"1","","càc"],
  ["Giant Chaos Spawn","Churning fangs and claws","C","D6+6",3,10,1,"2","","càc"],
  ["Great Unclean One","Plague flail","T","D6+1",3,7,2,"2","","6\""],
  ["Great Unclean One","Putrid vomit","T","D6+3",0,5,2,"1","ignorescover torrent","12\""],
  ["Great Unclean One","Bileblade","C","3",2,6,2,"2","extra lethal","càc"],
  ["Great Unclean One","Doomsday bell","C","6",2,7,1,"2","lethal","càc"],
  ["Great Unclean One","➤ Bilesword - strike","C","6",2,10,2,"D6+1","lethal","càc"],
  ["Great Unclean One","➤ Bilesword - sweep","C","12",2,7,1,"1","lethal","càc"],
  ["Hellflayers","Lashes of torment (tir)","T","3",3,4,1,"2","anti:3:inf assault pistol","12\""],
  ["Hellflayers","Lashes of torment (càc)","C","3",3,4,1,"2","anti:3:inf extra","càc"],
  ["Hellflayers","Seeker tongues","C","4",4,4,0,"1","extra lethal","càc"],
  ["Hellflayers","Slashing claws","C","8",3,4,1,"1","dev","càc"],
  ["Herald of Slaanesh on Steed of Slaanesh","Lashing tongue","C","2",4,4,0,"1","extra lethal","càc"],
  ["Herald of Slaanesh on Steed of Slaanesh","Ravaging claws","C","6",2,4,1,"1","dev","càc"],
  ["Horticulous Slimux","Acidic maw","C","2",4,7,4,"3","dev extra","càc"],
  ["Horticulous Slimux","Lopping shears","C","4",3,6,2,"3","lethal","càc"],
  ["Infernal Enrapturess","➤ Heartstring lyre - cacophonous melody","T","6",3,6,0,"1","assault","18\""],
  ["Infernal Enrapturess","➤ Heartstring lyre - euphonic blast","T","1",3,12,3,"D6+1","assault","24\""],
  ["Infernal Enrapturess","Ravaging claws","C","5",2,4,1,"1","dev","càc"],
  ["Kairos Fateweaver","➤ Infernal Gateway - focused witchfire","T","D3+6",2,9,2,"3","blast indirect hazardous psychic","24\""],
  ["Kairos Fateweaver","➤ Infernal Gateway - witchfire","T","D6+3",2,9,2,"D3","blast indirect psychic","24\""],
  ["Kairos Fateweaver","Staff of Tomorrow","C","5",3,8,2,"2D3","psychic","càc"],
  ["Karanak","Scalding Roar","T","D6+3",0,5,1,"1","ignorescover torrent","12\""],
  ["Karanak","Soul-rending fangs","C","6",2,6,2,"2","anti:3:perso precision","càc"],
  ["Keeper of Secrets","Living whip","T","6",2,6,1,"2","assault","12\""],
  ["Keeper of Secrets","➤ Phantasmagoria - focused witchfire","T","9",2,6,2,"1","dev hazardous psychic","18\""],
  ["Keeper of Secrets","➤ Phantasmagoria - witchfire","T","6",2,6,2,"1","dev psychic","18\""],
  ["Keeper of Secrets","Ritual knife","C","3",2,6,2,"2","extra","càc"],
  ["Keeper of Secrets","Snapping claws","C","4",2,6,2,"3","dev extra","càc"],
  ["Keeper of Secrets","Witstealer sword","C","6",2,8,2,"3","","càc"],
  ["Lord of Change","Rod of sorcery","T","6",2,8,1,"2","psychic","18\""],
  ["Lord of Change","➤ Bolt of Change - focused witchfire","T","9",2,9,2,"3","hazardous psychic","18\""],
  ["Lord of Change","➤ Bolt of Change - witchfire","T","9",2,9,1,"1","psychic","18\""],
  ["Lord of Change","Baleful sword","C","3",3,7,2,"3","extra","càc"],
  ["Lord of Change","Staff of Tzeentch","C","5",3,6,1,"3","psychic","càc"],
  ["Nurglings","Diseased claws and teeth","C","4",5,2,0,"1","lethal","càc"],
  ["Pink Horrors","Coruscating Blue flames (ref. only)","T","2",4,3,1,"1","pistol psychic","18\""],
  ["Pink Horrors","Coruscating Pink flames","T","2",3,4,1,"1","pistol psychic","18\""],
  ["Pink Horrors","Coruscating Yellow flames (ref. only)","T","2",5,2,1,"1","pistol psychic","18\""],
  ["Pink Horrors","Blue claws (ref. only)","C","1",5,3,0,"1","","càc"],
  ["Pink Horrors","Pink claws","C","1",4,3,0,"1","","càc"],
  ["Pink Horrors","Yellow claws (ref. only)","C","2",5,2,0,"1","","càc"],
  ["Plague Drones","Death's heads","T","D3",4,4,0,"1","blast lethal","12\""],
  ["Plague Drones","Foul mouthparts","C","2",4,5,1,"2","extra lethal","càc"],
  ["Plague Drones","Plaguesword","C","2",3,4,1,"1","lethal","càc"],
  ["Plague Toads","Grasping tongue","T","D3",4,5,0,"1","lethal","9\""],
  ["Plague Toads","Yawning maw","C","3",3,6,1,"2","lethal","càc"],
  ["Plaguebearers","Plaguesword","C","2",3,4,1,"1","lethal","càc"],
  ["Pox Riders","Grasping tongue","T","D3",4,5,0,"1","lethal","9\""],
  ["Pox Riders","Pox rider plaguesword","C","2",3,4,1,"1","extra lethal","càc"],
  ["Pox Riders","Yawning maw","C","3",3,6,1,"2","lethal","càc"],
  ["Poxbringer","Foul balesword","C","4",3,5,2,"2","lethal","càc"],
  ["Rendmaster on Blood Throne","Attendant's hellblades","C","4",3,5,2,"2","extra","càc"],
  ["Rendmaster on Blood Throne","Blade of blood","C","5",2,6,2,"3","","càc"],
  ["Rotigus","Streams of brackish filth","T","2D6",0,8,2,"1","dev ignorescover torrent","12\""],
  ["Rotigus","➤ Gnarlrod - strike","C","7",2,10,3,"3","lethal psychic","càc"],
  ["Rotigus","➤ Gnarlrod - sweep","C","14",2,8,1,"1","lethal psychic","càc"],
  ["Scabeiathrax the Bloated","Putrid vomit","T","D6+3",0,5,2,"1","ignorescover torrent","6\""],
  ["Scabeiathrax the Bloated","➤ Blade of decay - strike","C","7",2,9,2,"D6","lethal","càc"],
  ["Scabeiathrax the Bloated","➤ Blade of decay - sweep","C","14",2,7,1,"1","lethal","càc"],
  ["Screamers","Lamprey bite","C","3",3,6,2,"2","anti:4:mon anti:4:veh","càc"],
  ["Seekers","Lashing tongues","C","2",4,4,0,"1","extra lethal","càc"],
  ["Seekers","Slashing claws","C","3",3,4,1,"1","dev","càc"],
  ["Shalaxi Helbane","Lash of Slaanesh","T","6",2,6,1,"2","assault","12\""],
  ["Shalaxi Helbane","➤ Pavane of Slaanesh - focused witchfire","T","D6",2,9,2,"D3","hazardous dev psychic sust:3","18\""],
  ["Shalaxi Helbane","➤ Pavane of Slaanesh - witchfire","T","D6",2,9,1,"D3","dev psychic","18\""],
  ["Shalaxi Helbane","Snapping claws","C","4",2,6,2,"3","dev extra","càc"],
  ["Shalaxi Helbane","Soulpiercer","C","6",2,12,3,"D6+2","precision","càc"],
  ["Skarbrand","Bellow of endless fury","T","2D6",0,8,1,"1","ignorescover torrent","12\""],
  ["Skarbrand","➤ Slaughter and Carnage - strike","C","8",2,16,4,"6","","càc"],
  ["Skarbrand","➤ Slaughter and Carnage - sweep","C","16",2,8,2,"2","","càc"],
  ["Skull Cannon","Skull cannon","T","D6+2",3,9,1,"2","blast","48\""],
  ["Skull Cannon","Attendant's hellblades","C","4",3,5,2,"2","extra","càc"],
  ["Skull Cannon","Biting maw","C","2",4,6,0,"2","","càc"],
  ["Skullmaster","Blade of blood","C","5",2,6,2,"3","","càc"],
  ["Skullmaster","Juggernaut's bladed horn","C","4",4,6,1,"1","extra lance","càc"],
  ["Skulltaker","The Slayer Sword","C","6",2,6,2,"3","dev precision","càc"],
  ["Sloppity Bilepiper","Marotter","C","4",3,5,0,"1","lethal","càc"],
  ["Spined Chaos Beast","Jagged claws and tusked maw","C","6",3,12,2,"3","","càc"],
  ["Spoilpox Scrivener","Disgusting Sneezes","T","D6",0,3,0,"1","pistol torrent","6\""],
  ["Spoilpox Scrivener","Plaguesword and distended maw","C","6",3,5,1,"1","lethal","càc"],
  ["Syll'esske","Scourging whip (tir)","T","6",3,4,1,"1","assault","9\""],
  ["Syll'esske","➤ Cacophonic choir - focused witchfire","T","2D6",0,6,1,"1","dev hazardous ignorescover psychic torrent","12\""],
  ["Syll'esske","➤ Cacophonic choir - witchfire","T","D6",0,6,1,"1","dev ignorescover psychic torrent","12\""],
  ["Syll'esske","Axe of Dominion","C","6",3,7,2,"3","","càc"],
  ["Syll'esske","Scourging whip (càc)","C","6",2,4,1,"1","extra","càc"],
  ["The Blue Scribes","Sharp quills","C","4",5,2,0,"1","anti:2","càc"],
  ["The Changeling","➤ Infernal Flames - focused witchfire","T","D6+3",0,6,1,"D3","hazardous ignorescover psychic torrent","12\""],
  ["The Changeling","➤ Infernal Flames - witchfire","T","D6",0,6,1,"1","ignorescover psychic torrent","12\""],
  ["The Changeling","The Trickster's Staff","C","3",4,4,1,"D3","psychic","càc"],
  ["The Masque of Slaanesh","Serrated claws","C","6",2,4,1,"2","dev","càc"],
  ["Tormentbringer","Lashes of torment (tir)","T","6",2,4,1,"2","anti:3:inf assault pistol","12\""],
  ["Tormentbringer","Lashes of torment (càc)","C","6",2,4,1,"2","anti:3:inf extra","càc"],
  ["Tormentbringer","Seeker tongues","C","4",4,4,0,"1","extra lethal","càc"],
  ["Tormentbringer","Slashing claws","C","8",3,4,1,"1","dev","càc"],
  ["Tranceweaver","Ravaging claws","C","6",2,4,1,"1","dev","càc"],
  ["Zarakynel","➤ Phantasmagoria - focused witchfire","T","9",2,6,2,"1","dev hazardous psychic","18\""],
  ["Zarakynel","➤ Phantasmagoria - witchfire","T","6",2,6,2,"1","dev psychic","18\""],
  ["Zarakynel","Snapping claws","C","4",2,6,2,"3","dev extra","càc"],
  ["Zarakynel","Souleater blade","C","6",2,9,2,"3","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Aetaos'rau'keres","Epic Hero"],
  ["An'ggrath the Unbound","Epic Hero"],
  ["Be'lakor","Epic Hero"],
  ["Beasts of Nurgle","Bête"],
  ["Bloodcrushers","Monté"],
  ["Bloodletters","Battleline"],
  ["Bloodmaster","Personnage"],
  ["Bloodthirster","Monstre"],
  ["Blue Horrors","Battleline"],
  ["Burning Chariot","Monté"],
  ["Changecaster","Personnage"],
  ["Contorted Epitome","Personnage"],
  ["Daemon Prince of Chaos","Monstre"],
  ["Daemon Prince of Chaos with wings","Monstre"],
  ["Daemonettes","Battleline"],
  ["Epidemius","Epic Hero"],
  ["Exalted Flamer","Personnage"],
  ["Fateskimmer","Personnage"],
  ["Feculent Gnarlmaw","Fortification"],
  ["Fiends","Bête"],
  ["Flamers","Infanterie"],
  ["Flesh Hounds","Bête"],
  ["Fluxmaster","Personnage"],
  ["Furies","Infanterie"],
  ["Giant Chaos Spawn","Monstre"],
  ["Great Unclean One","Monstre"],
  ["Hellflayers","Monté"],
  ["Herald of Slaanesh on Steed of Slaanesh","Personnage"],
  ["Horticulous Slimux","Epic Hero"],
  ["Infernal Enrapturess","Personnage"],
  ["Kairos Fateweaver","Epic Hero"],
  ["Karanak","Epic Hero"],
  ["Keeper of Secrets","Monstre"],
  ["Lord of Change","Monstre"],
  ["Nurglings","Battleline"],
  ["Pink Horrors","Battleline"],
  ["Plague Drones","Monté"],
  ["Plague Toads","Bête"],
  ["Plaguebearers","Battleline"],
  ["Pox Riders","Monté"],
  ["Poxbringer","Personnage"],
  ["Rendmaster on Blood Throne","Personnage"],
  ["Rotigus","Epic Hero"],
  ["Scabeiathrax the Bloated","Epic Hero"],
  ["Screamers","Bête"],
  ["Seekers","Monté"],
  ["Shalaxi Helbane","Epic Hero"],
  ["Skarbrand","Epic Hero"],
  ["Skull Altar","Fortification"],
  ["Skull Cannon","Monté"],
  ["Skullmaster","Personnage"],
  ["Skulltaker","Epic Hero"],
  ["Sloppity Bilepiper","Personnage"],
  ["Spined Chaos Beast","Monstre"],
  ["Spoilpox Scrivener","Personnage"],
  ["Syll'esske","Epic Hero"],
  ["The Blue Scribes","Epic Hero"],
  ["The Changeling","Epic Hero"],
  ["The Masque of Slaanesh","Epic Hero"],
  ["Tormentbringer","Personnage"],
  ["Tranceweaver","Personnage"],
  ["Zarakynel","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Bloodmaster": [
  "Bloodletters"
 ],
 "Changecaster": [
  "Blue Horrors",
  "Pink Horrors"
 ],
 "Contorted Epitome": [
  "Daemonettes"
 ],
 "Epidemius": [
  "Plaguebearers"
 ],
 "Exalted Flamer": [
  "Flamers"
 ],
 "Fateskimmer": [
  "Screamers"
 ],
 "Fluxmaster": [
  "Blue Horrors",
  "Pink Horrors"
 ],
 "Herald of Slaanesh on Steed of Slaanesh": [
  "Seekers"
 ],
 "Horticulous Slimux": [
  "Beasts of Nurgle",
  "Plague Toads",
  "Pox Riders"
 ],
 "Infernal Enrapturess": [
  "Daemonettes"
 ],
 "Karanak": [
  "Flesh Hounds"
 ],
 "Poxbringer": [
  "Plaguebearers"
 ],
 "Skullmaster": [
  "Bloodcrushers"
 ],
 "Skulltaker": [
  "Bloodletters"
 ],
 "Sloppity Bilepiper": [
  "Plaguebearers"
 ],
 "Spoilpox Scrivener": [
  "Plaguebearers"
 ],
 "Syll'esske": [
  "Daemonettes"
 ],
 "Tormentbringer": [
  "Hellflayers"
 ],
 "Tranceweaver": [
  "Daemonettes"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Skarbrand": [
  [
   "Rage Embodied (Aura)",
   "While a friendly Khorne Legiones Daemonica unit is within 6\" of this model, add 1 to the Attacks characteristic of melee weapons equipped by models in that unit."
  ],
  [
   "Murderlust",
   "This unit is eligible to declare a charge in a turn in which it Advanced."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, add 2 to the Attacks characteristic of this model’s Slaughter and Carnage."
  ],
  [
   "Greater Daemon of Khorne (Aura)",
   "While a friendly Khorne Legiones Daemonica unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Bloodthirster": [
  [
   "Daemon Lord of Khorne (Aura)",
   "While a friendly Khorne Legiones Daemonica unit is within 6\" of this model, each time a model in that unit makes a melee attack, add 1 to the Hit roll."
  ],
  [
   "Relentless Carnage",
   "At the end of the Fight phase, you can select one enemy unit within Engagement Range of this model and roll eight D6: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Khorne (Aura)",
   "While a friendly Khorne Legiones Daemonica unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Skulltaker": [
  [
   "Lord of Decapitations",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Skulls for Khorne",
   "Each time this model makes an attack that targets a Character unit, you can re-roll the Hit roll and you can re-roll the Wound roll. Each time this model destroys an enemy Character unit, you gain 1CP."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ BLOODLETTERS"
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Bloodmaster": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ BLOODLETTERS"
  ],
  [
   "Bloodmaster",
   "While this model is leading a unit, each time a model in that unit makes an attack, add 1 to the Wound roll."
  ],
  [
   "A Gory Path",
   "Each time this model’s unit Consolidates, it can move up to 6\" instead of up to 3\"."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Skullmaster": [
  [
   "Skullmaster’s Fury",
   "While this model is leading a unit, each time that unit ends a Charge move, until the end of the turn, Juggernaut’s bladed horns equipped by models in that unit have the [DEVASTATING WOUNDS] ability."
  ],
  [
   "Devastating Charge",
   "Each time this model’s unit ends a Charge move, each enemy unit within Engagement Range of that unit must take a Battle-shock test."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n■ BLOODCRUSHERS"
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Rendmaster on Blood Throne": [
  [
   "Blood Throne",
   "At the start of the Fight phase, select one enemy unit within 18\" of and visible to this model. Until the end of the phase, each time a friendly KHORNE LEGIONES DAEMONICA unit makes an attack that targets that unit, improve the Strength, Armour Penetration and Damage characteristics of that attack by 1."
  ],
  [
   "Champion Slayer",
   "Each time this model makes a melee attack that targets a CHARACTER or MONSTER unit, you can re-roll the Wound roll. Each time this model destroys an enemy CHARACTER or MONSTER unit, this model regains up to D6 lost wounds."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Karanak": [
  [
   "Pack Leader",
   "While this model is leading a unit, you can re-roll Advance and Charge rolls made for that unit."
  ],
  [
   "Prey of the Blood God",
   "At the start of the first battle round, select one enemy unit to be this model’s prey. Each time a model in this model’s unit makes a melee attack that targets its prey, you can re-roll the Wound roll. Each time this model’s prey is destroyed, select one new enemy unit to be this model’s prey."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ FLESH HOUNDS"
  ],
  [
   "Brass Collar of Bloody Vengeance",
   "The bearer has the Feel No Pain 3+ ability against Psychic Attacks and mortal wounds."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Bloodletters": [
  [
   "Bane of Cowards",
   "Each time an enemy unit (excluding Monsters and Vehicles) within Engagement Range of one or more units from your army with this ability Falls Back, models in that enemy unit must take Desperate Escape tests. When doing so, if that enemy unit is also Battle-shocked, subtract 1 from each of those Desperate Escape tests."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Bloodcrushers": [
  [
   "Brass Stampede",
   "Each time this unit ends a Charge move, select one enemy unit within Engagement Range of this unit and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Flesh Hounds": [
  [
   "Hunters from the Warp",
   "At the end of your opponent’s turn, if this unit is not within Engagement Range of one or more enemy units, you can remove it from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Collar of Khorne",
   "The bearer has the Feel No Pain 3+ ability against Psychic Attacks."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Skull Cannon": [
  [
   "Skulls of the Fallen",
   "In your Shooting phase, after this model has shot, select one enemy unit that was hit by one or more of those attacks. That unit must take a Battle-shock test."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Skull Altar": [
  [
   "Shadow of Khorne (Aura)",
   "The area of the battlefield within 6\" of this FORTIFICATION is considered to be within your army’s Shadow of Chaos. In addition, while a friendly KHORNE LEGIONES DAEMONICA unit is within 6\" of this Fortification, each time you take a Battle-shock test for that unit, you can re-roll that test."
  ],
  [
   "Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Be'lakor": [
  [
   "The Dark Master (Aura)",
   "The area of the battlefield within 6\" of this model is considered to be within your army’s Shadow of Chaos."
  ],
  [
   "Shadow Form",
   "At the start of the battle round, select one Shadow Form ability. Until the end of the battle round, this model has that ability."
  ],
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Disciples of Be'lakor",
   "- This unit has the Dark Pacts army rule, and can use it as described in _Codex: Chaos Space Marines_, even though your Army Faction is not Heretic Astartes. If this unit is Be’lakor, it automatically passes the Leadership test required for Dark Pacts. \n- Shadow Legion Heretic Astartes models in this unit have the Deep Strike ability."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Daemon Prince of Chaos": [
  [
   "Prince of Darkness (Aura)",
   "While a friendly LEGIONES DAEMONICA unit is within 6\" of this model, models in that unit have the Stealth ability."
  ],
  [
   "Unholy Vigour",
   "Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, this model has a 3+ invulnerable save."
  ],
  [
   "Daemonic Lord",
   "While this model is within 3\" of one or more friendly Legiones Daemonica Infantry units, this model has the Lone Operative ability."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Daemon Prince of Chaos with wings": [
  [
   "Malefic Destruction",
   "Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of this model’s hellforged weapons."
  ],
  [
   "Harbinger of Death",
   "Each time this model is selected to fight, select one of the following abilities. Until the end of the phase, this model’s hellforged weapons have that ability:\n■ [LETHAL HITS]\n■ [PRECISION]\n■ [SUSTAINED HITS 1]"
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Kairos Fateweaver": [
  [
   "One Head Looks Forward",
   "At the end of your Command phase, if this model is on the battlefield, take a Leadership test for this model; if that test is passed, you gain 1CP."
  ],
  [
   "One Head Looks Back (Aura)",
   "Once per turn, when your opponent targets a unit from their army within 12\" of this model with a stratagem, you can use this ability. If you do, increase the CP cost of that use of that stratagem by 1CP."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Tzeentch (Aura)",
   "While a friendly TZEENTCH LEGIONES DAEMONICA unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Lord of Change": [
  [
   "Daemon Lord of Tzeentch (Aura)",
   "While a friendly TZEENTCH LEGIONES DAEMONICA unit is within 6\" of this model, each time a model in that unit makes a ranged attack, add 1 to the Strength characteristic of that attack."
  ],
  [
   "Master of Magicks (Psychic)",
   "In your Shooting phase, select one of the following abilities: [IGNORES COVER]; [LETHAL HITS]; [SUSTAINED HITS D3]. Until the end of the phase, this model’s Bolt of Change has that ability."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Tzeentch (Aura)",
   "While a friendly TZEENTCH LEGIONES DAEMONICA unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "The Changeling": [
  [
   "Formless Horror",
   "Each time an enemy unit wishes to select this model as the target of an attack, that unit must first take a Battle-shock test. If that test is failed, in addition to being Battle-shocked, that enemy unit cannot target this model this phase."
  ],
  [
   "Mischief and Confusion",
   "At the start of your opponent’s Shooting phase, select one enemy unit within 12\" of and visible to this model and roll one D6: on a 2-5, until the end of the phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll; on a 6, that enemy unit is not eligible to shoot this phase"
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Fateskimmer": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ SCREAMERS"
  ],
  [
   "Fateskimmer",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."
  ],
  [
   "Rider of the Immaterial Winds",
   "Once per battle, at the end of your opponent’s turn, if this model’s unit is not within Engagement Range of one or more enemy units, you can remove that unit from the battlefield and place it into Strategic Reserves."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Fluxmaster": [
  [
   "Leader",
   "This model can be attached to the following units:\n■ PINK HORRORS\n■ BLUE HORRORS"
  ],
  [
   "Fluxmaster",
   "- This unit has Stealth. \n- Melee attacks that target this unit have -1 to hit rolls."
  ],
  [
   "Altered Reality (Psychic)",
   "Once per battle round, after a Hit roll, a Wound roll or a saving throw is made for this model, you can change the result of that roll to a 6."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "The Blue Scribes": [
  [
   "P’tarix’s Sorcerous Syphon (Aura)",
   "While an enemy unit is within 12\" of this model, each time a model in that unit makes a Psychic Attack, subtract 1 from the Wound roll."
  ],
  [
   "Xirat’p’s Sorcerous Barrages (Psychic)",
   "At the end of your Movement phase, roll one D6 for each enemy unit within 6\" of this model: on a 2-3, that unit suffers 1 mortal wound; on a 4-5, that unit suffers D3 mortal wounds; on a 6, that unit suffers D6 mortal wounds."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Changecaster": [
  [
   "Changecaster",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Storm of Mutating Sorcery (Psychic)",
   "In your Shooting phase, after this model has shot, select one enemy Infantry unit hit by one or more of those attacks. That unit must take a Battle-shock test."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n■ PINK HORRORS\n■ BLUE HORRORS"
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Blue Horrors": [
  [
   "Split",
   "Each time a Blue Horror model in this unit is destroyed, after the attacking unit has finished making its attacks, if this unit is not destroyed, roll one D6 for that model. On a 4+, add one Brimstone Horror model to this unit."
  ],
  [
   "Sullen Malevolence (Aura)",
   "While an enemy unit is within 6\" of this unit, if this unit contains one or more Blue Horror models, worsen the Leadership characteristic of models in that enemy unit by 1."
  ],
  [
   "Exploding Horrors",
   "Each time this unit is selected to fight, you can select one enemy unit within Engagement Range of it, then select one or more Brimstone Horror models in this unit. For each Brimstone Horror model you select, roll one D6: on a 4+, that model is destroyed and that enemy unit suffers 1 mortal wound."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Pink Horrors": [
  [
   "Split",
   "Each time a Pink Horror or Blue Horror model in this unit is destroyed, after the attacking unit has finished making its attacks, if this unit is not destroyed, roll one D6 for that model. On a 4+, if it was a Pink Horror, add two Blue Horror models to this unit, and if it was a Blue Horror, add one Brimstone Horror model to this unit."
  ],
  [
   "Horrors are Pink. Horrors are Blue. Where once there was one, now there are two.",
   "If, at any point, this unit contains no Pink Horrors models, use the Blue Horrors datasheet for this unit. \n\n\n_Designer’s Note: While this unit contains one or more Pink Horrors models, the Cackling Horrors and Exploding Horrors abilities from the Blue Horrors datasheet do not apply to this unit._"
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Flamers": [
  [
   "Bounding Leaps",
   "This unit is eligible to shoot in a turn in which it Fell Back."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Exalted Flamer": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ FLAMERS"
  ],
  [
   "Blazing Warpfire (Psychic)",
   "While this model is leading a unit, ranged weapons equipped by models in that unit have the [ASSAULT] ability."
  ],
  [
   "Flames of Change (Psychic)",
   "In your Shooting phase, after this model has shot, select one enemy unit (excluding MONSTERS and VEHICLES) hit by one or more of those attacks, and roll one D6. On a 4+, until the end of your opponent’s next turn, that enemy unit is aflame. While a unit is aflame, subtract 2\" from its Move characteristic and subtract 2 from Advance and Charge rolls made for it."
  ],
  [
   "Manifestation of Destruction",
   "This model cannot be your Warlord and cannot be given Enhancements."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Screamers": [
  [
   "Slashing Dive",
   "In your Movement phase, after this unit ends a Normal move, you can select one enemy unit it moved over during that move and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Burning Chariot": [
  [
   "Eldritch Flames (Psychic)",
   "In your Shooting phase, after this model has shot, select one enemy unit that was hit by one or more of those attacks. Until the end of the phase, that unit cannot have the Benefit of Cover."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Rotigus": [
  [
   "Virulent Blessing (Psychic)",
   "At the start of the Fight phase, you can select one enemy unit within 24\" of and visible to this model. Until the end of the phase, each time an attack made by a NURGLE LEGIONES DAEMONICA model is allocated to a model in that unit, add 1 to the Damage characteristic of that attack."
  ],
  [
   "Deluge of Nurgle (Aura)",
   "While an enemy unit is within 6\" of this model, subtract 2 from the Move characteristic and subtract 1 from the Objective Control characteristic of models in that unit."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Nurgle (Aura)",
   "While a friendly NURGLE LEGIONES DAEMONICA unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Great Unclean One": [
  [
   "Daemon Lord of Nurgle (Aura)",
   "While a friendly Nurgle Legiones Daemonica unit is within 6\" of this model, add 1 to the Toughness characteristic of models in that unit."
  ],
  [
   "Nurgle’s Rot (Psychic)",
   "At the end of your Movement phase, you can select one enemy unit within 12\" of this model. Until the start of your next Movement phase, subtract 1 from the Toughness characteristic of models in that unit."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Nurgle (Aura)",
   "While a friendly NURGLE LEGIONES DAEMONICA unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Poxbringer": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ PLAGUEBEARERS"
  ],
  [
   "Poxbringer",
   "While this model is leading a unit, each time a model in that unit makes an attack, a successful unmodified Hit roll of 5+ scores a Critical Hit."
  ],
  [
   "Feculent Despair (Aura, Psychic)",
   "While an enemy unit is within 6\" of this model, each time that unit takes a Battle-shock test, subtract 1 from that test."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Spoilpox Scrivener": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ PLAGUE BEARERS"
  ],
  [
   "Keep Counting!",
   "While this model is leading a unit, melee weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Meet Your Quota!",
   "While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Epidemius": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ PLAGUEBEARERS"
  ],
  [
   "Blessed by the Plague God",
   "While this model is leading a unit, models in that unit have a 4+ invulnerable save."
  ],
  [
   "Tally of Pestilence",
   "Keep a tally of how many enemy models are destroyed by NURGLE LEGIONES DAEMONICA models from your army during the battle. At the start of your Command phase, if this tally is 7 or more, you gain 1CP and the tally is reset to 0."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Sloppity Bilepiper": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ PLAGUEBEARERS"
  ],
  [
   "Jolly Gutpipes",
   "While this model is leading a unit, add 1 to the Move characteristic of models in that unit and you can re-roll Advance rolls made for that unit."
  ],
  [
   "Disease of Mirth (Aura)",
   "At the start of the Fight phase, every enemy unit (excluding Monsters and Vehicles) within 6\" of this model must take a Battle-shock test."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Horticulous Slimux": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ BEASTS OF NURGLE"
  ],
  [
   "Beast Handler",
   "While this model is leading a unit, you can re-roll charge rolls made for that unit. In addition, once per battle, you can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do: \n- That use is -1 CP.\n- That use does not prevent any uses of that stratagem on other units this phase."
  ],
  [
   "Seed the Garden of Nurgle",
   "At the end of your Movement phase, if this model is within one AREA TERRAIN feature, until the end of the battle, that AREA TERRAIN feature is considered to be within your army’s Shadow of Chaos."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Plaguebearers": [
  [
   "Infected Outbreak",
   "If you control an objective marker at the end of your Command phase and this unit is within range of that objective marker, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Nurglings": [
  [
   "Mischief Makers (Aura)",
   "Each time an enemy unit (excluding Titanic units) within Engagement Range of one or more units with this ability is selected to fight, until the end of the phase, each time a model in that enemy unit makes a melee attack, subtract 1 from the Hit roll."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Beasts of Nurgle": [
  [
   "Grotesque Regeneration",
   "At the end of each phase, if a Beasts of Nurgle model in this unit has lost any wounds but is not destroyed, that model regains all of its lost wounds."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Plague Drones": [
  [
   "Death’s Heads",
   "In your Shooting phase, after this unit has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly NURGLE LEGIONES DAEMONICA unit makes an attack that targets that unit, you can re-roll the Wound roll."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Feculent Gnarlmaw": [
  [
   "Shroud of Flies (Aura)",
   "While a friendly NURGLE LEGIONES DAEMONICA unit is within 6\" of this Fortification, models in that unit have the Stealth ability."
  ],
  [
   "Diseased Cover",
   "Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Shalaxi Helbane": [
  [
   "No Prey Can Evade",
   "You can re-roll Advance and Charge rolls made for this model."
  ],
  [
   "Monarch of the Hunt",
   "At the start of the first battle round, select one enemy unit to be this model’s quarry. Each time this model makes a melee attack that targets its quarry, you can re-roll the Hit roll and you can re-roll the Wound roll. Each time this model’s quarry is destroyed, select one new enemy unit to be this model’s quarry."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Slaanesh (Aura)",
   "While a friendly Slaanesh Legiones Daemonica unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Keeper of Secrets": [
  [
   "Daemon Lord of Slaanesh (Aura)",
   "While a friendly Slaanesh Legiones Daemonica unit is within 6\" of this model, improve the Armour Penetration of melee weapons in that unit by 1."
  ],
  [
   "Mesmerising Form",
   "Each time an attack targets this model, subtract 1 from the Hit roll."
  ],
  [
   "Shining aegis",
   "The bearer has a Save Characteristic of 3+."
  ],
  [
   "Damaged: 1-6 wounds remaining",
   "While this model has 1-6 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Greater Daemon of Slaanesh (Aura)",
   "While a friendly Slaanesh Legiones Daemonica unit is within 6\" of this model, that unit is within your army’s Shadow of Chaos."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Infernal Enrapturess": [
  [
   "Leader",
   "This model can be attached to the following unit:\n■ DAEMONETTES"
  ],
  [
   "Harmonic Alignment",
   "While this model is leading a unit, in your Command phase, you can return D3 destroyed Bodyguard models to that unit."
  ],
  [
   "Discordant Disruption (Aura)",
   "While an enemy Psyker unit is within 12\" of this model, Psychic weapons equipped by models in that unit have the [HAZARDOUS] ability."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "The Masque of Slaanesh": [
  [
   "The Eternal Dance",
   "At the start of the Fight phase, select one enemy unit within 6\" of this model. Until the end of the phase:\n■ Each time a friendly SLAANESH LEGIONES DAEMONICA model makes a melee attack that targets that enemy unit, add 1 to the Wound roll.\n■ Each time a model in that enemy unit makes a melee attack, subtract 1 from the Wound roll."
  ],
  [
   "Dazzling Acrobatics",
   "This model is eligible to declare a charge in a turn in which it Advanced or Fell Back."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Syll'esske": [
  [
   "Prince of Slaanesh",
   "While this model is leading a unit, each time a model in that unit makes a melee attack, a successful unmodified Wound roll of 5+ scores a Critical Wound."
  ],
  [
   "Delightful Agonies",
   "The first time this model is destroyed, roll one D6 at the end of the phase. On a 2+, set this model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ DAEMONETTES"
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Contorted Epitome": [
  [
   "Swallow Energy (Psychic)",
   "While this model is leading a unit, models in that unit have the Feel No Pain 4+ ability against mortal wounds and Psychic Attacks."
  ],
  [
   "Horrible Fascination (Psychic)",
   "At the start of your opponent’s Shooting phase, one PSYKER model from your army with this ability can use it. If it does, select one enemy unit within 12\" of and visible to that PSYKER model and roll one D6: on a 1, that PSYKER model suffers D3 mortal wounds; on a 2-5, until the end of the phase, each time a model in that enemy unit makes an attack, subtract 1 from the Hit roll; on a 6, that enemy unit is not eligible to shoot this phase."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ DAEMONETTES"
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Tormentbringer": [
  [
   "Tormentbringer (Aura)",
   "While a friendly Slaanesh Legions Daemonica unit is within 6\" of this model, melee weapons in that unit have the [SUSTAINED HITS 1] ability."
  ],
  [
   "Hysterical Frenzy",
   "Each time a model in this model’s unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play."
  ],
  [
   "Leader",
   "This model can be attached to the following unit: \n- Hellflayers"
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Tranceweaver": [
  [
   "Tranceweaver",
   "Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target of that attack is within range of an objective marker, you can re-roll the Hit roll instead."
  ],
  [
   "Symphony of Pain (Psychic)",
   "At the end of your Movement phase, you can select one enemy unit that is Battle-shocked and within 12\" of this model. Until the end of the turn, each time a SLAANESH LEGIONES DAEMONICA model from your army makes an attack that targets that enemy unit, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ DAEMONETTES"
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Daemonettes": [
  [
   "Horrifying Beauty",
   "At the start of the Fight phase, each enemy unit within Engagement Range of one of more units from your army with this ability must take a Battle-shock test, subtracting 1 from the result if that enemy unit is Below Half-strength."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Fiends": [
  [
   "Soporific Musk",
   "Each time an enemy unit (excluding Monsters and Vehicles) within Engagement Range of one or more units from your army with this ability Falls Back, models in that enemy unit must take Desperate Escape tests. When doing so, if that enemy unit is also Battle-shocked, subtract 1 from each of those Desperate Escape tests."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Seekers": [
  [
   "Unholy Speed",
   "You can re-roll Advance and Charge rolls made for this unit."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Hellflayers": [
  [
   "Cutting Down the Foe",
   "Each time a model in this unit makes a melee attack, if this unit made a Charge move this turn, improve the Strength and Damage characteristics of that attack by 1."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Giant Chaos Spawn": [
  [
   "Regenerating Monstrosity",
   "At the start of each player’s Command phase, this model regains up to D3 lost wounds."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Spined Chaos Beast": [
  [
   "Warp Spines",
   "Each time this model ends a Charge move, select one enemy unit within Engagement Range of it and roll one D6: on a 2-3, that enemy unit suffers D3 mortal wounds; on a 4-5, that enemy unit suffers 3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ]
 ],
 "Pox Riders": [
  [
   "Grandfather's Blessing",
   "If a model from your army with the Leader ability can be attached to a BEASTS OF NURGLE unit, it can be attached to this unit instead."
  ],
  [
   "Bounding Assault",
   "Each time this unit ends a Charge move, until the end of the turn, Pox Rider plagueswords equipped by models in this unit have the [LANCE] ability."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Daemonic Icon",
   "Models in the bearer’s unit have a Leadership characteristic of 6+."
  ],
  [
   "Instrument of Chaos",
   "Add 1 to Charge rolls made for the bearer’s unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Plague Toads": [
  [
   "Grandfather's Blessing",
   "If a model from your army with the Leader ability can be attached to a BEASTS OF NURGLE unit, it can be attached to this unit instead."
  ],
  [
   "Pouncing Leap",
   "You can target this unit with the Heroic Intervention Stratagem for 0CP, and can do so even if you have already used that Stratagem on a different unit this phase."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "An'ggrath the Unbound": [
  [
   "Emissary of the Blood God (Aura)",
   "While a friendly KHORNE LEGIONES DAEMONICA unit is within 6\" of this model, you can re-roll Battle-shock tests taken for that unit."
  ],
  [
   "Relentless Carnage",
   "At the end of the Fight phase, you can select one enemy unit within Engagement Range of this model and roll eight D6: for each 4+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Damaged: 1-8 wounds remaining",
   "While this model has 1-8 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Aetaos'rau'keres": [
  [
   "Emissary of the Great Mutator (Aura)",
   "While a friendly TZEENTCH LEGIONES DAEMONICA unit is within 6\" of this model, you can re-roll Battle-shock tests taken for that unit."
  ],
  [
   "Master of Magicks (Psychic)",
   "In your Shooting phase, select one of the following abilities: [IGNORES COVER]; [LETHAL HITS]; [SUSTAINED HITS D3]. Until the end of the phase, this model’s ranged weapon has that ability."
  ],
  [
   "Damaged: 1-8 wounds remaining",
   "While this model has 1-8 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Scabeiathrax the Bloated": [
  [
   "Emissary of the Plague God (Aura)",
   "While a friendly NURGLE LEGIONES DAEMONICA unit is within 6\" of this model, you can re-roll Battle-shock tests taken for that unit."
  ],
  [
   "Nurgle’s Rot (Psychic)",
   "At the end of your Movement phase, you can select one enemy unit within 12\" of this model. Until the start of your next Movement phase, subtract 1 from the Toughness characteristic of models in that unit."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Zarakynel": [
  [
   "Emissary of the Prince of Excess (Aura)",
   "While a friendly SLAANESH LEGIONES DAEMONICA unit is within 6\" of this model, you can re-roll Battle-shock tests taken for that unit."
  ],
  [
   "Mesmerising Form",
   "Each time an attack targets this model, subtract 1 from the Hit roll."
  ],
  [
   "Damaged: 1-7 wounds remaining",
   "While this model has 1-7 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Herald of Slaanesh on Steed of Slaanesh": [
  [
   "Lethal Caress",
   "While this model is leading a unit, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1."
  ],
  [
   "Symphony of Pain (Psychic)",
   "At the end of your Movement phase, you can select one enemy unit that is Battle-shocked and within 12\" of this model. Until the end of the turn, each time a SLAANESH LEGIONES DAEMONICA model from your army makes an attack that targets that enemy unit, you can re-roll the Hit roll and you can re-roll the Wound roll."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n■ SEEKERS"
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ],
 "Furies": [
  [
   "Prey on the Weak",
   "Each time this model makes an attack that targets an enemy unit that is Battle-shocked, add 1 to the Wound roll."
  ],
  [
   "Murderer's Cowl",
   "This unit is eligible to shoot and declare a charge in a turn in which it Advanced."
  ],
  [
   "Gloam Rot",
   "Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll."
  ],
  [
   "Seductive Gambit",
   "Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1."
  ],
  [
   "Shadow's Caress",
   "Enemy units cannot use the Fire Overwatch Stratagem to shoot at this unit."
  ],
  [
   "Penumbral Puppetry",
   "This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll."
  ],
  [
   "The Shadow of Chaos",
   "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: \n■ Your deployment zone is always within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos.\n■ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos.\n\nDAEMONIC MANIFESTATION\nWhile a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead).\n\nDAEMONIC TERROR\nWhile an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
  ],
  [
   "Warp Rifts",
   "Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\"."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Blood Legion",2,"","Murdercall / Blood Tainted","In your opponent's movement phase, each time an enemy unit (excluding AIRCRAFT) ends a move within 8\" of one or more LEGIONES DAEMONICA KHORNE units from your army, one of those LEGIONES DAEMONICA KHORNE units can make a surge move of up to D6\". At the end of a phase in which a Legiones Daemonica Khorne unit from your army destroyed an enemy unit that was within range of an objective marker at the start of the phase, if your unit has a higher Level of Control over that objective marker, that objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.","",0,"","Purge the Foe"],
  ["Cavalcade of Chaos",1,"","Unholy Avalanche","If a friendly LEGIONES DAEMONICA MOUNTED unit made a fall-back move this turn, that move does not prevent that unit from being eligible to shoot/eligible to declare a charge.","",0,"","Disruption"],
  ["Daemonic Incursion",3,"","Warp Rifts","Each time a LEGIONES DAEMONICA unit from your army is set up on the battlefield using the Deep Strike ability, if it is set up wholly within your army’s Shadow of Chaos, and/or if it is set up wholly within 6\" of one or more friendly BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units with which it shares the KHORNE, TZEENTCH, NURGLE or SLAANESH keyword, it can be set up anywhere that is more than 6\" horizontally away from all enemy models, instead of more than 8\".","",0,"","Take and Hold"],
  ["Legion of Excess",2,"","Beguiling Aura / Seductive Gambit","Legiones Daemonica Slaanesh units from your army are eligible to declare a charge in a turn in which they Fell Back. Legiones Daemonica Slaanesh units from your army have the following ability: Seductive Gambit: Each time this unit ends a Charge move, you can declare it will perform a Seductive Gambit. If you do, until the end of the turn, this unit does not have the Fights First ability, but instead, each time a model in this unit makes an attack, you can re-roll the Hit roll and you can re-roll a Wound roll of 1.","",0,"","Priority Assets"],
  ["Lords of the Warp",1,"","Loci of Power","Friendly LEGIONES DAEMONICA CHARACTER models (excluding MONSTER models) have +1 Ld and OC.","",0,"","Take and Hold"],
  ["Plague Legion",2,"","Melancholic Miasma","While an enemy unit is within 9\" of one or more Legiones Daemonica Nurgle units from your army, that enemy unit is within your army’s Shadow of Chaos. In each player’s Command phase, select one enemy unit within your army’s Shadow of Chaos. That unit must take a Battle-shock test.","",0,"","Take and Hold"],
  ["Scintillating Legion",2,"","Fates in Flux","You start the battle with three Flux tokens (we recommend using a dice to track how many Flux tokens you have). You can spend one Flux token just after an Advance roll, Hit roll, Wound roll, Damage roll, saving throw or Hazardous test is made for a Legiones Daemonica Tzeentch model or LEGIONES DAEMONICA TZEENTCH unit from your army to re-roll the result of that roll, throw or test. Flux tokens can also be spent to enhance the effect of some Stratagems. Each time you spend a Flux token, reduce the number of Flux tokens you have by one and your opponent gains one Flux token. Whenever your opponent has one or more Flux tokens, they can spend one Flux token after an Advance roll, Hit roll, Wound roll or saving throw is made for a model or unit from their army, to re-roll the result of that roll or throw. If they do, they reduce the number of Flux tokens they have by one and you gain one Flux token. This is ignored if your opponent has the Fates in Flux Detachment rule. In your Command phase, if your opponent has one or more Flux tokens, you gain one Flux token. Designer’s Note: When using fast dice rolling, this rule can be used to spend any number of Flux tokens (up to the amount you have), to re-roll a number of dice up to the amount spent, after rolling multiple rolls or saving throws at once.","",0,"","Priority Assets"],
  ["Shadow Legion",2,"","Thralls of the First Prince / First Prince of Chaos","When mustering your army, you cannot include any Daemon Prince, Daemon Prince with Wings or Epic Hero units (excluding Be’lakor), but you can include the following HERETIC ASTARTES units: ▪ Chaos Lord ▪ Chaos Lord in Terminator Armour ▪ Chaos Lord with Jump Pack ▪ Chaos Terminator Squad ▪ Chosen ▪ Damned units ▪ Dark Apostle ▪ Havocs ▪ Legionaries ▪ Master of Possession ▪ Possessed ▪ Raptors ▪ Sorcerer ▪ Sorcerer in Terminator Armour ▪ Warp Talons The combined points value of such units depends on your battle size, as shown below. ▪ Incursion: Up to 500 pts ▪ Strike Force: Up to 1000 pts ▪ Onslaught: Up to 1500 pts KEYWORDS Be’lakor and Heretic Astartes units from your army gain the SHADOW LEGION and UNDIVIDED keywords. Legiones Daemonica units from your army gain the SHADOW LEGION keyword. Units from your army have the relevant abilities presented below. MURDERER’S COWL The most murderous seek not to hide in the Dark Master’s pall. The shadows extend before them, offering a rapid route to slaughter. SHADOW LEGION KHORNE units only. This unit is eligible to shoot and declare a charge in a turn in which it Advanced. PENUMBRAL PUPPETRY Mutative agents of change, touched by the Dark Master’s umbral aura, summon illusory magicks to confound and confuse their desperate foes. SHADOW LEGION TZEENTCH units only. This unit has Stealth. Each time a melee attack targets this unit, subtract 1 from the Hit roll. GLOAM ROT Borne upon the gloaming wisp of Be’lakor’s shadow, this debilitating curse atrophies muscle and withers flesh, greatly weakening its victims. SHADOW LEGION NURGLE units only. Each time an attack targets this unit, if the Strength characteristic of that attack is greater than this unit’s Toughness characteristic, subtract 1 from the Wound roll. SHADOW’S CARESS The Dark Master’s shadow falls across his thralls, masking their approach. SHADOW LEGION SLAANESH units only. Enemy units cannot target this unit with snap shooting attacks. DISCIPLES OF BE’LAKOR Be’lakor’s immortal ego draws into his orbit those as yet unclaimed by any one Chaos God. Their hate-filled pacts are made to the entire fell pantheon, and the dangerous boons they receive see them plunged along paths of perpetual night straight into the enemy’s midst. SHADOW LEGION UNDIVIDED units only. ▪ This unit has the Dark Pacts army rule, and can use it as described in Codex: Chaos Space Marines, even though your Army Faction is not HERETIC ASTARTES. If this unit is BE’LAKOR, it automatically passes the Leadership test required for Dark Pacts. ▪ SHADOW LEGION HERETIC ASTARTES models in this unit have the Deep Strike ability.","",0,"","Purge the Foe"],
  ["Warptide",1,"","Shudderblink","When a friendly LEGIONES DAEMONICA BATTLELINE unit is selected to make an advance move: ▪ That unit’s ranged attacks have [ASSAULT] until the end of the turn. ▪ That move does not prevent that unit from being eligible to declare a charge.","",0,"","Reconnaissance"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Brazenmaw",15,"Blood Legion","LEGIONES DAEMONICA KHORNE model only. Add 2 to Charge rolls made for the bearer’s unit.",null],
  ["Fury’s Cage",20,"Blood Legion","LEGIONES DAEMONICA KHORNE MONSTER model only. Each time the bearer is selected to fight, it can use this Enhancement. If it does, the bearer suffers D3+1 mortal wounds, and until the end of the phase, each time it makes an attack, you can re-roll the Hit roll and you can re-roll the Wound roll.",null],
  ["Gateway Unto Damnation",10,"Blood Legion","LEGIONES DAEMONICA KHORNE MONSTER model only. The bearer’s Deadly Demise ability inflicts mortal wounds on a D6 roll of 2+ instead of on a 6. In addition, if the bearer has destroyed one or more enemy units this battle, the bearer has the Deadly Demise D3+3 ability, instead of any other Deadly Demise ability on its datasheet.",null],
  ["Slaughterthirst",25,"Blood Legion","",null],
  ["Apocalyptic Steeds (Upgrade)",10,"Cavalcade of Chaos","LEGIONES DAEMONICA MOUNTED unit only. This unit has +1\" M.",null],
  ["Soul-shattering Charge (Upgrade)",10,"Cavalcade of Chaos","LEGIONES DAEMONICA MOUNTED unit only. When this unit is selected to fight, if this unit made a charge move this turn, you can use this ability. If you do, when determining which models in this unit can fight, friendly models that are within 3\" of enemy units engaged with this unit can target those enemy units.",null],
  ["A’rgath, The King of Blades",20,"Daemonic Incursion","Khorne Legiones Daemonica model only. Add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons. While the bearer is within your army’s Shadow of Chaos, add 2 to the Attacks and Strength characteristics of the bearer’s melee weapons instead.",null],
  ["Soulstealer",15,"Daemonic Incursion","SLAANESH LEGIONES DAEMONICA model only. Each time the bearer destroys an enemy model with a melee attack, roll one D6, adding 1 to the result if the bearer is within your army’s Shadow of Chaos. On a 4+, the bearer regains 1 lost wound.",null],
  ["The Endless Gift",30,"Daemonic Incursion","NURGLE LEGIONES DAEMONICA model only. The bearer has the Feel No Pain 5+ ability.",null],
  ["The Everstave",25,"Daemonic Incursion","Tzeentch Legiones Daemonica model only. Add 1 to the Strength characteristic of the bearer’s ranged weapons and increase the Range characteristic of such weapons by 3\". While the bearer is within your army’s Shadow of Chaos, add 2 to the Strength characteristic of the bearer’s ranged weapons and increase the Range characteristic of such weapons by 6\" instead.",null],
  ["Avatar of Perfection",15,"Legion of Excess","LEGIONES DAEMONICA SLAANESH MONSTER model only. At the start of each phase, if there are no other friendly units within 6\" of the bearer, you can: re-roll Advance rolls made for the bearer; re-roll Charge rolls made for the bearer; ignore any or all modifiers to its Move characteristic and to any Advance and/or Charge rolls made for the bearer.",null],
  ["Dreaming Crown",30,"Legion of Excess","",null],
  ["False Majesty",30,"Legion of Excess","",null],
  ["Soul Glutton",10,"Legion of Excess","LEGIONES DAEMONICA SLAANESH MONSTER model only. At the end of the Fight phase, if one or more enemy models were destroyed this phase as a result of one or more of the bearer’s attacks, it can use this Enhancement. If it does, it regains up to D3 lost wounds.",null],
  ["Swollen with Power (Upgrade)",10,"Lords of the Warp","LEGIONES DAEMONICA CHARACTER model only (excluding MONSTER units). This model has +2 W.",null],
  ["Cankerblight",15,"Plague Legion","Legiones Daemonica Nurgle model only. Each time an enemy unit (excluding MONSTERS and VEHICLES) that is within 6\" of the bearer fails a Battle-shock test, the bearer can use this Enhancement. If it does, one model in that unit is destroyed (chosen by its controlling player). Each time the bearer uses this Enhancement, no mortal wounds are inflicted by your army’s Daemonic Terror rule.",null],
  ["Droning Shroud",35,"Plague Legion","",null],
  ["Font of Spores",20,"Plague Legion","",null],
  ["Maggot Maws",15,"Plague Legion","LEGIONES DAEMONICA NURGLE model only. In your Shooting phase, select one enemy unit within 6\" of the bearer; that enemy unit must take a Battle-shock test. Then roll one D6: on a 3+, that enemy unit suffers D3 mortal wounds. Each time the bearer uses this Enhancement, no mortal wounds are inflicted by your army’s Daemonic Terror rule.",null],
  ["Improbable Shield",30,"Scintillating Legion","",null],
  ["Inescapable Eye",15,"Scintillating Legion","Legiones Daemonica Tzeentch model only. In your Command phase, if the bearer is on the battlefield, if your opponent has one or more Flux tokens, you gain one additional Flux token.",null],
  ["Infernal Puppeteer",20,"Scintillating Legion","Legiones Daemonica Tzeentch Monster model only. In your Shooting phase, when this unit is selected to shoot, while an enemy unit is visible to a friendly LEGIONES DAEMONICA TZEENTCH unit, that enemy unit has +9\" detection range until this unit has shot.",null],
  ["Neverblade",25,"Scintillating Legion","Legiones Daemonica Tzeentch Monster model only. Improve the Strength characteristic of melee weapons equipped by the bearer by 2, improve the Attacks and Armour Penetration characteristics of melee weapons equipped by the bearer by 1, and each time the bearer makes a melee attack, add 1 to the Hit roll.",null],
  ["Fade to Darkness",30,"Shadow Legion","At the end of the Fight phase, if the bearer’s unit destroyed one or more enemy units this phase and is not within Engagement Range of one or more enemy units, you can remove the bearer’s unit from the battlefield and place it into Strategic Reserves.",null],
  ["Leaping Shadows",25,"Shadow Legion","Models in the bearer's unit have the Scouts 9\" ability.",null],
  ["Malice Made Manifest",25,"Shadow Legion","At the start of the Fight phase, select one enemy unit within Engagement Range of the bearer’s unit and roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers 3 mortal wounds.",null],
  ["Mantle of Gloom",20,"Shadow Legion","",null],
  ["Bane-forged Weapons (Upgrade)",15,"Warptide","LEGIONES DAEMONICA BATTLELINE unit only. This unit’s attacks have +1 S.",null],
  ["Soul-hungry Slaughterers (Upgrade)",10,"Warptide","LEGIONES DAEMONICA BATTLELINE unit only. When you target this unit with the Heroic Intervention/Fire Overwatch stratagem, that use is -1 CP.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Blood Begets Skulls","Blood Legion","Ruse Stratégique",1,"Your Charge phase.","One Legiones Daemonica Khorne unit from your army that has not been selected to charge this phase.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Fools’ Flight","Blood Legion","Ruse Stratégique",2,"Your opponent’s Movement phase, when an enemy unit ends a fall-back move.","One friendly unengaged LEGIONES DAEMONICA KHORNE unit that is within 6\" of that enemy unit.","Declare a charge with your unit. When selecting charge targets, you can only select enemy units that made a fall-back move this phase and are within the maximum distance.",""],
  ["Gore-Hungry Onslaught","Blood Legion","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Legiones Daemonica Khorne unit from your army.","Until the end of the phase, each time a model in your unit makes a move, it can move through terrain features.",""],
  ["Sheathed in Brass","Blood Legion","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One Legiones Daemonica Khorne unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, models in your unit have a Save characteristic of 3+.",""],
  ["Skulls Beget Blood","Blood Legion","Ruse Stratégique",1,"Your Shooting phase.","One Legiones Daemonica Khorne Infantry or Legiones Daemonica Khorne Mounted unit from your army (excluding units that Fell Back this turn) that is not within Engagement Range of one or more enemy units.","Select one enemy unit that is not within Engagement Range of one or more units from your army and is within 8\" of and visible to your unit. Roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Wrath Undeniable","Blood Legion","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Legiones Daemonica Khorne unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time a model in your unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6: on a 4+, do not remove the destroyed model from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["From Beyond the Veil","Cavalcade of Chaos","",2,"End of the Movement phase, from the start of the battle.","One friendly LEGIONES DAEMONICA MOUNTED unit in strategic reserves.","Your unit can make an ingress move.",""],
  ["Inescapable Manifestations","Cavalcade of Chaos","",1,"Your opponent’s Movement phase, when a unit is selected to make a fall-back move, if that unit is engaged with a friendly LEGIONES DAEMONICA MOUNTED unit.","That LEGIONES DAEMONICA MOUNTED unit.","When an enemy unit engaged with your unit is selected to make a fall-back move, that enemy unit must use the desperate escape mode. If that enemy unit is battle-shocked, -1 from those hazard rolls.",""],
  ["Warp-Riders","Cavalcade of Chaos","",1,"Your Movement phase, when a friendly LEGIONES DAEMONICA MOUNTED unit is selected to move.","That LEGIONES DAEMONICA MOUNTED unit.","Your unit has MOBILE.",""],
  ["Corrupt Realspace","Daemonic Incursion","Ruse Stratégique",1,"Start of any Command phase.","One LEGIONES DAEMONICA unit from your army that is within range of an objective marker you control.","That objective marker is said to be Corrupted and remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn. In addition, while an objective marker is Corrupted and under your control, the area of the battlefield within 6\" of that objective marker is considered to be within your army’s Shadow of Chaos.",""],
  ["Daemonic Invulnerability","Daemonic Incursion","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One LEGIONES DAEMONICA unit from your army that was selected as the target of one or more of that enemy unit’s attacks.","Until the end of the phase, each time an invulnerable saving throw is made for a model in your unit, re-roll a saving throw of 1.",""],
  ["Denizens of the Warp","Daemonic Incursion","Ruse Stratégique",1,"Your Movement phase.","One LEGIONES DAEMONICA unit from your army that is arriving using the Deep Strike ability this phase.","Your unit can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy models.",""],
  ["Draught of Terror","Daemonic Incursion","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One LEGIONES DAEMONICA unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, improve the Armour Penetration characteristic of weapons equipped by models in that unit by 1. In addition, until the end of the phase, each time such a weapon targets a unit that is Battle-shocked, you can re-roll the Wound roll.",""],
  ["Incorporeal Terrors","Daemonic Incursion","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One LEGIONES DAEMONICA unit from your army that was selected as the target of one or more of the attacking unit's attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Insubstantial Entities","Daemonic Incursion","Ruse Stratégique",1,"Your Movement phase.","One LEGIONES DAEMONICA unit from your army that has not been selected to move this phase.","The next time your unit is selected to move this phase, models in that unit can move through Walls and closed Hatchways as if they were not there, but when doing so, no model can move more than 6\".","You can only use this Stratagem once."],
  ["Parting Blows","Daemonic Incursion","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One LEGIONES DAEMONIcA unit from your army that was selected as the target of one or more of the attacking unit's attacks.","Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, roll one D6: on a 4+, do not remove it from play. That destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.",""],
  ["The Realm of Chaos","Daemonic Incursion","Tactique de Bataille",1,"End of your opponent’s turn.","Up to two LEGIONES DAEMONICA units from your army that are within your army’s Shadow of Chaos, or one other LEGIONES DAEMONICA unit from your army.","▪ Place your unit in strategic reserves. ▪ Your unit must make an ingress move in your next Movement phase (including in your first turn).","You cannot target units that are within Engagement Range of one or more enemy units with this Stratagem."],
  ["Unreal Speed","Daemonic Incursion","Ruse Stratégique",1,"Your Charge phase.","One INfANTRY LEGIONES DAEMONIcA unit from your army.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced or Fell Back.",""],
  ["Warp Surge","Daemonic Incursion","Ruse Stratégique",1,"Your Charge phase.","One LEGIONES DAEMONICA unit from your army that is within your army’s Shadow of Chaos.","Until the end of the phase, your unit is eligible to declare a charge in a turn in which it Advanced.",""],
  ["Archagonists","Legion of Excess","Tactique de Bataille",2,"Fight phase.","One Legiones Daemonica Slaanesh Monster unit or up to two Legiones Daemonica Slaanesh units (excluding Monsters) from your army that have not been selected to fight this phase.","Until the end of the phase, each time a model in one of those units makes an attack, add 1 to the Wound roll.",""],
  ["Cavalcade of Blades","Legion of Excess","Tactique de Bataille",1,"Your Charge phase, just after a Legiones Daemonica Slaanesh unit from your army ends a Charge move.","That LEGIONES DAEMONICA SLAANESH unit.","Select one enemy unit within Engagement Range of your unit, then roll one D6 for each model in your unit that is within Engagement Range of that enemy unit, or roll six D6 instead if your unit is a MONSTER unit: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Overwhelming Excess","Legion of Excess","Tactique de Bataille",1,"Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.","One Legiones Daemonica Slaanesh unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll.",""],
  ["Phantasmal Longing","Legion of Excess","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Legiones Daemonica Slaanesh unit from your army.","Until the end of the phase, each time a model in your unit makes a move, it can move through terrain features.",""],
  ["Rapturous Agony","Legion of Excess","Ruse Stratégique",1,"Your opponent’s Shooting phase or the Fight phase, when an enemy unit targets a friendly LEGIONES DAEMONICA SLAANESH unit (excluding MONSTER/VEHICLE units).","That LEGIONES DAEMONICA SLAANESH unit.","Attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Sensory Excruciation","Legion of Excess","Ruse Stratégique",1,"Your Command phase.","One Legiones Daemonica Slaanesh Monster unit from your army that is on the battlefield.","Each unit on the battlefield that is within your army’s Shadow of Chaos must take a Battle-shock test, subtracting 1 from that test if they are Below Half-strength. Designer’s Note: This Stratagem forces all friendly and enemy units alike within your army’s Shadow of Chaos to take a Battle-shock test. This can allow a Chaos Daemons player to heal units from their army through the Daemonic Manifestation army rule, at the risk of causing some of their own units to become Battle-shocked.",""],
  ["Bilious Blessing","Lords of the Warp","",1,"Start of your Shooting phase.","One friendly LEGIONES DAEMONICA CHARACTER NURGLE unit (excluding MONSTER units).","Select one visible enemy unit within 8\" of your unit and roll seven D6: ▪ For each 4+, that enemy unit suffers 1 mortal wound",""],
  ["Call to Murder","Lords of the Warp","",1,"Fight phase, when a friendly LEGIONES DAEMONICA KHORNE CHARACTER unit (excluding MONSTER units) that made a charge move this turn is selected to fight.","That LEGIONES DAEMONICA CHARACTER KHORNE unit.","Your unit’s melee attacks have +1 A.",""],
  ["Carnival of Excess","Lords of the Warp","",1,"Fight phase, when an enemy unit has fought.","One friendly LEGIONES DAEMONICA CHARACTER SLAANESH unit (excluding MONSTER units) that has not been selected to fight this phase.","Your unit has Fights First and must be the next unit you select to fight.",""],
  ["Skirling Magicks","Lords of the Warp","",1,"Your Shooting phase, when a friendly LEGIONES DAEMONICA CHARACTER TZEENTCH unit (excluding MONSTER units) is selected to shoot.","That LEGIONES DAEMONICA CHARACTER TZEENTCH unit.","Your unit’s ranged attacks have [LETHAL HITS].",""],
  ["Fever Visions","Plague Legion","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Legiones Daemonica Nurgle unit from your army that has not been selected to shoot or fight this phase.","Until the end of the phase, each time a model in your unit makes an attack, add 1 to the Hit roll. After your unit has finished making its attacks, select one enemy unit hit by one or more of those attacks; that enemy unit must take a Battle-shock test.",""],
  ["Foetid Resurgence","Plague Legion","Ruse Stratégique",2,"Your Command phase.","One LEGIONES DAEMONICA NURGLE unit from your army that is on the battlefield.","Return up to 1 destroyed model to your unit (excluding CHARACTER models) or up to D3 destroyed models instead (excluding CHARACTER models) if your unit is a BATTLELINE unit, with their full wounds remaining. If your unit is a MONSTER unit, one model in your unit regains up to D3+1 lost wounds instead.",""],
  ["Murkshadows","Plague Legion","Tactique de Bataille",1,"Your Movement phase.","One Legiones Daemonica Nurgle Infantry unit from your army.","Until the end of the phase, each time your unit makes a Normal move, add 5\" to the Move characteristic of models in your unit.",""],
  ["Plague of Woes","Plague Legion","Ruse Stratégique",1,"Your opponent’s Command phase, before selecting any targets for the Melancholic Miasma Detachment rule.","One Legiones Daemonica Nurgle unit from your army.","Until the end of the phase, after an enemy unit takes a Battle-shock test as a result of the Melancholic Miasma Detachment rule, select one other enemy unit within 9\" of your unit; that enemy unit must take a Battle-shock test.",""],
  ["Rot and Renewal","Plague Legion","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Legiones Daemonica Nurgle unit from your army.","Until the end of the phase, each time a model in your unit makes a move, it can move through terrain features.",""],
  ["Seeping Virulence","Plague Legion","Tactique de Bataille",1,"Fight phase.","One Legiones Daemonica Nurgle unit from your army that has not been selected to fight this phase.","Until the end of the phase, each time a model in that unit makes an attack, an unmodified Hit roll of 5+ scores a Critical Hit.",""],
  ["Delirium Unmade","Scintillating Legion","Ruse Stratégique",1,"End of your opponent’s Fight phase.","One Legiones Daemonica Tzeentch unit from your army that is not within Engagement Range of one or more enemy units. Alternatively, you can spend one Flux token when you use this Stratagem and target up to two LEGIONES DAEMONICA TZEENTCH units from your army instead (including those within Engagement Range of one or more enemy units).","Remove your units from the battlefield and place them into Strategic Reserves.",""],
  ["Fateborne Nightmares","Scintillating Legion","Ruse Stratégique",1,"Your Movement phase or your Charge phase.","One Legiones Daemonica Tzeentch unit from your army.","Until the end of the phase, each time a model in your unit makes a move, it can move through terrain features.",""],
  ["Ficklefire","Scintillating Legion","Ruse Stratégique",1,"Your Shooting phase.","One Legiones Daemonica Tzeentch unit from your army that is within Engagement Range of one or more enemy units.","Until the end of the phase, enemy units are not considered to be within Engagement Range of your unit for the purposes of selecting targets for, and resolving attacks with, ranged weapons. Until the end of the phase, each time an enemy model is destroyed while its unit is within Engagement Range of your unit, roll one D6: on a 5+, your unit suffers 1 mortal wound after the attacking unit has finished making its attacks.",""],
  ["Flickering Reality","Scintillating Legion","Ruse Stratégique",1,"Fight phase, just after an enemy unit has selected its targets.","One Legiones Daemonica Tzeentch unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Roll one D6, then you can spend one Flux token to re-roll the result: until the end of the phase, each time an attack targets your unit, on an unmodified Hit roll (after any re-roll) of that result, the attack sequence ends, even if the original Hit roll would have been a Critical Hit. Example: If you roll a 2 and choose to spend one Flux token to re-roll the result, and the re-roll is a 6, then until the end of the phase, each time an attack targets your unit, on an unmodified Hit roll of 6 the attack sequence ends, that attack fails to hit and no Critical Hit effects (e.g. Lethal Hits) are resolved.",""],
  ["Impossible Eclipse","Scintillating Legion","Ruse Stratégique",1,"Any phase.","One Legiones Daemonica Tzeentch Monster unit from your army that is on the battlefield.","Select No Man’s Land or your opponent’s deployment zone, or spend one Flux token and select both. Until the end of the phase, the selected areas of the battlefield are within your army’s Shadow of Chaos.",""],
  ["Pyrogenesis","Scintillating Legion","Tactique de Bataille",1,"Your Shooting phase or the Fight phase.","One Legiones Daemonica Tzeentch unit from your army that has not been selected to shoot or fight that phase.","Until the end of the phase, add 2 to the Strength characteristic of weapons equipped by models in your unit, or spend one Flux token and add 3 to the Strength characteristic of those weapons and improve the Armour Penetration characteristic of those weapons by 1 instead.",""],
  ["Binding Shadow","Shadow Legion","Ruse Stratégique",1,"End of your opponent’s Fight phase.","Up to one Shadow Legion Heretic Astartes unit from your army and up to one Shadow Legion Legiones Daemonica unit from your army. You can only select units that are not within Engagement Range of one or more enemy units.","Remove those selected units from the battlefield and place them into Strategic Reserves.",""],
  ["Channelled Wrath","Shadow Legion","Ruse Stratégique",1,"Fight phase.","One Shadow Legion unit from your army that has not been selected to fight this phase.","Until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] ability. If your unit has the Khorne keyword, until the end of the phase, improve the Armour Penetration characteristic of those weapons by 1 as well.",""],
  ["Death Denied","Shadow Legion","Tactique de Bataille",1,"Your Command phase.","One Shadow Legion unit from your army.","One model in your unit regains up to 3 lost wounds. In addition, If your unit has the Tzeentch keyword, return up to one destroyed model (excluding Character models) to your unit with its full wounds remaining.",""],
  ["Encroaching Darkness","Shadow Legion","Tactique de Bataille",1,"Your Shooting phase.","Up to one Shadow Legion Heretic Astartes unit from your army and up to one Shadow Legion Legiones Daemonica unit from your army. You can only select units that arrived from Reserves this turn.","Until the end of the phase, weapons equipped by models in your selected units have the [IGNORES COVER] ability.",""],
  ["Shade Path","Shadow Legion","Tactique de Bataille",2,"Start of your opponent's Charge phase.","One friendly SHADOW LEGION unit.","Select one visible enemy unit within 12\" of your unit. When that enemy unit declares a charge, that enemy unit has -1 to charge rolls. If your unit has Nurgle, that enemy unit must make a battle-shock roll.",""],
  ["Spiteful Demise","Shadow Legion","Ruse Stratégique",1,"Any phase, just after a Shadow Legion unit from your army is destroyed, before removing the last model in that unit from the battlefield and before rolling any dice for the Deadly Demise ability.","That SHADOW LEGION unit. You can use this Stratagem on that unit even though it was just destroyed.","Roll one D6 for each enemy unit that is within Engagement Range of the last model in your unit, adding 2 to the result if your unit has the Slaanesh keyword: on a 4-5, that enemy unit suffers D3 mortal wounds; on a 6+, that enemy unit suffers 3 mortal wounds.",""],
  ["Daemonic Infestation","Warptide","",1,"Your Command phase.","One friendly LEGIONES DAEMONICA BATTLELINE unit (excluding PINK HORRORS units).","Your unit heals 3 wounds.",""],
  ["Incorporeal Entities","Warptide","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly LEGIONES DAEMONICA BATTLELINE unit.","That LEGIONES DAEMONICA BATTLELINE unit.","Ranged attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls.",""],
  ["Soulseeing","Warptide","",1,"Start of your Shooting phase.","One friendly LEGIONES DAEMONICA BATTLELINE unit.","Select one visible enemy unit within 12\" of your unit. That enemy unit has +6\" detection range.",""],
  ["Command Re-Roll","Core","Tactique de Bataille",1,"Any phase, just after you make an Advance roll, a Charge roll, a Desperate Escape test or a Hazardous test for a unit from your army, or a Hit roll, a Wound roll, a Damage roll or a saving throw for a model in that unit, or a roll to determine the number of attacks made with a weapon equipped by a model in that unit. If you are using fast dice rolling, this Stratagem can still be used after rolling multiple rolls or saving throws at once.","That unit or model from your army.","You re-roll that roll, test or saving throw. If you are using fast dice rolling, select one of those rolls or saving throws to re-roll.",""],
  ["Counter-Offensive","Core","Ruse Stratégique",2,"Fight phase, just after an enemy unit has fought.","One unit from your army that is within Engagement Range of one or more enemy units and that has not already been selected to fight this phase.","Your unit fights next.",""],
  ["Epic Challenge","Core","Fait Épique",1,"Fight phase, when a CHARACTER unit from your army that is within Engagement Range of one or more Attached units is selected to fight.","One CHARACTER model in your unit.","Until the end of the phase, all melee attacks made by that model have the [PRECISION] ability.",""],
  ["Fire Overwatch","Core","Ruse Stratégique",1,"Your opponent’s Movement or Charge phase, just after an enemy unit is set up or when an enemy unit starts or ends a Normal, Advance or Fall Back move, or declares a charge.","One unit from your army that is within 24\" of that enemy unit and that would be eligible to shoot if it were your Shooting phase.","If that enemy unit is visible to your unit, your unit can shoot that enemy unit as if it were your Shooting phase.","You cannot target a TITANIC unit with this Stratagem. Until the end of the phase, each time a model in your unit makes a ranged attack, an unmodified Hit roll of 6 is required to score a hit, irrespective of the attacking weapon’s Ballistic Skill or any modifiers. You can only use this Stratagem once per turn."],
  ["Go to Ground","Core","Tactique de Bataille",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, all models in your unit have a 6+ invulnerable save and have the Benefit of Cover.",""],
  ["Grenade","Core","Équipement",1,"Your Shooting phase.","One GRENADES unit from your army (excluding units that Advanced, Fell Back or have shot this turn) that is not within Engagement Range of one or more enemy units.","Select one GRENADES model in your unit and one enemy unit that is not within Engagement Range of any units from your army and is within 8\" of and visible to your GRENADES model. Roll six D6: for each 4+, that enemy unit suffers 1 mortal wound.",""],
  ["Heroic Intervention","Core","Ruse Stratégique",1,"Your opponent’s Charge phase, just after an enemy unit ends a Charge move.","One unit from your army that is within 6\" of that enemy unit and would be eligible to declare a charge against that enemy unit if it were your Charge phase.","Your unit now declares a charge that targets only that enemy unit, and you resolve that charge as if it were your Charge phase.","You can only select a VEHICLE unit from your army if it is a WALKER. Note that even if this charge is successful, your unit does not receive any Charge bonus this turn."],
  ["Insane Bravery","Core","Fait Épique",1,"Battle-shock step of your Command phase, just before you take a Battle-shock test for a unit from your army.","That unit from your army.","Your unit automatically passes that Battle-shock test.","You cannot use this Stratagem more than once per battle."],
  ["Rapid Ingress","Core","Ruse Stratégique",1,"End of your opponent’s Movement phase.","One unit from your army that is in Reserves.","Your unit can arrive on the battlefield as if it were the Reinforcements step of your Movement phase, and if every model in that unit has the Deep Strike ability, you can set that unit up as described in the Deep Strike ability (even though it is not your Movement phase).","You cannot use this Stratagem to enable a unit to arrive on the battlefield during a battle round it would not normally be able to do so in."],
  ["Smokescreen","Core","Équipement",1,"Your opponent’s Shooting phase, just after an enemy unit has selected its targets.","One SMOKE unit from your army that was selected as the target of one or more of the attacking unit’s attacks.","Until the end of the phase, all models in your unit have the Benefit of Cover and the Stealth ability.",""],
  ["Tank Shock","Core","Ruse Stratégique",1,"Your Charge phase, just after a VEHICLE unit from your army ends a Charge move.","That VEHICLE unit.","Select one enemy unit within Engagement Range of your unit, and select one VEHICLE model in your unit that is within Engagement Range of that enemy unit. Roll a number of D6 equal to the Toughness characteristic of the selected VEHICLE model. For each 5+, that enemy unit suffers 1 mortal wound (to a maximum of 6 mortal wounds).",""]
];

/* KW : les mots-clés dont les règles de détachement se servent,
   déduits des catégories du catalogue */
const KW = {
 "vehicle": [],
 "monster": [
  "Bloodthirster",
  "Daemon Prince of Chaos",
  "Daemon Prince of Chaos with wings",
  "Giant Chaos Spawn",
  "Great Unclean One",
  "Keeper of Secrets",
  "Lord of Change",
  "Spined Chaos Beast"
 ],
 "battleline": [
  "Bloodletters",
  "Blue Horrors",
  "Daemonettes",
  "Nurglings",
  "Pink Horrors",
  "Plaguebearers"
 ],
 "epic": [
  "Aetaos'rau'keres",
  "An'ggrath the Unbound",
  "Be'lakor",
  "Epidemius",
  "Horticulous Slimux",
  "Kairos Fateweaver",
  "Karanak",
  "Rotigus",
  "Scabeiathrax the Bloated",
  "Shalaxi Helbane",
  "Skarbrand",
  "Skulltaker",
  "Syll'esske",
  "The Blue Scribes",
  "The Changeling",
  "The Masque of Slaanesh",
  "Zarakynel"
 ],
 "infantry": [
  "Flamers",
  "Furies"
 ],
 "character": [
  "Bloodmaster",
  "Changecaster",
  "Contorted Epitome",
  "Exalted Flamer",
  "Fateskimmer",
  "Fluxmaster",
  "Herald of Slaanesh on Steed of Slaanesh",
  "Infernal Enrapturess",
  "Poxbringer",
  "Rendmaster on Blood Throne",
  "Skullmaster",
  "Sloppity Bilepiper",
  "Spoilpox Scrivener",
  "Tormentbringer",
  "Tranceweaver"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Skarbrand": "100",
 "Bloodthirster": "120x92",
 "Skulltaker": "40",
 "Bloodmaster": "40",
 "Skullmaster": "90x52.5",
 "Rendmaster on Blood Throne": "120x92",
 "Karanak": "75x42",
 "Bloodletters": "32",
 "Bloodcrushers": "90x52.5",
 "Flesh Hounds": "60x35.5",
 "Skull Cannon": "120x92",
 "Skull Altar": "coque",
 "Be'lakor": "100",
 "Daemon Prince of Chaos": "60",
 "Daemon Prince of Chaos with wings": "60",
 "Kairos Fateweaver": "100",
 "Lord of Change": "100",
 "The Changeling": "40",
 "Fateskimmer": "120x92",
 "Fluxmaster": "120x92",
 "The Blue Scribes": "120x92",
 "Changecaster": "32",
 "Blue Horrors": "25",
 "Pink Horrors": "32",
 "Flamers": "32",
 "Exalted Flamer": "75x42",
 "Screamers": "60x35.5",
 "Burning Chariot": "120x92",
 "Rotigus": "130",
 "Great Unclean One": "130",
 "Poxbringer": "32",
 "Spoilpox Scrivener": "40",
 "Epidemius": "60",
 "Sloppity Bilepiper": "32",
 "Horticulous Slimux": "105x70",
 "Plaguebearers": "32",
 "Nurglings": "40",
 "Beasts of Nurgle": "60",
 "Plague Drones": "120x92",
 "Feculent Gnarlmaw": "coque",
 "Shalaxi Helbane": "100",
 "Keeper of Secrets": "100",
 "Infernal Enrapturess": "60x35.5",
 "The Masque of Slaanesh": "32",
 "Syll'esske": "50",
 "Contorted Epitome": "75x42",
 "Tormentbringer": "120x92",
 "Tranceweaver": "32",
 "Daemonettes": "25",
 "Fiends": "75x42",
 "Seekers": "60x35.5",
 "Hellflayers": "120x92"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {
 "Skarbrand": 7,
 "Bloodthirster": 6,
 "Be'lakor": 6,
 "Kairos Fateweaver": 7,
 "Lord of Change": 7,
 "Rotigus": 7,
 "Great Unclean One": 7,
 "Shalaxi Helbane": 7,
 "Keeper of Secrets": 6,
 "An'ggrath the Unbound": 8,
 "Aetaos'rau'keres": 8,
 "Scabeiathrax the Bloated": 7,
 "Zarakynel": 7
};

const TRANSPORTS = {};
const FACTION = [
 [
  "The Shadow of Chaos",
  "If your Army Faction is LEGIONES DAEMONICA, certain areas of the battlefield are considered to be within your army’s Shadow of Chaos, as follows: ▪ Your deployment zone is always within your army’s Shadow of Chaos. ▪ At the start of any phase, if you control at least half of the objective markers within No Man’s Land, until the end of that phase, No Man’s Land is within your army’s Shadow of Chaos. ▪ At the start of any phase, if you control at least half of the objective markers within your opponent’s deployment zone, until the end of that phase, your opponent’s deployment zone is within your army’s Shadow of Chaos. DAEMONIC MANIFESTATION While a friendly LEGIONES DAEMONICA unit is within your army’s Shadow of Chaos, each time that unit makes a battle-shock roll, that unit has +1 to that battle-shock roll and, if that roll is successful, one model in that unit heals D3 wounds (if that unit is a BATTLELINE unit and that roll is successful, up to D3 destroyed models (excluding CHARACTER models) can be returned to that unit instead). DAEMONIC TERROR While an enemy unit is within your army’s Shadow of Chaos and/or it is within 6\" of one or more BLOODTHIRSTER, GREAT UNCLEAN ONE, KAIROS FATEWEAVER, KEEPER OF SECRETS, LORD OF CHANGE, ROTIGUS, SHALAXI HELBANE or SKARBRAND units from your army, each time that unit takes a Battle-shock test, subtract 1 from that test and, if that test is failed, that enemy unit suffers D3 mortal wounds."
 ],
 [
  "Dark Pacts",
  "If your Army Faction is HERETIC ASTARTES, each time a unit with this ability is selected to shoot or fight, it can make a Dark Pact. If it does, it must first take a Leadership test before any effects of that Dark Pact are resolved; if that test is failed, that unit suffers D3 mortal wounds. Then, select one of the following abilities for that unit’s weapons to gain until the end of the phase: ▪ [LETHAL HITS] ▪ [SUSTAINED HITS 1]"
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/demons.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */

/* Vides, faute de câblage : voir l'en-tête. */
const ARMEMENT = {};
const STRAT_SIMU = [];
const APTIS_CIBLE = {};
const RETINUE = {};
const ENH_ANCIENS = {};
const GRPN = {};
const MOMENTS = {};
const MOMENTS_ARMEE = [];
const COMPO = {};
const ROLES_UNITE = {};
const OCTROIS_DETACH = {};
const APTIS_UNITE = {};
const APTIS_COND = {};
const AURAS_ARMEE = [];
const AURAS_PERSO = {};

enregistreFaction({
  cle : "demons",
  nom : "Démons du Chaos",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
