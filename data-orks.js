/* ============================================================
   Données Orks — Warhammer 40 000, 11e édition

   FICHIER GÉNÉRÉ — ne pas corriger ici, corriger l'extracteur.
   Refait par : python3 outils/extraction.py orks

   Sources : BSData/wh40k-11e pour les fiches, les armes et les
   textes d'aptitudes ; BSData/wh40k-11e-mfm pour les points, les
   détachements et les rattachements ; l'export de Wahapedia pour
   les stratagèmes et les textes de règles que BSData ne porte pas.
   Données de stratagèmes et de règles de détachement fournies par
   Wahapedia (wahapedia.ru).

   STRATS porte 51 stratagèmes : ceux des détachements que le
   Munitorum reconnaît, plus les 11 de base. Ceux des Actions
   d'Abordage sont écartés : l'application ne tient pas ce format.

   Ce que ce fichier NE porte PAS, et qu'il faut savoir avant de
   s'y fier :
   · SOCLES vient du Base Size Guide, relevé par outils/socles.py :
     54 fiches sur 67 en ont un. Les autres — des Legends, que le
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
  ["Bannernob",6,5,4,0,4,[1],{"1": 30},0,"Appui",0,"",3,"7+"],
  ["Battlewagon",10,11,3,6,16,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",5,"7+"],
  ["Beast Snagga Boyz",6,5,5,6,3,[10, 20],[[1, {"10": 80, "20": 160}], [4, {"10": 90, "20": 170}]],0,"",0,"",2,"7+"],
  ["Beastboss",6,6,4,5,6,[1],{"1": 85},0,"Meneur",0,"",1,"6+"],
  ["Beastboss on Squigosaur",10,9,3,5,10,[1],[[1, {"1": 140}], [3, {"1": 155}]],0,"",0,"",3,"6+"],
  ["Big Mek",6,5,3,0,6,[1],[[1, {"1": 100}], [3, {"1": 115}]],0,"Meneur",0,"",1,"7+"],
  ["Big Mek Dakkarig",8,8,3,5,11,[1],[[1, {"1": 160}], [3, {"1": 180}]],0,"",0,"",3,"7+"],
  ["Big Mek in Mega Armour",5,6,2,0,5,[1],{"1": 90},0,"Meneur",0,"",1,"7+"],
  ["Big Mek with Shokk Attack Gun",6,5,4,0,5,[1],[[1, {"1": 110}], [2, {"1": 125}]],0,"Meneur",0,"",1,"7+"],
  ["Big Trakk",12,9,4,6,12,[1],{"1": 90},0,"",1,"",3,"7+"],
  ["Big'ed Bossbunka",0,10,3,0,12,[1],{"1": 135},0,"",0,"",0,"7+"],
  ["Bigboss",6,5,4,0,5,[1],{"1": 50},0,"Appui",0,"",1,"7+"],
  ["Blitza-bommer",0,9,3,6,12,[1],{"1": 115},0,"",0,"",0,"7+"],
  ["Boss Snikrot",6,5,5,5,6,[1],{"1": 80},0,"Meneur",0,"",1,"6+"],
  ["Boss Zagstruk",12,5,4,5,6,[1],{"1": 90},0,"Meneur",1,"",1,"6+"],
  ["Boyz",6,5,5,0,3,[10, 20],[[1, {"10": 85, "20": 170}], [4, {"10": 95, "20": 180}]],0,"",0,"",2,"7+"],
  ["Breaka Boyz",6,5,4,0,2,[6],[[1, {"6": 120}], [3, {"6": 130}]],0,"",0,"",1,"7+"],
  ["Burna Boyz",6,5,5,0,1,[5, 10],{"5": 60, "10": 120},0,"",1,"",1,"7+"],
  ["Burna-bommer",0,9,3,6,12,[1],{"1": 125},0,"",0,"",0,"7+"],
  ["Dakkajet",0,9,3,6,12,[1],{"1": 125},0,"",0,"",0,"7+"],
  ["Deff Dread",8,9,2,6,8,[1],[[1, {"1": 130}], [3, {"1": 140}]],0,"",0,"",3,"7+"],
  ["Deffkilla Wartrike",12,6,4,5,9,[1],{"1": 80},0,"Meneur",0,"",3,"6+"],
  ["Deffkoptas",12,6,4,6,4,[3, 6],[[1, {"3": 85, "6": 170}], [3, {"3": 95, "6": 180}]],0,"",0,"",2,"7+"],
  ["Flash Gitz",6,5,4,0,3,[5, 10],[[1, {"5": 110, "10": 220}], [3, {"5": 150, "10": 260}]],0,"",0,"",1,"7+"],
  ["Gargantuan Squiggoth",10,13,3,0,30,[1],[[1, {"1": 500}], [2, {"1": 600}]],0,"",0,"",12,"7+"],
  ["Ghazghkull Thraka",8,10,2,4,16,[1],{"1": 290},0,"",0,"",4,"6+"],
  ["Gorkanaut",9,12,2,6,20,[1],[[1, {"1": 325}], [3, {"1": 355}]],0,"",0,"",8,"7+"],
  ["Gretchin",6,2,6,0,1,[10, 20],{"10": 45, "20": 80},0,"",0,"",1,"8+"],
  ["Grot Mega-Tank",8,9,3,0,12,[1],{"1": 110},0,"",1,"",4,"8+"],
  ["Grot Tanks",10,6,3,0,5,[4, 8],{"4": 155, "8": 310},0,"",1,"",2,"8+"],
  ["Gunwagon",10,12,3,6,16,[1],[[1, {"1": 150}], [3, {"1": 160}]],0,"",0,"",5,"7+"],
  ["Hunta Rig",10,10,3,6,16,[1],[[1, {"1": 165}], [3, {"1": 185}]],0,"",0,"",5,"7+"],
  ["Kaptin Badrukk",6,5,3,4,6,[1],{"1": 80},0,"Meneur",1,"",1,"7+"],
  ["Kill Rig",10,10,3,6,16,[1],[[1, {"1": 175}], [3, {"1": 195}]],0,"",0,"",5,"7+"],
  ["Kill Tank",12,12,3,0,24,[1],{"1": 300},0,"",1,"",10,"6+"],
  ["Killa Kans",8,7,3,6,5,[3, 6],[[1, {"3": 130, "6": 275}], [3, {"3": 170, "6": 315}]],0,"",0,"",2,"8+"],
  ["Kommandos",6,5,5,0,3,[10],{"10": 125},0,"",0,"",1,"7+"],
  ["Lifta Wagon",10,10,3,6,16,[1],{"1": 135},0,"",1,"",5,"7+"],
  ["Lootas",6,5,5,0,1,[5, 10],[[1, {"5": 50, "10": 100}], [3, {"5": 60, "10": 110}]],0,"",1,"",1,"7+"],
  ["Mad Dok Grotsnik",6,5,5,5,4,[1],{"1": 65},0,"Meneur",1,"",1,"7+"],
  ["Meganobz",5,6,2,0,3,[2, 3, 5, 6],[[1, {"2": 70, "3": 105, "5": 175, "6": 210}], [3, {"2": 110, "3": 145, "5": 215, "6": 250}]],0,"",0,"",1,"7+"],
  ["Mek",6,5,5,0,4,[1],{"1": 55},0,"Appui",0,"",1,"7+"],
  ["Mek Gunz",5,6,4,6,6,[1, 2, 3],[[1, {"1": 55, "2": 110, "3": 165}], [3, {"1": 65, "2": 120, "3": 175}]],0,"",0,"",2,"8+"],
  ["Mekboy Workshop",0,9,4,0,10,[1],{"1": 80},0,"",1,"",0,"7+"],
  ["Morkanaut",9,12,2,5,20,[1],[[1, {"1": 345}], [3, {"1": 375}]],0,"",0,"",8,"7+"],
  ["Mozrog Skragbad",10,9,3,4,10,[1],{"1": 170},0,"",0,"",3,"6+"],
  ["Nazdreg",5,7,2,5,8,[1],{"1": 165},0,"Meneur",0,"",1,"6+"],
  ["Nobz",6,5,4,0,3,[5, 10],[[1, {"5": 115, "10": 230}], [3, {"5": 145, "10": 260}]],0,"",0,"",1,"7+"],
  ["Painboss",6,5,4,6,4,[1],[[1, {"1": 60}], [3, {"1": 70}]],0,"Appui",0,"",1,"7+"],
  ["Painboy",6,5,5,0,3,[1],{"1": 45},0,"Appui",0,"",1,"7+"],
  ["Rukkatrukk Squigbuggies",12,7,4,6,9,[1, 2],{"1": 85, "2": 160},0,"",0,"",3,"7+"],
  ["Runtherd",6,5,5,0,2,[1],{"1": 10},0,"Appui",0,"",1,"7+"],
  ["Squighog Boyz",10,6,4,6,4,[4, 8],[[1, {"4": 130, "8": 260}], [3, {"4": 160, "8": 290}]],0,"",0,"",2,"7+"],
  ["Stompa",10,14,2,5,30,[1],[[1, {"1": 700}], [2, {"1": 800}]],0,"",0,"",12,"6+"],
  ["Stormboyz",12,5,5,0,1,[5, 10],{"5": 70, "10": 140},0,"",0,"",1,"7+"],
  ["Tankbustas",6,5,4,0,3,[6],[[1, {"6": 160}], [3, {"6": 170}]],0,"",0,"",1,"7+"],
  ["Trukk",12,8,4,6,10,[1],[[1, {"1": 60}], [4, {"1": 70}]],0,"",0,"",2,"7+"],
  ["Warbikers",12,6,4,6,4,[3, 6],{"3": 75, "6": 140},0,"",0,"",2,"7+"],
  ["Warboss",6,6,4,5,6,[1],{"1": 100},0,"Meneur",0,"",1,"6+"],
  ["Warboss in Mega Armour",5,7,2,5,7,[1],[[1, {"1": 115}], [3, {"1": 130}]],0,"Meneur",0,"",1,"6+"],
  ["Warboss on Warbike",12,6,4,5,7,[1],{"1": 75},0,"Meneur",1,"",2,"6+"],
  ["Warbuggies",12,7,4,6,9,[1, 2],{"1": 70, "2": 130},0,"",0,"",3,"7+"],
  ["Wartrakks",12,6,4,6,7,[1, 2],{"1": 70, "2": 130},0,"",0,"",3,"7+"],
  ["Wazbom Blastajet",0,9,3,6,12,[1],[[1, {"1": 215}], [3, {"1": 235}]],0,"",0,"",0,"7+"],
  ["Wazdakka Gutsmek",14,8,3,4,10,[1],{"1": 200},0,"",0,"",3,"6+"],
  ["Weirdboy",6,5,5,0,4,[1],{"1": 60},0,"Appui",0,"",1,"7+"],
  ["Zodgrod Wortsnagga",6,5,5,6,5,[1],{"1": 50},0,"Meneur",0,"",1,"7+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A, CT/CC, F, PA, D, drapeaux, portée] */
const WEAPONS = [
  ["Bannernob","Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Bannernob","Kustom Choppa","C","4",3,5,2,"2","","càc"],
  ["Battlewagon","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Battlewagon","Crushin' Bulk","C","6",3,8,2,"2","","càc"],
  ["Battlewagon","Grabbin' Klaw","C","2",3,10,2,"2","extra","càc"],
  ["Battlewagon","Wreckin' Ball","C","1",3,10,0,"D6","extra","càc"],
  ["Beast Snagga Boyz","Slugga","T","1",5,4,0,"1","","12\""],
  ["Beast Snagga Boyz","Thump Gun","T","3",5,6,0,"2","","18\""],
  ["Beast Snagga Boyz","Power Snappa","C","3",3,8,2,"2","","càc"],
  ["Beast Snagga Boyz","➤ Choppa - Hunter (Hunter: MONSTER/VEHICLE)","C","3",3,6,2,"1","","càc"],
  ["Beast Snagga Boyz","➤ Choppa - Standard","C","3",3,5,1,"1","","càc"],
  ["Beastboss","Shoota","T","2",4,4,0,"1","rf:1","18\""],
  ["Beastboss","Beast Snagga Klaw and Beastchoppa","C","6",2,12,2,"2","sust:2","càc"],
  ["Beastboss on Squigosaur","Slugga","T","1",5,4,0,"1","","12\""],
  ["Beastboss on Squigosaur","Thump Gun","T","3",5,6,0,"2","","18\""],
  ["Beastboss on Squigosaur","Squigosaur’s jaws","C","3",3,7,2,"3","extra","càc"],
  ["Beastboss on Squigosaur","➤ Beastchoppa - Hunter (Hunter: MONSTER/VEHICLE)","C","6",2,12,2,"D6","","càc"],
  ["Beastboss on Squigosaur","➤ Beastchoppa - Standard","C","6",2,6,2,"2","","càc"],
  ["Big Mek","Kustom mega-blasta","T","3",4,9,2,"3","hazardous","24\""],
  ["Big Mek","Traktor Blasta","T","3",4,6,2,"D3+3","anti:2:vol","24\""],
  ["Big Mek","Drilla","C","3",3,12,3,"3","","càc"],
  ["Big Mek","Power Klaw","C","5",3,10,2,"2","","càc"],
  ["Big Mek Dakkarig","Blitzkannon","T","8",4,7,2,"2","ignorescover","24\""],
  ["Big Mek Dakkarig","Multi-busta Launcha","T","6",5,10,2,"3","ignorescover lethal","24\""],
  ["Big Mek Dakkarig","Stompy Feet","C","4",3,6,1,"1","","càc"],
  ["Big Mek in Mega Armour","Kustom Mega-blasta","T","3",4,9,2,"3","hazardous","24\""],
  ["Big Mek in Mega Armour","Tellyport Blasta","T","6",4,9,2,"3","","12\""],
  ["Big Mek in Mega Armour","➤ Kombi-weapon - Kill Shot","T","1",4,10,2,"3","","24\""],
  ["Big Mek in Mega Armour","➤ Kombi-weapon - Point Blank","T","3",0,5,0,"1","torrent","12\""],
  ["Big Mek in Mega Armour","➤ Kombi-weapon - Shoota","T","2",4,4,0,"1","rf:1","18\""],
  ["Big Mek in Mega Armour","➤ Kustom Shoota - Aimed","T","4",4,4,0,"1","rf:2","18\""],
  ["Big Mek in Mega Armour","➤ Kustom Shoota - Point Blank","T","D3+3",0,4,0,"1","torrent","6\""],
  ["Big Mek in Mega Armour","Killsaw","C","3",4,10,2,"3","","càc"],
  ["Big Mek in Mega Armour","Power Klaw","C","3",3,10,2,"2","","càc"],
  ["Big Mek with Shokk Attack Gun","Shokk Attack Gun","T","D3+3",5,12,4,"D6+1","heavy","60\""],
  ["Big Mek with Shokk Attack Gun","Big Mek's Toolz","C","4",3,5,0,"1","","càc"],
  ["Big Trakk","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Big Trakk","➤ Kannon - Frag","T","3",5,5,0,"1","","36\""],
  ["Big Trakk","➤ Kannon - Shell","T","1",5,9,2,"D3+3","","36\""],
  ["Big Trakk","➤ Supa-kannon - Frag","T","D6+3",5,5,0,"1","","36\""],
  ["Big Trakk","➤ Supa-kannon - Shell","T","1",5,12,3,"D6+3","","36\""],
  ["Big Trakk","Armoured hull","C","3",4,6,0,"1","","càc"],
  ["Big'ed Bossbunka","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Big'ed Bossbunka","➤ Gaze of Gork - Glare","T","3",5,5,0,"1","","24\""],
  ["Big'ed Bossbunka","➤ Gaze of Gork - Squint","T","1",5,12,3,"3","","18\""],
  ["Bigboss","Slugga","T","1",5,4,0,"1","","12\""],
  ["Bigboss","Big Choppa","C","5",3,7,2,"2","precision","càc"],
  ["Blitza-bommer","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Blitza-bommer","Dual Supa-shoota","T","8",5,6,1,"1","rf:4","36\""],
  ["Blitza-bommer","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Boss Snikrot","Slugga","T","1",5,4,0,"1","precision","12\""],
  ["Boss Snikrot","Mork’s Teef","C","6",2,6,2,"2","anti:2:inf precision","càc"],
  ["Boss Zagstruk","Slugga","T","1",5,4,0,"1","","12\""],
  ["Boss Zagstruk","Da Vulcha’s Klaws and Choppa","C","6",2,8,2,"2","","càc"],
  ["Boyz","Big Shoota","T","3",5,4,0,"1","rf:2","36\""],
  ["Boyz","Burna","T","3",0,4,0,"1","torrent","12\""],
  ["Boyz","Kustom Shoota","T","4",5,4,0,"1","rf:2","18\""],
  ["Boyz","Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Boyz","Slugga","T","1",5,4,0,"1","","12\""],
  ["Boyz","➤ Kombi-rokkit - Busta Rokkit","T","1",5,10,2,"3","","24\""],
  ["Boyz","➤ Kombi-rokkit - Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Boyz","➤ Kombi-skorcha - Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Boyz","➤ Kombi-skorcha - Skorcha","T","3",0,5,0,"1","torrent","12\""],
  ["Boyz","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Boyz","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Boyz","Big Choppa","C","4",3,7,1,"2","","càc"],
  ["Boyz","Choppa","C","3",3,5,1,"1","","càc"],
  ["Boyz","Kustom Choppa","C","4",3,5,2,"2","","càc"],
  ["Boyz","Power Klaw","C","3",3,10,2,"2","","càc"],
  ["Breaka Boyz","Rokkit pistol","T","1",5,10,2,"3","","12\""],
  ["Breaka Boyz","Choppa","C","4",3,5,1,"1","","càc"],
  ["Breaka Boyz","Knucklebustas","C","4",3,5,2,"2","","càc"],
  ["Breaka Boyz","Tankhammer","C","3",4,12,2,"3","dev hazardous","càc"],
  ["Breaka Boyz","➤ Smash Hammer - Hunter (Hunter: MONSTER/VEHICLE)","C","3",3,12,2,"3","","càc"],
  ["Breaka Boyz","➤ Smash Hammer - Standard","C","3",3,7,2,"2","","càc"],
  ["Burna Boyz","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Burna Boyz","Burna","T","3",0,4,0,"1","torrent","12\""],
  ["Burna Boyz","Kustom mega-blasta","T","3",5,9,2,"D6","hazardous","24\""],
  ["Burna Boyz","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Burna Boyz","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Burna Boyz","Cuttin’ Flames","C","2",4,4,2,"1","","càc"],
  ["Burna Boyz","Gun Stock and Fists","C","2",3,5,0,"1","","càc"],
  ["Burna-bommer","Dual Big Shoota","T","6",5,5,0,"1","rf:4","36\""],
  ["Burna-bommer","Dual Supa-shoota","T","8",5,6,1,"1","rf:4 sust:1","36\""],
  ["Burna-bommer","Skorcha Missile Rack","T","6",5,5,0,"1","ignorescover","36\""],
  ["Burna-bommer","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Dakkajet","Dual Supa-shoota","T","8",5,6,1,"1","rf:4","36\""],
  ["Dakkajet","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Deff Dread","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Deff Dread","Kustom Mega-blasta","T","3",5,9,2,"3","hazardous","24\""],
  ["Deff Dread","Skorcha","T","3",0,5,0,"1","torrent","12\""],
  ["Deff Dread","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Deff Dread","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Deff Dread","Dread Klaws","C","5",3,12,2,"3","","càc"],
  ["Deff Dread","Extra Klaw","C","1",3,12,2,"3","extra","càc"],
  ["Deffkilla Wartrike","Boomstikks","T","6",5,5,0,"1","assault","12\""],
  ["Deffkilla Wartrike","Snagga Klaw (tir)","T","1",5,7,2,"2","assault precision","12\""],
  ["Deffkilla Wartrike","Snagga Klaw (càc)","C","5",2,7,2,"2","","càc"],
  ["Deffkilla Wartrike","➤ Killa Jet - Burna","C","3",3,5,1,"1","extra","càc"],
  ["Deffkilla Wartrike","➤ Killa Jet - Cutta","C","1",3,10,3,"D6+2","extra","càc"],
  ["Deffkoptas","Kustom Mega-blasta","T","3",5,9,2,"3","hazardous lethal","24\""],
  ["Deffkoptas","Slugga","T","1",5,4,0,"1","","12\""],
  ["Deffkoptas","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Deffkoptas","➤ Rokkit Launcha- Busta","T","2",5,10,2,"3","lethal","24\""],
  ["Deffkoptas","Choppa","C","3",4,5,1,"1","","càc"],
  ["Deffkoptas","Spinnin’ Blades","C","4",3,5,1,"1","hazardous","càc"],
  ["Flash Gitz","➤ Snazzgun - Cutta","T","1",4,9,3,"D3+2","hazardous melta:2","12\""],
  ["Flash Gitz","➤ Snazzgun - Dakka","T","3",4,6,1,"2","sust:1","24\""],
  ["Flash Gitz","➤ Snazzgun - Kill Shot","T","2",4,8,2,"2","hazardous","36\""],
  ["Flash Gitz","Choppa","C","4",3,5,1,"1","","càc"],
  ["Gargantuan Squiggoth","Supa-kannon","T","8",5,12,2,"3","","60\""],
  ["Gargantuan Squiggoth","➤ Kannon - frag","T","6",5,5,0,"1","rf:6","36\""],
  ["Gargantuan Squiggoth","➤ Kannon - shell","T","2",5,10,2,"D6+1","rf:2","36\""],
  ["Gargantuan Squiggoth","Huge tusks","C","6",3,14,3,"12","","càc"],
  ["Ghazghkull Thraka","➤ Mork’s Roar - Aimed","T","12",5,6,1,"1","rf:4","36\""],
  ["Ghazghkull Thraka","➤ Mork’s Roar - Point Blank","T","2D6+2",0,6,1,"1","torrent","9\""],
  ["Ghazghkull Thraka","Adamantine 'Eadbutt","C","1",2,14,2,"D3+3","dev extra precision","càc"],
  ["Ghazghkull Thraka","Gork’s Klaw","C","7",2,14,3,"4","dev","càc"],
  ["Gorkanaut","Dual Big Shoota","T","6",5,5,0,"1","rf:4","36\""],
  ["Gorkanaut","Skorcha","T","3",0,5,0,"1","torrent","12\""],
  ["Gorkanaut","➤ Deffstorm Mega-shoota - Aimed","T","20",5,6,1,"1","","36\""],
  ["Gorkanaut","➤ Deffstorm Mega-shoota - Point Blank","T","3D6",0,6,1,"1","torrent","12\""],
  ["Gorkanaut","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Gorkanaut","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Gorkanaut","Klaw of Gork","C","6",3,18,3,"6","","càc"],
  ["Gretchin","Grot Blasta","T","1",4,3,0,"1","","12\""],
  ["Gretchin","Scavenged Shivs","C","1",5,2,0,"1","","càc"],
  ["Grot Mega-Tank","Dual Big Shoota","T","6",4,5,0,"1","","36\""],
  ["Grot Mega-Tank","Dual Grotzooka","T","D3+3",4,6,1,"1","ignorescover twin","18\""],
  ["Grot Mega-Tank","Dual Kustom Mega-blasta","T","3",4,9,2,"3","hazardous twin","24\""],
  ["Grot Mega-Tank","Dual Skorcha","T","3",0,5,0,"1","torrent twin","12\""],
  ["Grot Mega-Tank","Mega-tank Weapons","T","10",4,5,0,"1","rf:10","18\""],
  ["Grot Mega-Tank","➤ Dual Rokkit Launcha - Blasta","T","2",5,4,0,"1","twin","24\""],
  ["Grot Mega-Tank","➤ Dual Rokkit Launcha - Busta","T","2",5,10,2,"3","twin","24\""],
  ["Grot Mega-Tank","Armoured Hull","C","6",4,4,0,"1","","càc"],
  ["Grot Tanks","Grot Tank Shoota","T","3",4,5,0,"1","dev rf:2","36\""],
  ["Grot Tanks","Grotzooka","T","D3+3",4,6,1,"1","ignorescover","18\""],
  ["Grot Tanks","Kustom Mega-blasta","T","3",4,9,2,"3","hazardous","24\""],
  ["Grot Tanks","Skorcha","T","3",0,5,0,"1","torrent","12\""],
  ["Grot Tanks","➤ Rokkit Launcha - Blasta","T","2",4,4,0,"1","","24\""],
  ["Grot Tanks","➤ Rokkit Launcha - Busta","T","2",4,10,2,"3","","24\""],
  ["Grot Tanks","Ramshackle Hull","C","3",5,6,0,"1","","càc"],
  ["Gunwagon","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Gunwagon","Killkannon","T","4",4,6,3,"2","anti:3:inf rf:4","24\""],
  ["Gunwagon","Lobba","T","3",4,5,0,"1","indirect","48\""],
  ["Gunwagon","Zzap Gun","T","2",4,8,2,"4","rf:2 sust:2","36\""],
  ["Gunwagon","➤ Kannon - Frag","T","4",4,5,0,"1","rf:4","36\""],
  ["Gunwagon","➤ Kannon - Shell","T","2",4,10,2,"D6+1","rf:2","36\""],
  ["Gunwagon","Crushin' Bulk","C","6",3,8,2,"2","","càc"],
  ["Gunwagon","Grabbin' Klaw","C","2",3,10,2,"2","extra","càc"],
  ["Gunwagon","Wreckin' Ball","C","1",3,10,0,"D6","extra","càc"],
  ["Hunta Rig","Stikka Kannon","T","1",5,12,2,"3","","12\""],
  ["Hunta Rig","’Eavy Lobba","T","3",5,6,0,"2","indirect","48\""],
  ["Hunta Rig","Butcha Boyz","C","4",3,5,1,"1","","càc"],
  ["Hunta Rig","Savage Horns and Hooves","C","4",4,8,1,"3","extra lance","càc"],
  ["Hunta Rig","Saw Blades","C","6",3,10,2,"2","extra","càc"],
  ["Kaptin Badrukk","Slugga","T","1",5,4,0,"1","","12\""],
  ["Kaptin Badrukk","➤ Da Rippa - Standard","T","3",5,7,2,"2","heavy sust:1","24\""],
  ["Kaptin Badrukk","➤ Da Rippa - Supercharge","T","3",5,8,3,"3","hazardous heavy sust:1","24\""],
  ["Kaptin Badrukk","Choppa","C","3",3,5,1,"1","","càc"],
  ["Kill Rig","Stikka Kannon","T","1",5,12,2,"3","","12\""],
  ["Kill Rig","Wurrtower","T","1",0,12,3,"6","hazardous psychic torrent","24\""],
  ["Kill Rig","’Eavy Lobba","T","3",5,6,0,"2","indirect","48\""],
  ["Kill Rig","Butcha Boyz","C","4",3,5,1,"1","","càc"],
  ["Kill Rig","Savage Horns and Hooves","C","4",4,8,1,"3","extra lance","càc"],
  ["Kill Rig","Saw Blades","C","6",3,10,2,"2","extra","càc"],
  ["Kill Tank","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Kill Tank","Lobba","T","3",5,5,0,"1","indirect","48\""],
  ["Kill Tank","Skorcha","T","3",0,5,0,"1","torrent","12\""],
  ["Kill Tank","Zzap Gun","T","2",5,8,2,"4","rf:2 sust:2","36\""],
  ["Kill Tank","➤ Kannon - Frag","T","2D6",5,6,1,"1","","48\""],
  ["Kill Tank","➤ Kannon - Shell","T","2",5,12,3,"D3+3","heavy","48\""],
  ["Kill Tank","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Kill Tank","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Kill Tank","➤ Tank Kannon - Blasta","T","10",5,6,1,"1","","48\""],
  ["Kill Tank","➤ Tank Kannon - Tankhamma","T","2",5,16,3,"D6+6","heavy","48\""],
  ["Kill Tank","Crushin' Bulk","C","6",3,8,2,"2","","càc"],
  ["Kill Tank","Deff Rolla","C","6",3,10,2,"3","","càc"],
  ["Killa Kans","➤ Kan Blasta - Dakka","T","4",4,6,1,"1","ignorescover sust:1","24\""],
  ["Killa Kans","➤ Kan Blasta - Kill Shot","T","2",4,10,2,"3","","24\""],
  ["Killa Kans","➤ Kan Blasta - Point Blank","T","3",0,5,1,"1","torrent","12\""],
  ["Killa Kans","Kan Klaw","C","3",4,8,2,"3","","càc"],
  ["Kommandos","Burna","T","3",0,4,0,"1","torrent","12\""],
  ["Kommandos","Kustom Shoota","T","4",5,4,0,"1","rf:2","18\""],
  ["Kommandos","Slugga","T","1",5,4,0,"1","","12\""],
  ["Kommandos","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Kommandos","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Kommandos","Big Choppa","C","4",3,7,1,"2","","càc"],
  ["Kommandos","Breacha Ram","C","2",4,8,2,"2","","càc"],
  ["Kommandos","Choppa","C","3",3,5,1,"1","","càc"],
  ["Kommandos","Power Klaw","C","3",3,10,2,"2","","càc"],
  ["Lifta Wagon","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Lifta Wagon","Lifta-droppa","T","4",5,6,3,"D6+1","anti:3:veh","36\""],
  ["Lifta Wagon","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Lifta Wagon","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Lifta Wagon","Crushin' Bulk","C","6",3,8,2,"2","","càc"],
  ["Lifta Wagon","Grabbin' Klaw","C","2",3,10,2,"2","extra","càc"],
  ["Lifta Wagon","Wreckin' ball","C","1",3,10,0,"D6","extra","càc"],
  ["Lootas","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Lootas","Deffgun","T","2",6,8,1,"2","heavy rf:1","48\""],
  ["Lootas","Kustom Mega-blasta","T","3",5,9,2,"3","hazardous","24\""],
  ["Lootas","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Lootas","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Lootas","Gun Stock and Fists","C","2",3,5,0,"1","","càc"],
  ["Mad Dok Grotsnik","Slugga","T","1",5,4,0,"1","","12\""],
  ["Mad Dok Grotsnik","Power Klaw","C","4",3,10,2,"2","","càc"],
  ["Mad Dok Grotsnik","’Urty syringe","C","1",3,2,0,"D6","anti:4:inf extra precision","càc"],
  ["Meganobz","➤ Kombi-weapon - Kill Shot","T","1",5,10,2,"3","","24\""],
  ["Meganobz","➤ Kombi-weapon - Point Blank","T","3",0,5,0,"1","torrent","12\""],
  ["Meganobz","➤ Kombi-weapon - Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Meganobz","➤ Kustom Shoota - Aimed","T","4",5,4,0,"1","rf:2","18\""],
  ["Meganobz","➤ Kustom Shoota - Point Blank","T","D3+3",0,4,0,"1","torrent","6\""],
  ["Meganobz","Killsaw","C","3",4,10,2,"3","","càc"],
  ["Meganobz","Power Klaw","C","3",3,10,2,"2","","càc"],
  ["Meganobz","Twin Killsaw","C","3",4,10,2,"3","twin","càc"],
  ["Mek","Kustom Mega-slugga","T","3",4,8,2,"3","hazardous","12\""],
  ["Mek","Mek's Toolz","C","3",3,5,0,"1","","càc"],
  ["Mek Gunz","Bubblechukka","T","8",4,3,3,"1","lethal","48\""],
  ["Mek Gunz","Kustom Mega-kannon","T","D3+1",4,12,2,"4","hazardous","36\""],
  ["Mek Gunz","Smasha Gun","T","4",4,7,3,"3","","48\""],
  ["Mek Gunz","Traktor Kannon","T","2",4,6,2,"D3+3","anti:2:vol","48\""],
  ["Mek Gunz","Scavenged Shivs","C","5",5,2,0,"1","","càc"],
  ["Morkanaut","Dual Big Shoota","T","6",4,5,0,"1","rf:4","36\""],
  ["Morkanaut","Kustom Mega-blasta","T","3",4,9,2,"3","hazardous","24\""],
  ["Morkanaut","Kustom Mega-zappa","T","3",4,12,2,"4","hazardous","36\""],
  ["Morkanaut","➤ Rokkit Launcha - Blasta","T","2",4,5,0,"1","","24\""],
  ["Morkanaut","➤ Rokkit Launcha - Busta","T","2",4,10,2,"3","","24\""],
  ["Morkanaut","Klaw of Mork","C","5",3,18,3,"6","","càc"],
  ["Mozrog Skragbad","Thump Gun","T","3",5,6,0,"2","","18\""],
  ["Mozrog Skragbad","Big Chompa’s Jaws","C","3",3,7,2,"4","extra","càc"],
  ["Mozrog Skragbad","➤ Gutrippa - Hunter (Hunter: MONSTER/VEHICLE)","C","6",2,12,2,"D6+1","lethal","càc"],
  ["Mozrog Skragbad","➤ Gutrippa - Standard","C","6",2,9,2,"2","","càc"],
  ["Nazdreg","Kustom Blasta X - Gatler","T","6",4,9,2,"3","hazardous","24\""],
  ["Nazdreg","Kustom Blasta X - Shoota","T","4",4,5,1,"1","rf:2","18\""],
  ["Nazdreg","Kustom Blasta X - Skorcha","T","3",0,5,1,"1","torrent","12\""],
  ["Nazdreg","Kustom Blasta X","C","6",2,5,1,"1","extra","càc"],
  ["Nazdreg","Moonchewa","C","5",2,12,2,"3","twin","càc"],
  ["Nobz","Big Skorcha","T","3",0,5,1,"1","torrent","18\""],
  ["Nobz","Kustom Big Shoota","T","8",5,4,0,"1","","18\""],
  ["Nobz","Kustom Shoota","T","4",5,4,0,"1","rf:2","18\""],
  ["Nobz","➤ Kombi-rokkit - Busta Rokkit","T","1",5,10,2,"3","","24\""],
  ["Nobz","➤ Kombi-rokkit - Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Nobz","Big Choppa","C","4",3,7,1,"2","","càc"],
  ["Nobz","Kustom Choppa","C","4",3,5,2,"2","","càc"],
  ["Nobz","Kustom Krumpa","C","3",3,10,2,"2","","càc"],
  ["Painboss","Beast Snagga Klaw","C","3",3,10,2,"2","","càc"],
  ["Painboy","Dok's Toolz","C","3",3,10,2,"2","","càc"],
  ["Painboy","’Urty syringe","C","1",3,2,0,"D6","anti:4:inf extra","càc"],
  ["Rukkatrukk Squigbuggies","Sawn-off Shotgun","T","2",5,4,0,"1","assault","12\""],
  ["Rukkatrukk Squigbuggies","Squig Launchas","T","D6+6",4,5,1,"2","ignorescover","24\""],
  ["Rukkatrukk Squigbuggies","Saw Blades","C","4",3,7,1,"2","","càc"],
  ["Runtherd","Slugga","T","1",5,4,0,"1","","12\""],
  ["Runtherd","Grot-smacka","C","3",3,5,0,"1","","càc"],
  ["Squighog Boyz","Saddlegit's Shiv","T","1",4,3,0,"1","assault","9\""],
  ["Squighog Boyz","Slugga","T","1",5,4,0,"1","","12\""],
  ["Squighog Boyz","Stikka (ranged)","T","1",5,5,1,"2","assault","9\""],
  ["Squighog Boyz","Big Choppa","C","4",3,7,1,"2","","càc"],
  ["Squighog Boyz","Squig Jaws","C","3",4,6,1,"2","extra","càc"],
  ["Squighog Boyz","Stikka (melee)","C","3",3,5,1,"2","","càc"],
  ["Stompa","Big Shoota","T","3",5,5,0,"1","rf:2","36\""],
  ["Stompa","Deffkannon and Supa-rokkits","T","12",5,14,3,"D6+2","","72\""],
  ["Stompa","Skorcha","T","3",0,5,1,"1","torrent","12\""],
  ["Stompa","Twin big shoota","T","3",5,5,0,"1","rf:2 twin","36\""],
  ["Stompa","➤ Supa-gatler - Aimed","T","30",5,7,2,"2","sust:1","24\""],
  ["Stompa","➤ Supa-gatler - Point Blank","T","3D6+3",0,7,2,"2","torrent","12\""],
  ["Stompa","Mega-choppa","C","6",3,24,4,"10","","càc"],
  ["Stormboyz","Slugga","T","1",5,4,0,"1","","12\""],
  ["Stormboyz","Choppa","C","3",3,5,1,"1","","càc"],
  ["Stormboyz","Kustom Choppa","C","4",3,5,2,"2","","càc"],
  ["Stormboyz","Power Klaw","C","3",3,10,2,"2","","càc"],
  ["Tankbustas","Rokkit pistol","T","1",4,10,2,"3","","12\""],
  ["Tankbustas","➤ Busta Rokkit Launcha - Hunter (Hunter: MONSTER/VEHICLE)","T","3",4,12,2,"3","","24\""],
  ["Tankbustas","➤ Busta Rokkit Launcha - Standard","T","2",4,10,2,"3","","24\""],
  ["Tankbustas","Choppa","C","4",3,5,1,"1","","càc"],
  ["Tankbustas","Gitstikka","C","3",3,5,0,"1","","càc"],
  ["Tankbustas","➤ Smash Hammer - Hunter (Hunter: MONSTER/VEHICLE)","C","3",3,12,2,"3","","càc"],
  ["Tankbustas","➤ Smash Hammer - Standard","C","3",3,7,2,"2","","càc"],
  ["Trukk","Dual Big Shoota","T","6",5,5,0,"1","rf:4","36\""],
  ["Trukk","➤ Rokkit Launcha - Blasta","T","2",5,4,0,"1","","24\""],
  ["Trukk","➤ Rokkit Launcha - Busta","T","2",5,10,2,"3","","24\""],
  ["Trukk","Buzzsaw","C","2",3,6,1,"2","extra","càc"],
  ["Trukk","Grabbin' Klaw","C","2",3,10,2,"2","extra","càc"],
  ["Trukk","Spiked Ram","C","3",3,6,0,"1","","càc"],
  ["Warbikers","Dual Dakkagun","T","6",5,5,0,"1","assault","18\""],
  ["Warbikers","➤ Dual Kombi-rokkit - Busta Rokkit","T","2",5,10,2,"3","assault","24\""],
  ["Warbikers","➤ Dual Kombi-rokkit - Dakkagun","T","6",5,5,0,"1","assault","18\""],
  ["Warbikers","Choppa","C","3",3,5,1,"1","","càc"],
  ["Warbikers","Kustom Choppa","C","4",3,5,2,"2","","càc"],
  ["Warboss","Kustom Shoota","T","4",5,4,0,"1","rf:2","18\""],
  ["Warboss","➤ Kombi-rokkit - Busta Rokkit","T","1",5,10,2,"3","","24\""],
  ["Warboss","➤ Kombi-rokkit - Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Warboss","➤ Kombi-skorcha - Shoota","T","2",5,4,0,"1","rf:1","18\""],
  ["Warboss","➤ Kombi-skorcha - Skorcha","T","3",0,5,0,"1","torrent","12\""],
  ["Warboss","Kustom Choppa","C","6",2,7,2,"2","","càc"],
  ["Warboss","Power Klaw","C","6",2,12,2,"2","","càc"],
  ["Warboss in Mega Armour","Big Shoota","T","3",4,5,0,"1","rf:2","36\""],
  ["Warboss in Mega Armour","’Uge Choppa","C","5",2,12,2,"3","","càc"],
  ["Warboss on Warbike","Dual Dakkagun","T","6",5,5,0,"1","assault","18\""],
  ["Warboss on Warbike","Big Choppa","C","6",2,9,1,"2","","càc"],
  ["Warboss on Warbike","Killsaw","C","6",3,12,2,"3","","càc"],
  ["Warboss on Warbike","Power Klaw","C","6",2,12,2,"2","","càc"],
  ["Warbuggies","Extra Dakka","T","4",5,5,1,"1","assault sust:1","12\""],
  ["Warbuggies","➤ Mek Speshul - Aimed","T","14",4,5,1,"1","assault sust:1","24\""],
  ["Warbuggies","➤ Mek Speshul - Point Blank","T","2D6+2",0,5,1,"1","assault torrent","6\""],
  ["Warbuggies","➤ Rivet Kannon - Aimed","T","6",4,7,2,"2","anti:4:inf assault","24\""],
  ["Warbuggies","➤ Rivet Kannon - Point Blank","T","D3+1",0,7,2,"2","anti:4:inf assault torrent","6\""],
  ["Warbuggies","Spiked Ram","C","4",3,7,1,"2","","càc"],
  ["Wartrakks","Kustom Shoota","T","4",5,4,0,"1","rf:2","18\""],
  ["Wartrakks","Multi-busta Launcha","T","D3+3",5,10,2,"3","","24\""],
  ["Wartrakks","Kustom Choppa","C","4",3,5,2,"2","","càc"],
  ["Wazbom Blastajet","Dual Supa-shoota","T","8",4,6,1,"1","ignorescover rf:4","36\""],
  ["Wazbom Blastajet","Dual Tellyport Mega-blasta","T","6",4,9,2,"3","ignorescover rf:6","24\""],
  ["Wazbom Blastajet","Dual Wazbom Mega-kannon","T","4",4,12,2,"4","hazardous ignorescover","36\""],
  ["Wazbom Blastajet","Smasha Gun","T","4",4,6,3,"3","ignorescover","48\""],
  ["Wazbom Blastajet","Armoured Impact","C","3",4,6,0,"1","","càc"],
  ["Wazdakka Gutsmek","Grabba Dragga (tir)","T","1",2,10,2,"3","assault precision","12\""],
  ["Wazdakka Gutsmek","Psyko-gatler","T","12",4,6,2,"2","assault sust:1","24\""],
  ["Wazdakka Gutsmek","Fixit's Wrench","C","1",4,3,0,"1","extra","càc"],
  ["Wazdakka Gutsmek","Grabba Dragga (càc)","C","6",2,10,2,"3","lance","càc"],
  ["Wazdakka Gutsmek","Speeding Bulk and Flaming Exhaust","C","3",2,5,1,"1","extra","càc"],
  ["Weirdboy","Power Vomit","T","3",0,5,3,"2","hazardous psychic torrent","12\""],
  ["Weirdboy","Copper Staff","C","3",3,8,1,"2","psychic","càc"],
  ["Zodgrod Wortsnagga","Squigstoppa","T","1",5,4,1,"1","","12\""],
  ["Zodgrod Wortsnagga","Da Grabzappa","C","5",2,7,2,"2","","càc"]
];

/* CAT : [nom, catégorie principale] */
const CAT = [
  ["Bannernob","Personnage"],
  ["Battlewagon","Véhicule"],
  ["Beast Snagga Boyz","Battleline"],
  ["Beastboss","Personnage"],
  ["Beastboss on Squigosaur","Monstre"],
  ["Big Mek","Personnage"],
  ["Big Mek Dakkarig","Personnage"],
  ["Big Mek in Mega Armour","Personnage"],
  ["Big Mek with Shokk Attack Gun","Personnage"],
  ["Big Trakk","Véhicule"],
  ["Big'ed Bossbunka","Fortification"],
  ["Bigboss","Personnage"],
  ["Blitza-bommer","Véhicule"],
  ["Boss Snikrot","Epic Hero"],
  ["Boss Zagstruk","Epic Hero"],
  ["Boyz","Battleline"],
  ["Breaka Boyz","Infanterie"],
  ["Burna Boyz","Infanterie"],
  ["Burna-bommer","Véhicule"],
  ["Dakkajet","Véhicule"],
  ["Deff Dread","Véhicule"],
  ["Deffkilla Wartrike","Personnage"],
  ["Deffkoptas","Monté"],
  ["Flash Gitz","Infanterie"],
  ["Gargantuan Squiggoth","Monstre"],
  ["Ghazghkull Thraka","Epic Hero"],
  ["Gorkanaut","Véhicule"],
  ["Gretchin","Infanterie"],
  ["Grot Mega-Tank","Véhicule"],
  ["Grot Tanks","Véhicule"],
  ["Gunwagon","Véhicule"],
  ["Hunta Rig","Monstre"],
  ["Kaptin Badrukk","Epic Hero"],
  ["Kill Rig","Monstre"],
  ["Kill Tank","Véhicule"],
  ["Killa Kans","Véhicule"],
  ["Kommandos","Infanterie"],
  ["Lifta Wagon","Véhicule"],
  ["Lootas","Infanterie"],
  ["Mad Dok Grotsnik","Epic Hero"],
  ["Meganobz","Infanterie"],
  ["Mek","Personnage"],
  ["Mek Gunz","Véhicule"],
  ["Mekboy Workshop","Fortification"],
  ["Morkanaut","Véhicule"],
  ["Mozrog Skragbad","Epic Hero"],
  ["Nazdreg","Epic Hero"],
  ["Nobz","Infanterie"],
  ["Painboss","Personnage"],
  ["Painboy","Personnage"],
  ["Rukkatrukk Squigbuggies","Véhicule"],
  ["Runtherd","Autre"],
  ["Squighog Boyz","Monté"],
  ["Stompa","Véhicule"],
  ["Stormboyz","Infanterie"],
  ["Tankbustas","Infanterie"],
  ["Trukk","Véhicule"],
  ["Warbikers","Monté"],
  ["Warboss","Personnage"],
  ["Warboss in Mega Armour","Personnage"],
  ["Warboss on Warbike","Personnage"],
  ["Warbuggies","Véhicule"],
  ["Wartrakks","Monté"],
  ["Wazbom Blastajet","Véhicule"],
  ["Wazdakka Gutsmek","Epic Hero"],
  ["Weirdboy","Personnage"],
  ["Zodgrod Wortsnagga","Epic Hero"]
];

/* ATTACH : qui peut rejoindre qui, d'après le Munitorum */
const ATTACH = {
 "Beastboss": [
  "Beast Snagga Boyz"
 ],
 "Big Mek": [
  "Boyz",
  "Breaka Boyz",
  "Flash Gitz",
  "Mek Gunz",
  "Nobz",
  "Tankbustas"
 ],
 "Big Mek in Mega Armour": [
  "Meganobz",
  "Mek Gunz"
 ],
 "Big Mek with Shokk Attack Gun": [
  "Boyz",
  "Mek Gunz",
  "Nobz",
  "Tankbustas"
 ],
 "Boss Snikrot": [
  "Kommandos"
 ],
 "Boss Zagstruk": [
  "Stormboyz"
 ],
 "Deffkilla Wartrike": [
  "Warbikers"
 ],
 "Kaptin Badrukk": [
  "Flash Gitz"
 ],
 "Mad Dok Grotsnik": [
  "Boyz",
  "Burna Boyz",
  "Lootas",
  "Nobz",
  "Tankbustas"
 ],
 "Nazdreg": [
  "Meganobz"
 ],
 "Warboss": [
  "Boyz",
  "Breaka Boyz",
  "Nobz"
 ],
 "Warboss in Mega Armour": [
  "Meganobz"
 ],
 "Warboss on Warbike": [
  "Warbikers"
 ],
 "Zodgrod Wortsnagga": [
  "Gretchin"
 ]
};

/* APTITUDES : le texte du catalogue, en anglais */
const APTITUDES = {
 "Battlewagon": [
  [
   "Mobile Fortress",
   "Ranged attacks that target this unit have -1 D."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Beast Snagga Boyz": [
  [
   "Mobbed",
   "When this unit ends a charge move, each enemy MONSTER/VEHICLE unit engaged with this unit makes a battle-shock roll:\n- With -1 to that battle-shock roll.\n- Or: With -2 to that battle-shock roll if this unit has 13+ models."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Beastboss": [
  [
   "Dodge Dis!",
   "This unit's attacks have +1 to hit rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Beast Snagga Boyz"
  ],
  [
   "Keep Huntin'! (Once per battle round, per army)",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly BEAST SNAGGA unit within 6\" of this unit. That unit:\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ]
 ],
 "Beastboss on Squigosaur": [
  [
   "Thundering Stampede (Aura)",
   "Friendly BEAST SNAGGA units within 6\" of this unit have +1 to charge rolls."
  ],
  [
   "Boss of da Hunt",
   "While this unit is within 3\" of a friendly BEAST SNAGGA unit (excluding MONSTER CHARACTER units), this unit has Lone Operative."
  ],
  [
   "Keep Huntin'! (Once per battle round, per army)",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly BEAST SNAGGA unit within 6\" of this unit. That unit:\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Big Mek in Mega Armour": [
  [
   "Fix Dat Armour Up (Once per battle, per unit)",
   "In your Command phase, this unit heals 3 wounds.\n*Place a Grot Oiler token next to the unit, removing it when this ability is used.*"
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- MEGANOBZ\n- MEK GUNZ"
  ],
  [
   "Kustom Force Field",
   "This unit has 4+ InSv against ranged attacks."
  ],
  [
   "More Dakka",
   "This unit's ranged attacks have:\n- [IGNORES COVER].\n- If this unit is riled up, [SUSTAINED HITS 1]."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Big Mek with Shokk Attack Gun": [
  [
   "Support Shokka",
   "While this model is within 3\" of a friendly ORKS INFANTRY unit (excluding BIG MEK WITH SHOKK ATTACK GUN units), this model has Lone Operative."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- BOYZ\n- MEK GUNZ\n- NOBZ\n- TANKBUSTAS"
  ],
  [
   "More Dakka",
   "This unit's ranged attacks have:\n- [IGNORES COVER].\n- If this unit is riled up, [SUSTAINED HITS 1]."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Big'ed Bossbunka": [
  [
   "Fortification",
   "While an enemy unit is engaged with only FORTIFICATION units:\n- That enemy unit can be selected as a target of ranged attacks.\n- When shooting that enemy unit, those ranged attacks have -1 to hit rolls (excluding [CLOSE-QUARTERS attacks).\n- When that enemy unit is selected to make a fall-back move, if that enemy unit if only engaged with FORTIFICATION units, and that enemy unit is not battle-shocked, hazard rolls made for that enemy unit are automatically passed."
  ],
  [
   "Raucous Occupants",
   "While this model is within range of your home objective, add the OC of models embarked within this model to this model's OC."
  ],
  [
   "Ramshackle Cover",
   "When an attack targets a unit that is not fully visible to the attacking model because of this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Blitza-bommer": [
  [
   "Boom Bomb",
   "At the end of your opponent’s Fight phase, select one visible enemy unit (excluding Lone Operative units) within 24\" of this unit, and roll one D6 for that unit:\n- On a 1-3, that enemy unit suffers D3 mortal wounds.\n- On a 4-5, that enemy unit suffers 3 mortal wounds.\n- On a 6, that enemy unit suffers D3+3 mortal wounds."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Boss Snikrot": [
  [
   "Deff from the Shadows (First battle round onwards)",
   "At the end of your opponent's Movement phase, if this unit is in strategic reserves, this unit can make an ingress move."
  ],
  [
   "Kunnin’ Infiltrator",
   "At the end of your opponent's Fight phase, if each model in this unit is hidden and unengaged, you can place this unit in strategic reserves."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- KOMMANDOS"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Boss Zagstruk": [
  [
   "Drill Boss",
   "This unit's melee attacks have +1 to hit rolls."
  ],
  [
   "Plummeting Descent",
   "If this unit made an ingress move this turn, this unit can re-roll charge rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- STORMBOYZ"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Boyz": [
  [
   "Never Too Busy to Fight",
   "Being engaged does not prevent this unit from being eligible to start an action."
  ],
  [
   "Ammo Runts (Once per battle, per unit)",
   "In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have +1 to hit rolls.\n*Place any number of Ammo Runts tokens next to the unit, removing them when this ability is used.*"
  ],
  [
   "Tide of Muscle",
   "In the Fight phase, if this unit made a charge move this turn, this unit's melee attacks have [LETHAL HITS]."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Burna Boyz": [
  [
   "Pyromaniaks",
   "This unit's attacks that target a unit within 6\" of this unit can re-roll wound rolls of 1."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Burna-bommer": [
  [
   "Burna Bomb",
   "At the end of your opponent’s Fight phase, you can select one visible enemy unit (excluding Lone Operative and MONSTER/VEHICLE units) within 36\" of this unit, and roll one D6 for that units. On a 2+:\n- That enemy unit suffers D3 mortal wounds.\n- That enemy unit cannot be hidden until the end of your next turn.\n- Ranged attacks that target that enemy unit have [IGNORES COVER] until the end of your next turn."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Dakkajet": [
  [
   "Strafing Run",
   "In your Shooting phase, this unit's ranged attacks that target a unit (excluding FLY units) have +1 to hit rolls."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Deff Dread": [
  [
   "Dead 'Ard",
   "Attacks that target this unit have -1 D."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Deffkilla Wartrike": [
  [
   "Get Back in da Race! (Once per battle round, per army)",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly SPEED FREEKS unit within 6\" of this unit. That unit (and any units embarked within that unit):\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Fuel-mixa Grot",
   "This unit has +1 to advance rolls."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- WARBIKERS"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Deffkoptas": [
  [
   "Aerial Manoover",
   "At the end of your opponent's Fight phase, if this unit is unengaged, you can place this unit in strategic reserves."
  ],
  [
   "Deff from Above",
   "In your Shooting phase, if this unit made an ingress move this turn, this unit's ranged attacks have +1 to hit rolls."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Flash Gitz": [
  [
   "Finderz Keeperz",
   "In your Shooting phase, if any of the following apply, this unit's ranged attacks have +1 AP.\n- This unit is within range of an objective.\n- The target of that attack is within range of an objective."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Ghazghkull Thraka": [
  [
   "Supreme Commander",
   "If this model is in your army, it must be your WARLORD."
  ],
  [
   "Makari, Hoist Dat Banner! (Once per battle, per army)",
   "In your Movement phase, you can select a number of friendly ORKS units equal to or less than the current battle round number. Those units are riled up until the start of your next turn.\n*Place one Makari token next to the unit, removing it after this ability is used.*"
  ],
  [
   "Da Grand Warlord's Ladz",
   "While this unit is within 3\" of another friendly ORKS INFANTRY unit, this unit has Lone Operative."
  ],
  [
   "Prophet of Da Great Waaagh! (Aura)",
   "While a friendly ORKS unit is within 6\" of this unit, that unit's melee attacks have:\n- +1 to hit rolls.\n- +1 to wound rolls."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ]
 ],
 "Gorkanaut": [
  [
   "Big an’ Stompy",
   "This unit's melee attacks can re-roll hit rolls of 1."
  ],
  [
   "Gut Hatch",
   "In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Gretchin": [
  [
   "Downtrodden",
   "For the purposes of transport capacity, each 2 Gretchin models (rounding up) take up the space of 1 model."
  ],
  [
   "Thievin’ Scavengers",
   "At the end of your Movement phase, if this unit is controlling an objective, that objective is secured."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Hunta Rig": [
  [
   "Tramplasquig Charge",
   "When you target this unit with the Crushing Impact stratagem, that use is -1 CP."
  ],
  [
   "Fully Loaded Butchery",
   "This unit's Butcha Boyz weapon has +2 A for each model embarked within this unit (to a maximum of +22 A)."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Kaptin Badrukk": [
  [
   "Flashiest Gitz",
   "This unit's ranged attacks can re-roll hit rolls."
  ],
  [
   "Ded Glowy Ammo (Aura)",
   "Enemy units within 6\" of this model have -1 T."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- FLASH GITZ"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Kill Rig": [
  [
   "Wurrboy (psyker level 1)",
   "This model has the psychic abilities listed in the Psychic Abilities section."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Unstable Energies",
   "ORKS PSYKER units with this ability have a psyker level of 1 or higher, specified in that unit's abilities. Each psychic ability has a psychic level of 1 or higher, specified in that ability's name.\nIn a battle round, a friendly ORKS PSYKER unit can use a number of psychic abilities whose total psychic level does not exceed that PSYKER unit's psyker level."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Killa Kans": [
  [
   "Spiteful Power Trip",
   "This unit's attacks that target a unit that has no models with a T of 7+ have +1 to hit rolls."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Kommandos": [
  [
   "Found 'Em!",
   "In your Movement phase, you can select one enemy unit within 12\" of this unit. That unit has +3\" detection range until the end of the turn.\n*Place one Kommando Grot token next to that enemy unit to remind you.*"
  ],
  [
   "Taktikal Know-wotz",
   "In the Declare Battle Formations step, you can split this unit into two units, each with a starting strength of 5. If you do, select which one of those units will have the Bomb Squig ability and which one of those units will have the Found 'Em! ability."
  ],
  [
   "Nowhere to Hide",
   "This unit's attacks that target a hidden unit have +1 to hit rolls."
  ],
  [
   "Bomb Squig (Once per battle, per unit)",
   "In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12\" of this unit and roll one D6:\n- On a 3+, that enemy unit suffers D3 mortal wounds.\n*Place one Bomb Squig token next to the unit, removing it after this ability is used.*"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Lootas": [
  [
   "Dat’s Our Loot",
   "- This unit's ranged attacks can re-roll hit rolls of 1.\n- This unit's ranged attacks that target a unit within range of an objective can re-roll hit rolls."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Mad Dok Grotsnik": [
  [
   "Mad Dok",
   "In your Command phase, select one friendly ORKS INFANTRY unit within 6\" of this model, and select one of the following:\n- That unit heals 3 wounds.\n- Or: If all models in that unit have their starting number of wounds, revive one CHARACTER model in that unit."
  ],
  [
   "One Scalpel Short of a Medpack",
   "When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to declare a charge."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- BOYZ\n- BURNA BOYZ\n- LOOTAS\n- NOBZ\n- TANKBUSTAS"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Meganobz": [
  [
   "Krumpin’ Time",
   "In the Fight phase, if this unit is riled up, this unit has +1 to hit rolls."
  ],
  [
   "Arrogant Invulnerability",
   "Attacks that target this unit have -1 AP."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Mek": [
  [
   "Clever Know-wotz",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS VEHICLE model (excluding AIRCRAFT/TITANIC models) within 3\" of this model:\n- That VEHICLE model heals D3 wounds.\n- That VEHICLE model's attacks have +1 to hit rolls until the start of your next Movement phase."
  ],
  [
   "Kustom Dakka",
   "This unit's ranged attacks have [IGNORES COVER]."
  ],
  [
   "Support",
   "This model can be attached to the following units:\n- BOYZ\n- FLASH GITZ\n- MEK GUNZ\n- NOBZ\n- TANKBUSTAS"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Mek Gunz": [
  [
   "Madcap Artillery",
   "In your Shooting phase, when this unit has shot, if all ranged weapons equipped by each Mek Gunz model in this unit are the same, select one enemy unit hit by those attacks. That enemy unit has the ability below that matches that weapon's name until the start of your next turn:\n- Bubblechukka: This unit is wobbled. While a wobbled unit is attacking, its targets have the benefit of cover against those attacks.\n- Kustom Mega-kannon: This unit is zapped. While a unit is zapped, that unit has -1 Ld.\n- Smash Gun: This unit is smashed. While a unit is smashed, that unit has -2\" M.\n- Tracktor Kannon: This unit is grounded. While a unit is grounded, it cannot take to the skies.\n*Place five Grot Crew tokens next to each Mek Gun model, removing one each time its Mek Gun model loses a wound (a Mek Gun model itself is considered to represent its final wound).*"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Morkanaut": [
  [
   "Big an’ Shooty",
   "In your Shooting phase, this unit's ranged attacks can re-roll hit rolls of 1."
  ],
  [
   "Gut Hatch",
   "In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Mozrog Skragbad": [
  [
   "Beast Snagga Following",
   "While this unit is within 3\" of a friendly BEAST SNAGGA unit (excluding MONSTER CHARACTER units), this unit has Lone Operative."
  ],
  [
   "One Last Kill",
   "In the Fight phase, when this model is destroyed, if this unit has not been selected to fight this phase, roll one D6:\n- On a 2+, do not remove this model from the battlefield. When this unit has fought, or at the end of the phase (whichever comes first), this model is removed from the battlefield."
  ],
  [
   "Da Bigger Dey Iz…",
   "This unit's melee attacks that target a MONSTER/VEHICLE unit can re-roll wounds rolls."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Bannernob": [
  [
   "Waaagh! Banner",
   "This unit has +1 to charge rolls."
  ],
  [
   "Support",
   "This model can be attached to the following units: \n- BOYZ\n- NOBZ"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Nobz": [
  [
   "Ammo Runts (Once per battle, per unit)",
   "In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have +1 to hit rolls.\n*Place any number of Ammo Runt tokens next to the unit, removing them when this ability is used.*"
  ],
  [
   "Get Out da Way!",
   "While making a charge move, this unit can move through models (excluding MONSTER/VEHICLE models)."
  ],
  [
   "Paired Krumpas",
   "Attacks made with this model's Kustom Krumpa weapon can re-roll hit rolls and wound rolls."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Painboss": [
  [
   "Push Dat Bit Back In (Once per battle, per unit)",
   "In your Command phase, select one friendly BEAST SNAGGA unit within 6\" of this unit. That unit heals 3 wounds.\n*Place a Grot Orderly token next to the unit, removing it when this ability is used.*"
  ],
  [
   "Runnin' wiv da Herd",
   "While this model is attached to a MOUNTED unit, this model:\n- Does not have INFANTRY.\n- Has MOBILE and MOUNTED.\n- Has +4\" M."
  ],
  [
   "Support",
   "This model can be attached to the following unit:\n- BEAST SNAGGA BOYZ\n- SQUIGHOG BOYZ"
  ],
  [
   "Hardy Bioniks",
   "Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Painboy": [
  [
   "Crude Surgery",
   "In your Command phase, this unit heals 3 wounds."
  ],
  [
   "Catch Dat Red Bit (Once per battle, per unit)",
   "When this model uses its Crude Surgery ability, you can add D3 to the number of wounds healed.\n*Place a Grot Orderly token next to the unit, removing it when this ability is used.*"
  ],
  [
   "Support",
   "This model can be attached to the following units:\n- BOYZ\n- BREAKA BOYZ\n- FLASH GITZ\n- NOBZ\n- TANKBUSTAS"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Rukkatrukk Squigbuggies": [
  [
   "Squig Barrage",
   "In your Shooting phase, when this unit has shot, select one enemy unit (excluding MONSTER/VEHICLE units) hit by this unit's Squig Launchas weapons. That enemy unit is covered in Squigs until the start of your next turn:\n- While a unit is covered in Squigs, that unit's attacks have -1 to hit rolls."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Squighog Boyz": [
  [
   "Brutal Impact",
   "If this unit made a charge move this turn, this unit's attacks have +1 D."
  ],
  [
   "Bomb Squig (Once per battle, per unit)",
   "In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12\" of this unit and roll one D6:\n- On a 3+, that enemy unit suffers D3 mortal wounds.\n*Place one Bomb Squig token next to the unit, removing it after this ability is used.*"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Stompa": [
  [
   "Waaagh! Effigy",
   "This unit is riled up."
  ],
  [
   "Idol of Belligerence",
   "In your Movement phase, when a unit embarked within this unit is selected to make a disembark move, that unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Stormboyz": [
  [
   "Rokkit Charge",
   "When this unit is selected to fight, if this unit made a charge move this turn, you can use this ability. If you do, this unit's melee attacks have:\n- +1 A and S.\n- [HAZARDOUS]."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Tankbustas": [
  [
   "Rokkit Barrage",
   "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. That unit makes a battle-shock roll, with -1 to that battle-shock roll."
  ],
  [
   "Pulsa Rokkit (Once per battle, per unit)",
   "In your Shooting phase, when this unit is selected to shoot, you can select one enemy MONSTER/VEHICLE unit within 24\" of this unit. If you do, this unit's attacks that target that unit have:\n- +1 AP.\n- [LETHAL HITS]."
  ],
  [
   "Bomb Squig (Once per turn, twice per battle, per unit)",
   "In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12\" of this unit and roll one D6:\n- On a 3+, that enemy unit suffers D3 mortal wounds.\n*Place two Bomb Squig tokens next to the unit, removing one each time this ability is used.*"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Trukk": [
  [
   "Pilin' Out",
   "In your opponent's Movement phase, when an enemy unit ends a move within 8\" of this model, units embarked within this model can make a disembark move using the rapid disembark mode."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Warbikers": [
  [
   "High-speed Carnage",
   "If this unit made a charge move this turn, this unit's melee attacks have:\n- +1 S and D."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Warboss": [
  [
   "Might is Right",
   "If this unit made a charge move this turn, this model's melee attacks have:\n- +3 A.\n- +2 S."
  ],
  [
   "Boss' Ammo Runt (Once per battle, per unit)",
   "In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this model's ranged attacks have +1 to hit rolls.\n*Place a Boss' Ammo Runt token next to the unit, removing it when this ability is used.*"
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- BOYZ\n- BREAKA BOYZ\n- NOBZ"
  ],
  [
   "Intimidating Motivation (Once per battle round, per army)",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS unit within 6\" of this unit. That unit:\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Warboss in Mega Armour": [
  [
   "Krushin' Impetus",
   "When this unit ends a charge move, you can select one enemy unit engaged with this unit. If you do, roll one D6 for each model in this unit engaged with that enemy unit:\n- For each 3+, that enemy unit suffers 1 mortal wound."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- MEGANOBZ"
  ],
  [
   "Intimidating Motivation (Once per battle round, per army)",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS unit within 6\" of this unit. That unit:\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Wazbom Blastajet": [
  [
   "Go fer da Weak Spot",
   "In your Shooting phase, this unit's ranged attacks that target a MONSTER/VEHICLE unit have +1 to wound rolls."
  ],
  [
   "Blastajet Force Field",
   "Models in this unit:\n- Have 5+ InSv.\n- Do not have SMOKE."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Weirdboy": [
  [
   "Waaagh! Energy (psyker level 1)",
   "This model has the psychic abilities listed in the Psychic Abilities section."
  ],
  [
   "Support",
   "This model can be attached to the following unit:\n- BEAST SNAGGA BOYZ\n\n- BOYZ"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Unstable Energies",
   "ORKS PSYKER units with this ability have a psyker level of 1 or higher, specified in that unit's abilities. Each psychic ability has a psychic level of 1 or higher, specified in that ability's name.\nIn a battle round, a friendly ORKS PSYKER unit can use a number of psychic abilities whose total psychic level does not exceed that PSYKER unit's psyker level."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Zodgrod Wortsnagga": [
  [
   "Super Runts",
   "- This unit is riled up.\n- This unit's Scavenged Shivs weapons have +1 A, WS and S."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- Gretchin"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Mekboy Workshop": [
  [
   "Ramshackle Cover",
   "When an attack targets a unit that is not fully visible to the attacking model because of this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Workshop",
   "When this unit is set up, all parts of it must be set up in a single group, in which each part is within 1\" of another part.\nAt the end of the Movement phase, each friendly ORKS VEHICLE within 6\" of this unit heals D3 wounds. Each friendly ORKS VEHICLE unit can only be affected by this ability once per turn."
  ],
  [
   "Fortification",
   "While an enemy unit is engaged with only FORTIFICATION units:\n- That enemy unit can be selected as a target of ranged attacks.\n- When shooting that enemy unit, those ranged attacks have -1 to hit rolls (excluding [CLOSE-QUARTERS] attacks).\n- When that enemy unit is selected to make a fall-back move, if that enemy unit is only engaged with FORTIFICATION units, and that enemy unit is not battle-shocked, hazard rolls made for that enemy unit are automatically passed."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Grot Tanks": [
  [
   "Scatter! (Once per phase, per unit)",
   "In your opponent's Movement phase, when an enemy unit ends a move within 8\" of this unit, if this unit is unengaged, this unit can make a normal move of up to 6\"."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Grot Mega-Tank": [
  [
   "Bizarrely Resilient",
   "Attacks that target this unit have -1 AP."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Gargantuan Squiggoth": [
  [
   "Walking Bastion",
   "This unit's attacks can ignore modifiers to:\n- BS/WS\n- Hit rolls"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Kill Tank": [
  [
   "Da Biggest Boom",
   "In your Shooting phase, when this unit has shot, you can select one enemy unit hit by this unit's Tank Kannon attacks. If you do, enemy units (excluding MONSTER/VEHICLE units) within 3\" of that enemy unit make a battle-shock roll."
  ],
  [
   "Rolling Fortress",
   "When an attack targets a friendly ORKS unit that is not fully visible to the attacking model because of this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Big Trakk": [
  [
   "Spiked Ram",
   "When this unit ends a charge move, you can select one enemy unit engagedwith this unit. If you do, roll one D6:\n- On a 2-5, that enemy unit suffers D3 mortal wounds.\n- On a 6, that enemy unit suffers 3 mortal wounds."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Warboss on Warbike": [
  [
   "Speedboss",
   "This unit's melee attacks have +1 to hit rolls."
  ],
  [
   "Get Back in Da Race",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly SPEED FREEKS unit within 6\" of this unit. That unit (and any units embarked within that unit):\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- WARBIKERS"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Wartrakks": [
  [
   "Speednob Support",
   "While each model in this unit is within 3\" of a friendly SPEED FREEKS unit (excluding WARTRAKK units), this unit has Lone Operative."
  ],
  [
   "Bust 'Em",
   "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. That enemy unit is busted until the end of the turn:\n- Friendly SPEED FREEKS units' attacks that target a busted unit have [LETHAL HITS]."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Warbuggies": [
  [
   "Drive-by Skorchin'",
   "In your Movement phase, you can select one visible enemy unit (excluding MONSTER/VEHICLE units) within 6\" of this unit:\n- That enemy unit cannot be targeted with the Fire Overwatch stratagem until the end of the turn."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Lifta Wagon": [
  [
   "Da Bigger Dey Are, Da Better Dey Drop",
   "In your Shooting phase, when this unit's Lifta-droppa destroys an enemy MONSTER/VEHICLE model with Deadly Demise, that enemy model suffers a Deadly Demise on a roll of 3+, instead of a 6."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Big Mek": [
  [
   "Shokk-boosta",
   "In your Movement phase, when this unit is selected to make an advance move, you can use this ability. If you do:\n- This unit can change that advance roll to a 6.\n- This unit can move through all types of model.\n- When this unit ends that advance move, make a hazard roll for each model in this unit."
  ],
  [
   "Leader",
   "This model can be attached to the following units:\n- BOYZ\n- BREAKA BOYZ\n- FLASH GITZ\n- MEK GUNZ\n- NOBZ\n- TANKBUSTAS"
  ],
  [
   "More Dakka",
   "This unit's ranged attacks have:\n- [IGNORES COVER].\n- If this unit is riled up, [SUSTAINED HITS 1]."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Breaka Boyz": [
  [
   "Trophy Hunters",
   "This unit has +1 to charge rolls."
  ],
  [
   "Bomb Squig (Once per turn, twice per battle, per unit)",
   "In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12\" of this unit and roll one D6:\n- On a 3+, that enemy unit suffers D3 mortal wounds.\n*Place two Bomb Squig tokens next to the unit, removing one each time this ability is used.*"
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Wazdakka Gutsmek": [
  [
   "Full Throttle",
   "In your Command phase, select one Throttlerokkit Shokka Engine ability. This unit has that ability until the start of your next Command phase."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Bigboss": [
  [
   "Sumfin’ to Prove",
   "This unit's melee attacks have +1 to hit rolls."
  ],
  [
   "Support",
   "This model can be attached to the following units: \n- BOYZ\n- BREAKA BOYZ\n- NOBZ"
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Big Mek Dakkarig": [
  [
   "Even More Dakka",
   "If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Blitz Dem Gitz!",
   "In your Shooting phase, if this unit's Blitzkannon weapon targets a unit (excluding MONSTER/VEHICLE units), that weapon has +6 A."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ],
 "Nazdreg": [
  [
   "Nazdreg's Know-wotz",
   "- This unit has Deep Strike\n- This unit's ranged attacks have [IGNORES COVER]."
  ],
  [
   "Supreme Kunnin' (Once per phase, per army)",
   "In your opponent's Movement phase, when an enemy unit ends a move within 8\" of this unit, if this unit is unengaged, this unit can:\n- Make a normal move of up to D6\".\n- Or: If this unit is riled up, make a normal move of up to 5\"."
  ],
  [
   "Leader",
   "This model can be attached to the following unit:\n- MEGANOBZ"
  ],
  [
   "Intimidating Motivation (Once per battle round, per army)",
   "In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS unit within 6\" of this unit. That unit:\n- Is no longer battle-shocked.\n- Is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ],
  [
   "Da Boss",
   "At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP."
  ]
 ],
 "Gunwagon": [
  [
   "Mobile Arsenal",
   "In your Shooting phase, this unit's ranged attacks can re-roll hit rolls of 1."
  ],
  [
   "Wimp-kickaz",
   "NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move:\n- That enemy unit must select the desperate escape mode.\n- If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape."
  ],
  [
   "'Ardboyz",
   "BOYZ unit only. This unit has 4+ Sv."
  ],
  [
   "Minefield Detail",
   "GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6\"."
  ],
  [
   "Extra Sneaky",
   "GRETCHIN unit only. This unit has -3\" detection range."
  ],
  [
   "Throat-slittas",
   "KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [LETHAL HITS: non-MONSTER/VEHICLE]."
  ],
  [
   "Supa-snazz Dakka",
   "FLASH GITZ unit only. This unit's Snazzgun weapons have [RAPID FIRE 1]."
  ],
  [
   "Enhanced Runt-maw",
   "BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn.\n- While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls."
  ],
  [
   "Temperamental Shokka",
   "BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6:\n- On a 1, this model's Shokk Attack Gun weapon has [TORRENT], and when this unit has shot, this model is destroyed.\n- On a 2-5, this model's Shokk Attack Gun weapon has +1 A.\n- One a 6, this model's Shokk Attack Gun wepon has SUSTAINED HITS 2]."
  ],
  [
   "Targetin' Gizmos",
   "WAGON unit only. While a BIG MEK model is embarked within this unit:\n- This unit's ranged attacks have [IGNORES COVER].\n- If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  ],
  [
   "Boss Boomer",
   "WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability."
  ],
  [
   "Smoky Gubbinz",
   "SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack."
  ],
  [
   "Impulsive Recon",
   "ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move."
  ],
  [
   "Flyboss",
   "ORKS AIRCRAFT unit only.\n- This unit has CHARACTER.\n- When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6\" of this unit is riled up until the start of your next turn."
  ],
  [
   "Waaagh!",
   "Friendly ORKS with this ability can:\n- Re-roll advance rolls.\n- Become riled up, as stated in other rules.\nWhile a unit is riled up:\n    - That unit has 5+ InSv.\n    - That unit's ranged attacks have [ASSAULT].\n    - When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge."
  ]
 ]
};

/* DETACHMENTS : [nom, PD, tag unique, nom de la règle, texte, octroi,
   0, nom français, Disposition de Force] */
const DETACHMENTS = [
  ["Blitz Brigade",1,"","Unstoppable Momentum","▪ Friendly Wagon units can re-roll charge rolls. ▪ When a friendly WAGON unit is selected to make an advance move, that unit can change advance rolls to a 6.","",0,"","Take and Hold"],
  ["Brute Bosses",1,"","’Ard as Nails","When a friendly Warboss model is destroyed, if this unit has not been selected to fight this phase, roll one D6, with +1 to the roll if your unit is riled up: ▪ On a 3+, do not remove this WARBOSS model from the battlefield. When this unit has fought, or at the end of the phase (whichever comes first), this WARBOSS model is removed from the battlefield.","",0,"","Purge the Foe"],
  ["Bully Boyz",1,"","Displays of Savagery","Friendly Meganobz/Nobz units’ melee attacks have [Sustained Hits 1].","",0,"","Purge the Foe"],
  ["Da Big Hunt",1,"","Da Hunt is On","Friendly Beast Snagga units’ attacks that target a MONSTER/VEHICLE unit have +1 AP.","",0,"","Purge the Foe"],
  ["Dread Mob",1,"","Try Dat Button!","In your Shooting phase or the Fight phase, when a friendly Orks Walker unit (excluding Titanic units) is selected to attack, you can use this ability. If you do, roll either one D6 or two D6 (keep re-rolling duplicate results). This unit’s attacks have the relevant rule(s): TRY DAT BUTTON!D6RESULT1-2+1 A3-4+2 S5-6+1 AP If you rolled two D6, when this unit has attacked, this unit makes one hazard roll.","",0,"","Purge the Foe"],
  ["Flyboyz",1,"","Skyborne Loons","▪ Friendly Orks Aircraft units do not count towards the combined points value of your strategic reserves units. ▪ While a friendly Orks Aircraft/Deffkoptas unit is riled up, this unit’s ranged attacks have +1 to hit rolls.","",0,"","Reconnaissance"],
  ["Green Tide",1,"","Mob-handed Brutality","▪ Friendly Boyz units’ melee attacks have [Sustained Hits 1]. ▪ If a friendly Orks Infantry unit made a charge move this turn, that unit’s melee attacks have [Lethal Hits: non-Monster/Vehicle].","",0,"","Take and Hold"],
  ["Kult of Speed",1,"","Adrenaline Junkies","▪ Friendly Warbikers units have BATTLELINE. ▪ When a friendly Speed Freeks unit is selected to make an advance/fall-back move: ▪ That unit’s ranged attacks have [Assault] until the end of the turn. ▪ That move does not prevent that unit from being eligible to declare a charge.","",0,"","Reconnaissance"],
  ["Madcap Meks",1,"","Unpredictable Genius","In your Shooting phase, when all of a friendly Big Mek/Mek Gunz/Morkanaut/Wazbom Blastajet unit’s ranged attacks target a single enemy unit, roll one D6: UNPREDICTABLE GENIUSD6RESULT1Dat’s Weird: The target unit has 4+ InSv until your unit has shot.2-3Hop Splat: Select one other enemy unit within 3\" of the target. That unit suffers D3 mortal wounds.4Seekerz: Those attacks have +1 to hit rolls.5Lifted: The target unit has FLY, and cannot have the benefit of cover, until your unit has shot.6Runtified: The target unit has -1 T until your unit has shot.","",0,"","Disruption"],
  ["Runt Swarm",1,"","Sneaky Little Gitz","▪ Friendly Gretchin units have BATTLELINE. ▪ When a friendly GRETCHIN unit is selected to make an advance/fall-back move, that move does not prevent this unit from being eligible to start an action.","",0,"","Priority Assets"],
  ["Shoota Boyz",1,"","Dakka! Dakka! Dakka!","Friendly Orks Infantry units’ ranged attacks have: ▪ [Assault]. ▪ While this unit is riled up, +3\" R.","",0,"","Purge the Foe"],
  ["Taktikal Brigade",1,"","Suspiciously Well Organised","▪ Friendly Stormboyz units have BATTLELINE. ▪ When a friendly Boyz/Kommandos/Stormboyz unit is selected to make a fall-back move, that fall-back move does not prevent that unit from being eligible to declare a charge.","",0,"","Take and Hold"],
  ["War Horde",3,"","Get Stuck In","Friendly ORKS units’ melee attacks have [Sustained Hits 1].","",0,"","Take and Hold"],
  ["Wreckas",1,"","Wreckin’ and Lootin’","In your Shooting phase, when a friendly Breaka Boyz/Flash Gitz/Tankbustas unit is selected to shoot, if any of the following apply, that unit’s attacks can re-roll hit rolls of 1: ▪ That unit is within range of an objective. ▪ The target of that attack is within range of an objective.","",0,"","Priority Assets"],
  ["Wurrband",1,"","Powers of da Waaagh!","Friendly Orks Psyker models’ [Psychic] attacks have: ▪ +1 S. ▪ +1 S for every 5 models in this unit (or embarked within this model). Friendly ORKS PSYKER models have the following psychic abilities: Roar of Mork (psychic level 1): In your Movement phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: ▪ On a 1, this unit is battle-shocked. ▪ Select one enemy unit (excluding MONSTER/VEHICLE units) within 12\" of this unit. That enemy unit makes a battle-shock roll, with -1 from that battle-shock roll for every 10 models in this unit. Visions of Violence (psychic level 1): At the start of the Fight phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. If you do: ▪ On a 1, this unit is battle-shocked. ▪ This unit has Fights First.","",0,"","Disruption"]
];

/* ENHANCEMENTS : [nom, coût, détachement, texte, cible] */
const ENHANCEMENTS = [
  ["Boss Boomer (Upgrade)",10,"Blitz Brigade","Wagon unit only. While a Warboss model is embarked within this unit, this unit has that WARBOSS model’s Intimidating Motivation/Keep Huntin’ ability.",null],
  ["Targetin’ Gizmos (Upgrade)",25,"Blitz Brigade","Wagon unit only. While a Big Mek model is embarked within this unit: ▪ This unit’s ranged attacks have [Ignores Cover]. ▪ If this unit is riled up, this unit’s ranged attacks have [Sustained Hits 1].",null],
  ["Blitzboss",20,"Brute Bosses","WARBOSS model only. A TRANSPORT unit (excluding WALKER units) this unit is embarked within has:\n- +2\" M.\n- 5+ InSv.",null],
  ["Brutal But Kunnin’",30,"Brute Bosses","WARBOSS model only. This model's melee attacks have +1 D.",null],
  ["Da Gobshot Thunderbuss",20,"Brute Bosses","Warboss model only. This model has the following weapon:",null],
  ["Morgog’s Finkin’ Cap",50,"Brute Bosses","WARBOSS model only. (Once per battle, per army) At the end of your opponent's Movement phase, if this unit is unengaged, this unit can make a normal move of:\n- Up to D6\".\n- If this unit is riled up, you can re-roll that D6.",null],
  ["Proper Killy",15,"Brute Bosses","WARBOSS model only. This model can re-roll hit rolls of 1.",null],
  ["Surly as a Squiggoth",25,"Brute Bosses","INFANTRY WARBOSS model only. (Once per battle, per army) At the end of phase in which this model is destroyed, roll one D6:\n- On a 2+, set this model back up on the battlefield as close as possible to where it was destroyed, unengaged, with 3 wounds remaining.",null],
  ["Tellyporta Boss",20,"Bully Boyz","MEGA ARMOUR model only. This unit (excluding VEHICLE units) has Deep Strike.",null],
  ["Wimp-kickaz (Upgrade)",15,"Bully Boyz","Nobz unit only. When an enemy unit engaged with this unit is selected to make a fall-back move: ▪ That enemy unit must select the desperate escape mode. ▪ If this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape.",null],
  ["Glory Hog",25,"Da Big Hunt","BEAST SNAGGA model only. When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to declare a charge.",null],
  ["It Came from da Drops",20,"Da Big Hunt","BEASTBOSS ON SQUIGOSAUR model only. This model has +1 T.",null],
  ["Cybork Boosta",10,"Dread Mob","BIG MEK/MEK model only. This model has +2\" M.",null],
  ["Dreadherder",30,"Dread Mob","BIG MEK model only. While this model is within 3\" of a friendly ORKS WALKER unit (excluding BIG MEK units):\n- This model has Lone Operative.\n- In your Shooting phase, you can select one friendly ORKS WALKER unit within 3\" of this model. That unit's attacks can re-roll hit rolls of 1 until the end of the turn.",null],
  ["Flyboss (Upgrade)",20,"Flyboyz","Orks Aircraft unit only. ▪ This unit has CHARACTER. ▪ When this unit ends an ingress move, each friendly Orks Aircraft/Deffkoptas unit within 6\" of this unit is riled up until the start of your next turn.",null],
  ["Impulsive Recon (Upgrade)",15,"Flyboyz","Orks Aircraft unit only. In your first Movement phase, this unit can make an ingress move.",null],
  ["'Ardboyz (Upgrade)",25,"Green Tide","Boyz unit only. This unit has 4+ Sv.",null],
  ["Ferocious Show Off",15,"Green Tide","ORKS INFANTRY model only. This model's melee attacks have:\n- +1 A.\n- Or: If this unit has 11+ models, +2 A.",null],
  ["Competitive Streak",15,"Kult of Speed","DEFFKILLA WARTRIKE model only. This unit can re-roll charge rolls.",null],
  ["Smoky Gubbinz (Upgrade)",10,"Kult of Speed","Speed Freeks unit only (excluding Aircraft units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack.",null],
  ["Enhanced Runt-maw (Upgrade)",10,"Madcap Meks","Big Mek with Shokk Attack Gun model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn. ▪ While an enemy unit is infested with Snotlings, that unit has -1 to leadership rolls.",null],
  ["Mekwaaagh! Mastermind",30,"Madcap Meks","BIG MEK model only. This unit is riled up.",null],
  ["Temperamental Shokka (Upgrade)",20,"Madcap Meks","Big Mek with Shokk Attack Gun model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6: ▪ On a 1, this model’s Shokk Attack Gun weapon has [Torrent], and when this unit has shot, this model is destroyed. ▪ On a 2-5, this model’s Shokk Attack Gun weapon has +1 A. ▪ On a 6, this model’s Shokk Attack Gun weapon has [Sustained Hits 2].",null],
  ["Extra Sneaky (Upgrade)",10,"Runt Swarm","Gretchin unit only. This unit has -3\" detection range.",null],
  ["Minefield Detail (Upgrade)",10,"Runt Swarm","Gretchin unit only. While this unit is not embarked, this unit has Scouts 6\".",null],
  ["Supa-glowy Fing",25,"Shoota Boyz","ORKS INFANTRY model only (excluding WEIRDBOY models). This model’s ranged attacks have:\n- [ANTI-INFANTRY 4+}\n\n- [DEVASTATING WOUNDS].\n- [SUPA-HAZARDOUS].",null],
  ["Targetin' Squigs",20,"Shoota Boyz","BIG MEK/BIGBOSS/WARBOSS model only. This unit's ranged attacks (excluding [TORRENT] attacks) have +3\" R.",null],
  ["Kill Kommanda",20,"Taktikal Brigade","BIG MEK/WARBOSS INFANTRY model only. While this unit is part of an attached unit, this model has:\n- Infiltrators.\n- Stealth.",null],
  ["Throat-slittas (Upgrade)",15,"Taktikal Brigade","Kommandos/Stormboyz unit only. This unit’s melee attacks have [Lethal Hits: non-Monster/Vehicle].",null],
  ["Da Boss is Watchin'",25,"War Horde","ORKS model only. (Once per battle, per army) In your Movement phase, you can use this ability. If you do, this unit is riled up until the start of your next turn.",null],
  ["Follow Me Ladz",20,"War Horde","ORKS model only. This unit has +2\" M.",null],
  ["Headwoppa’s Killchoppa",15,"War Horde","ORKS model only. If this unit made a charge move this turn, this model's melee attacks have +1 AP.",null],
  ["Kunnin’ But Brutal",20,"War Horde","ORKS model only. When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot/declare a charge.",null],
  ["Kaptin's Hat",25,"Wreckas","BIG MEK/WARBOSS INFANTRY model only. When both players have deployed their armies, you can redeploy up to three friendly ORKS INFANTRY units. When doing so, you can set those units up in strategic reserves, regardless of how many units are already in strategic reserves.",null],
  ["Supa-snazz Dakka (Upgrade)",25,"Wreckas","Flash Gitz unit only. This unit’s Snazzgun weapons have [Rapid Fire 1].",null],
  ["'Eadbanger",15,"Wurrband","Orks Psyker model only. This model has the following weapon.",null],
  ["Da Krunch",10,"Wurrband","Orks Psyker model only. This model has the following weapon.",null],
  ["Warphead",25,"Wurrband","ORKS PSYKER model only. This model:\n- Has psyker level 2.\n- Has Deadly Demise D6.\n- Can re-roll psychic rolls.",null]
];

/* STRATS : [nom, détachement, famille, PC, quand, cible, effet,
   restrictions]. Texte de l'export Wahapedia, en anglais. */
const STRATS = [
  ["Impending Krunch","Blitz Brigade","",1,"Your Charge phase, when a friendly Wagon unit ends a charge move.","That WAGON unit.","Each enemy unit engaged with your unit makes a battle-shock roll, with -1 to that battle-shock roll.",""],
  ["Keep It Runnin'","Blitz Brigade","",1,"End of the Fight phase.","One friendly unengaged Orks Infantry unit that was eligible to fight this phase and is wholly within 6\" of a friendly Transport unit that INFANTRY unit is able to embark within.","Your INFANTRY unit embarks within that TRANSPORT unit.",""],
  ["Readied Brawlers","Blitz Brigade","",1,"Your Movement phase, when a friendly Wagon unit ends a normal move.","That WAGON unit.","Units embarked within your unit can make an assault disembark move.",""],
  ["Armed to Da Teef","Bully Boyz","",1,"Your Shooting phase or the Fight phase, when a friendly Meganobz/Nobz unit is selected to attack.","That MEGANOBZ/NOBZ unit.","Your unit’s attacks can: ▪ Re-roll hit rolls of 1. ▪ If your unit is riled up, re-roll hit rolls.",""],
  ["Hulking Brutes","Bully Boyz","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Meganobz/Nobz unit.","That MEGANOBZ/NOBZ unit.","Ranged attacks that target your unit with a S greater than your unit’s T have -1 to wound rolls. +1CP Or: Ranged attacks that target your unit have -1 to wound rolls.",""],
  ["Too Arrogant to Die","Bully Boyz","",1,"Fight phase, when an enemy unit targets a friendly Meganobz/Nobz unit.","That MEGANOBZ/NOBZ unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if your unit is riled up: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Goaded Into Action","Da Big Hunt","",1,"Your opponent’s Shooting phase, when an enemy unit has shot.","One friendly unengaged Beast Snagga unit that lost a wound as a result of those attacks.","Your unit can make a surge move of up to D6\". If your unit is riled up, it can re-roll that D6.",""],
  ["Instinctive Hunters","Da Big Hunt","",1,"End of your opponent’s Fight phase.","One friendly unengaged Beast Snagga unit within 6\" of a battlefield edge.","Place your unit in strategic reserves.",""],
  ["Where D'ya Fink You're Going?","Da Big Hunt","",1,"Your opponent’s Movement phase, when an enemy unit is selected to make a fall-back move, if that enemy unit is engaged with a friendly Beast Snagga unit.","That BEAST SNAGGA unit.","When an enemy unit engaged with your unit is selected to make a fall-back move, that enemy unit must use the desperate escape mode. If that enemy unit is a MONSTER/VEHICLE unit, that enemy unit makes three additional hazard rolls for each BEAST SNAGGA unit it is engaged with, with -1 from those hazard rolls if that enemy unit is battle-shocked.",""],
  ["Crazed Rampage","Dread Mob","",1,"Fight phase, when an enemy unit targets a friendly Orks Walker unit (excluding Titanic units).","That ORKS WALKER unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +3 to the result if your unit has Deff Dread: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Dread Power","Dread Mob","",1,"Your Movement phase.","One friendly Orks Walker unit.","Your unit is riled up until the start of your next turn.",""],
  ["Stomping Juggernaut","Dread Mob","",1,"Your Movement/Charge phase, when a friendly Orks Walker unit is selected to move or declares a charge.","That ORKS WALKER unit.","Your unit has MOBILE.",""],
  ["Flyin' Headbutt","Flyboyz","",1,"Any phase, when a friendly Orks Aircraft unit is destroyed, before rolling for any Deadly Demise.","That ORKS unit.","Your unit does not have the Deadly Demise ability. Select one enemy unit within 12\" of your unit and roll eight D6: ▪ For each 4+, that enemy unit suffers 1 mortal wound. Then remove your unit from the battlefield.",""],
  ["Long, Uncontrolled Bursts","Flyboyz","",1,"Your Shooting phase, when a friendly Orks Aircraft/Deffkoptas unit is selected to shoot.","That ORKS AIRCRAFT/DEFFKOPTAS unit.","When your unit’s ranged attacks target a FLY unit, those attacks can re-roll hit rolls.",""],
  ["Whirligig Evasion","Flyboyz","",1,"Your opponent’s Movement phase, when an enemy unit ends a move.","One friendly unengaged Deffkoptas unit within 8\" of that enemy unit.","Your unit can make a normal move of: ▪ Up to D6\". ▪ Or: If your unit is riled up, up to 6\".",""],
  ["'ere We Go","Green Tide","",1,"Your Movement phase, when a friendly Beast Snagga Boyz/Boyz unit is selected to move.","That BEAST SNAGGA BOYZ/BOYZ unit.","Your unit has +2 to advance rolls.",""],
  ["Mob Mentality","Green Tide","",1,"Start of the Battle-shock step of your Command phase.","One friendly Orks Infantry unit of 13+ models.","Select one visible friendly ORKS unit within 12\" of your unit. That unit’s battle-shock rolls are automatically successful.",""],
  ["Unbridled Carnage","Green Tide","",1,"Fight phase, when a friendly Boyz unit that made a charge move this turn is selected to fight.","That BOYZ unit.","Your unit’s melee attacks have +1 A.",""],
  ["Dakkastorm","Kult of Speed","",1,"Your Shooting phase, when a friendly Speed Freeks unit is selected to shoot.","That SPEED FREEKS unit.","Your unit’s ranged attacks have [Sustained Hits 1].",""],
  ["Delicious Eating Squigs","Kult of Speed","",1,"Your Movement phase.","One friendly Rukkatrukk Squigbuggies unit.","Select any number of friendly Orks Infantry units within 3\" of your unit. Each selected unit heals 3 wounds.",""],
  ["Speediest Freeks","Kult of Speed","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Speed Freeks unit.","That SPEED FREEKS unit.","Ranged attacks that target your unit fail on an unmodified hit roll of 1-3.",""],
  ["Vindictive Artillerists","Madcap Meks","",1,"Your Shooting phase, when a friendly Mek Gunz unit is selected to shoot.","That MEK GUNZ unit.","Your unit’s ranged attacks have: ▪ [Lethal Hits]. ▪ Or: [Sustained Hits 1]. ▪ Or: [Hazardous], [Lethal Hits], [Sustained Hits 1].",""],
  ["Grot Shields","Runt Swarm","",1,"Your opponent’s Shooting phase, when an enemy unit targets a friendly Orks Infantry unit (excluding Gretchin units).","One friendly Gretchin unit within 3\" of that ORKS INFANTRY unit.","When a hit roll for that enemy unit’s ranged attacks that target that ORKS unit results in a hit, if a model in your GRETCHIN unit is on the battlefield, end the attack sequence for that attack and your GRETCHIN unit suffers 1 mortal wound.",""],
  ["Infested War Zone","Runt Swarm","",2,"Any phase, when an enemy unit has attacked.","One friendly Gretchin unit that was just destroyed. You can target that unit with this stratagem even though that unit was just destroyed.","Add a new GRETCHIN unit to your army identical to your destroyed unit, in strategic reserves, at its starting strength, with its full wounds remaining.",""],
  ["Scarper!","Runt Swarm","",1,"Your opponent’s Movement phase, when an enemy unit ends a move within 8\" of a friendly unengaged Gretchin unit.","That GRETCHIN unit.","Your unit can make a normal move of: ▪ Up to D6\". ▪ Or: Up to 6\" instead if your unit is an attached unit.",""],
  ["Glowin' Dakka","Shoota Boyz","",1,"Your Shooting phase, when a friendly Orks Infantry unit is selected to shoot.","That ORKS INFANTRY unit.","Your unit’s ranged attacks that target a unit within 9\" have +1 AP.",""],
  ["Kustom Dakka","Shoota Boyz","",1,"Your Shooting phase, when a friendly Orks Infantry unit is selected to shoot.","That ORKS INFANTRY unit.","Your unit’s ranged attacks that target a unit (excluding MONSTER/VEHICLE units) have +1 to wound rolls.",""],
  ["Never Enough Dakka","Shoota Boyz","",1,"Your Shooting phase, when a friendly Orks Infantry unit is selected to shoot.","That ORKS INFANTRY unit.","Your unit’s ranged attacks have [Sustained Hits 1].",""],
  ["Dubious Restraint","Taktikal Brigade","",1,"Start/end of your Movement phase.","One friendly Boyz/Kommandos/Stormboyz unit.","Select one objective your unit is controlling. That objective is secured.",""],
  ["Mind Mostly on the Mission","Taktikal Brigade","",1,"Your Movement phase, when a friendly Boyz/Kommandos/Stormboyz unit is selected to make an advance/fall-back move.","That BOYZ/KOMMANDOS/STORMBOYZ unit.","That move does not prevent your unit from being eligible to start an action.",""],
  ["While Their Backs Are Turned","Taktikal Brigade","",1,"End of your opponent’s Movement phase.","One friendly unengaged Boyz/Kommandos/Stormboyz unit that was engaged at the start of the phase.","Your unit can make a normal move of up to 6\".",""],
  ["Breakin' Heads","War Horde","",1,"Any phase, when a friendly attached Orks Infantry unit becomes battle-shocked.","That ORKS INFANTRY unit. You can target that unit with this stratagem even though it is battle-shocked.","Roll one D3: ▪ Your unit suffers a number of mortal wounds equal to the result. ▪ Your unit is no longer battle-shocked.",""],
  ["Close-Range Dakka","War Horde","",1,"Your Shooting phase, when a friendly ORKS unit is selected to shoot.","That ORKS unit.","Your unit’s ranged attacks have: ▪ [Rapid Fire 1]. ▪ Or: If that attack already has [RAPID FIRE], +1 to the value of that [RAPID FIRE] (e.g. [RAPID FIRE 1] becomes [RAPID FIRE 2]).",""],
  ["Fungus-Fuel Injection","War Horde","",1,"Your Movement phase, when a friendly Orks mounted/vehicle unit is selected to move.","That ORKS MOUNTED/VEHICLE unit.","Your unit has +2\" M.",""],
  ["Hit 'em Harder","War Horde","",1,"Fight phase, when a friendly ORKS unit is selected to fight.","That ORKS unit.","Your unit’s melee attacks have [Lethal Hits].",""],
  ["Mow 'em Down","War Horde","",1,"Fight phase, when a friendly Orks Vehicle unit (excluding Walker units) that made a charge move this turn is selected to fight.","That ORKS VEHICLE unit.","Your unit’s melee attacks have: ▪ [Cleave 1]. ▪ Or: If that attack already has [CLEAVE], +1 to the value of that [CLEAVE] (e.g. [CLEAVE 1] becomes [CLEAVE 2]).",""],
  ["Orks Is Never Beaten","War Horde","",1,"Fight phase, when an enemy unit targets a friendly ORKS unit (excluding Titanic units).","That ORKS unit.","When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if your unit is riled up: ▪ On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.",""],
  ["Drive-By Bustin'","Wreckas","",1,"Your Shooting phase, when a friendly Orks Transport unit is selected to shoot.","That ORKS TRANSPORT unit.","Your unit’s ranged attacks with weapons selected for the Firing Deck ability have +1 to hit rolls.",""],
  ["Grab It","Wreckas","",1,"Your Shooting phase, when a friendly unengaged Breaka Boyz/Flash Gitz/Tankbustas unit has shot.","That BREAKA BOYZ/FLASH GITZ/TANKBUSTAS unit.","▪ Your unit can make a normal move of up to 6\", and must end that move within range of an objective. ▪ Your unit is not eligible to declare a charge until the end of the turn.",""],
  ["Gun-Crazy Show-Offs","Wreckas","",1,"Your opponent’s Shooting phase, when an enemy unit has shot.","One friendly Flash Gitz/Tankbustas unit hit by those attacks.","Your unit shoots using normal shooting, but while doing so your unit can only target that enemy unit.",""],
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
 "vehicle": [
  "Battlewagon",
  "Big Trakk",
  "Blitza-bommer",
  "Burna-bommer",
  "Dakkajet",
  "Deff Dread",
  "Gorkanaut",
  "Grot Mega-Tank",
  "Grot Tanks",
  "Gunwagon",
  "Kill Tank",
  "Killa Kans",
  "Lifta Wagon",
  "Mek Gunz",
  "Morkanaut",
  "Rukkatrukk Squigbuggies",
  "Stompa",
  "Trukk",
  "Warbuggies",
  "Wazbom Blastajet"
 ],
 "monster": [
  "Beastboss on Squigosaur",
  "Gargantuan Squiggoth",
  "Hunta Rig",
  "Kill Rig"
 ],
 "battleline": [
  "Beast Snagga Boyz",
  "Boyz"
 ],
 "epic": [
  "Boss Snikrot",
  "Boss Zagstruk",
  "Ghazghkull Thraka",
  "Kaptin Badrukk",
  "Mad Dok Grotsnik",
  "Mozrog Skragbad",
  "Nazdreg",
  "Wazdakka Gutsmek",
  "Zodgrod Wortsnagga"
 ],
 "infantry": [
  "Breaka Boyz",
  "Burna Boyz",
  "Flash Gitz",
  "Gretchin",
  "Kommandos",
  "Lootas",
  "Meganobz",
  "Nobz",
  "Stormboyz",
  "Tankbustas"
 ],
 "character": [
  "Bannernob",
  "Beastboss",
  "Big Mek",
  "Big Mek Dakkarig",
  "Big Mek in Mega Armour",
  "Big Mek with Shokk Attack Gun",
  "Bigboss",
  "Deffkilla Wartrike",
  "Mek",
  "Painboss",
  "Painboy",
  "Warboss",
  "Warboss in Mega Armour",
  "Warboss on Warbike",
  "Weirdboy"
 ]
};

/* SOCLES : le relevé du Base Size Guide, rapproché des noms de fiche.
   « 32 » pour un rond, « 120x92 » pour un ovale, « coque » pour un
   modèle qui n'a pas de socle à annoncer. */
const SOCLES = {
 "Battlewagon": "coque",
 "Beast Snagga Boyz": "32",
 "Beastboss": "50",
 "Beastboss on Squigosaur": "80",
 "Big Mek in Mega Armour": "40",
 "Big Mek with Shokk Attack Gun": "40",
 "Big'ed Bossbunka": "coque",
 "Blitza-bommer": "120x92",
 "Boss Snikrot": "40",
 "Boyz": "32",
 "Burna Boyz": "32",
 "Burna-bommer": "120x92",
 "Dakkajet": "120x92",
 "Deff Dread": "60",
 "Deffkilla Wartrike": "150x95",
 "Deffkoptas": "75x42",
 "Flash Gitz": "40",
 "Ghazghkull Thraka": "80",
 "Gorkanaut": "170x109",
 "Gretchin": "25",
 "Hunta Rig": "170x109",
 "Kill Rig": "170x109",
 "Killa Kans": "60",
 "Kommandos": "32",
 "Lootas": "32",
 "Meganobz": "40",
 "Mek": "32",
 "Mek Gunz": "coque",
 "Morkanaut": "170x109",
 "Mozrog Skragbad": "80",
 "Bannernob": "40",
 "Nobz": "32",
 "Painboss": "40",
 "Painboy": "32",
 "Rukkatrukk Squigbuggies": "150x95",
 "Squighog Boyz": "75x42",
 "Stompa": "coque",
 "Stormboyz": "32",
 "Tankbustas": "32",
 "Trukk": "coque",
 "Warbikers": "75x42",
 "Warboss": "40",
 "Warboss in Mega Armour": "50",
 "Wazbom Blastajet": "150x95",
 "Weirdboy": "40",
 "Zodgrod Wortsnagga": "50",
 "Gargantuan Squiggoth": "coque",
 "Wartrakks": "105x70",
 "Big Mek": "50",
 "Runtherd": "32",
 "Breaka Boyz": "32",
 "Wazdakka Gutsmek": "120",
 "Bigboss": "40",
 "Big Mek Dakkarig": "90"
};

/* ABIMEES : au-dessous de ce nombre de PV, le profil est dégradé.
   Déduit des aptitudes « Damaged: 1-N Wounds Remaining ». */
const ABIMEES = {};

const TRANSPORTS = {
 "Battlewagon": "This model has a **transport capacity** of 22 **ORKS INFANTRY** models. Each **MEGA ARMOUR/JUMP PACK** model takes up the space of 2 models. Each **GHAZGHKULL THRAKA** model takes up the space of 4 models.",
 "Big'ed Bossbunka": "This model has a **transport capacity** of 11 **ORKS INFANTRY** models. It cannot transport **GHAZGHKULL THRAKA** models. Each **MEGA ARMOUR/JUMP PACK** model takes up the space of 2 models.",
 "Gorkanaut": "This model has a **transport capacity** of 12 **ORKS INFANTRY** models It cannot transport **GHAZGHKULL THRAKA** models. Each **MEGA ARMOUR/JUMP PACK** model takes up the space of 2 models.",
 "Hunta Rig": "This model has a **transport capacity** of 22 **BEAST SNAGGAS INFANTRY** models.",
 "Kill Rig": "This model has a **transport capacity** of 12 **BEAST SNAGGAS INFANTRY** models.",
 "Morkanaut": "This model has a **transport capacity** of 12 **ORKS INFANTRY** models. In cannot transport **GHAZGHKULL THRAKA** models. Each **MEGA ARMOUR/JUMP PACK** model takes up the space of 2 models.",
 "Stompa": "This model has a **transport capacity** of 22 **ORKS INFANTRY** models. Each **MEGA ARMOUR/JUMP PACK** model takes up the space of 2 models. Each **GHAZGHKULL THRAKA** model takes up the space of 4 models.",
 "Trukk": "This model has a **transport capacity** of 12 **ORKS INFANTRY** models. It cannot transport **GHAZGHKULL THRAKA/JUMP PACK** models. Each **MEGA ARMOUR** model takes up the space of 2 models.",
 "Gargantuan Squiggoth": "This model has a transport capacity of 22 ORKS INFANTRY models. Each MEGA ARMOUR, JUMP PACK model takes up the space of 2 models. Each GHAZGHKULL THRAKA model takes up the space of 4 models.",
 "Kill Tank": "This model has a transport capacity of 12 Orks Infantry models. Each Mega Armour, Jump Pack model takes up the space of 2 models. Each Ghazghkull Thraka model takes up the space of 4 models.",
 "Big Trakk": "This model has a transport capacity of 12 Orks Infantry models. It cannot transport Ghazghkull Thraka models. Each Mega Armour, Jump Pack model takes up the space of 2 models.",
 "Gunwagon": "This model has a **transport capacity** of 12 **ORKS INFANTRY** models. Each **MEGA ARMOUR/JUMP PACK** model takes up the space of 2 models. Each **GHAZGHKULL THRAKA** model takes up the space of 4 models."
};
const FACTION = [
 [
  "Waaagh!",
  "Friendly ORKS units with this ability can: ▪ Re-roll advance rolls. ▪ Become riled up, as stated in other rules. While a unit is riled up: ▪ That unit has 5+ InSv. ▪ That unit’s ranged attacks have [ASSAULT]. ▪ When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge. War Cry (Once per battle, per army): At the start of the Command phase, you can use this ability. If you do, friendly ORKS units with the Waaagh! ability are riled up until the end of the next turn."
 ]
];

/* Le câblage tenu à la main, repris de outils/cablage/orks.json —
   ce que chaque règle fait au calcul. Ce qui n'y figure pas sort
   vide : le simulateur tourne alors sur les caractéristiques nues,
   ce qui est faux par défaut plutôt que faux par invention. */
const APTIS_UNITE = {
 "Beastboss": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Esquive Ça !",
   "texte": "This unit's attacks have +1 to hit rolls."
  }
 ],
 "Big Mek": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Plus d'Dakka",
   "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
  }
 ],
 "Big Mek in Mega Armour": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Plus d'Dakka",
   "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
  }
 ],
 "Big Mek with Shokk Attack Gun": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Plus d'Dakka",
   "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
  }
 ],
 "Boss Zagstruk": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Chef de Largage",
   "texte": "This unit's melee attacks have +1 to hit rolls."
  }
 ],
 "Gorkanaut": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "C",
   "nom": "Grand et Piétineur",
   "texte": "This unit's melee attacks can re-roll hit rolls of 1."
  }
 ],
 "Kaptin Badrukk": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Les Gitz les Plus Clinquants",
   "texte": "This unit's ranged attacks can re-roll hit rolls."
  }
 ],
 "Lootas": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "T",
   "nom": "C'est Not' Butin",
   "texte": "- This unit's ranged attacks can re-roll hit rolls of 1."
  }
 ],
 "Mek": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Dakka Kustom",
   "texte": "This unit's ranged attacks have [IGNORES COVER]."
  }
 ],
 "Morkanaut": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "T",
   "nom": "Grand et Tireur",
   "texte": "In your Shooting phase, this unit's ranged attacks can re-roll hit rolls of 1."
  }
 ],
 "Warboss on Warbike": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Boss Rapide",
   "texte": "This unit's melee attacks have +1 to hit rolls."
  }
 ],
 "Bigboss": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Quelque Chose à Prouver",
   "texte": "This unit's melee attacks have +1 to hit rolls."
  }
 ],
 "Nazdreg": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Les Trucs de Nazdreg",
   "texte": "- This unit's ranged attacks have [IGNORES COVER]."
  }
 ],
 "Gunwagon": [
  {
   "champ": "rrH",
   "val": "ones",
   "port": "T",
   "nom": "Arsenal Mobile",
   "texte": "In your Shooting phase, this unit's ranged attacks can re-roll hit rolls of 1."
  }
 ]
};
const APTIS_COND = {
 "Boyz": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Munitions Grots",
   "quand": "Les Munitions Grots sont utilisées (une fois par bataille)",
   "texte": "In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have +1 to hit rolls."
  },
  {
   "mot": "lethal",
   "port": "C",
   "nom": "Marée de Muscles",
   "quand": "L'unité a chargé ce tour",
   "texte": "In the Fight phase, if this unit made a charge move this turn, this unit's melee attacks have [LETHAL HITS]."
  }
 ],
 "Nobz": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Munitions Grots",
   "quand": "Les Munitions Grots sont utilisées (une fois par bataille)",
   "texte": "In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have +1 to hit rolls."
  },
  {
   "champ": "rrH",
   "val": "failed",
   "arme": "Kustom Krumpa",
   "port": "C",
   "nom": "Krumpas Jumelles",
   "quand": "La figurine porte deux Kustom Krumpas",
   "texte": "Attacks made with this model's Kustom Krumpa weapon can re-roll hit rolls and wound rolls."
  },
  {
   "champ": "rrW",
   "val": "failed",
   "arme": "Kustom Krumpa",
   "port": "C",
   "nom": "Krumpas Jumelles",
   "quand": "La figurine porte deux Kustom Krumpas",
   "texte": "Attacks made with this model's Kustom Krumpa weapon can re-roll hit rolls and wound rolls."
  }
 ],
 "Burna Boyz": [
  {
   "champ": "rrW",
   "val": "ones",
   "nom": "Pyromaniaks",
   "quand": "La cible est à 6\" ou moins",
   "texte": "This unit's attacks that target a unit within 6\" of this unit can re-roll wound rolls of 1."
  }
 ],
 "Lootas": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "C'est Not' Butin — sur objectif",
   "quand": "La cible est à portée d'un objectif",
   "texte": "- This unit's ranged attacks that target a unit within range of an objective can re-roll hit rolls."
  }
 ],
 "Deffkoptas": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "La Mort Vient d'en Haut",
   "quand": "L'unité a fait un mouvement d'arrivée ce tour",
   "texte": "In your Shooting phase, if this unit made an ingress move this turn, this unit's ranged attacks have +1 to hit rolls."
  }
 ],
 "Flash Gitz": [
  {
   "champ": "apMod",
   "val": 1,
   "port": "T",
   "nom": "Ki Trouve Garde",
   "quand": "L'unité ou la cible est à portée d'un objectif",
   "texte": "In your Shooting phase, if any of the following apply, this unit's ranged attacks have +1 AP. - This unit is within range of an objective. - The target of that attack is within range of an objective."
  }
 ],
 "Killa Kans": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Sale Caractère",
   "quand": "La cible n'a aucune figurine d'Endurance 7 ou plus",
   "texte": "This unit's attacks that target a unit that has no models with a T of 7+ have +1 to hit rolls."
  }
 ],
 "Kommandos": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Nulle Part où s'Cacher",
   "quand": "La cible est cachée",
   "texte": "This unit's attacks that target a hidden unit have +1 to hit rolls."
  }
 ],
 "Meganobz": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "C'est l'Heure du Krump",
   "quand": "L'unité est excitée",
   "texte": "In the Fight phase, if this unit is riled up, this unit has +1 to hit rolls."
  }
 ],
 "Squighog Boyz": [
  {
   "champ": "dmgMod",
   "val": 1,
   "nom": "Impact Brutal",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's attacks have +1 D."
  }
 ],
 "Stormboyz": [
  {
   "champ": "atkMod",
   "val": 1,
   "port": "C",
   "nom": "Charge Rokkit",
   "quand": "L'unité a chargé et utilise la Charge Rokkit ([DANGEREUX])",
   "texte": "When this unit is selected to fight, if this unit made a charge move this turn, you can use this ability. If you do, this unit's melee attacks have: - +1 A and S. - [HAZARDOUS]."
  },
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Charge Rokkit",
   "quand": "L'unité a chargé et utilise la Charge Rokkit ([DANGEREUX])",
   "texte": "When this unit is selected to fight, if this unit made a charge move this turn, you can use this ability. If you do, this unit's melee attacks have: - +1 A and S. - [HAZARDOUS]."
  }
 ],
 "Tankbustas": [
  {
   "champ": "apMod",
   "val": 1,
   "port": "T",
   "nom": "Pulsa Rokkit",
   "quand": "La cible est le MONSTRE ou VÉHICULE désigné (une fois par bataille)",
   "texte": "In your Shooting phase, when this unit is selected to shoot, you can select one enemy MONSTER/VEHICLE unit within 24\" of this unit. If you do, this unit's attacks that target that unit have: - +1 AP. - [LETHAL HITS]."
  },
  {
   "mot": "lethal",
   "port": "T",
   "nom": "Pulsa Rokkit",
   "quand": "La cible est le MONSTRE ou VÉHICULE désigné (une fois par bataille)",
   "texte": "In your Shooting phase, when this unit is selected to shoot, you can select one enemy MONSTER/VEHICLE unit within 24\" of this unit. If you do, this unit's attacks that target that unit have: - +1 AP. - [LETHAL HITS]."
  }
 ],
 "Warbikers": [
  {
   "champ": "strMod",
   "val": 1,
   "port": "C",
   "nom": "Carnage à Grande Vitesse",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's melee attacks have: - +1 S and D."
  },
  {
   "champ": "dmgMod",
   "val": 1,
   "port": "C",
   "nom": "Carnage à Grande Vitesse",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this unit's melee attacks have: - +1 S and D."
  }
 ],
 "Warboss": [
  {
   "champ": "atkMod",
   "val": 3,
   "port": "C",
   "nom": "La Force Fait le Droit",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this model's melee attacks have: - +3 A. - +2 S."
  },
  {
   "champ": "strMod",
   "val": 2,
   "port": "C",
   "nom": "La Force Fait le Droit",
   "quand": "L'unité a chargé ce tour",
   "texte": "If this unit made a charge move this turn, this model's melee attacks have: - +3 A. - +2 S."
  },
  {
   "champ": "hitMod",
   "val": 1,
   "port": "T",
   "nom": "Munitions Grots du Boss",
   "quand": "Les munitions sont utilisées (une fois par bataille)",
   "texte": "In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this model's ranged attacks have +1 to hit rolls."
  }
 ],
 "Big Mek Dakkarig": [
  {
   "mot": "sust:1",
   "port": "T",
   "nom": "Encore Plus d'Dakka",
   "quand": "L'unité est excitée",
   "texte": "If this unit is riled up, this unit's ranged attacks have [SUSTAINED HITS 1]."
  }
 ]
};
const APTIS_CIBLE = {
 "Dakkajet": [
  {
   "champ": "hitMod",
   "val": 1,
   "sauf": [
    "vol"
   ],
   "port": "T",
   "nom": "Passe de Mitraillage",
   "texte": "In your Shooting phase, this unit's ranged attacks that target a unit (excluding FLY units) have +1 to hit rolls."
  }
 ],
 "Mozrog Skragbad": [
  {
   "champ": "rrW",
   "val": "failed",
   "vs": [
    "mon",
    "veh"
   ],
   "port": "C",
   "nom": "Plus Y Sont Gros…",
   "texte": "This unit's melee attacks that target a MONSTER/VEHICLE unit can re-roll wounds rolls."
  }
 ],
 "Wazbom Blastajet": [
  {
   "champ": "wndMod",
   "val": 1,
   "vs": [
    "mon",
    "veh"
   ],
   "port": "T",
   "nom": "Vise l'Point Faible",
   "texte": "In your Shooting phase, this unit's ranged attacks that target a MONSTER/VEHICLE unit have +1 to wound rolls."
  }
 ],
 "Big Mek Dakkarig": [
  {
   "champ": "atkMod",
   "val": 6,
   "arme": "Blitzkannon",
   "sauf": [
    "mon",
    "veh"
   ],
   "port": "T",
   "nom": "Blitz Dem Gitz !",
   "texte": "In your Shooting phase, if this unit's Blitzkannon weapon targets a unit (excluding MONSTER/VEHICLE units), that weapon has +6 A."
  }
 ]
};
const AURAS_PERSO = {
 "Beastboss": [
  {
   "champ": "hitMod",
   "val": 1,
   "nom": "Esquive Ça !",
   "texte": "This unit's attacks have +1 to hit rolls."
  }
 ],
 "Big Mek": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Plus d'Dakka",
   "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
  }
 ],
 "Big Mek in Mega Armour": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Plus d'Dakka",
   "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
  }
 ],
 "Big Mek with Shokk Attack Gun": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Plus d'Dakka",
   "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
  }
 ],
 "Boss Zagstruk": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Chef de Largage",
   "texte": "This unit's melee attacks have +1 to hit rolls."
  }
 ],
 "Kaptin Badrukk": [
  {
   "champ": "rrH",
   "val": "failed",
   "port": "T",
   "nom": "Les Gitz les Plus Clinquants",
   "texte": "This unit's ranged attacks can re-roll hit rolls."
  }
 ],
 "Warboss on Warbike": [
  {
   "champ": "hitMod",
   "val": 1,
   "port": "C",
   "nom": "Boss Rapide",
   "texte": "This unit's melee attacks have +1 to hit rolls."
  }
 ],
 "Nazdreg": [
  {
   "mot": "ignorescover",
   "port": "T",
   "nom": "Les Trucs de Nazdreg",
   "texte": "- This unit's ranged attacks have [IGNORES COVER]."
  }
 ]
};
const AURAS_ARMEE = [
 {
  "sens": "def",
  "kw": [],
  "champ": "inv",
  "val": 5,
  "nom": "Waaagh! — excitée",
  "quand": "L'unité est excitée (Cri de Guerre, ou une autre règle)",
  "texte": "While a unit is riled up: ▪ That unit has 5+ InSv."
 },
 {
  "mot": "sust:1",
  "source": "Big Mek",
  "kw": [
   "Big Mek",
   "Boyz",
   "Breaka Boyz",
   "Flash Gitz",
   "Mek Gunz",
   "Nobz",
   "Tankbustas"
  ],
  "port": "T",
  "nom": "Plus d'Dakka — excitée",
  "quand": "L'unité du Big Mek est excitée",
  "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
 },
 {
  "mot": "sust:1",
  "source": "Big Mek in Mega Armour",
  "kw": [
   "Big Mek in Mega Armour",
   "Meganobz",
   "Mek Gunz"
  ],
  "port": "T",
  "nom": "Plus d'Dakka — excitée",
  "quand": "L'unité du Big Mek est excitée",
  "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
 },
 {
  "mot": "sust:1",
  "source": "Big Mek with Shokk Attack Gun",
  "kw": [
   "Big Mek with Shokk Attack Gun",
   "Boyz",
   "Mek Gunz",
   "Nobz",
   "Tankbustas"
  ],
  "port": "T",
  "nom": "Plus d'Dakka — excitée",
  "quand": "L'unité du Big Mek est excitée",
  "texte": "This unit's ranged attacks have: - [IGNORES COVER]. - If this unit is riled up, [SUSTAINED HITS 1]."
 },
 {
  "champ": "hitMod",
  "val": 1,
  "source": "Ghazghkull Thraka",
  "kw": [],
  "port": "C",
  "nom": "Prophète de la Grande Waaagh! (Aura)",
  "quand": "L'unité est à 6\" de Ghazghkull",
  "texte": "While a friendly ORKS unit is within 6\" of this unit, that unit's melee attacks have: - +1 to hit rolls. - +1 to wound rolls."
 },
 {
  "champ": "wndMod",
  "val": 1,
  "source": "Ghazghkull Thraka",
  "kw": [],
  "port": "C",
  "nom": "Prophète de la Grande Waaagh! (Aura)",
  "quand": "L'unité est à 6\" de Ghazghkull",
  "texte": "While a friendly ORKS unit is within 6\" of this unit, that unit's melee attacks have: - +1 to hit rolls. - +1 to wound rolls."
 },
 {
  "champ": "hitMod",
  "val": 1,
  "source": "Mek",
  "kw": [
   "vehicle"
  ],
  "nom": "Bidouillages Malins",
  "quand": "Ce VÉHICULE a été bidouillé par le Mek à sa phase de Mouvement",
  "texte": "In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS VEHICLE model (excluding AIRCRAFT/TITANIC models) within 3\" of this model: - That VEHICLE model's attacks have +1 to hit rolls until the start of your next Movement phase."
 },
 {
  "mot": "lethal",
  "source": "Wartrakks",
  "kw": [
   "Blitza-bommer",
   "Burna-bommer",
   "Dakkajet",
   "Deffkilla Wartrike",
   "Deffkoptas",
   "Rukkatrukk Squigbuggies",
   "Trukk",
   "Warbikers",
   "Warboss on Warbike",
   "Warbuggies",
   "Wartrakks",
   "Wazbom Blastajet",
   "Wazdakka Gutsmek"
  ],
  "nom": "Défonce-les",
  "quand": "La cible a été « défoncée » par les Wartrakks ce tour",
  "texte": "In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. That enemy unit is busted until the end of the turn: - Friendly SPEED FREEKS units' attacks that target a busted unit have [LETHAL HITS]."
 },
 {
  "champ": "apMod",
  "val": 1,
  "detach": "Da Big Hunt",
  "kw": [
   "Beast Snagga Boyz",
   "Beastboss",
   "Beastboss on Squigosaur",
   "Hunta Rig",
   "Kill Rig",
   "Mozrog Skragbad",
   "Painboss",
   "Squighog Boyz"
  ],
  "nom": "La Chasse est Ouverte",
  "quand": "La cible est un MONSTRE ou un VÉHICULE",
  "texte": "Friendly Beast Snagga units’ attacks that target a MONSTER/VEHICLE unit have +1 AP."
 },
 {
  "champ": "atkMod",
  "val": 1,
  "detach": "Dread Mob",
  "kw": [
   "Big Mek Dakkarig",
   "Deff Dread",
   "Gorkanaut",
   "Killa Kans",
   "Morkanaut",
   "Stompa"
  ],
  "nom": "Essaye Ce Bouton ! — 1-2",
  "quand": "Le dé donne 1 ou 2",
  "texte": "TRY DAT BUTTON! D6 RESULT 1-2 +1 A"
 },
 {
  "champ": "strMod",
  "val": 2,
  "detach": "Dread Mob",
  "kw": [
   "Big Mek Dakkarig",
   "Deff Dread",
   "Gorkanaut",
   "Killa Kans",
   "Morkanaut",
   "Stompa"
  ],
  "nom": "Essaye Ce Bouton ! — 3-4",
  "quand": "Le dé donne 3 ou 4",
  "texte": "TRY DAT BUTTON! D6 RESULT 3-4 +2 S"
 },
 {
  "champ": "apMod",
  "val": 1,
  "detach": "Dread Mob",
  "kw": [
   "Big Mek Dakkarig",
   "Deff Dread",
   "Gorkanaut",
   "Killa Kans",
   "Morkanaut",
   "Stompa"
  ],
  "nom": "Essaye Ce Bouton ! — 5-6",
  "quand": "Le dé donne 5 ou 6",
  "texte": "TRY DAT BUTTON! D6 RESULT 5-6 +1 AP"
 },
 {
  "champ": "hitMod",
  "val": 1,
  "detach": "Flyboyz",
  "kw": [
   "Blitza-bommer",
   "Burna-bommer",
   "Dakkajet",
   "Wazbom Blastajet",
   "Deffkoptas"
  ],
  "port": "T",
  "nom": "Dingos Volants",
  "quand": "L'unité est excitée",
  "texte": "▪ While a friendly Orks Aircraft/Deffkoptas unit is riled up, this unit’s ranged attacks have +1 to hit rolls."
 },
 {
  "mot": "lethal",
  "detach": "Green Tide",
  "kw": [
   "Bannernob",
   "Beast Snagga Boyz",
   "Beastboss",
   "Big Mek",
   "Big Mek in Mega Armour",
   "Big Mek with Shokk Attack Gun",
   "Bigboss",
   "Boss Snikrot",
   "Boss Zagstruk",
   "Boyz",
   "Breaka Boyz",
   "Burna Boyz",
   "Flash Gitz",
   "Ghazghkull Thraka",
   "Gretchin",
   "Kaptin Badrukk",
   "Kommandos",
   "Lootas",
   "Mad Dok Grotsnik",
   "Meganobz",
   "Mek",
   "Nazdreg",
   "Nobz",
   "Painboss",
   "Painboy",
   "Runtherd",
   "Stormboyz",
   "Tankbustas",
   "Warboss",
   "Warboss in Mega Armour",
   "Weirdboy",
   "Zodgrod Wortsnagga"
  ],
  "port": "C",
  "nom": "Brutalité en Bande",
  "quand": "L'unité d'INFANTERIE a chargé ce tour, et la cible n'est ni MONSTRE ni VÉHICULE",
  "texte": "▪ If a friendly Orks Infantry unit made a charge move this turn, that unit’s melee attacks have [Lethal Hits: non-Monster/Vehicle]."
 },
 {
  "champ": "hitMod",
  "val": 1,
  "detach": "Madcap Meks",
  "kw": [
   "Big Mek",
   "Mek Gunz",
   "Morkanaut",
   "Wazbom Blastajet"
  ],
  "port": "T",
  "nom": "Génie Imprévisible — Chercheurz",
  "quand": "Le dé donne 4, et tous les tirs visent une seule unité",
  "texte": "4 Seekerz: Those attacks have +1 to hit rolls."
 },
 {
  "champ": "rrH",
  "val": "ones",
  "detach": "Wreckas",
  "kw": [
   "Breaka Boyz",
   "Flash Gitz",
   "Tankbustas"
  ],
  "port": "T",
  "nom": "Cass' et Pillage",
  "quand": "L'unité ou la cible est à portée d'un objectif",
  "texte": "In your Shooting phase, when a friendly Breaka Boyz/Flash Gitz/Tankbustas unit is selected to shoot, if any of the following apply, that unit’s attacks can re-roll hit rolls of 1: ▪ That unit is within range of an objective. ▪ The target of that attack is within range of an objective."
 }
];
const OCTROIS_DETACH = {
 "War Horde": [
  {
   "mot": "sust:1",
   "port": "C",
   "qui": "unite",
   "kw": [],
   "nom": "Rentrez-leur Dedans",
   "texte": "Friendly ORKS units’ melee attacks have [Sustained Hits 1]."
  }
 ],
 "Bully Boyz": [
  {
   "mot": "sust:1",
   "port": "C",
   "qui": "unite",
   "kw": [
    "Meganobz",
    "Nobz"
   ],
   "nom": "Démonstrations de Sauvagerie",
   "texte": "Friendly Meganobz/Nobz units’ melee attacks have [Sustained Hits 1]."
  }
 ],
 "Green Tide": [
  {
   "mot": "sust:1",
   "port": "C",
   "qui": "unite",
   "kw": [
    "Boyz"
   ],
   "nom": "Brutalité en Bande",
   "texte": "▪ Friendly Boyz units’ melee attacks have [Sustained Hits 1]."
  }
 ]
};
const STRAT_SIMU = [
 {
  "nom": "Armed to Da Teef",
  "detach": "Bully Boyz",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Meganobz",
   "Nobz"
  ],
  "sauf": [],
  "aide": "relance des 1 pour toucher",
  "effet": {
   "rrH": "ones"
  }
 },
 {
  "nom": "Armed to Da Teef — excitée",
  "detach": "Bully Boyz",
  "pc": 1,
  "ph": "TC",
  "unites": [
   "Meganobz",
   "Nobz"
  ],
  "sauf": [],
  "aide": "relance TOTALE des touches — l'unité est excitée",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Long, Uncontrolled Bursts",
  "detach": "Flyboyz",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Blitza-bommer",
   "Burna-bommer",
   "Dakkajet",
   "Wazbom Blastajet",
   "Deffkoptas"
  ],
  "sauf": [],
  "aide": "relance des touches ratées — contre une unité qui VOLE seulement",
  "effet": {
   "rrH": "failed"
  }
 },
 {
  "nom": "Unbridled Carnage",
  "detach": "Green Tide",
  "pc": 1,
  "ph": "C",
  "unites": [
   "Boyz"
  ],
  "sauf": [],
  "aide": "+1 attaque au corps à corps — l'unité a chargé ce tour",
  "effet": {
   "atkMod": 1
  }
 },
 {
  "nom": "Dakkastorm",
  "detach": "Kult of Speed",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Blitza-bommer",
   "Burna-bommer",
   "Dakkajet",
   "Deffkilla Wartrike",
   "Deffkoptas",
   "Rukkatrukk Squigbuggies",
   "Trukk",
   "Warbikers",
   "Warboss on Warbike",
   "Warbuggies",
   "Wartrakks",
   "Wazbom Blastajet",
   "Wazdakka Gutsmek"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] sur les armes de tir",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Vindictive Artillerists",
  "detach": "Madcap Meks",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Mek Gunz"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] — ou l'une des deux autres options",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Vindictive Artillerists — Soutenues",
  "detach": "Madcap Meks",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Mek Gunz"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1]",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Vindictive Artillerists — les deux",
  "detach": "Madcap Meks",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Mek Gunz"
  ],
  "sauf": [],
  "aide": "[TOUCHES FATALES] et [TOUCHES SOUTENUES 1], au prix de [DANGEREUX]",
  "effet": {
   "lethal": true,
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Glowin' Dakka",
  "detach": "Shoota Boyz",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Bannernob",
   "Beast Snagga Boyz",
   "Beastboss",
   "Big Mek",
   "Big Mek in Mega Armour",
   "Big Mek with Shokk Attack Gun",
   "Bigboss",
   "Boss Snikrot",
   "Boss Zagstruk",
   "Boyz",
   "Breaka Boyz",
   "Burna Boyz",
   "Flash Gitz",
   "Ghazghkull Thraka",
   "Gretchin",
   "Kaptin Badrukk",
   "Kommandos",
   "Lootas",
   "Mad Dok Grotsnik",
   "Meganobz",
   "Mek",
   "Nazdreg",
   "Nobz",
   "Painboss",
   "Painboy",
   "Runtherd",
   "Stormboyz",
   "Tankbustas",
   "Warboss",
   "Warboss in Mega Armour",
   "Weirdboy",
   "Zodgrod Wortsnagga"
  ],
  "sauf": [],
  "aide": "+1 en PA — cible à 9\" ou moins",
  "effet": {
   "apMod": 1
  }
 },
 {
  "nom": "Kustom Dakka",
  "detach": "Shoota Boyz",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Bannernob",
   "Beast Snagga Boyz",
   "Beastboss",
   "Big Mek",
   "Big Mek in Mega Armour",
   "Big Mek with Shokk Attack Gun",
   "Bigboss",
   "Boss Snikrot",
   "Boss Zagstruk",
   "Boyz",
   "Breaka Boyz",
   "Burna Boyz",
   "Flash Gitz",
   "Ghazghkull Thraka",
   "Gretchin",
   "Kaptin Badrukk",
   "Kommandos",
   "Lootas",
   "Mad Dok Grotsnik",
   "Meganobz",
   "Mek",
   "Nazdreg",
   "Nobz",
   "Painboss",
   "Painboy",
   "Runtherd",
   "Stormboyz",
   "Tankbustas",
   "Warboss",
   "Warboss in Mega Armour",
   "Weirdboy",
   "Zodgrod Wortsnagga"
  ],
  "sauf": [],
  "aide": "+1 pour blesser — la cible n'est ni MONSTRE ni VÉHICULE",
  "effet": {
   "wndMod": 1
  }
 },
 {
  "nom": "Never Enough Dakka",
  "detach": "Shoota Boyz",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Bannernob",
   "Beast Snagga Boyz",
   "Beastboss",
   "Big Mek",
   "Big Mek in Mega Armour",
   "Big Mek with Shokk Attack Gun",
   "Bigboss",
   "Boss Snikrot",
   "Boss Zagstruk",
   "Boyz",
   "Breaka Boyz",
   "Burna Boyz",
   "Flash Gitz",
   "Ghazghkull Thraka",
   "Gretchin",
   "Kaptin Badrukk",
   "Kommandos",
   "Lootas",
   "Mad Dok Grotsnik",
   "Meganobz",
   "Mek",
   "Nazdreg",
   "Nobz",
   "Painboss",
   "Painboy",
   "Runtherd",
   "Stormboyz",
   "Tankbustas",
   "Warboss",
   "Warboss in Mega Armour",
   "Weirdboy",
   "Zodgrod Wortsnagga"
  ],
  "sauf": [],
  "aide": "[TOUCHES SOUTENUES 1] sur les armes de tir",
  "effet": {
   "sustainedOn": true,
   "sustainedN": "1"
  }
 },
 {
  "nom": "Hit 'em Harder",
  "detach": "War Horde",
  "pc": 1,
  "ph": "C",
  "unites": [],
  "sauf": [],
  "aide": "[TOUCHES FATALES] au corps à corps",
  "effet": {
   "lethal": true
  }
 },
 {
  "nom": "Drive-By Bustin'",
  "detach": "Wreckas",
  "pc": 1,
  "ph": "T",
  "unites": [
   "Battlewagon",
   "Big Trakk",
   "Gargantuan Squiggoth",
   "Gorkanaut",
   "Gunwagon",
   "Hunta Rig",
   "Kill Rig",
   "Kill Tank",
   "Morkanaut",
   "Stompa",
   "Trukk"
  ],
  "sauf": [],
  "aide": "+1 pour toucher — armes choisies pour le Pont de Tir seulement",
  "effet": {
   "hitMod": 1
  }
 }
];

/* Vides, faute de câblage : voir l'en-tête. */
const ARMEMENT = {};
const RETINUE = {};
const ENH_ANCIENS = {};
const GRPN = {};
const MOMENTS = {};
const MOMENTS_ARMEE = [];
const COMPO = {};
const ROLES_UNITE = {};

enregistreFaction({
  cle : "orks",
  nom : "Orks",
  tables : {
    UNITS, ARMEMENT, WEAPONS, KW, STRAT_SIMU, APTIS_CIBLE,
    DETACHMENTS, ATTACH, RETINUE, ENHANCEMENTS, ENH_ANCIENS, SOCLES,
    GRPN, STRATS, MOMENTS, MOMENTS_ARMEE, CAT, COMPO, ROLES_UNITE,
    APTITUDES, TRANSPORTS, FACTION, OCTROIS_DETACH, APTIS_UNITE,
    APTIS_COND, AURAS_ARMEE, ABIMEES, AURAS_PERSO
  }
});
})();
