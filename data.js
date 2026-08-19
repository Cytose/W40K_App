/* ============================================================
   Données Necrons — Warhammer 40 000, 11e édition
   Sources : Faction Pack Necrons v1.0 (GW, légal au 20/06/2026)
             + Wahapedia wh40k11ed (aligné faction pack v1.1, 07/2026)
   Les points viennent de Wahapedia, PAS du MFM lu directement :
   à revérifier. Tous les champs sont modifiables dans l'appli.
   ============================================================ */

/* UNITS : [nom, M, E, Svg, Invu, PV, tailles[], points{}, fnp, rôle, legends, notes] */
const UNITS = [
["Necron Warriors",5,4,4,0,1,[10,20],{"10":80,"20":190},0,"",0,"Battleline. Their Number is Legion : relance du dé de Réanimation."],
["Immortals",5,5,3,0,1,[5,10],{"5":70,"10":140},0,"",0,"Battleline. Aucune règle défensive propre."],
["Lychguard",5,5,3,4,2,[5,10],{"5":80,"10":160},0,"",0,"Invu 4+ SEULEMENT avec bouclier de dispersion. Guardian Protocols : -1 pour blesser si un NOBLE mène l'unité et F > E."],
["Deathmarks",5,5,3,0,1,[5,10],{"5":60,"10":120},0,"",0,"Frappe en Profondeur."],
["Flayed Ones",5,4,4,0,1,[5,10],{"5":55,"10":100},0,"",0,"Infiltrators + Discrétion."],
["Triarch Praetorians",10,5,3,0,2,[5,10],{"5":80,"10":160},0,"",0,"Frappe en Profondeur. Aucune invu listée en 11e (à revérifier)."],
["Cryptothralls",5,4,3,0,3,[2],{"2":60},0,"",0,"Bound Creation : le CRYPTEK de l'unité gagne FNP 4+."],
["Skorpekh Destroyers",8,6,3,0,3,[3,6],{"3":85,"6":170},0,"",0,""],
["Ophydian Destroyers",10,5,4,0,3,[3,6],{"3":80,"6":145},0,"",0,"Tunnelling Horrors : repart en Réserves en fin de tour adverse."],
["Lokhust Destroyers",8,6,3,0,3,[1,2,3,6],{"1":40,"2":55,"3":80,"6":170},0,"",0,""],
["Lokhust Heavy Destroyers",8,6,3,0,4,[1,2,3],{"1":50,"2":100,"3":160},0,"",0,""],
["Tomb Blades",12,5,4,0,2,[3,6],{"3":70,"6":140},0,"",0,"Shieldvanes : Svg 3+ mais M 8\". Shadowloom : Discrétion. Deep Strike en 11e."],
["Canoptek Scarab Swarms",10,2,6,0,4,[3,6],{"3":40,"6":80},0,"",0,"CO 0 (1 à 6\" d'un CRYPTEK)."],
["Canoptek Wraiths",10,6,3,4,4,[3,6],{"3":95,"6":220},0,"",0,"Invu 4+ permanente."],
["Canoptek Spyders",5,7,3,0,6,[1,2],{"1":65,"2":110},0,"",0,"Gloom Prism : FNP 5+ vs mortelles/psychiques à 6\". Deadly Demise 1."],
["Canoptek Reanimator",8,6,3,0,6,[1],{"1":75},4,"",0,"FNP 4+ permanent. Aura 3\" : +D3 PV réanimés."],
["Canoptek Doomstalker",8,8,3,4,12,[1],{"1":140},0,"",0,"Profil dégradé à 1-4 PV : -1 pour toucher. Deadly Demise D3."],
["Canoptek Macrocytes",8,3,4,0,1,[5],{"5":70},0,"",0,"NOUVEAU 11e. Harassment Swarm : -1 pour toucher aux ennemis non-MONSTRE/VÉHICULE à 3\"."],
["Canoptek Tomb Crawlers",5,4,3,0,3,[2],{"2":50},0,"",0,"NOUVEAU 11e. Weapon Sentinels : ignore les modificateurs de touche/blessure à 12\"."],
["Triarch Stalker",8,8,3,4,12,[1],{"1":110},0,"",0,"Targeting Relay : retire le couvert à la cible touchée. Scouts 8\"."],
["Doomsday Ark",10,9,3,4,14,[1],{"1":210},0,"",0,"Profil dégradé à 1-5 PV : -1 pour toucher. Deadly Demise D3."],
["Ghost Ark",10,9,3,4,14,[1],{"1":100},0,"",0,"Transport 10 Necron Warriors + 1 perso. Repair Barge. Deadly Demise D3."],
["Annihilation Barge",10,8,3,4,9,[1],{"1":95},0,"",0,"Deadly Demise 1."],
["Monolith",8,13,2,0,22,[1],{"1":420},0,"",0,"TITANIC FLY en 11e. Pas d'invu. Dégradé à 1-7 PV : -1 pour toucher. Deadly Demise D6."],
["Obelisk",8,13,2,0,24,[1],{"1":280},0,"",0,"TITANIC FLY. Pas d'invu. Dégradé à 1-8 PV : -1 pour toucher. Deadly Demise D6."],
["Tesseract Vault",8,12,2,4,24,[1],{"1":465},0,"",0,"TITANIC FLY. Dégradé à 1-8 PV : un seul pouvoir C'tan par phase. Deadly Demise D6+3."],
["Doom Scythe",20,9,3,0,12,[1],{"1":200},0,"",0,"Aircraft. Dégradé à 1-4 PV : -1 pour toucher. Deadly Demise D3."],
["Night Scythe",14,9,3,0,12,[1],{"1":125},0,"",0,"Refondu en 11e (Hover, FRAME). Transport 1 unité INFANTERIE."],
["Overlord",5,5,2,4,6,[1],{"1":90},0,"Leader",0,"Implacable Resilience : -1 Dégât sur chaque attaque allouée. Orbe de résurrection en option."],
["Royal Warden",5,5,3,0,4,[1],{"1":50},0,"Leader",0,"Engrammatic Logic."],
["Lokhust Lord",8,6,3,4,6,[1],{"1":70},0,"Leader",0,"Nanoscarab Amulet (option) : FNP 5+."],
["Skorpekh Lord",8,7,3,4,7,[1],{"1":90},0,"Leader",0,"Rejoint les Skorpekh Destroyers."],
["Hexmark Destroyer",8,5,3,0,5,[1],{"1":75},0,"",0,"Lone Operative + Frappe en Profondeur."],
["Technomancer",10,4,4,0,4,[1],{"1":80},0,"Support",0,"Rites of Reanimation : l'unité menée gagne FNP 5+."],
["Plasmancer",5,4,4,0,4,[1],{"1":55},0,"Support",0,""],
["Chronomancer",5,4,4,4,4,[1],{"1":70},0,"Support",0,"Timesplinter Mantle : Discrétion + -1 pour toucher en mêlée contre l'unité."],
["Psychomancer",5,4,4,0,4,[1],{"1":55},0,"Support",0,"Nightmare Shroud. Ne peut plus jouer seul en 11e."],
["Geomancer",8,4,4,0,4,[1],{"1":75},0,"Support",0,"NOUVEAU 11e. Obelisk Node Control : bloque les Réserves ennemies à 12\"."],
["Catacomb Command Barge",10,8,3,4,9,[1],{"1":120},0,"Leader",0,"Advanced Quantum Shielding : -1 pour blesser si F > E."],
["C'tan Shard of the Nightbringer",10,11,3,4,16,[1],{"1":360},5,"",0,"Epic Hero. Necrodermis : -1 Dégât. FNP 5+. Deadly Demise D6."],
["C'tan Shard of the Deceiver",8,11,3,4,16,[1],{"1":330},5,"",0,"Epic Hero. Necrodermis : -1 Dégât. FNP 5+. Discrétion, Frappe en Profondeur."],
["C'tan Shard of the Void Dragon",10,11,3,4,16,[1],{"1":345},5,"",0,"Epic Hero. Necrodermis : -1 Dégât. FNP 5+. Frappe en Profondeur."],
["Transcendent C'tan",8,11,3,4,16,[1],{"1":340},5,"",0,"Necrodermis : -1 Dégât. FNP 5+. Pas Epic Hero."],
["Imotekh the Stormlord",5,5,2,4,6,[1],{"1":100},0,"Leader",0,"Epic Hero. Grand Strategist : +1 PC par tour."],
["Trazyn the Infinite",5,5,2,4,6,[1],{"1":65},0,"Leader",0,"Epic Hero. Surrogate Hosts."],
["Orikan the Diviner",5,4,4,4,4,[1],{"1":90},0,"Support",0,"Epic Hero. Master Chronomancer : l'unité menée gagne une invu 4+."],
["Illuminor Szeras",8,8,2,4,9,[1],{"1":175},4,"",0,"Epic Hero. FNP 4+ permanent. Mechanical Augmentation."],
["Nekrosor Ammentar",10,8,3,4,9,[1],{"1":185},0,"",0,"NOUVEAU 11e. Epic Hero. Nullstone Field : FNP 5+ vs mortelles/psychiques à 6\". Fights First."],
["Szarekh, The Silent King",8,10,2,4,16,[3],{"3":420},0,"",0,"Epic Hero. Unité = Szarekh (16 PV) + 2 Menhirs (E10 Svg2+ Invu4+ 5 PV). Dégradé à 1-6 PV."],
["Nemesor Zahndrekh",5,5,2,4,6,[1],{"1":85},0,"Leader",1,"Legends. Counter-tactics."],
["Vargard Obyron",5,5,2,0,5,[1],{"1":85},0,"Leader",1,"Legends. Pas d'invu. Avec Zahndrekh : FNP 4+ aux personnages de l'unité."],
["Lord",5,5,3,0,4,[1],{"1":65},0,"Leader",1,"Legends. Svg en conflit selon les sources (2+ sur le PDF, 3+ sur Wahapedia)."]
];

/* WEAPONS : [unité, arme, "T"|"C", A par figurine, CT/CC, F, PA, D, drapeaux] */
const WEAPONS = [
["Necron Warriors","Gauss flayer","T","1",4,4,0,"1","lethal rf:1"],
["Necron Warriors","Gauss reaper","T","2",4,4,1,"1","lethal"],
["Necron Warriors","Close combat weapon","C","1",4,4,0,"1",""],
["Immortals","Gauss blaster","T","2",3,5,1,"1","lethal"],
["Immortals","Tesla carbine","T","2",3,5,0,"1","sust:2 assault"],
["Immortals","Close combat weapon","C","2",3,4,0,"1",""],
["Lychguard","Hyperphase sword","C","3",3,6,2,"1",""],
["Lychguard","Warscythe","C","2",3,8,3,"2","dev"],
["Deathmarks","Synaptic disintegrator","T","1",3,5,2,"2","heavy precision"],
["Deathmarks","Close combat weapon","C","2",3,4,0,"1",""],
["Flayed Ones","Flayer claws","C","4",3,4,1,"1","sust:1 twin"],
["Triarch Praetorians","Rod of covenant (tir)","T","1",3,5,2,"2",""],
["Triarch Praetorians","Rod of covenant (càc)","C","3",3,5,2,"2",""],
["Triarch Praetorians","Particle caster","T","3",3,5,0,"1","dev"],
["Triarch Praetorians","Voidblade","C","4",3,5,2,"1",""],
["Cryptothralls","Scouring eye","T","2",4,5,1,"1",""],
["Cryptothralls","Scythed limbs","C","4",4,5,1,"1",""],
["Skorpekh Destroyers","Skorpekh hyperphase weapons","C","4",3,7,2,"2",""],
["Ophydian Destroyers","Ophydian hyperphase weapons","C","5",3,4,2,"2",""],
["Lokhust Destroyers","Gauss cannon","T","3",3,5,2,"2","lethal"],
["Lokhust Destroyers","Close combat weapon","C","2",3,4,0,"1",""],
["Lokhust Heavy Destroyers","Gauss destructor","T","1",3,14,4,"6","heavy lethal"],
["Lokhust Heavy Destroyers","Enmitic exterminator","T","6",3,6,1,"1","heavy rf:6 sust:1"],
["Lokhust Heavy Destroyers","Close combat weapon","C","2",3,4,0,"1",""],
["Tomb Blades","Twin gauss blaster","T","2",3,5,1,"1","lethal twin"],
["Tomb Blades","Twin tesla carbine","T","2",3,5,0,"1","assault sust:2 twin"],
["Tomb Blades","Particle beamer","T","D6",3,5,0,"1","blast dev"],
["Tomb Blades","Close combat weapon","C","1",4,4,0,"1",""],
["Canoptek Scarab Swarms","Feeder mandibles","C","6",5,2,0,"1","lethal"],
["Canoptek Wraiths","Vicious claws","C","4",4,6,1,"2",""],
["Canoptek Wraiths","Whip coils","C","8",4,5,0,"1",""],
["Canoptek Wraiths","Transdimensional beamer","T","1",4,4,2,"3",""],
["Canoptek Wraiths","Particle caster","T","3",4,5,0,"1","dev"],
["Canoptek Spyders","Particle beamer ×2","T","2D6",3,6,0,"1","blast dev"],
["Canoptek Spyders","Automaton claws","C","5",4,8,2,"2",""],
["Canoptek Reanimator","Atomiser beam ×2","T","6",4,6,2,"1",""],
["Canoptek Reanimator","Reanimator's claws","C","4",4,5,0,"1",""],
["Canoptek Doomstalker","Doomsday blaster","T","D6+1",4,14,3,"3","blast heavy"],
["Canoptek Doomstalker","Twin gauss flayer","T","1",4,4,0,"1","lethal rf:1 twin"],
["Canoptek Doomstalker","Doomstalker limbs","C","3",4,6,0,"1",""],
["Canoptek Macrocytes","Gauss scalpel","T","1",4,4,1,"1","lethal"],
["Canoptek Macrocytes","Tesla caster","T","1",4,5,0,"1","assault sust:1"],
["Canoptek Macrocytes","Atomiser beam","T","1",4,6,1,"1",""],
["Canoptek Macrocytes","Claws","C","2",4,4,1,"1",""],
["Canoptek Tomb Crawlers","Twin gauss reaper","T","2",4,4,1,"1","lethal twin"],
["Canoptek Tomb Crawlers","Transdimensional isolator","T","2",4,4,2,"2",""],
["Canoptek Tomb Crawlers","Claws","C","4",4,6,1,"1",""],
["Triarch Stalker","Heavy gauss cannon array","T","6",3,8,2,"2","lethal"],
["Triarch Stalker","Particle shredder","T","D6+6",2,7,0,"1","blast dev"],
["Triarch Stalker","Heat ray — focalisé","T","2",3,9,4,"D6","melta:4"],
["Triarch Stalker","Heat ray — dispersé","T","2D6",4,5,1,"1","torrent ignorescover"],
["Triarch Stalker","Stalker's forelimbs","C","4",3,7,1,"3",""],
["Doomsday Ark","Doomsday cannon","T","D6+1",3,18,4,"4","blast heavy"],
["Doomsday Ark","Gauss flayer array ×2","T","10",3,4,0,"1","lethal rf:10"],
["Doomsday Ark","Armoured bulk","C","3",4,6,0,"1",""],
["Ghost Ark","Gauss flayer array ×2","T","10",3,4,0,"1","lethal rf:10"],
["Ghost Ark","Armoured bulk","C","3",4,6,0,"1",""],
["Annihilation Barge","Twin tesla destructor","T","6",3,8,0,"2","sust:2 twin"],
["Annihilation Barge","Gauss cannon","T","3",3,5,2,"2","lethal"],
["Annihilation Barge","Tesla cannon","T","4",3,6,0,"1","sust:2"],
["Annihilation Barge","Armoured bulk","C","3",4,6,0,"1",""],
["Monolith","Gauss flux arc ×4","T","12",3,6,1,"1","lethal rf:12"],
["Monolith","Death ray ×4","T","4",3,12,4,"D6+1","sust:D3"],
["Monolith","Particle whip","T","3D6",3,8,1,"2","blast dev"],
["Monolith","Portal of exile","C","6",2,8,2,"3",""],
["Obelisk","Tesla sphere ×4","T","24",3,7,0,"1","sust:2 anti:4"],
["Obelisk","Armoured bulk","C","6",4,8,0,"1",""],
["Tesseract Vault","Tesla spheres ×4","T","24",3,7,0,"1","sust:2"],
["Tesseract Vault","Antimatter Meteor (C'tan)","T","D6+3",3,10,3,"3","blast dev indirect"],
["Tesseract Vault","Cosmic Fire (C'tan)","T","3D6",4,6,2,"1","torrent dev ignorescover"],
["Tesseract Vault","Time's Arrow (C'tan)","T","1",2,3,2,"6","dev precision anti:4"],
["Tesseract Vault","Armoured bulk","C","6",4,8,0,"1",""],
["Doom Scythe","Heavy death ray","T","3",3,16,4,"D6+1","sust:D3"],
["Doom Scythe","Twin tesla destructor","T","6",3,8,0,"2","sust:2 twin"],
["Doom Scythe","Armoured bulk","C","3",4,6,0,"1",""],
["Night Scythe","Twin tesla destructor","T","6",3,8,0,"2","sust:2 twin"],
["Night Scythe","Armoured bulk","C","3",4,6,0,"1",""],
["Overlord","Tachyon arrow","T","1",2,16,5,"D6+2","oneshot"],
["Overlord","Staff of light (tir)","T","3",2,5,2,"1",""],
["Overlord","Overlord's blade","C","4",2,8,3,"2","dev"],
["Overlord","Voidscythe","C","3",3,12,3,"3","dev"],
["Overlord","Staff of light (càc)","C","4",2,5,2,"1",""],
["Royal Warden","Relic gauss blaster","T","2",3,5,1,"2","lethal rf:2"],
["Royal Warden","Close combat weapon","C","4",3,5,0,"1",""],
["Lokhust Lord","Staff of light (tir)","T","3",2,5,2,"1",""],
["Lokhust Lord","Lord's blade","C","4",2,8,3,"2","dev"],
["Lokhust Lord","Staff of light (càc)","C","4",2,5,2,"1",""],
["Skorpekh Lord","Enmitic annihilator","T","2",2,6,1,"1","rf:2"],
["Skorpekh Lord","Hyperphase harvester","C","4",2,10,3,"3",""],
["Skorpekh Lord","Flensing claw","C","8",2,6,1,"1",""],
["Hexmark Destroyer","Enmitic disintegrator pistols","T","6",2,6,2,"1","ignorescover pistol"],
["Hexmark Destroyer","Close combat weapon","C","4",3,5,0,"1",""],
["Technomancer","Staff of light (tir)","T","3",4,5,2,"1",""],
["Technomancer","Staff of light (càc)","C","2",4,5,2,"1",""],
["Plasmancer","Plasmic lance (tir)","T","3",4,7,3,"2",""],
["Plasmancer","Plasmic lance (càc)","C","2",4,7,3,"2",""],
["Chronomancer","Aeonstave blast","T","D6",4,5,1,"1",""],
["Chronomancer","Aeonstave","C","3",4,5,1,"1",""],
["Psychomancer","Abyssal lance (tir)","T","1",4,6,3,"3",""],
["Psychomancer","Abyssal lance (càc)","C","1",4,6,3,"3",""],
["Geomancer","Tremorglaive — faisceau","T","2",4,8,2,"2","melta:2"],
["Geomancer","Tremorglaive — onde de choc","T","D6+2",4,4,0,"1","torrent ignorescover"],
["Geomancer","Tremorglaive (càc)","C","2",4,8,2,"2",""],
["Catacomb Command Barge","Gauss cannon","T","3",3,5,2,"2","lethal"],
["Catacomb Command Barge","Tesla cannon","T","4",3,6,0,"1","sust:2"],
["Catacomb Command Barge","Staff of light (tir)","T","3",2,5,2,"1",""],
["Catacomb Command Barge","Overlord's blade","C","4",2,8,3,"2","dev"],
["Catacomb Command Barge","Staff of light (càc)","C","4",3,5,2,"1",""],
["C'tan Shard of the Nightbringer","Gaze of death","T","D3",2,12,3,"D6+3",""],
["C'tan Shard of the Nightbringer","Scythe — strike","C","6",2,14,4,"D6+2","dev"],
["C'tan Shard of the Nightbringer","Scythe — sweep","C","14",2,8,2,"2",""],
["C'tan Shard of the Deceiver","Cosmic insanity","T","6",2,6,2,"2","dev precision anti:4"],
["C'tan Shard of the Deceiver","Golden fists","C","8",2,10,3,"3",""],
["C'tan Shard of the Void Dragon","Spear of the Void Dragon (tir)","T","D3",2,8,3,"D6+2","anti:2"],
["C'tan Shard of the Void Dragon","Voltaic storm","T","D6+3",2,7,1,"2","blast sust:2"],
["C'tan Shard of the Void Dragon","Spear — strike","C","5",2,12,4,"D6+2","anti:2"],
["C'tan Shard of the Void Dragon","Spear — sweep","C","10",2,8,1,"2",""],
["C'tan Shard of the Void Dragon","Canoptek tail blades","C","6",2,6,1,"1","extra"],
["Transcendent C'tan","Seismic assault","T","6",2,8,2,"2","assault sust:1"],
["Transcendent C'tan","Crackling tendrils","C","8",2,10,3,"D6","sust:1"],
["Imotekh the Stormlord","Staff of the Destroyer (tir)","T","3",2,6,3,"2",""],
["Imotekh the Stormlord","Gauntlet of Fire","T","D6",4,5,1,"1","torrent ignorescover"],
["Imotekh the Stormlord","Staff of the Destroyer (càc)","C","4",2,6,3,"2","dev"],
["Trazyn the Infinite","Empathic Obliterator","C","4",2,7,0,"D3","sust:D3"],
["Orikan the Diviner","Staff of Tomorrow","C","2",3,4,3,"D3","dev"],
["Illuminor Szeras","Eldritch lance (tir)","T","3",3,9,3,"3",""],
["Illuminor Szeras","Eldritch lance (càc)","C","4",3,9,3,"3",""],
["Illuminor Szeras","Impaling legs","C","4",3,6,1,"1","extra"],
["Nekrosor Ammentar","Enmitic disintegrators","T","4",2,6,2,"1","ignorescover pistol sust:2"],
["Nekrosor Ammentar","Unmaker Gauntlet","C","6",2,10,3,"3",""],
["Nekrosor Ammentar","Blade tail and whip coils","C","6",2,6,1,"1","extra"],
["Szarekh, The Silent King","Sceptre of Eternal Glory","T","2",2,10,3,"3","dev"],
["Szarekh, The Silent King","Staff of Stars","T","12",2,6,1,"1","indirect"],
["Szarekh, The Silent King","Annihilator beam (×2 menhirs)","T","2",2,14,4,"6",""],
["Szarekh, The Silent King","Weapons of the Final Triarch","C","12",2,8,3,"2","lethal"],
["Nemesor Zahndrekh","Staff of light (tir)","T","3",3,5,2,"1",""],
["Nemesor Zahndrekh","Staff of light (càc)","C","4",3,5,2,"1",""],
["Vargard Obyron","Warscythe","C","4",2,8,3,"2","dev precision"],
["Lord","Staff of light (tir)","T","3",3,5,2,"1",""],
["Lord","Lord's blade","C","3",3,8,3,"2","dev"],
["Lord","Staff of light (càc)","C","3",3,5,2,"1",""]
];

/* ============================================================
   Mots-cles utiles aux regles de detachement (11e)
   ============================================================ */
const KW = {
  canoptek : ["Canoptek Scarab Swarms","Canoptek Wraiths","Canoptek Spyders","Canoptek Reanimator",
              "Canoptek Doomstalker","Canoptek Macrocytes","Canoptek Tomb Crawlers"],
  cryptek  : ["Technomancer","Plasmancer","Chronomancer","Psychomancer","Geomancer",
              "Orikan the Diviner","Illuminor Szeras"],
  destroyer: ["Skorpekh Destroyers","Ophydian Destroyers","Lokhust Destroyers","Lokhust Heavy Destroyers",
              "Hexmark Destroyer","Skorpekh Lord","Lokhust Lord","Nekrosor Ammentar"],
  noble    : ["Overlord","Lord","Imotekh the Stormlord","Nemesor Zahndrekh","Trazyn the Infinite",
              "Catacomb Command Barge","Royal Warden"],
  triarch  : ["Triarch Praetorians","Triarch Stalker","Szarekh, The Silent King"],
  lychguard: ["Lychguard"],
  monster  : ["C'tan Shard of the Nightbringer","C'tan Shard of the Deceiver",
              "C'tan Shard of the Void Dragon","Transcendent C'tan"],
  vehicle  : ["Catacomb Command Barge","Canoptek Spyders","Canoptek Reanimator","Canoptek Doomstalker",
              "Triarch Stalker","Doomsday Ark","Ghost Ark","Annihilation Barge","Monolith","Obelisk",
              "Tesseract Vault","Doom Scythe","Night Scythe","Szarekh, The Silent King"],
  titanic  : ["Monolith","Obelisk","Tesseract Vault"],
  tombblade: ["Tomb Blades"],
  epic     : ["C'tan Shard of the Nightbringer","C'tan Shard of the Deceiver","C'tan Shard of the Void Dragon",
              "Imotekh the Stormlord","Trazyn the Infinite","Orikan the Diviner","Illuminor Szeras",
              "Nekrosor Ammentar","Szarekh, The Silent King","Nemesor Zahndrekh","Vargard Obyron"],
  battleline:["Necron Warriors","Immortals"]
};

/* DETACHMENTS : [nom, PD, tag, nom de la regle, effet en clair, cle d'effet, conditionnel] */
const DETACHMENTS = [
["Awakened Dynasty",3,"DYNASTY","Command Protocols",
 "+1 au jet de touche pour toute unite menee par un PERSONNAGE necron.","led_hit1",0],
["Canoptek Court",3,"","Power Matrix",
 "Relance des 1 pour toucher pour CRYPTEK et CANOPTEK ; relance totale dans la Matrice de Puissance.","canoptek_rr",1],
["Starshatter Arsenal",3,"","Relentless Onslaught",
 "+1 pour toucher contre une unite a portee d'un objectif (hors MONSTRE) ; [ASSAUT] aux tirs VEHICULE/MONTE.","obj_hit1",1],
["Annihilation Legion",2,"","Annihilation Protocol",
 "+1 PA aux tirs DESTROYER CULT visant la cible eligible la plus proche ; relance de charge.","destroyer_ap1",1],
["Obeisance Phalanx",2,"","Worthy Foes",
 "+1 pour blesser aux NOBLE / LYCHGUARD / TRIARCH contre l'unite ennemie designee.","noble_wound1",1],
["Hypercrypt Legion",2,"HYPERCRYPT","Hyperphasing",
 "Retire des unites en Reserves Strategiques en fin de tour adverse. Aucun effet sur les des.","",0],
["Cursed Legion",2,"","Cold Fervour",
 "+2 en Force aux armes DESTROYER CULT (etendu a l'armee apres une unite detruite).","destroyer_str2",0],
["Cryptek Conclave",2,"","Technosorcerous Augmentations",
 "[ASSAUT] aux CRYPTEK, plus une aptitude au choix par phase de tir (Anti-Infanterie 3+, Ignore le couvert...).","cryptek_anti",1],
["Pantheon of Woe",2,"","Cosmic Distortion",
 "+1 PA a toute attaque visant une unite « unravelling » a 6\" d'un MONSTRE necron.","monster_ap1",1],
["Hand of the Dynasty",1,"DYNASTY","Hypermotility Protocols",
 "[ASSAUT] pour IMMORTALS / NECRON WARRIORS. Aucun effet sur les des.","",0],
["Skyshroud Spearhead",1,"","Transdimensional Deployment",
 "Frappe en Profondeur pour TOMB BLADES, et +1 pour toucher apres un mouvement d'ingress.","tomb_hit1",1],
["The Phaeron's Armoury",1,"HYPERCRYPT","Empowered Engines",
 "+6\" de Mouvement aux NECRONS TITANESQUE VOLANT. Aucun effet sur les des.","",0]
];

/* ============================================================
   RATTACHEMENT DES PERSONNAGES
   Source : catalogue BattleScribe BSData/wh40k-10e rev.106,
   regle « Leader » de chaque personnage (extraction automatique).
   ATTACH : personnage -> unites qu'il peut rejoindre.
   ============================================================ */
const ATTACH = {
"Chronomancer":["Immortals","Necron Warriors"],
"Geomancer":["Canoptek Macrocytes","Immortals","Necron Warriors"],
"Imotekh the Stormlord":["Immortals","Lychguard","Necron Warriors"],
"Lokhust Lord":["Lokhust Destroyers","Lokhust Heavy Destroyers"],
"Orikan the Diviner":["Immortals","Necron Warriors"],
"Overlord":["Immortals","Lychguard","Necron Warriors"],
"Plasmancer":["Immortals","Necron Warriors"],
"Psychomancer":["Immortals","Necron Warriors"],
"Royal Warden":["Immortals","Necron Warriors"],
"Skorpekh Lord":["Skorpekh Destroyers"],
"Technomancer":["Canoptek Wraiths","Immortals","Necron Warriors"],
"Trazyn the Infinite":["Immortals","Lychguard","Necron Warriors"],
"Nemesor Zahndrekh":["Immortals","Lychguard","Necron Warriors"],
"Vargard Obyron":["Immortals","Lychguard","Necron Warriors"],
"Lord":["Immortals","Lychguard","Necron Warriors"]
};

/* RETINUE : escortes qui se greffent sur une unite deja menee par un
   CRYPTEK. Liste relevee sur la fiche Canoptek Tomb Crawlers. */
const RETINUE = {
"Canoptek Tomb Crawlers":["Canoptek Macrocytes","Canoptek Wraiths","Immortals","Necron Warriors",
  "Skorpekh Destroyers","Lokhust Destroyers","Ophydian Destroyers","Lokhust Heavy Destroyers"],
"Cryptothralls":["Canoptek Macrocytes","Canoptek Wraiths","Immortals","Necron Warriors",
  "Skorpekh Destroyers","Lokhust Destroyers","Ophydian Destroyers","Lokhust Heavy Destroyers"]
};

/* ============================================================
   AMELIORATIONS (Enhancements)
   [nom, points, detachement, description]
   Source : catalogue BattleScribe BSData/wh40k-10e rev.106.
   Ce catalogue est en retard sur la 11e : les ameliorations de
   Skyshroud Spearhead en sont absentes et ont ete relevees sur
   WarOrgan. Un cout inconnu vaut null et n'est pas compte.
   Les quatre detachements Pantheon of Woe, Hand of the Dynasty
   et The Phaeron's Armoury n'ont pas encore d'amelioration ici.
   ============================================================ */
const ENHANCEMENTS = [
["Veil of Darkness",20,"Awakened Dynasty","NECRONS model only. Once per battle, at the end of your opponent’s turn, if the bearer’s unit is not within Engagement Range of one or more enemy units, the bearer can use this Enh"],
["Nether-realm Casket",20,"Awakened Dynasty","NECRONS model only. While the bearer is leading a unit, models in that unit have the Stealth ability."],
["Phasal Subjugator",35,"Awakened Dynasty","NECRONS model only. While a friendly NECRONS unit (excluding CHARACTER units) is within 6' of the bearer, each time a model in that unit makes an attack, add 1 to the hit roll."],
["Dimensional Overseer",25,"Hypercrypt Legion","NECRONS model only. While the bearer is on the battlefield or in Strategic Reserves, add 1 to the number of units from your army that you can select for the Hyperphasing rule."],
["Eternal Madness",25,"Annihilation Legion","NECRONS model only. In the Fight phase, each time a model in the bearer's unit is destroyed, if that model had not fought this phase, roll one D6. On a 4+, do not remove the destro"],
["Ingrained Superiority",10,"Annihilation Legion","NECRONS model only. Each time a model in the bearer's unit makes an attack, on a Critical Wound, improve the Armour Penetration characteristic of that attack by 1."],
["Soulless Reaper",20,"Annihilation Legion","DESTROYER CULT model only. Each time an enemy unit within Engagement Range of the bearer's unit is selected to Fall Back, roll one D6. On a 3+, that unit cannot Fall Back and must "],
["Eldritch Nightmare",15,"Annihilation Legion","DESTROYER CULT model only. At the start of the Fight phase, each enemy unit within Engagement Range of the bearer must take a Battle-shock test."],
["Dimensional Sanctum",20,"Canoptek Court","CRYPTEK model only. Models in the bearer's unit have the Infiltrators ability."],
["Hyperphasic Fulcrum",15,"Canoptek Court","CRYPTEK model only. While the bearer is leading a unit, if that unit is wholly within your army's Power Matrix, each time a model in that unit makes an attack, re-roll a Wound roll"],
["Autodivinator",15,"Canoptek Court","CRYPTEK model only. Each time your opponent gains a CP as a result of an ability, roll one D6: on a 2+, you also gain 1CP."],
["Metalodermal Tesla Weave",10,"Canoptek Court","CRYPTEK model only. Once per phase, when an enemy unit selects the bearer's unit as a target of a charge, roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds, on a 6, t"],
["Honourable Combatant",10,"Obeisance Phalanx","OVERLORD model only. Each time the bearer's unit destroys an enemy CHARACTER unit, your opponent loses 1CP if they have any."],
["Unflinching Will",20,"Obeisance Phalanx","OVERLORD model only. The bearer's melee weapons have the [PRECISION] and [ANTI-INFANTRY 5+] abilities."],
["Warrior Noble",15,"Obeisance Phalanx","OVERLORD model only. Each time a melee attack targets the bearer's unit, subtract 1 from the Hit roll."],
["Eternal Conqueror",25,"Obeisance Phalanx","OVERLORD model only. Each time a model in the bearer's unit makes an attack that targets an enemy unit within range of an objective marker, you can re-roll the Hit roll."],
["Enaegic Dermal Bond",30,"Awakened Dynasty","NECRONS model only. The bearer has the Feel No Pain 4+ ability."],
["Arisen Tyrant",25,"Hypercrypt Legion","NECRONS model only. Each time a model in the bearer's unit makes an attack, re-roll a Hit roll of 1. If the bearer's unit was set up on the battlefield this turn, you can re-roll t"],
["Hyperspatial Transfer Node",15,"Hypercrypt Legion","NECRONS model only. Each time the bearer's unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6' to the Move characteristic of models in th"],
["Osteoclave Fulcrum",20,"Hypercrypt Legion","NECRONS model only. Models in the bearer's unit have the Deep Strike ability."],
["Dread Majesty",30,"Starshatter Arsenal","While a friendly Necrons unit (excluding Monster and Titianic units) is within 6' of the bearer, each time a model in that unit makes an attack, re‑roll a Hit roll of 1 and re‑roll"],
["Miniaturised Nebuloscope",15,"Starshatter Arsenal","Ranged weapons equipped by models in the bearer’s unit have the [IGNORES COVER] ability."],
["Demanding Leader",10,"Starshatter Arsenal","In your Command phase, select one friendly NECRONS VEHICLE or NECRONS MOUNTED unit (excluding TITANIC units) within 6' of the bearer. Until the start of your next Command phase, th"],
["Chrono-impedance Fields",25,"Starshatter Arsenal","In your Command phase, select one friendly Necrons Vehicle or Necrons Mounted unit (excluding Titanic units) within 6' of the bearer. Until the start of your next Command phase, ea"],
["Gauntlet of Compression",20,"Cryptek Conclave","Add 6' to the Range characteristic of ranged weapons equipped by models in the bearer’s unit."],
["Atomic Disintegrators",10,"Cryptek Conclave","In your Shooting phase, each time the bearer’s unit is selected to shoot, when selecting an ability for the Technosorcerous Augmentations Detachment rule, you can also select from "],
["Quantum Abacus",15,"Cryptek Conclave","Each time you select the bearer’s unit as the target of a Stratagem, roll one D6, adding 1 if it is within range of one or more objectives: on a 4+, you gain 1CP."],
["Gravitic Bolas",15,"Skyshroud Spearhead","In your Shooting phase, after the bearer has shot, select one enemy unit hit by one or more of those attacks (excluding Titanic units); until the start of your next turn, that enem"],
["Destroyer Ankh",20,"Cursed Legion","The bearer has the Destroyer Cult keyword. Add 2' to the Move characteristic of models in the bearer’s unit and add 2 to the Attacks characteristic of melee weapons equipped by the"],
["Murdermind",15,"Cursed Legion","The bearer has the Destroyer Cult keyword and during the Declare Battle Formations step, the bearer can be attached to a Destroyer Cult unit (excluding Character units). If you do,"],
["Mark of the Nekrosor",20,"Cursed Legion","Each time a model in the bearer’s unit makes an attack, add 1 to the Hit roll."],
["Cursed Circlet",25,"Cursed Legion","Each time an enemy unit is selected to shoot, after that unit has shot, if any models from the bearer’s unit were destroyed as a result of those attacks, the bearer’s unit can make"],
["Recursive Reanimation",null,"Skyshroud Spearhead","Absente du catalogue BattleScribe : relevee sur WarOrgan, cout a confirmer."],
["Deepening Madness",20,"Skyshroud Spearhead","Absente du catalogue BattleScribe : relevee sur WarOrgan (20 pts)."]];

/* ============================================================
   EMPREINTE DE SOCLE, en millimetres
   Trois valeurs seulement sont certaines — Immortals 32,
   Canoptek Tomb Crawlers 50 et Lokhust Heavy Destroyers 60 —
   relevees sur les fiches WarOrgan. Le reste suit les socles
   Games Workshop habituels et reste A VERIFIER. Une chaine vide
   signifie « inconnu » et s'affiche « — » dans l'application.
   ============================================================ */
const BASES = {
"Necron Warriors":"32","Immortals":"32","Lychguard":"40","Deathmarks":"32","Flayed Ones":"32",
"Triarch Praetorians":"40","Cryptothralls":"40","Skorpekh Destroyers":"50",
"Ophydian Destroyers":"50","Lokhust Destroyers":"60","Lokhust Heavy Destroyers":"60",
"Tomb Blades":"60","Canoptek Scarab Swarms":"40","Canoptek Wraiths":"60",
"Canoptek Spyders":"60","Canoptek Reanimator":"80","Canoptek Doomstalker":"80",
"Canoptek Macrocytes":"","Canoptek Tomb Crawlers":"50","Triarch Stalker":"120×92",
"Doomsday Ark":"170×105","Ghost Ark":"170×105","Annihilation Barge":"170×105",
"Monolith":"","Obelisk":"","Tesseract Vault":"","Doom Scythe":"120×92","Night Scythe":"120×92",
"Overlord":"40","Royal Warden":"40","Lokhust Lord":"60","Skorpekh Lord":"60",
"Hexmark Destroyer":"40","Technomancer":"40","Plasmancer":"40","Chronomancer":"40",
"Psychomancer":"40","Geomancer":"","Catacomb Command Barge":"170×105",
"C'tan Shard of the Nightbringer":"60","C'tan Shard of the Deceiver":"60",
"C'tan Shard of the Void Dragon":"80","Transcendent C'tan":"60",
"Imotekh the Stormlord":"40","Trazyn the Infinite":"40","Orikan the Diviner":"40",
"Illuminor Szeras":"80","Nekrosor Ammentar":"","Szarekh, The Silent King":"100",
"Nemesor Zahndrekh":"40","Vargard Obyron":"40","Lord":"40"
};

/* ============================================================
   NOMS DE GROUPES
   Un groupe d'unites rattachees recoit un nom fabrique tout seul,
   pour qu'on puisse le designer en partie sans avoir a le saisir.
   Trois fragments tires au hasard : forme, qualificatif, origine.
   ============================================================ */
const GRPN = {
forme: ["Phalange","Cohorte","Croisade","Colonne","Escorte","Garde","Lame","Faucille","Meute",
  "Procession","Cortege","Legion","Vague","Sentinelle","Vigile","Serre","Nuee","Herse"],
qualif: ["d'Obsidienne","de Nécrodermis","du Silence","des Cendres","de Cuivre","du Vide",
  "d'Antimatiere","des Tombes","du Crepuscule","de Phase","des Dynasties","du Zenith",
  "de Poussiere","d'Ivoire","des Suaires","du Prisme","de Fer Noir","des Constellations"],
origine: ["de Mandragora","de Thanatos","de Solemnace","de Gidrim","de Nihilakh","de Sautekh",
  "de Novokh","de Nephrekh","de Ogdobekh","d'Antinomia","de Charnovokh","de Maynarkh",
  "de Szarekhan","d'Oruscar","de Thokt","de Ithakas"]
};
