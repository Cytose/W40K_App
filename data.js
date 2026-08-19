/* ============================================================
   Données Necrons — Warhammer 40 000, 11e édition
   Sources : Faction Pack Necrons v1.0 (GW, légal au 20/06/2026)
             + Wahapedia wh40k11ed (aligné faction pack v1.1, 07/2026)
   Les points viennent de Wahapedia, PAS du MFM lu directement :
   à revérifier. Tous les champs sont modifiables dans l'appli.
   ============================================================ */

/* UNITS : [nom, M, E, Svg, Invu, PV, tailles[], points{}, fnp, rôle, legends, notes, CO, Cd]
   CO et Cd viennent du catalogue BattleScribe. */
const UNITS = [
["Convergence of Dominion",0,9,3,0,7,[1,2,3],{"1":60,"2":120,"3":180},0,"",0,"Fortification, immobile (M —). 60 points par élément, confirmé. Profil et armement repris du catalogue BattleScribe. La composition de 1 à 3 éléments n'a pas de source : à corriger si l'unité se prend autrement.",0,"8+"],
["Necron Warriors",5,4,4,0,1,[10,20],{"10":80,"20":190},0,"",0,"Battleline. Their Number is Legion : relance du dé de Réanimation.",2,"7+"],
["Immortals",5,5,3,0,1,[5,10],{"5":70,"10":140},0,"",0,"Battleline. Aucune règle défensive propre.",2,"7+"],
["Lychguard",5,5,3,4,2,[5,10],{"5":80,"10":160},0,"",0,"Invu 4+ SEULEMENT avec bouclier de dispersion. Guardian Protocols : -1 pour blesser si un NOBLE mène l'unité et F > E.",1,"7+"],
["Deathmarks",5,5,3,0,1,[5,10],{"5":60,"10":120},0,"",0,"Frappe en Profondeur.",1,"7+"],
["Flayed Ones",5,4,4,0,1,[5,10],{"5":55,"10":100},0,"",0,"Infiltrators + Discrétion.",1,"7+"],
["Triarch Praetorians",10,5,3,0,2,[5,10],{"5":80,"10":160},0,"",0,"Frappe en Profondeur. Aucune invu listée en 11e (à revérifier).",1,"7+"],
["Cryptothralls",5,4,3,0,3,[2],{"2":60},0,"",0,"Bound Creation : le CRYPTEK de l'unité gagne FNP 4+.",1,"8+"],
["Skorpekh Destroyers",8,6,3,0,3,[3,6],{"3":85,"6":170},0,"",0,"",2,"7+"],
["Ophydian Destroyers",10,5,4,0,3,[3,6],{"3":80,"6":145},0,"",0,"Tunnelling Horrors : repart en Réserves en fin de tour adverse.",2,"7+"],
["Lokhust Destroyers",8,6,3,0,3,[1,2,3,6],{"1":40,"2":55,"3":80,"6":170},0,"",0,"",2,"7+"],
["Lokhust Heavy Destroyers",8,6,3,0,4,[1,2,3],{"1":50,"2":100,"3":160},0,"",0,"",2,"7+"],
["Tomb Blades",12,5,4,0,2,[3,6],{"3":70,"6":140},0,"",0,"Shieldvanes : Svg 3+ mais M 8\". Shadowloom : Discrétion. Deep Strike en 11e.",2,"7+"],
["Canoptek Scarab Swarms",10,2,6,0,4,[3,6],{"3":40,"6":80},0,"",0,"CO 0 (1 à 6\" d'un CRYPTEK).",0,"8+"],
["Canoptek Wraiths",10,6,3,4,4,[3,6],{"3":95,"6":220},0,"",0,"Invu 4+ permanente.",2,"8+"],
["Canoptek Spyders",5,7,3,0,6,[1,2],{"1":65,"2":110},0,"",0,"Gloom Prism : FNP 5+ vs mortelles/psychiques à 6\". Deadly Demise 1.",2,"8+"],
["Canoptek Reanimator",8,6,3,0,6,[1],{"1":75},4,"",0,"FNP 4+ permanent. Aura 3\" : +D3 PV réanimés.",3,"8+"],
["Canoptek Doomstalker",8,8,3,4,12,[1],{"1":140},0,"",0,"Profil dégradé à 1-4 PV : -1 pour toucher. Deadly Demise D3.",4,"8+"],
["Canoptek Macrocytes",8,3,4,0,1,[5],{"5":70},0,"",0,"NOUVEAU 11e. Harassment Swarm : -1 pour toucher aux ennemis non-MONSTRE/VÉHICULE à 3\".",1,"8+"],
["Canoptek Tomb Crawlers",5,4,3,0,3,[2],{"2":50},0,"",0,"NOUVEAU 11e. Weapon Sentinels : ignore les modificateurs de touche/blessure à 12\".",1,"8+"],
["Triarch Stalker",8,8,3,4,12,[1],{"1":110},0,"",0,"Targeting Relay : retire le couvert à la cible touchée. Scouts 8\".",4,"7+"],
["Doomsday Ark",10,9,3,4,14,[1],{"1":210},0,"",0,"Profil dégradé à 1-5 PV : -1 pour toucher. Deadly Demise D3.",5,"7+"],
["Ghost Ark",10,9,3,4,14,[1],{"1":100},0,"",0,"Transport 10 Necron Warriors + 1 perso. Repair Barge. Deadly Demise D3.",3,"7+"],
["Annihilation Barge",10,8,3,4,9,[1],{"1":95},0,"",0,"Deadly Demise 1.",3,"7+"],
["Monolith",8,13,2,0,22,[1],{"1":420},0,"",0,"TITANIC FLY en 11e. Pas d'invu. Dégradé à 1-7 PV : -1 pour toucher. Deadly Demise D6.",8,"7+"],
["Obelisk",8,13,2,0,24,[1],{"1":280},0,"",0,"TITANIC FLY. Pas d'invu. Dégradé à 1-8 PV : -1 pour toucher. Deadly Demise D6.",8,"7+"],
["Tesseract Vault",8,12,2,4,24,[1],{"1":465},0,"",0,"TITANIC FLY. Dégradé à 1-8 PV : un seul pouvoir C'tan par phase. Deadly Demise D6+3.",8,"7+"],
["Doom Scythe",0,9,3,0,12,[1],{"1":200},0,"",0,"AÉRODYNE. Le pack de faction remplace son M et son CO par « — » : en 11e un aérodyne ne fait qu'un mouvement d'arrivée (règles de base 23.02) et ne tient pas d'objectif. Dégradé à 1-4 PV : -1 pour toucher. Deadly Demise D3. Le pack nomme cette fiche « Faucheur » ; le rattachement au Doom Scythe est une déduction, pas une lecture.",0,"7+"],
["Night Scythe",14,9,3,0,12,[1],{"1":125},0,"",0,"Refondu en 11e : le pack lui retire AÉRODYNE, fixe son M à 14\" et lui donne Stationnaire et Frappe en Profondeur. Mot-clé CHÂSSIS. Transport 1 unité INFANTERIE. Le pack nomme cette fiche « Moissonneur » ; le rattachement au Night Scythe est une déduction, pas une lecture.",0,"7+"],
["Overlord",5,5,2,4,6,[1],{"1":90},0,"Leader",0,"Implacable Resilience : -1 Dégât sur chaque attaque allouée. Orbe de résurrection en option.",1,"6+"],
["Royal Warden",5,5,3,0,4,[1],{"1":50},0,"Leader",0,"Engrammatic Logic.",1,"6+"],
["Lokhust Lord",8,6,3,4,6,[1],{"1":70},0,"Leader",0,"Nanoscarab Amulet (option) : FNP 5+.",2,"6+"],
["Skorpekh Lord",8,7,3,4,7,[1],{"1":90},0,"Leader",0,"Rejoint les Skorpekh Destroyers.",2,"6+"],
["Hexmark Destroyer",8,5,3,0,5,[1],{"1":75},0,"",0,"Lone Operative + Frappe en Profondeur.",1,"6+"],
["Technomancer",10,4,4,0,4,[1],{"1":80},0,"Support",0,"Rites of Reanimation : l'unité menée gagne FNP 5+.",1,"6+"],
["Plasmancer",5,4,4,0,4,[1],{"1":55},0,"Support",0,"",1,"6+"],
["Chronomancer",5,4,4,4,4,[1],{"1":70},0,"Support",0,"Timesplinter Mantle : Discrétion + -1 pour toucher en mêlée contre l'unité.",1,"6+"],
["Psychomancer",5,4,4,0,4,[1],{"1":55},0,"Support",0,"Nightmare Shroud. Ne peut plus jouer seul en 11e.",1,"6+"],
["Geomancer",8,4,4,0,4,[1],{"1":75},0,"Support",0,"NOUVEAU 11e. Obelisk Node Control : bloque les Réserves ennemies à 12\".",1,"6+"],
["Catacomb Command Barge",10,8,3,4,9,[1],{"1":120},0,"Leader",0,"Advanced Quantum Shielding : -1 pour blesser si F > E.",3,"6+"],
["C'tan Shard of the Nightbringer",10,11,3,4,16,[1],{"1":360},5,"",0,"Epic Hero. Necrodermis : -1 Dégât. FNP 5+. Deadly Demise D6.",4,"6+"],
["C'tan Shard of the Deceiver",8,11,3,4,16,[1],{"1":330},5,"",0,"Epic Hero. Necrodermis : -1 Dégât. FNP 5+. Discrétion, Frappe en Profondeur.",4,"6+"],
["C'tan Shard of the Void Dragon",10,11,3,4,16,[1],{"1":345},5,"",0,"Epic Hero. Necrodermis : -1 Dégât. FNP 5+. Frappe en Profondeur.",4,"6+"],
["Transcendent C'tan",8,11,3,4,16,[1],{"1":340},5,"",0,"Necrodermis : -1 Dégât. FNP 5+. Pas Epic Hero.",4,"6+"],
["Imotekh the Stormlord",5,5,2,4,6,[1],{"1":100},0,"Leader",0,"Epic Hero. Grand Strategist : +1 PC par tour.",1,"6+"],
["Trazyn the Infinite",5,5,2,4,6,[1],{"1":65},0,"Leader",0,"Epic Hero. Surrogate Hosts.",1,"6+"],
["Orikan the Diviner",5,4,4,4,4,[1],{"1":90},0,"Support",0,"Epic Hero. Master Chronomancer : l'unité menée gagne une invu 4+.",1,"6+"],
["Illuminor Szeras",8,8,2,4,9,[1],{"1":175},4,"",0,"Epic Hero. FNP 4+ permanent. Mechanical Augmentation.",3,"6+"],
["Nekrosor Ammentar",10,8,3,4,9,[1],{"1":185},0,"",0,"NOUVEAU 11e. Epic Hero. Nullstone Field : FNP 5+ vs mortelles/psychiques à 6\". Fights First.",3,"6+"],
["Szarekh, The Silent King",8,10,2,4,16,[3],{"3":420},0,"",0,"Epic Hero. Unité = Szarekh (16 PV) + 2 Menhirs (E10 Svg2+ Invu4+ 5 PV). Dégradé à 1-6 PV.",6,"6+"]
];

/* WEAPONS : [unité, arme, "T"|"C", A par figurine, CT/CC, F, PA, D, drapeaux, portée]
   La portée vient du catalogue BattleScribe ; "càc" pour le corps a corps,
   vide quand le catalogue ne connait pas l'arme. */
const WEAPONS = [
["Convergence of Dominion","Transdimensional abductor","T","3",4,6,2,"3","","18\""],
["Necron Warriors","Gauss flayer","T","1",4,4,0,"1","lethal rf:1","24\""],
["Necron Warriors","Gauss reaper","T","2",4,4,1,"1","lethal","12\""],
["Necron Warriors","Close combat weapon","C","1",4,4,0,"1","","càc"],
["Immortals","Gauss blaster","T","2",3,5,1,"1","lethal","24\""],
["Immortals","Tesla carbine","T","2",3,5,0,"1","sust:2 assault","24\""],
["Immortals","Close combat weapon","C","2",3,4,0,"1","","càc"],
["Lychguard","Hyperphase sword","C","3",3,6,2,"1","","càc"],
["Lychguard","Warscythe","C","2",3,8,3,"2","dev","càc"],
["Deathmarks","Synaptic disintegrator","T","1",3,5,2,"2","heavy precision","36\""],
["Deathmarks","Close combat weapon","C","2",3,4,0,"1","","càc"],
["Flayed Ones","Flayer claws","C","4",3,4,1,"1","sust:1 twin","càc"],
["Triarch Praetorians","Rod of covenant (tir)","T","1",3,5,2,"2","","càc"],
["Triarch Praetorians","Rod of covenant (càc)","C","3",3,5,2,"2","","càc"],
["Triarch Praetorians","Particle caster","T","3",3,5,0,"1","dev","12\""],
["Triarch Praetorians","Voidblade","C","4",3,5,2,"1","","càc"],
["Cryptothralls","Scouring eye","T","2",4,5,1,"1","","6\""],
["Cryptothralls","Scythed limbs","C","4",4,5,1,"1","","càc"],
["Skorpekh Destroyers","Skorpekh hyperphase weapons","C","4",3,7,2,"2","","càc"],
["Ophydian Destroyers","Ophydian hyperphase weapons","C","5",3,4,2,"2","","càc"],
["Lokhust Destroyers","Gauss cannon","T","3",3,5,2,"2","lethal","24\""],
["Lokhust Destroyers","Close combat weapon","C","2",3,4,0,"1","","càc"],
["Lokhust Heavy Destroyers","Gauss destructor","T","1",3,14,4,"6","heavy lethal","48\""],
["Lokhust Heavy Destroyers","Enmitic exterminator","T","6",3,6,1,"1","heavy rf:6 sust:1","36\""],
["Lokhust Heavy Destroyers","Close combat weapon","C","2",3,4,0,"1","","càc"],
["Tomb Blades","Twin gauss blaster","T","2",3,5,1,"1","lethal twin","24\""],
["Tomb Blades","Twin tesla carbine","T","2",3,5,0,"1","assault sust:2 twin","24\""],
["Tomb Blades","Particle beamer","T","D6",3,5,0,"1","blast dev","18\""],
["Tomb Blades","Close combat weapon","C","1",4,4,0,"1","","càc"],
["Canoptek Scarab Swarms","Feeder mandibles","C","6",5,2,0,"1","lethal","càc"],
["Canoptek Wraiths","Vicious claws","C","4",4,6,1,"2","","càc"],
["Canoptek Wraiths","Whip coils","C","8",4,5,0,"1","","càc"],
["Canoptek Wraiths","Transdimensional beamer","T","1",4,4,2,"3","","12\""],
["Canoptek Wraiths","Particle caster","T","3",4,5,0,"1","dev","12\""],
["Canoptek Spyders","Particle beamer ×2","T","2D6",3,6,0,"1","blast dev","18\""],
["Canoptek Spyders","Automaton claws","C","5",4,8,2,"2","","càc"],
["Canoptek Reanimator","Atomiser beam ×2","T","6",4,6,2,"1","","12\""],
["Canoptek Reanimator","Reanimator's claws","C","4",4,5,0,"1","","càc"],
["Canoptek Doomstalker","Doomsday blaster","T","D6+1",4,14,3,"3","blast heavy","48\""],
["Canoptek Doomstalker","Twin gauss flayer","T","1",4,4,0,"1","lethal rf:1 twin","24\""],
["Canoptek Doomstalker","Doomstalker limbs","C","3",4,6,0,"1","","càc"],
["Canoptek Macrocytes","Gauss scalpel","T","1",4,4,1,"1","lethal","18\""],
["Canoptek Macrocytes","Tesla caster","T","1",4,5,0,"1","assault sust:1","18\""],
["Canoptek Macrocytes","Atomiser beam","T","1",4,6,1,"1","","12\""],
["Canoptek Macrocytes","Claws","C","2",4,4,1,"1","","càc"],
["Canoptek Tomb Crawlers","Twin gauss reaper","T","2",4,4,1,"1","lethal twin","12\""],
["Canoptek Tomb Crawlers","Transdimensional isolator","T","2",4,4,2,"2","","12\""],
["Canoptek Tomb Crawlers","Claws","C","4",4,6,1,"1","","càc"],
["Triarch Stalker","Heavy gauss cannon array","T","6",3,8,2,"2","lethal","24\""],
["Triarch Stalker","Particle shredder","T","D6+6",2,7,0,"1","blast dev","18\""],
["Triarch Stalker","Heat ray — focalisé","T","2",3,9,4,"D6","melta:4","18\""],
["Triarch Stalker","Heat ray — dispersé","T","2D6",4,5,1,"1","torrent ignorescover","12\""],
["Triarch Stalker","Stalker's forelimbs","C","4",3,7,1,"3","","càc"],
["Doomsday Ark","Doomsday cannon","T","D6+1",3,18,4,"4","blast heavy","72\""],
["Doomsday Ark","Gauss flayer array ×2","T","10",3,4,0,"1","lethal rf:10","24\""],
["Doomsday Ark","Armoured bulk","C","3",4,6,0,"1","","càc"],
["Ghost Ark","Gauss flayer array ×2","T","10",3,4,0,"1","lethal rf:10","24\""],
["Ghost Ark","Armoured bulk","C","3",4,6,0,"1","","càc"],
["Annihilation Barge","Twin tesla destructor","T","6",3,8,0,"2","sust:2 twin","36\""],
["Annihilation Barge","Gauss cannon","T","3",3,5,2,"2","lethal","24\""],
["Annihilation Barge","Tesla cannon","T","4",3,6,0,"1","sust:2","24\""],
["Annihilation Barge","Armoured bulk","C","3",4,6,0,"1","","càc"],
["Monolith","Gauss flux arc ×4","T","12",3,6,1,"1","lethal rf:12","24\""],
["Monolith","Death ray ×4","T","4",3,12,4,"D6+1","sust:D3","24\""],
["Monolith","Particle whip","T","3D6",3,8,1,"2","blast dev","24\""],
["Monolith","Portal of exile","C","6",2,8,2,"3","","càc"],
["Obelisk","Tesla sphere ×4","T","24",3,7,0,"1","sust:2 anti:4","24\""],
["Obelisk","Armoured bulk","C","6",4,8,0,"1","","càc"],
["Tesseract Vault","Tesla spheres ×4","T","24",3,7,0,"1","sust:2","24\""],
["Tesseract Vault","Antimatter Meteor (C'tan)","T","D6+3",3,10,3,"3","blast dev indirect","24\""],
["Tesseract Vault","Cosmic Fire (C'tan)","T","3D6",4,6,2,"1","torrent dev ignorescover","18\""],
["Tesseract Vault","Time's Arrow (C'tan)","T","1",2,3,2,"6","dev precision anti:4","24\""],
["Tesseract Vault","Armoured bulk","C","6",4,8,0,"1","","càc"],
["Doom Scythe","Heavy death ray","T","3",3,16,4,"D6+1","sust:D3","36\""],
["Doom Scythe","Twin tesla destructor","T","6",3,8,0,"2","sust:2 twin","36\""],
["Doom Scythe","Armoured bulk","C","3",4,6,0,"1","","càc"],
["Night Scythe","Twin tesla destructor","T","6",3,8,0,"2","sust:2 twin","36\""],
["Night Scythe","Armoured bulk","C","3",4,6,0,"1","","càc"],
["Overlord","Tachyon arrow","T","1",2,16,5,"D6+2","oneshot","72\""],
["Overlord","Staff of light (tir)","T","3",2,5,2,"1","","18\""],
["Overlord","Overlord's blade","C","4",2,8,3,"2","dev","càc"],
["Overlord","Voidscythe","C","3",3,12,3,"3","dev","càc"],
["Overlord","Staff of light (càc)","C","4",2,5,2,"1","","18\""],
["Royal Warden","Relic gauss blaster","T","2",3,5,1,"2","lethal rf:2","24\""],
["Royal Warden","Close combat weapon","C","4",3,5,0,"1","","càc"],
["Lokhust Lord","Staff of light (tir)","T","3",2,5,2,"1","","18\""],
["Lokhust Lord","Lord's blade","C","4",2,8,3,"2","dev","càc"],
["Lokhust Lord","Staff of light (càc)","C","4",2,5,2,"1","","18\""],
["Skorpekh Lord","Enmitic annihilator","T","2",2,6,1,"1","rf:2","18\""],
["Skorpekh Lord","Hyperphase harvester","C","4",2,10,3,"3","","càc"],
["Skorpekh Lord","Flensing claw","C","8",2,6,1,"1","","càc"],
["Hexmark Destroyer","Enmitic disintegrator pistols","T","6",2,6,2,"1","ignorescover pistol","18\""],
["Hexmark Destroyer","Close combat weapon","C","4",3,5,0,"1","","càc"],
["Technomancer","Staff of light (tir)","T","3",4,5,2,"1","","18\""],
["Technomancer","Staff of light (càc)","C","2",4,5,2,"1","","18\""],
["Plasmancer","Plasmic lance (tir)","T","3",4,7,3,"2","","18\""],
["Plasmancer","Plasmic lance (càc)","C","2",4,7,3,"2","","18\""],
["Chronomancer","Aeonstave blast","T","D6",4,5,1,"1","",""],
["Chronomancer","Aeonstave","C","3",4,5,1,"1","","càc"],
["Psychomancer","Abyssal lance (tir)","T","1",4,6,3,"3","","18\""],
["Psychomancer","Abyssal lance (càc)","C","1",4,6,3,"3","","18\""],
["Geomancer","Sismolance — faisceau réverbérant","T","2",4,8,2,"2","melta:2","18\""],
["Geomancer","Sismolance — ondes de choc","T","D6+2",4,4,0,"1","torrent ignorescover","18\""],
["Geomancer","Sismolance (càc)","C","2",4,8,2,"2","","càc"],
["Catacomb Command Barge","Gauss cannon","T","3",3,5,2,"2","lethal","24\""],
["Catacomb Command Barge","Tesla cannon","T","4",3,6,0,"1","sust:2","24\""],
["Catacomb Command Barge","Staff of light (tir)","T","3",2,5,2,"1","","18\""],
["Catacomb Command Barge","Overlord's blade","C","4",2,8,3,"2","dev","càc"],
["Catacomb Command Barge","Staff of light (càc)","C","4",3,5,2,"1","","18\""],
["C'tan Shard of the Nightbringer","Gaze of death","T","D3",2,12,3,"D6+3","","18\""],
["C'tan Shard of the Nightbringer","Scythe — strike","C","6",2,14,4,"D6+2","dev","càc"],
["C'tan Shard of the Nightbringer","Scythe — sweep","C","14",2,8,2,"2","","càc"],
["C'tan Shard of the Deceiver","Cosmic insanity","T","6",2,6,2,"2","dev precision anti:4","18\""],
["C'tan Shard of the Deceiver","Golden fists","C","8",2,10,3,"3","","càc"],
["C'tan Shard of the Void Dragon","Spear of the Void Dragon (tir)","T","D3",2,8,3,"D6+2","anti:2","12\""],
["C'tan Shard of the Void Dragon","Voltaic storm","T","D6+3",2,7,1,"2","blast sust:2","18\""],
["C'tan Shard of the Void Dragon","Spear — strike","C","5",2,12,4,"D6+2","anti:2","càc"],
["C'tan Shard of the Void Dragon","Spear — sweep","C","10",2,8,1,"2","","càc"],
["C'tan Shard of the Void Dragon","Canoptek tail blades","C","6",2,6,1,"1","extra","càc"],
["Transcendent C'tan","Seismic assault","T","6",2,8,2,"2","assault sust:1","12\""],
["Transcendent C'tan","Crackling tendrils","C","8",2,10,3,"D6","sust:1","càc"],
["Imotekh the Stormlord","Staff of the Destroyer (tir)","T","3",2,6,3,"2","","18\""],
["Imotekh the Stormlord","Gauntlet of Fire","T","D6",4,5,1,"1","torrent ignorescover","12\""],
["Imotekh the Stormlord","Staff of the Destroyer (càc)","C","4",2,6,3,"2","dev","18\""],
["Trazyn the Infinite","Empathic Obliterator","C","4",2,7,0,"D3","sust:D3","càc"],
["Orikan the Diviner","Staff of Tomorrow","C","2",3,4,3,"D3","dev","càc"],
["Illuminor Szeras","Eldritch lance (tir)","T","3",3,9,3,"3","","36\""],
["Illuminor Szeras","Eldritch lance (càc)","C","4",3,9,3,"3","","36\""],
["Illuminor Szeras","Impaling legs","C","4",3,6,1,"1","extra","càc"],
["Nekrosor Ammentar","Enmitic disintegrators","T","4",2,6,2,"1","ignorescover pistol sust:2","18\""],
["Nekrosor Ammentar","Unmaker Gauntlet","C","6",2,10,3,"3","","càc"],
["Nekrosor Ammentar","Blade tail and whip coils","C","6",2,6,1,"1","extra","càc"],
["Szarekh, The Silent King","Sceptre of Eternal Glory","T","2",2,10,3,"3","dev","24\""],
["Szarekh, The Silent King","Staff of Stars","T","12",2,6,1,"1","indirect","24\""],
["Szarekh, The Silent King","Annihilator beam (×2 menhirs)","T","2",2,14,4,"6","","24\""],
["Szarekh, The Silent King","Weapons of the Final Triarch","C","12",2,8,3,"2","lethal","càc"]
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
  noble    : ["Overlord","Imotekh the Stormlord","Trazyn the Infinite",
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
              "Nekrosor Ammentar","Szarekh, The Silent King"],
  battleline:["Necron Warriors","Immortals"],
  chassis:["Annihilation Barge","Catacomb Command Barge","Convergence of Dominion","Tesseract Vault","Doomsday Ark","Ghost Ark","Monolith","Obelisk","Triarch Stalker"]
};

/* ============================================================
   DETACHEMENTS
   [nom, PD, tag, nom de la regle, texte de la regle, cle d'effet,
    conditionnel, nom francais]
   Les sept premiers viennent du Pack de Faction Necrons v1.1
   (22 juillet 2026) : regle de detachement au texte officiel.
   Les cinq suivants viennent du codex, que ce pack ne reprend
   pas : leur texte reste resume, avec les errata du pack
   appliques et signales.
   ============================================================ */
const DETACHMENTS = [
["Hand of the Dynasty",1,"DYNASTY","Protocoles d'Hypermobilité",
 "▪ Les attaques de tir des unités d'IMMORTELS/GUERRIERS NÉCRONS amies ont [ASSAUT]. ▪ Quand une unité d'IMMORTELS/GUERRIERS NÉCRONS amie est choisie pour faire un mouvement d'avance, ce dernier ne l'empêche pas d'être éligible pour entreprendre une action. Ce détachement a l'étiquette DYNASTIE et ne peut pas être pris avec un autre détachement de DYNASTIE.",
 "",0,"Main de la Dynastie"],
["Skyshroud Spearhead",1,"","Déploiement Transdimensionnel",
 "▪ Les unités de MÉCANOPTÈRES amies ont Frappe en Profondeur. ▪ Quand une unité de MÉCANOPTÈRES amie est choisie pour tirer, si elle a fait un mouvement d'arrivée à ce tour, ses attaques de tir ont +1 aux jets de touche.",
 "tomb_hit1",1,"Fer de Lance Linceul Céleste"],
["The Phaeron's Armoury",1,"HYPERCRYPT","Réacteurs Surpuissants",
 "Les unités TITANESQUES NÉCRONS amies qui ont le mot-clé VOL ont +6\" en M. Ce détachement a l'étiquette HYPERCRYPTE et ne peut pas être pris avec un autre détachement d'HYPERCRYPTE.",
 "",0,"L'Arsenal du Phaëron"],
["Starshatter Arsenal",3,"","Offensive Implacable",
 "Chaque fois qu'une figurine de NÉCRONS de votre armée (figurines de MONSTRE exclues) fait une attaque qui cible une unité à portée d'un ou plusieurs pions d'objectif, ajoutez 1 au jet de Touche. De plus, les armes de tir dont sont équipées les figurines de VÉHICULE NÉCRON et de NÉCRONS MONTÉES (figurines TITANESQUES exclues) de votre armée ont l'aptitude [ASSAUT].",
 "obj_hit1",1,"Arsenal Brise-astres"],
["Cryptek Conclave",2,"","Augmentations Technosorcières",
 "▪ Les armes de tir dont sont équipées les figurines de CRYPTEK de votre armée ont l'aptitude [ASSAUT]. ▪ À votre phase de Tir, chaque fois qu'une unité de CRYPTEK de votre armée est choisie pour tirer, choisissez 1 des aptitudes suivantes : [ANTI-INFANTERIE 3+], [ANTI-MONTÉ 4+], [ASSAUT], [LOURD], [IGNORE LE COUVERT]. Jusqu'à la fin de la phase, les armes de tir dont sont équipées les figurines de l'unité ont l'aptitude choisie.",
 "cryptek_anti",1,"Conclave de Crypteks"],
["Cursed Legion",2,"","Froide Ferveur",
 "▪ Ajoutez 2 à la caractéristique de Force des armes dont sont équipées les figurines de CULTE DESTROYER de votre armée. ▪ La première fois à chaque tour qu'une unité de CULTE DESTROYER de votre armée fait des attaques qui détruisent une unité ou la font passer En Dessous de son Demi-effectif, après que l'unité a fini de résoudre ses attaques, jusqu'à la fin du tour, ajoutez 2 à la caractéristique de Force des armes dont sont équipées les figurines NÉCRONS (sauf les figurines de CULTE DESTROYER, MONSTRE et TITANESQUES).",
 "destroyer_str2",0,"Légion Maudite"],
["Pantheon of Woe",2,"","Distorsion Cosmique",
 "Les unités de MONSTRE NÉCRON de votre armée ont l'aptitude Champs de Distorsion (Aura) : tant qu'une unité ennemie est à 6\" de cette unité, l'unité ennemie est effritée ; tant qu'une unité ennemie est effritée, chaque fois qu'une attaque cible l'unité, améliorez de 1 la caractéristique de Pénétration d'Armure de l'attaque. Au début de chaque phase, pour chaque unité de MONSTRE NÉCRON de votre armée, l'unité peut subir 3 blessures mortelles ; dans ce cas, jusqu'à la fin de la phase, la portée de l'aura passe à 9\". RESTRICTIONS : quand vous rassemblez votre armée, chaque unité de MONSTRE NÉCRON reçoit son aptitude d'Entrave Nécrodermique et vous devez augmenter son coût en points du montant indiqué dans l'Inventaire du Munitorum ; si votre armée dépasse alors la limite en points, vous ne pouvez pas inclure l'unité.",
 "monster_ap1",1,"Panthéon de Malheur"],
["Awakened Dynasty",3,"DYNASTY","Protocoles de Commandement",
 "+1 au jet de touche pour toute unité menée par un PERSONNAGE nécron. Texte du codex, non repris par le pack de faction : à vérifier sur ta fiche.",
 "led_hit1",0,"Dynastie Éveillée"],
["Canoptek Court",3,"","Matrice Énergétique",
 "Relance des 1 pour toucher pour CRYPTEK et CANOPTEK ; relance totale dans la Matrice Énergétique. Texte du codex, non repris par le pack de faction : à vérifier sur ta fiche. Errata du pack : s'il n'y a aucun pion d'objectif dans le No Man's Land ou la zone de déploiement adverse, ces zones ne peuvent pas être dans la Matrice Énergétique.",
 "canoptek_rr",1,"Cour Canoptek"],
["Annihilation Legion",2,"","Protocole d'Annihilation",
 "Errata du pack : « Chaque fois qu'une unité de CULTE DESTROYER de votre armée fait une attaque de tir qui cible la cible éligible la plus proche, ajoutez 1 à la caractéristique de Pénétration d'Armure de l'attaque. » Le reste de la règle vient du codex : relance de charge.",
 "destroyer_ap1",1,"Légion d'Annihilation"],
["Obeisance Phalanx",2,"","Adversaires Dignes",
 "Texte remplacé par le pack de faction : « À votre phase de Commandement, choisissez 1 unité ennemie. Jusqu'au début de votre prochaine phase de Commandement, à chaque attaque d'une unité de NOBLE, de FACTIONNAIRES ou du TRIARCAT de votre armée qui cible l'unité choisie, ajoutez 1 au jet de Blessure. »",
 "noble_wound1",1,"Phalange d'Obéissance"],
["Hypercrypt Legion",2,"HYPERCRYPT","Hyperphasage",
 "Retire des unités en Réserves Stratégiques en fin de tour adverse. Tableau remplacé par le pack de faction : Incursion jusqu'à 1 unité, Force de Frappe jusqu'à 2 unités, Offensive jusqu'à 3 unités. Une unité retirée par l'Hyperphasage qui a Frappe en Profondeur ne peut pas arriver des Réserves au premier round. Aucun effet sur les dés.",
 "",0,"Légion d'Hypercrypte"]
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
"Trazyn the Infinite":["Immortals","Lychguard","Necron Warriors"]
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
   OPTIMISATIONS
   [nom, cout en points, detachement, texte]
   Un cout a null signifie « inconnu » : le pack de faction ne
   donne pas les points, qui vivent dans l'Inventaire du
   Munitorum. L'application affiche alors « cout inconnu » et
   ne compte rien dans le total.
   Les vingt optimisations des sept detachements du pack sont au
   texte officiel francais. Les seize autres viennent du codex,
   que ce pack ne reprend pas : elles restent en anglais, sauf
   le Voile de Tenebres dont le pack donne le nouveau texte.
   ============================================================ */
const ENHANCEMENTS = [

/* --- Main de la Dynastie */
["Sentinelles Animées",null,"Hand of the Dynasty",
 "Unité de GUERRIERS NÉCRONS seulement. Cette unité a Éclaireurs 5\"."],
["Instruments de Domination",null,"Hand of the Dynasty",
 "Unité d'IMMORTELS seulement. Les attaques de tir de cette unité ont [TIR RAPIDE 1]."],

/* --- Fer de Lance Linceul Céleste */
["Réanimation Récursive",null,"Skyshroud Spearhead",
 "Unité de MÉCANOPTÈRES seulement. Quand cette unité active ses Protocoles de Réanimation, +1 au jet."],
["Folie Croissante",20,"Skyshroud Spearhead",
 "Unité MONTÉE de CULTE DESTROYER seulement. Les attaques de tir de cette unité ont [ASSAUT]. Coût relevé sur WarOrgan, absent du pack de faction."],

/* --- L'Arsenal du Phaëron */
["Optimisateur de Prélocalisation",null,"The Phaeron's Armoury",
 "Figurine NÉCRON seulement. Quand cette unité est choisie pour tirer, si elle a été placée à ce tour en utilisant l'aptitude Portail d'Éternité d'un Monolithe, les attaques de tir de l'unité ont [TOUCHES FATALES], ou [TOUCHES SOUTENUES 1]."],
["Linceul Mortel (Aura)",null,"The Phaeron's Armoury",
 "Unité d'OBÉLISQUE seulement. À l'étape d'Ébranlement adverse, si une unité ennemie à 8\" ou moins de cette unité est en dessous de son effectif initial, elle fait un jet d'ébranlement."],

/* --- Arsenal Brise-astres */
["Majesté Effroyable (Aura)",30,"Starshatter Arsenal",
 "Figurine de TÉTRARQUE ou CONSOLE DE COMMANDEMENT seulement. Tant qu'une unité NÉCRON amie (unités TITANESQUES exclues) est à 6\" du porteur, à chaque attaque d'une figurine de l'unité, relancez tout jet de Touche de 1 et relancez tout jet de Blessure de 1."],
["Nébuloscope Miniaturisé",15,"Starshatter Arsenal",
 "Figurine NÉCRON seulement. Les armes de tir dont sont équipées les figurines de l'unité du porteur ont l'aptitude [IGNORE LE COUVERT]."],
["Noble Exigeant",10,"Starshatter Arsenal",
 "Figurine NÉCRON seulement. À votre phase de Commandement, choisissez 1 unité de VÉHICULE NÉCRON ou de NÉCRONS MONTÉS (unités TITANESQUES exclues) à 6\" du porteur. Jusqu'au début de votre prochaine phase de Commandement, l'unité est éligible pour tirer à un tour où elle a Battu en Retraite."],
["Champs de Chrono-impédance",25,"Starshatter Arsenal",
 "Figurine NÉCRON seulement. À votre phase de Commandement, choisissez 1 unité de VÉHICULE NÉCRON ou de NÉCRONS MONTÉS (unités TITANESQUES exclues) à 6\" du porteur. Jusqu'au début de votre prochaine phase de Commandement, à chaque attaque qui cible une figurine de l'unité, soustrayez 1 à la caractéristique de Dégâts de l'attaque."],

/* --- Conclave de Crypteks */
["Boulier Quantique",15,"Cryptek Conclave",
 "Figurine NÉCRON seulement. Chaque fois que vous choisissez l'unité du porteur comme cible d'un Stratagème, jetez 1 D6, en ajoutant 1 si elle est à portée d'un ou plusieurs objectifs : sur 4+, vous gagnez 1PC."],
["Désintégrateurs Atomiques",10,"Cryptek Conclave",
 "Figurine de CRYPTEK seulement. À votre phase de Tir, chaque fois que l'unité du porteur est choisie pour tirer, quand vous choisissez une aptitude pour la règle de Détachement Augmentations Technosorcières, vous pouvez aussi choisir parmi les aptitudes suivantes : [ANTI-MONSTRE 5+], [ANTI-VÉHICULE 5+]."],
["Gantelet de Compression",20,"Cryptek Conclave",
 "Figurine NÉCRON seulement. Ajoutez 6\" à la caractéristique de Portée des armes de tir dont sont équipées les figurines de l'unité du porteur."],
["Bolas Gravitiques",15,"Cryptek Conclave",
 "Figurine de CRYPTEK seulement. À votre phase de Tir, après que le porteur a tiré, choisissez 1 unité ennemie touchée par une ou plusieurs de ces attaques (sauf les unités TITANESQUES) ; jusqu'au début de votre prochain tour, l'unité ennemie est entravée. Tant qu'une unité est entravée, soustrayez 2 à sa caractéristique de Mouvement et soustrayez 2 aux jets de Charge pour l'unité."],

/* --- Légion Maudite */
["Ankh de Destroyer",20,"Cursed Legion",
 "Figurine de CONSOLE DE COMMANDEMENT ou TÉTRARQUE seulement. Le porteur a le mot-clé CULTE DESTROYER. Ajoutez 2\" à la caractéristique de Mouvement des figurines de l'unité du porteur et ajoutez 2 à la caractéristique d'Attaques des armes de mêlée dont le porteur est équipé."],
["Esprit Meurtrier",15,"Cursed Legion",
 "Figurine de CRYPTEK seulement. Le porteur a le mot-clé CULTE DESTROYER. Ajoutez 3\" à la caractéristique de Mouvement du porteur. Texte corrigé par le pack de faction v1.1."],
["Marque du Nékrosor",20,"Cursed Legion",
 "Figurine de CULTE DESTROYER seulement. À chaque attaque d'une figurine de l'unité du porteur, ajoutez 1 au jet de Touche."],
["Diadème Maudit",25,"Cursed Legion",
 "Figurine de CULTE DESTROYER seulement. Chaque fois qu'une unité ennemie est choisie pour tirer, après que l'unité a tiré, si une ou plusieurs figurines de l'unité du porteur ont été détruites à cause de ces attaques, l'unité du porteur peut faire un mouvement d'Élan. Dans ce cas, jetez 1 D6 : l'unité du porteur peut se déplacer d'une distance en pouces inférieure ou égale au résultat, mais elle doit finir ce mouvement aussi près que possible de l'unité ennemie la plus proche (sauf les AÉRODYNES). Ce faisant, ces figurines peuvent être déplacées à Portée d'Engagement de l'unité ennemie. Une unité ne peut pas faire un mouvement d'Élan tant qu'elle est Ébranlée."],

/* --- Dynastie Éveillée (codex) */
["Voile de Ténèbres",20,"Awakened Dynasty",
 "Texte remplacé par le pack de faction : « (Une fois par bataille, par armée) À la fin du tour adverse, si cette unité est non engagée, vous pouvez utiliser cette aptitude. Dans ce cas : ▪ Placez cette unité en réserve stratégique. ▪ Cette unité a Frappe en Profondeur jusqu'au début de votre prochaine phase de Tir. ▪ Cette unité doit faire un mouvement d'arrivée à votre prochaine phase de Mouvement (y compris à votre premier tour). »"],
["Nether-realm Casket",20,"Awakened Dynasty",
 "NECRONS model only. While the bearer is leading a unit, models in that unit have the Stealth ability."],
["Phasal Subjugator",35,"Awakened Dynasty",
 "NECRONS model only. While a friendly NECRONS unit (excluding CHARACTER units) is within 6\" of the bearer, each time a model in that unit makes an attack, add 1 to the hit roll."],
["Enaegic Dermal Bond",30,"Awakened Dynasty",
 "NECRONS model only. The bearer has the Feel No Pain 4+ ability."],

/* --- Légion d'Hypercrypte (codex) */
["Dimensional Overseer",25,"Hypercrypt Legion",
 "NECRONS model only. While the bearer is on the battlefield or in Strategic Reserves, add 1 to the number of units from your army that you can select for the Hyperphasing rule."],
["Arisen Tyrant",25,"Hypercrypt Legion",
 "NECRONS model only. Each time a model in the bearer's unit makes an attack, re-roll a Hit roll of 1. If the bearer's unit was set up on the battlefield this turn, you can re-roll the Hit roll instead."],
["Hyperspatial Transfer Node",15,"Hypercrypt Legion",
 "NECRONS model only. Each time the bearer's unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in the bearer's unit."],
["Osteoclave Fulcrum",20,"Hypercrypt Legion",
 "NECRONS model only. Models in the bearer's unit have the Deep Strike ability."],

/* --- Légion d'Annihilation (codex) */
["Eternal Madness",25,"Annihilation Legion",
 "NECRONS model only. In the Fight phase, each time a model in the bearer's unit is destroyed, if that model had not fought this phase, roll one D6. On a 4+, do not remove the destroyed model from play; it can fight after the attacking model's unit has finished making its attacks, and is then removed from play."],
["Ingrained Superiority",10,"Annihilation Legion",
 "NECRONS model only. Each time a model in the bearer's unit makes an attack, on a Critical Wound, improve the Armour Penetration characteristic of that attack by 1."],
["Soulless Reaper",20,"Annihilation Legion",
 "DESTROYER CULT model only. Each time an enemy unit within Engagement Range of the bearer's unit is selected to Fall Back, roll one D6. On a 3+, that unit cannot Fall Back and must Remain Stationary."],
["Eldritch Nightmare",15,"Annihilation Legion",
 "DESTROYER CULT model only. At the start of the Fight phase, each enemy unit within Engagement Range of the bearer must take a Battle-shock test."],

/* --- Cour Canoptek (codex) */
["Dimensional Sanctum",20,"Canoptek Court",
 "CRYPTEK model only. Models in the bearer's unit have the Infiltrators ability."],
["Hyperphasic Fulcrum",15,"Canoptek Court",
 "CRYPTEK model only. While the bearer is leading a unit, if that unit is wholly within your army's Power Matrix, each time a model in that unit makes an attack, re-roll a Wound roll of 1."],
["Autodivinator",15,"Canoptek Court",
 "CRYPTEK model only. Each time your opponent gains a CP as a result of an ability, roll one D6: on a 2+, you also gain 1CP. Errata du pack : ne se déclenche pas quand une règle d'une autre nature octroie des PC, ni quand l'adversaire défausse une carte de Mission Secondaire contre 1PC."],
["Metalodermal Tesla Weave",10,"Canoptek Court",
 "CRYPTEK model only. Once per phase, when an enemy unit selects the bearer's unit as a target of a charge, roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds, on a 6, that enemy unit suffers 3 mortal wounds."],

/* --- Phalange d'Obéissance (codex) */
["Honourable Combatant",10,"Obeisance Phalanx",
 "OVERLORD model only. Each time the bearer's unit destroys an enemy CHARACTER unit, your opponent loses 1CP if they have any."],
["Unflinching Will",20,"Obeisance Phalanx",
 "OVERLORD model only. The bearer's melee weapons have the [PRECISION] and [ANTI-INFANTRY 5+] abilities."],
["Warrior Noble",15,"Obeisance Phalanx",
 "OVERLORD model only. Each time a melee attack targets the bearer's unit, subtract 1 from the Hit roll."],
["Eternal Conqueror",25,"Obeisance Phalanx",
 "OVERLORD model only. Each time a model in the bearer's unit makes an attack that targets an enemy unit within range of an objective marker, you can re-roll the Hit roll."]
];
/* Anciens noms anglais des optimisations que le pack de faction
   nomme desormais en francais : les listes deja enregistrees
   continuent de retrouver leur optimisation. */
const ENH_ANCIENS = {
 "Recursive Reanimation" : "Réanimation Récursive",
 "Deepening Madness" : "Folie Croissante",
 "Dread Majesty" : "Majesté Effroyable (Aura)",
 "Miniaturised Nebuloscope" : "Nébuloscope Miniaturisé",
 "Demanding Leader" : "Noble Exigeant",
 "Chrono-impedance Fields" : "Champs de Chrono-impédance",
 "Quantum Abacus" : "Boulier Quantique",
 "Atomic Disintegrators" : "Désintégrateurs Atomiques",
 "Gauntlet of Compression" : "Gantelet de Compression",
 "Gravitic Bolas" : "Bolas Gravitiques",
 "Destroyer Ankh" : "Ankh de Destroyer",
 "Murdermind" : "Esprit Meurtrier",
 "Mark of the Nekrosor" : "Marque du Nékrosor",
 "Cursed Circlet" : "Diadème Maudit",
 "Veil of Darkness" : "Voile de Ténèbres"
};

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
"Illuminor Szeras":"80","Nekrosor Ammentar":"","Szarekh, The Silent King":"100"
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

/* ============================================================
   STRATAGEMES
   Texte officiel francais. Deux sources, toutes deux publiees
   librement par Games Workshop :
     - Necrons, Pack de Faction version 1.1 (valide a partir du
       22 juillet 2026) pour les sept detachements du pack ;
     - Warhammer 40,000, Regles de Base, section 15, pour les
       stratagemes de base.
   Les cinq detachements du codex (Dynastie Eveillee, Cour
   Canoptek, Legion d'Annihilation, Phalange d'Obeissance,
   Legion d'Hypercrypte) ne figurent pas dans ces documents :
   leurs stratagemes restent a saisir dans l'application.
   [nom, detachement, type, cout, quand, cible, effet, restrictions]
   ============================================================ */
const STRATS = [

/* --- Main de la Dynastie ------------------------------------ */
["Protocoles Prépondérants","Hand of the Dynasty","",1,
 "À la phase de Commandement.",
 "Une unité d'IMMORTELS amie.",
 "Votre unité a +1 en CO jusqu'à la fin du tour.",""],
["Volonté du Conquérant","Hand of the Dynasty","",1,
 "À la fin de votre phase de Mouvement.",
 "Une unité d'IMMORTELS/GUERRIERS NÉCRONS amie.",
 "Choisissez un objectif que votre unité contrôle. Cet objectif est sécurisé.",""],
["Nanosaturation","Hand of the Dynasty","",1,
 "À la phase de Tir adverse, quand une unité ennemie qui a ciblé une unité d'IMMORTELS/GUERRIERS NÉCRONS amie a tiré.",
 "Cette unité d'IMMORTELS/GUERRIERS NÉCRONS.",
 "Votre unité tire en utilisant le tir au jugé, mais ce faisant, elle peut seulement cibler cette unité ennemie.",""],

/* --- Fer de Lance Linceul Céleste --------------------------- */
["Mitraillage Omniverrouillé","Skyshroud Spearhead","",1,
 "À votre phase de Mouvement, quand une unité de NÉCRONS MONTÉE amie est choisie pour faire un mouvement de retraite.",
 "Cette unité de NÉCRONS MONTÉE.",
 "Ce mouvement n'empêche pas votre unité d'être éligible pour tirer.",""],
["Vif comme la Mort","Skyshroud Spearhead","",1,
 "À la phase de Mouvement adverse, quand une unité ennemie finit un mouvement à 8\" ou moins d'une unité de NÉCRONS MONTÉE amie non engagée.",
 "Cette unité de NÉCRONS MONTÉE.",
 "Votre unité peut faire un mouvement normal de D3+3\" maximum.",""],
["Protocoles d'Esquive","Skyshroud Spearhead","",1,
 "À la phase de Tir adverse, quand une unité ennemie cible une unité de NÉCRONS MONTÉE amie.",
 "Cette unité de NÉCRONS MONTÉE.",
 "Les attaques de tir qui ciblent votre unité et dont la F est supérieure à son E ont -1 aux jets de blessure.",""],

/* --- L'Arsenal du Phaëron ----------------------------------- */
["Trame Quantique Sous-surfacique","The Phaeron's Armoury","",1,
 "À la phase de Tir adverse ou à la phase de Combat, quand une unité ennemie cible une unité TITANESQUE NÉCRON amie qui a le mot-clé VOL.",
 "Cette unité TITANESQUE NÉCRON qui a le mot-clé VOL.",
 "Les attaques qui ciblent votre unité ont -1 en PA jusqu'à ce que cette unité ennemie ait attaqué.",""],
["Impulsion de Particules","The Phaeron's Armoury","",1,
 "Au début de votre phase de Tir.",
 "Une unité TITANESQUE NÉCRON amie qui a le mot-clé VOL.",
 "Choisissez une unité ennemie visible et à 12\" ou moins de votre unité : l'unité choisie a +3\" en portée de détection.",""],
["Tempête Cosmique","The Phaeron's Armoury","",1,
 "À votre phase de Tir, quand une unité d'OBÉLISQUE/CRYPTE TESSERACT amie est choisie pour tirer.",
 "Cette unité d'OBÉLISQUE/CRYPTE TESSERACT.",
 "Les Sphères Tesla de votre unité ont +1 en PA.",""],

/* --- Arsenal Brise-astres ----------------------------------- */
["Récupération Impitoyable","Starshatter Arsenal","Tactique de Bataille",2,
 "À votre phase de Tir ou à la phase de Combat.",
 "1 unité NÉCRON (unités TITANESQUES exclues) de votre armée qui n'a pas été choisie pour tirer ou combattre à cette phase.",
 "Jusqu'à la fin de la phase, à chaque attaque d'une figurine de votre unité, si la cible de l'attaque est à portée d'un ou plusieurs pions d'objectif, ajoutez 1 au jet de Blessure.",""],
["Enveloppes Inflexibles","Starshatter Arsenal","Tactique de Bataille",2,
 "À la phase de Tir adverse ou à la phase de Combat, juste après qu'une unité ennemie a choisi ses cibles.",
 "1 unité de VÉHICULE NÉCRON ou de NÉCRONS MONTÉS (unités TITANESQUES exclues) de votre armée qui a été choisie comme cible d'une ou plusieurs attaques de l'unité attaquante.",
 "Jusqu'à la fin de la phase, chaque fois qu'une attaque cible une figurine de votre unité, si la caractéristique de Force de l'attaque est supérieure à la caractéristique d'Endurance de l'unité, soustrayez 1 au jet de Blessure.",""],
["Chronodécalage","Starshatter Arsenal","Ruse Stratégique",1,
 "À votre phase de Mouvement.",
 "1 unité de VÉHICULE NÉCRON ou de NÉCRONS MONTÉS (unités TITANESQUES exclues) de votre armée qui n'a pas été choisie pour se déplacer à cette phase.",
 "Jusqu'à la fin de la phase, si votre unité Avance, ne faites pas un jet d'Avance pour elle. À la place, jusqu'à la fin de la phase, ajoutez 6\" à la caractéristique de Mouvement des figurines de votre unité.",""],
["Tunnel Dimensionnel","Starshatter Arsenal","Ruse Stratégique",1,
 "À votre phase de Mouvement.",
 "1 unité de VÉHICULE NÉCRON ou de NÉCRONS MONTÉS (unités TITANESQUES exclues) de votre armée.",
 "Jusqu'à la fin de la phase, les figurines de votre unité peuvent se déplacer à l'horizontale à travers les figurines et les éléments de terrain.",""],
["Servitude sans Fin","Starshatter Arsenal","Ruse Stratégique",1,
 "À la fin de votre phase de Combat.",
 "1 unité NÉCRON (unités TITANESQUES exclues) de votre armée qui est à portée d'un ou plusieurs pions d'objectif que vous contrôlez.",
 "Les Protocoles de Réanimation de votre unité s'activent.",""],
["Repositionnement Réactif","Starshatter Arsenal","Ruse Stratégique",1,
 "À la phase de Tir adverse, juste après qu'une unité ennemie a tiré.",
 "1 unité NÉCRON de votre armée (unités TITANESQUES exclues) qui était la cible d'une ou plusieurs attaques de l'unité attaquante.",
 "Votre unité peut faire un mouvement Normal de jusqu'à D6\".",""],

/* --- Conclave de Crypteks ----------------------------------- */
["Ciblage Moléculaire","Cryptek Conclave","Tactique de Bataille",1,
 "À votre phase de Tir ou à la phase de Combat.",
 "1 unité NÉCRON de votre armée qui n'a pas été choisie pour tirer ou combattre à cette phase.",
 "Jusqu'à la fin de la phase, à chaque attaque d'une figurine de votre unité, vous pouvez ignorer certains ou tous les modificateurs à ce qui suit : la caractéristique de Capacité de Tir ou de Capacité de Combat de l'attaque ; le jet de Touche. Si votre unité a le mot-clé CRYPTEK, vous pouvez aussi ignorer certains ou tous les modificateurs au jet de Blessure.",""],
["Nuée de Microscarabées","Cryptek Conclave","Équipement",1,
 "À la phase de Tir adverse ou à la phase de Combat, juste après qu'une unité ennemie a choisi ses cibles.",
 "1 unité d'INFANTERIE CRYPTEK de votre armée qui a été choisie comme cible d'une ou plusieurs attaques de l'unité attaquante.",
 "Si votre unité a le mot-clé GUERRIERS NÉCRONS, jusqu'à la fin de la phase, les figurines de votre unité ont une sauvegarde invulnérable de 5+. Si elle a le mot-clé IMMORTELS, jusqu'à la fin de la phase, les figurines de votre unité ont une sauvegarde invulnérable de 4+.",""],
["Malédiction Spirituelle","Cryptek Conclave","Équipement",1,
 "À la phase de Tir adverse ou à la phase de Combat, juste après qu'une unité ennemie a tiré ou combattu.",
 "1 figurine de CRYPTEK de votre armée qui a été détruite par 1 attaque de l'unité attaquante. Vous pouvez utiliser ce Stratagème sur la figurine même si elle vient d'être détruite.",
 "Jusqu'à la fin de la bataille, chaque fois qu'une figurine NÉCRON amie fait une attaque qui cible l'unité attaquante, vous pouvez relancer le jet de Touche.",""],
["Renforcement Synergétique","Cryptek Conclave","Ruse Stratégique",1,
 "Au début de votre phase de Tir.",
 "1 unité de CRYPTEK de votre armée.",
 "Choisissez 1 figurine NÉCRON amie (sauf les MONSTRES et VÉHICULES) à 12\" d'une figurine de CRYPTEK de votre unité. Jusqu'à la fin de la phase, cette figurine NÉCRON amie a le mot-clé CRYPTEK.",""],
["Pouvoir Inexploité","Cryptek Conclave","Tactique de Bataille",1,
 "À votre phase de Tir.",
 "1 unité de CRYPTEK de votre armée qui n'a pas été choisie pour tirer à cette phase.",
 "Jusqu'à la fin de la phase, chaque fois que votre unité est choisie pour tirer, quand vous choisissez une aptitude pour la Règle de Détachement Augmentations Technosorcières, vous pouvez choisir 1 aptitude supplémentaire parmi celles disponibles.",""],
["Siphon des Possibles","Cryptek Conclave","Ruse Stratégique",1,
 "À la phase de Commandement adverse.",
 "1 unité NÉCRON de votre armée à portée d'un ou plusieurs pions d'objectif.",
 "Les Protocoles de Réanimation de votre unité s'activent. Si c'est une unité de CRYPTEK, elle réanime 1 point de vie supplémentaire.",""],

/* --- Légion Maudite ----------------------------------------- */
["Meurtre Méthodique","Cursed Legion","Tactique de Bataille",1,
 "À votre phase de Tir ou à la phase de Combat.",
 "1 unité NÉCRON (MONSTRES et VÉHICULES exclus) de votre armée qui n'a pas été choisie pour tirer ou combattre à cette phase.",
 "Jusqu'à la fin de la phase, les armes dont sont équipées les figurines de votre unité ont l'aptitude [TOUCHES SOUTENUES 1].",""],
["Image de la Mort","Cursed Legion","Tactique de Bataille",1,
 "À la phase de Tir adverse ou à la phase de Combat, juste après qu'une unité ennemie a choisi ses cibles.",
 "1 unité de CULTE DESTROYER de votre armée qui a été choisie comme cible d'une ou plusieurs attaques de l'unité attaquante.",
 "Jusqu'à la fin de la phase, chaque fois qu'une attaque cible votre unité, soustrayez 1 au jet de Touche.",""],
["Protocoles Mortis","Cursed Legion","Ruse Stratégique",1,
 "À votre phase de Tir ou à la phase de Combat, juste après la première fois qu'une unité de CULTE DESTROYER de votre armée a détruit une unité ennemie à ce tour.",
 "1 unité NÉCRON amie (MONSTRES et VÉHICULES exclus) à 9\" de l'unité de CULTE DESTROYER.",
 "Les Protocoles de Réanimation de l'unité amie ciblée s'activent.",""],
["Poussés à la Boucherie","Cursed Legion","Ruse Stratégique",1,
 "À votre phase de Tir ou votre phase de Charge.",
 "1 unité de CULTE DESTROYER de votre armée.",
 "Jusqu'à la fin du tour, votre unité est éligible pour tirer et déclarer une charge à un tour où elle a Avancé.",
 "Vous pouvez utiliser ce Stratagème une seule fois par tour."],
["Démence Contagieuse","Cursed Legion","Tactique de Bataille",1,
 "À votre phase de Charge.",
 "1 unité NÉCRON (MONSTRES et VÉHICULES exclus) de votre armée qui n'a pas déclaré une charge à cette phase.",
 "Jusqu'à la fin de la phase, chaque fois que votre unité déclare une charge, si une ou plusieurs cibles de cette charge sont à Portée d'Engagement d'une ou plusieurs unités amies, ajoutez 2 au jet de Charge.",""],
["Agressivité contre Nature","Cursed Legion","Ruse Stratégique",2,
 "À la fin de la phase de Charge adverse.",
 "1 unité NÉCRON (MONSTRES et VÉHICULES exclus) de votre armée qui est à 6\" d'une ou plusieurs unités ennemies et qui serait éligible pour déclarer une charge contre une ou plusieurs de ces unités ennemies si c'était votre phase de Charge.",
 "Votre unité déclare à présent une charge qui peut seulement cibler une ou plusieurs de ces unités ennemies, et vous résolvez cette charge. Notez que même si cette charge est réussie, votre unité ne reçoit pas de bonus de Charge à ce tour.",""],

/* --- Panthéon de Malheur ------------------------------------ */
["Cascade Disharmonique","Pantheon of Woe","Fait Épique",1,
 "À n'importe quelle phase, juste après qu'une figurine de MONSTRE NÉCRON de votre armée a été détruite, avant de faire son jet de Destruction Néfaste.",
 "Cette figurine de MONSTRE NÉCRON. Vous pouvez utiliser ce Stratagème sur la figurine même si elle vient d'être détruite.",
 "Jusqu'à la fin de la phase, l'aptitude Destruction Néfaste de votre figurine inflige des blessures mortelles sur un jet d'un D6 de 3+ au lieu de 6.",""],
["Érosion Moléculaire","Pantheon of Woe","Ruse Stratégique",1,
 "À la phase de Commandement.",
 "1 unité de MONSTRE NÉCRON de votre armée.",
 "Choisissez 1 unité ennemie effritée visible de votre unité. L'unité ennemie doit faire un test d'Ébranlement. Ce faisant, soustrayez 1 au résultat. En cas d'échec à ce test, l'unité ennemie subit D3+1 blessures mortelles.",
 "Vous pouvez utiliser ce Stratagème une seule fois par round de bataille."],
["Transmogrification de Masse","Pantheon of Woe","Fait Épique",1,
 "À votre phase de Tir ou à la phase de Combat, juste après qu'une unité de MONSTRE NÉCRON de votre armée a détruit une unité ennemie.",
 "1 unité NÉCRON amie (sauf les MONSTRES) à 6\" de l'unité de MONSTRE.",
 "Si l'unité ennemie était effritée au début de la phase, les Protocoles de Réanimation de votre unité amie s'activent.",
 "Vous pouvez utiliser ce Stratagème une seule fois par tour."],
["Ciblage d'Aura Entrophasique","Pantheon of Woe","Tactique de Bataille",1,
 "À votre phase de Tir ou à la phase de Combat.",
 "1 unité NÉCRON (sauf les MONSTRES) de votre armée qui n'a pas été choisie pour tirer ou combattre à cette phase.",
 "Jusqu'à la fin de la phase, à chaque attaque d'une figurine de votre unité qui cible une unité ennemie, relancez tout jet de Touche de 1. Si la cible de l'attaque est effritée, relancez tout jet de Blessure de 1 également.",""],
["Chronodistorsion","Pantheon of Woe","Tactique de Bataille",1,
 "À la phase de Combat, juste après qu'une unité ennemie a choisi ses cibles.",
 "1 unité NÉCRON de votre armée qui a été choisie comme cible d'une ou plusieurs attaques de l'unité attaquante.",
 "Jusqu'à la fin de la phase, chaque fois qu'une figurine de votre unité est détruite, si la figurine n'a pas combattu à cette phase, jetez 1 D6, en ajoutant 1 si l'unité attaquante est effritée : sur 4+, ne retirez pas la figurine détruite du jeu ; elle peut combattre après que l'unité attaquante a résolu ses attaques, puis elle est retirée du jeu.",""],
["Dissolution de Phase","Pantheon of Woe","Ruse Stratégique",1,
 "À la phase de Mouvement adverse, quand une unité ennemie effritée est choisie pour Battre en Retraite.",
 "1 unité NÉCRON de votre armée qui est à Portée d'Engagement de l'unité ennemie.",
 "Quand l'unité ennemie Bat en Retraite, toutes ses figurines doivent faire un test de Fuite Désespérée. Ce faisant, si l'unité ennemie est Ébranlée, soustrayez 1 à chacun de ces tests.",""],

/* --- Stratagèmes de base (Règles de Base, section 15) -------- */
["Relance de Commandement","Core","Core",1,
 "À n'importe quelle phase, juste après que vous avez fait un des jets suivants pour une unité ou une figurine amie : jet d'avance, jet de charge, jet de dégâts, jet de risque, jet de touche, jet de sauvegarde, jet de blessure, ou un jet pour déterminer le nombre d'attaques générées par une arme.",
 "Cette unité ou figurine.",
 "Vous relancez ce jet. Si vous jetez plus d'un dé en même temps, choisissez l'un de ces dés pour le relancer (sauf pour les jets de charge, que vous devez relancer entièrement).",""],
["Défi Épique","Core","Core",1,
 "À la phase de Combat, juste après qu'une unité de PERSONNAGE amie a été choisie pour combattre.",
 "Cette unité de PERSONNAGE.",
 "Choisissez 1 figurine de PERSONNAGE de votre unité. Jusqu'à la fin de la phase, les armes de mêlée de cette figurine ont l'aptitude [PRÉCISION].",""],
["Courage Insensé","Core","Core",1,
 "À l'étape d'Ébranlement de votre phase de Commandement, juste avant que vous fassiez un jet d'ébranlement pour une unité amie.",
 "Cette unité.",
 "Ce jet d'ébranlement est automatiquement réussi.",
 "Vous ne pouvez pas utiliser ce stratagème plus d'une fois par bataille."],
["Explosifs","Core","Core",1,
 "À votre phase de Tir.",
 "1 unité à EXPLOSIFS/GRENADES non engagée amie qui est éligible pour tirer et n'a pas fait de mouvement d'avance à ce tour.",
 "1. Choisissez 1 figurine à EXPLOSIFS/GRENADES de votre unité. 2. Choisissez 1 unité ennemie non engagée à 8\" ou moins et visible de cette figurine. 3. Jetez six D6 : pour chaque 4+, cette unité ennemie subit 1 blessure mortelle.",""],
["Impact Écrasant","Core","Core",1,
 "À votre phase de Charge, juste après qu'une unité de MONSTRE/VÉHICULE amie a fini un mouvement de charge.",
 "Cette unité de MONSTRE/VÉHICULE.",
 "1. Choisissez 1 unité ennemie engagée avec votre unité. 2. Choisissez 1 figurine de votre unité engagée avec cette unité ennemie. 3. Jetez autant de D6 que la caractéristique d'E de cette figurine : pour chaque 1, votre unité subit 1 blessure mortelle ; pour chaque 5+, l'unité ennemie subit 1 blessure mortelle (jusqu'à un maximum de 6 blessures mortelles par unité).",""],
["Arrivée Précipitée","Core","Core",1,
 "À la fin de la phase de Mouvement adverse.",
 "1 unité amie qui est en réserve stratégique (sauf les AÉRODYNES).",
 "Votre unité effectue un mouvement d'arrivée.",
 "Vous ne pouvez pas utiliser ce stratagème pendant le premier round de bataille."],
["Tir en État d'Alerte","Core","Core",1,
 "À la fin de la phase de Mouvement adverse.",
 "1 unité non engagée amie (sauf les unités TITANESQUES).",
 "Votre unité tire en utilisant le tir au jugé : elle peut cibler une seule unité ennemie visible à 24\" ou moins, chaque attaque touche seulement sur un jet de touche non modifié de 6 quels que soient la CT et les modificateurs, et les jets de touche ne peuvent pas être relancés. Après avoir tiré, votre unité n'est plus éligible pour entreprendre une action jusqu'à la fin de la phase.",""],
["Écran de Fumée","Core","Core",1,
 "Au début de la phase de Tir adverse.",
 "1 unité à FUMÉE amie.",
 "Jusqu'à la fin de la phase, à chaque attaque qui cible soit votre unité à FUMÉE, soit une unité qui n'est pas entièrement visible de la figurine attaquante à cause d'une ou plusieurs figurines de votre unité à FUMÉE, la cible a le bénéfice du couvert contre l'attaque.",""],
["Intervention Héroïque","Core","Core",1,
 "À la fin de la phase de Charge adverse.",
 "1 unité non engagée amie à 12\" ou moins d'une ou plusieurs unités ennemies. Vous pouvez choisir une unité de VÉHICULE seulement si c'est une unité de PERSONNAGE/MARCHEUR.",
 "Résolvez une charge avec votre unité. Ce faisant, avant de faire le jet de charge, vous devez choisir 1 des modes suivants. Bondir pour Défendre : quand vous choisissez des cibles de charge, vous pouvez seulement choisir des unités ennemies qui ont effectué un mouvement de charge à cette phase et qui sont dans la distance maximale. Dans la Mêlée (+1PC) : quand vous faites le jet de charge, si le résultat est supérieur à 6 après modificateurs, changez-le par 6 ; quand vous choisissez des cibles de charge, vous pouvez choisir une ou plusieurs unités ennemies qui sont à 6\" ou moins de votre unité et dans la distance maximale.",
 "Le mode « Dans la Mêlée » coûte 1PC de plus."],
["Contre-Offensive","Core","Core",2,
 "À l'étape Combattre de la phase de Combat adverse, juste après qu'une unité ennemie a résolu ses attaques.",
 "1 unité amie qui est éligible pour combattre.",
 "Jusqu'à la fin de la phase, votre unité a l'aptitude Combat en Premier et elle doit être la prochaine unité que vous choisissez pour combattre.",""]
];

/* ============================================================
   MENACES TYPES
   [nom, attaques par tireur, CT/CC, Force, PA, Dégâts, mots-clés, note]
   Archétypes destinés à jauger la survie d'une unité, pas des
   profils officiels : les listes adverses sont trop variées pour
   être modélisées. Valeurs indicatives, ajustables à l'écran.
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
   CATÉGORIES
   [nom, catégorie principale] — la première qui s'applique dans
   l'ordre Epic Hero, Personnage, Battleline, Infanterie, Bête,
   Monté, Véhicule, Monstre. Reprises des mots-clés du catalogue
   BattleScribe, elles servent à ranger le choix d'unité.
   ============================================================ */
const CAT = [
["Necron Warriors","Battleline"],
["Immortals","Battleline"],
["Lychguard","Infanterie"],
["Deathmarks","Infanterie"],
["Flayed Ones","Infanterie"],
["Triarch Praetorians","Infanterie"],
["Cryptothralls","Infanterie"],
["Skorpekh Destroyers","Infanterie"],
["Ophydian Destroyers","Infanterie"],
["Lokhust Destroyers","Monté"],
["Lokhust Heavy Destroyers","Monté"],
["Tomb Blades","Monté"],
["Canoptek Scarab Swarms","Bête"],
["Canoptek Wraiths","Bête"],
["Canoptek Spyders","Véhicule"],
["Canoptek Reanimator","Véhicule"],
["Canoptek Doomstalker","Véhicule"],
["Canoptek Macrocytes","Bête"],
["Canoptek Tomb Crawlers","Bête"],
["Triarch Stalker","Véhicule"],
["Doomsday Ark","Véhicule"],
["Ghost Ark","Véhicule"],
["Annihilation Barge","Véhicule"],
["Monolith","Véhicule"],
["Obelisk","Véhicule"],
["Tesseract Vault","Véhicule"],
["Doom Scythe","Véhicule"],
["Night Scythe","Véhicule"],
["Overlord","Personnage"],
["Royal Warden","Personnage"],
["Lokhust Lord","Personnage"],
["Skorpekh Lord","Personnage"],
["Hexmark Destroyer","Personnage"],
["Technomancer","Personnage"],
["Plasmancer","Personnage"],
["Chronomancer","Personnage"],
["Psychomancer","Personnage"],
["Geomancer","Personnage"],
["Catacomb Command Barge","Personnage"],
["C'tan Shard of the Nightbringer","Monstre"],
["C'tan Shard of the Deceiver","Monstre"],
["C'tan Shard of the Void Dragon","Monstre"],
["Transcendent C'tan","Monstre"],
["Imotekh the Stormlord","Epic Hero"],
["Trazyn the Infinite","Epic Hero"],
["Orikan the Diviner","Epic Hero"],
["Illuminor Szeras","Epic Hero"],
["Nekrosor Ammentar","Epic Hero"],
["Szarekh, The Silent King","Epic Hero"],
["Convergence of Dominion","Fortification"]
];
const CAT_ORDRE = ["Epic Hero","Personnage","Battleline","Infanterie","Bête","Monté","Véhicule","Monstre","Fortification","Autre"];

/* ============================================================
   APTITUDES : les aptitudes propres a chaque unite.
   Texte anglais repris tel quel du catalogue BattleScribe — pas
   de traduction maison, une regle mal traduite se paie en partie.
   ============================================================ */
const APTITUDES = {
 "Convergence of Dominion" : [
  ["Reanimation Nodes (Aura)","While a friendly NECRONS INFANTRY unit is within 6\" of this FORTIFICATION, models in that unit have the Feel No Pain 6+ ability."],
  ["Ancient Cover","Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this FORTIFICATION, that model has the Benefit of Cover against that attack."],
  ["Deployment","When this unit is first set up on the battlefield, its models do not have to be set up in Unit Coherency. Instead, each model must be set up wholly within 12\" of one other model from its unit. From that point on, each model in this unit is treated as a separate unit."]
 ],
 "Necron Warriors" : [
  ["Leur Nombre Est Légion","Quand les Protocoles de Réanimation de cette unité s'activent, vous pouvez relancer le dé. Le pack confirme que cette aptitude s'applique aussi quand la réanimation vient du Stratagème Protocole des Légions Impérissables."]
 ],
 "Immortals" : [
  ["Implacable Eradication","Each time a model in this unit makes an attack, re-roll a Wound roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Wound roll instead."]
 ],
 "Lychguard" : [
  ["Dispersion Shield","The bearer has a 4+ invulnerable save."],
  ["Guardian Protocols","While a NOBLE model is leading this unit, each time an attack targets this unit, if the Strength characteristic of that attack is greater than the Toughness characteristic of this unit, subtract 1 from the Wound roll."]
 ],
 "Deathmarks" : [
  ["Hyperspace Hunters","Once per turn, in the Reinforcements step of your opponent's Movement phase, when an enemy unit is set up on the battlefield from Reserves within 18\" of and visible to this unit, this unit can shoot as if it were your Shooting phase, but must only target that enemy unit when doing so, and can only do so if that enemy unit is an eligible target."]
 ],
 "Flayed Ones" : [
  ["Flesh Hunger","Each time a model in this unit makes a melee attack, if the target of that attack is Below Half-strength, a successful Hit roll scores a Critical Hit."]
 ],
 "Triarch Praetorians" : [
  ["Relentless Combatants","You can re-roll Charge rolls made for this unit, and this unit is eligible to declare a charge in a turn in which it Fell Back."]
 ],
 "Cryptothralls" : [
  ["Bound Creation","While this unit is in the same unit as a CRYPTEK model, that CRYPTEK model has the Feel No Pain 4+ ability."],
  ["Systematic Vigour","Each time a CRYPTOTHRALL model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6: on a 2+, do not remove it from play. The destroyed model can fight after the attacking model's unit has finished making its attacks, and it is then removed from play."],
  ["Cryptek Retinue","At the start of the Declare Battle Formations step, this unit can join one other unit from your army that is being led by a CRYPTEK model (a unit cannot have more than one CRYPTOTHRALLS unit joined to it). If it does, until the end of the battle, every model in this unit counts as being part of that Bodyguard unit, and that Bodyguard unit's Starting Strength is increased accordingly."]
 ],
 "Skorpekh Destroyers" : [
  ["Whirling Onslaught","Each time a model in this unit makes a melee attack, re-roll a Hit roll of 1. If this unit made a Charge move this turn, you can re-roll the Hit roll instead."]
 ],
 "Ophydian Destroyers" : [
  ["Horreurs Fouisseuses","À la fin du tour adverse, si cette unité est non engagée, vous pouvez utiliser cette aptitude. Dans ce cas : ▪ placez cette unité en réserve stratégique ; ▪ cette unité doit faire un mouvement d'arrivée à votre prochaine phase de Mouvement, y compris à votre premier tour. Texte remplacé par le pack de faction v1.1."]
 ],
 "Lokhust Destroyers" : [
  ["Hard-wired for Destruction","Each time a model in this unit makes a ranged attack that targets the closest eligible enemy unit, re-roll a Hit roll of 1. If the target of that attack is within range of an objective marker your opponent controls, you can re-roll the Hit roll instead."]
 ],
 "Lokhust Heavy Destroyers" : [
  ["Optimised for Slaughter","Each time a model in this unit makes an attack with an enmitic exterminator that targets a unit (excluding MONSTERS and VEHICLES), re-roll a Wound roll of 1. Each time a model in this unit makes an attack with a gauss destructor against a MONSTER or VEHICLE unit, re-roll a Wound roll of 1."]
 ],
 "Tomb Blades" : [
  ["Evasion Engrams","In your Shooting phase, after this unit has shot, it can make a Normal Move of up to 6\". If it does, until the end of the turn, this unit is not eligible to declare a charge."],
  ["Shadowloom","The bearer has the Stealth ability."],
  ["Nebuloscope","Ranged weapons equipped by the bearer have the [IGNORES COVER] ability."],
  ["Shieldvanes","The bearer has a Save characteristic of 3+ and a Move characteristic of 8\"."]
 ],
 "Canoptek Scarab Swarms" : [
  ["Self-destruction","At the start of the Fight phase, if this unit is within Engagement Range of one or more enemy units, you can select one model in this unit to destroy. If you do, select one enemy unit within Engagement Range of that model and roll one D6, adding 1 to the result if that unit is a VEHICLE. On a 2-5, that unit suffers D3 mortal wounds; on a 6+, that unit suffers 3 mortal wounds."],
  ["Chittering Swarm","While an enemy unit is within Engagement Range of this unit, subtract 1 from the Objective Control characteristic of models in that enemy unit (to a minimum of 1). While this unit is within 6\" of one or more friendly CRYPTEK models, the Objective Control characteristic of models in this unit is 1."]
 ],
 "Canoptek Wraiths" : [
  ["Wraith Form","Each time this unit ends a Normal move, you can select one enemy unit it moved over during that move and roll one D6 for each model in this unit: for each 4+, that enemy unit suffers 1 mortal wound."]
 ],
 "Canoptek Spyders" : [
  ["Fabricator Claw Array (Aura)","While a friendly NECRONS VEHICLE unit is within 6\" of the bearer, models in that unit have the Feel No Pain 6+ ability."],
  ["Canoptek Swarm","In your Command phase, select one friendly CANOPTEK SCARAB SWARM unit within 6\" of this unit. One destroyed model is returned to that CANOPTEK SCARAB SWARM unit for each SPYDER model in this unit."]
 ],
 "Canoptek Reanimator" : [
  ["Faisceau de Réanimation de Nanoscarabées (Aura)","Tant qu'une unité NÉCRONS amie est à 3\" de cette figurine, chaque fois que les Protocoles de Réanimation de l'unité amie s'activent, l'unité amie soigne D3 points de vie supplémentaires. Texte remplacé par le pack de faction v1.1."]
 ],
 "Canoptek Doomstalker" : [
  ["Damaged: 1-4 wounds remaining","While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."],
  ["Sentinel Construct","Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+."]
 ],
 "Canoptek Macrocytes" : [
  ["Aptitudes de base","Éclaireurs 8\"."],
  ["Essaim Harceleur (Aura)","Tant qu'une unité ennemie (MONSTRES et VÉHICULES exclus) est à 3\" de cette unité, à chaque attaque d'une figurine de l'unité, soustrayez 1 au jet de Touche."],
  ["Mandibule accélératrice (équipement)","Au début de la phase de Combat, choisissez 1 unité CANOPTEK amie à 3\" de l'unité du porteur. Jusqu'à la fin de la phase, améliorez de 1 la caractéristique de Capacité de Combat des armes dont sont équipées les figurines de l'unité."],
  ["Projecteur de nanoscarabées (équipement)","Une fois par round de bataille, quand une unité de NÉCRONS amie à 3\" du porteur active ses Protocoles de Réanimation, le porteur peut utiliser cette aptitude. Dans ce cas, l'unité réanime 1 PV supplémentaire."],
  ["Composition","5 Macrocytes Canopteks, chacun équipé d'un scalpel Gauss et de griffes. Toutes les figurines peuvent échanger leur scalpel Gauss contre un projecteur Tesla ; 1 figurine peut prendre à la place un faisceau atomiseur et un projecteur de nanoscarabées ; 1 figurine peut prendre à la place une mandibule accélératrice."]
 ],
 "Canoptek Tomb Crawlers" : [
  ["Arme Sentinelle","À chaque attaque de tir d'une figurine de cette unité qui cible une unité à 12\", vous pouvez ignorer certains ou tous les modificateurs à ce qui suit : la caractéristique de Capacité de Tir de l'attaque ; le jet de Touche ; le jet de Blessure."],
  ["Suite Canoptek","Au début de l'étape Déclarer les Formations de Bataille, cette unité peut rejoindre 1 autre unité de votre armée qui est menée par une figurine de CRYPTEK. Une unité ne peut pas avoir plus de 1 unité d'Arpenteurs Sépulcraux jointe à elle, ni avoir à la fois une unité d'Arpenteurs Sépulcraux et de Cryptoserfs. Dans ce cas, jusqu'à la fin de la bataille, toutes les figurines de cette unité comptent comme faisant partie de l'unité de Gardes du Corps, et l'Effectif Initial de celle-ci est augmenté en conséquence."],
  ["Composition","2 Arpenteurs Sépulcraux Canopteks, chacun équipé d'une faucheuse Gauss jumelée et de griffes. 1 figurine peut échanger sa faucheuse Gauss jumelée contre 1 isolateur transdimensionnel."]
 ],
 "Triarch Stalker" : [
  ["Targeting Relay","In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that unit cannot have the Benefit of Cover."]
 ],
 "Doomsday Ark" : [
  ["Damaged: 1-5 wounds remaining","While this model has 1-5 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."],
  ["Overwhelming Obliteration","In your Movement phase, if this model Remains Stationary, until the end of the turn, its doomsday cannon has the [DEVASTATING WOUNDS] ability."]
 ],
 "Ghost Ark" : [
  ["Repair Barge","Once per turn, just after an enemy unit finishes making its attacks, if one or more friendly NECRON WARRIORS units within 3\" of this model lost one or more wounds as a result of those attacks, this model can use this ability. If it does, select one of those NECRON WARRIORS units; that unit's Reanimation Protocols activate. The same NECRON WARRIORS unit cannot be selected for this ability more than once per turn."]
 ],
 "Annihilation Barge" : [
  ["Malevolent Arcing","In your Shooting phase, each time you select a target for this model's twin tesla destructor, roll one D6 for the target unit and one D6 for every other enemy unit within 3\" of the target unit. On a 5+, the unit being rolled for is struck by arcing energies; after resolving all of this model's attacks against the target unit, each unit struck by arcing energies suffers D3 mortal wounds."]
 ],
 "Monolith" : [
  ["Damaged: 1-7 wounds remaining","While this model has 1-7 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."],
  ["Portail d'Éternité","À votre phase de mouvement (hormis au premier round de bataille), vous pouvez choisir 1 unité d'INFANTERIE NÉCRON qui est soit en réserve stratégique, soit sur le champ de bataille (si vous choisissez une unité sur le champ de bataille, retirez-la du champ de bataille et placez-la en réserve stratégique). L'unité choisie peut faire un mouvement d'arrivée, et doit être placée entièrement à 6\" ou moins de cette unité, et ne doit être engagée avec aucune unité ennemie. L'unité choisie ne peut pas faire de mouvement de charge à ce tour. Elle n'a pas à être placée à 6\" ou moins d'un bord du champ de bataille et reste éligible pour tirer. Texte remplacé par le pack de faction v1.1."]
 ],
 "Obelisk" : [
  ["Damaged: 1-8 wounds remaining","While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and each time this model makes an attack, subtract 1 from the Hit roll."],
  ["Gravitic Pulse","At the start of your opponent's Movement phase, you can select one enemy unit within 18\" of and visible to this model. Until the end of the turn, halve the Move characteristic of models in that unit and halve Advance and Charge rolls made for that unit. In addition, if that unit can FLY, until the start of your next Movement phase, roll one D6 each time that unit ends any type of move: on a 4+, that unit suffers D3 mortal wounds."]
 ],
 "Tesseract Vault" : [
  ["Damaged: 1-8 wounds remaining","While this model has 1-8 wounds remaining, subtract 4 from its Objective Control characteristic and you can only select one of the C'tan Powers weapons in your Shooting phase, instead of two."],
  ["Powers of the C'tan","In your Shooting phase, when this model is selected to shoot, first select up to 2 different C'tan Powers weapons. Until the end of the phase, this model is equipped with those weapons in addition to its other weapons (this model cannot make attacks with any other C'tan Powers weapon you did not select in this way this phase)."]
 ],
 "Doom Scythe" : [
  ["Atavistic Instigation","Each time this model targets an enemy unit with its heavy death ray, your opponent must declare if that unit will stand firm or duck for cover: ■ If it stands firm, when resolving attacks against that unit this phase, a successful unmodified Hit roll of 5+ scores a Critical Hit. ■ If it ducks for cover, until the start of your next Shooting phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll."],
  ["Damaged: 1-4 wounds remaining","While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."]
 ],
 "Night Scythe" : [
  ["Invasion Beams","At the end of the Fight phase, if there are no models currently embarked within this TRANSPORT, you can select one friendly NECRONS INFANTRY unit wholly within 6\" of this TRANSPORT. Unless that unit is within Engagement Range of one or more enemy units, it can embark within this TRANSPORT."],
  ["Damaged: 1-4 wounds remaining","While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."],
  ["Quantum Invader","This model can be set up in the Reinforcements step of your first, second or third Movement phase, regardless of any mission rules."]
 ],
 "Overlord" : [
  ["Implacable Resilience","Each time an attack is allocated to this model, subtract 1 from that attack's Damage characteristic."]
 ],
 "Royal Warden" : [
  ["Adaptive Strategy","This model's unit is eligible to shoot and declare a charge in a turn in which it Fell Back."],
  ["Engrammatic Logic","Once per battle, at the start of any phase, you can select one friendly NECRONS unit that is Battle-shocked and within 12\" of this model. That unit is no longer Battle-shocked."]
 ],
 "Lokhust Lord" : [
  ["Destroyer Cult","While this model is leading a unit, each time a model in that unit makes a ranged attack, a successful unmodifed Hit roll of 5+ scores a Critical Hit."],
  ["Driven by Hatred","Each time this model makes an attack that targets an enemy unit that is Below Half-strength, you can re-roll the Hit roll and you can re-roll the Wound roll."],
  ["Nanoscarab amulet","The bearer has the Feel No Pain 5+ ability."],
  ["Résurrection","(Une fois par bataille, par unité) À la fin de n'importe quelle phase, vous pouvez utiliser cette aptitude. Dans ce cas, cette unité ressuscite : ses Protocoles de Réanimation s'activent, mais l'unité soigne D6 points de vie au lieu de D3. Vous ne pouvez pas ressusciter plus d'une unité par tour. Texte donné par le pack de faction v1.1 pour le Seigneur Lokhust et le Tétrarque."]
 ],
 "Skorpekh Lord" : [
  ["United In Destruction","While this model is leading a unit, melee weapons equipped by models in that unit have the [LETHAL HITS] ability."],
  ["Crimson Harvest","Each time this model ends a Charge move, select one enemy unit within Engagement Range of this model and roll one D6: on a 2-5, that unit suffers D3 mortal wounds; on a 6, that unit suffers D3+3 mortal wounds."]
 ],
 "Hexmark Destroyer" : [
  ["Inescapable Death","Once per turn, one unit from your army with this ability can be targeted with the Fire Overwatch Stratagem for 0CP, even if you have already used that Stratagem on a different unit this phase. In addition, each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 2+."],
  ["Multi-threat Eliminator","Once per turn, in your opponent's Shooting phase, when an enemy unit makes a ranged attack that targets a friendly NECRONS unit within 3\" of a model with this ability, after that enemy has shot, one model with this ability that is within 3\" of that target can shoot as if it were your Shooting phase, but must target that enemy unit when doing so, and can only do so if that enemy unit is an eligible target."]
 ],
 "Technomancer" : [
  ["Rites of Reanimation","While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability."],
  ["Technomancer","At the end of your Movement phase, select one friendly NECRONS model within 6\" of the bearer. That model regains up to D3 lost wounds. Each model can only be selected for this ability once per turn."]
 ],
 "Plasmancer" : [
  ["Harbinger of Destruction","While this model is leading a unit, each time a model in that unit makes a ranged attack, a successful unmodifed Hit roll of 5+ scores a Critical Hit."],
  ["Foudre Consciente","À votre phase de Tir, choisissez 1 unité ennemie à 18\" ou moins et visible de cette figurine (à l'exclusion des unités avec l'aptitude Agent Solitaire qui ne font pas partie d'une unité Attachée et qui sont à plus de 12\" de cette figurine) et jetez quatre D6 : pour chaque 4+, l'unité ennemie subit 1 blessure mortelle. Texte remplacé par le pack de faction v1.1."]
 ],
 "Chronomancer" : [
  ["Cape d'Uchronie","▪ Cette unité a Discrétion. ▪ Les attaques de mêlée qui ciblent cette unité ont -1 aux jets de touche. Texte remplacé par le pack de faction v1.1."],
  ["Chronometron","In your Shooting phase, after this model's unit has shot, if it is not within Engagement Range of any enemy units, that unit can make a Normal move of up to 5\". If it does, until the end of the turn, that unit is not eligible to declare a charge."]
 ],
 "Psychomancer" : [
  ["Nightmare Shroud (Aura)","In the Battle-shock step of your opponent's Command phase, if an enemy unit that is below its Starting Strength is within 6\" of this model, that enemy unit must take a Battle-shock test, subtracting 1 from the roll when it does so."],
  ["Harbinger of Despair","Once per turn, at the start of your Command, Movement, Shooting, Charge or Fight phase, you can select one enemy unit within 18\" of this model. That unit must take a Battle-shock test, subtracting 1 from the roll when it does so."]
 ],
 "Geomancer" : [
  ["Aptitudes de base","Appui. Le pack retire « Meneur » aux Crypteks et leur donne « Appui » (page 30). La fiche du Géomancien, page 17 du même document, porte encore « Meneur » : le pack se contredit sur ce point."],
  ["Réverbération Tectonique","À votre phase de Mouvement, vous pouvez choisir 1 unité ennemie à 18\" et visible de cette figurine. Jusqu'au début de votre prochaine phase de Mouvement, l'unité ennemie est entravée. Tant qu'une unité est entravée, soustrayez 2 à sa caractéristique de Mouvement et soustrayez 2 à ses jets de Charge."],
  ["Contrôle d'Obélisque Nodal","Tant que cette figurine est à portée d'un pion d'objectif que vous contrôlez, les unités ennemies qui sont placées sur le champ de bataille depuis les Réserves ne peuvent pas être placées à 12\" de cette figurine."],
  ["Protocoles d'Avant-garde","Si cette figurine est attachée à une unité de Macrocytes Canopteks à l'étape Déclarer les Formations de Bataille, cette figurine a l'aptitude Éclaireurs 8\"."],
  ["Meneur (fiche du pack)","Cette figurine peut être attachée aux unités suivantes : Macrocytes Canopteks, Immortels, Guerriers Nécrons. Vous pouvez l'attacher même si une figurine de Garde Royal ou de Noble a déjà été attachée à l'unité."]
 ],
 "Catacomb Command Barge" : [
  ["Carrier Wave (Aura)","While a friendly NECRONS unit is within 6\" of this model, add 1 to the Objective Control characteristic of models in that unit."],
  ["Advanced Quantum Shielding","Each time an attack targets this model, if the Strength characteristic of that attack is greater than this model's Toughness characteristic, subtract 1 from the Wound roll."],
  ["Orbe de Résurrection","(Une fois par bataille, par unité) À la fin de n'importe quelle phase, vous pouvez utiliser cette aptitude. Dans ce cas, vous pouvez choisir une unité d'INFANTERIE/MONTÉE NÉCRON amie à 6\" ou moins de cette unité. L'unité choisie ressuscite : ses Protocoles de Réanimation s'activent, mais elle soigne D6 points de vie au lieu de D3. Vous ne pouvez pas ressusciter plus d'une unité par tour, et une unité ne peut pas être affectée par un Orbe de Résurrection plus d'une fois par tour. Le pack ajoute aussi le mot-clé NOBLE à cette fiche."]
 ],
 "C'tan Shard of the Nightbringer" : [
  ["Aptitudes de base","Destruction Néfaste D6, Frappe en Profondeur, Insensible à la Douleur 5+."],
  ["Sauvegarde invulnérable","4+."],
  ["Drain de Vie","À la fin de la phase de Combat, jetez 1 D6 pour chaque unité ennemie à 6\" de cette figurine : sur 4+, l'unité ennemie subit D3 blessures mortelles."],
  ["Nécroderme","À chaque attaque qui cible cette figurine, soustrayez 1 à la caractéristique de Dégâts de l'attaque."],
  ["Dieu Stellaire Asservi","Cette figurine ne peut pas être votre Seigneur de Guerre."],
  ["Aiguillon Quantique — Panthéon de Malheur","Entrave Nécrodermique imposée par ce détachement : cette figurine est éligible pour déclarer une charge à un tour où elle a Avancé. Son coût en points augmente du montant indiqué dans l'Inventaire du Munitorum."]
 ],
 "C'tan Shard of the Deceiver" : [
  ["Aptitudes de base","Destruction Néfaste D6, Frappe en Profondeur, Insensible à la Douleur 5+, Discrétion."],
  ["Sauvegarde invulnérable","4+."],
  ["Grande Illusion","Si votre armée inclut cette figurine, après que les deux joueurs ont déployé leurs armées, choisissez jusqu'à trois unités de NÉCRONS de votre armée et redéployez-les. Ce faisant, une ou plusieurs de ces unités peuvent être placées en Réserve Stratégique, quel que soit le nombre d'unités s'y trouvant déjà."],
  ["Nécroderme","À chaque attaque qui cible cette figurine, soustrayez 1 à la caractéristique de Dégâts de l'attaque."],
  ["Dieu Stellaire Asservi","Cette figurine ne peut pas être votre Seigneur de Guerre."],
  ["Matrice de Singularité — Panthéon de Malheur","Entrave Nécrodermique imposée par ce détachement. Seigneur de la Duperie (Aura) : chaque fois que votre adversaire cible une unité de son armée avec un Stratagème, si l'unité est à 12\" de cette figurine, augmentez de 1PC le coût de cette utilisation."]
 ],
 "C'tan Shard of the Void Dragon" : [
  ["Aptitudes de base","Destruction Néfaste D6, Frappe en Profondeur, Insensible à la Douleur 5+."],
  ["Sauvegarde invulnérable","4+."],
  ["Absorption de Matière","Au début de votre phase de Tir, choisissez 1 unité de VÉHICULE ennemie à 12\" de cette figurine et jetez 1 D6 : sur 2+, l'unité ennemie subit D3 blessures mortelles et cette figurine récupère jusqu'à ce nombre de PV perdus."],
  ["Nécroderme","À chaque attaque qui cible cette figurine, soustrayez 1 à la caractéristique de Dégâts de l'attaque."],
  ["Dieu Stellaire Asservi","Cette figurine ne peut pas être votre Seigneur de Guerre."],
  ["Sourdine Spirituelle — Panthéon de Malheur","Entrave Nécrodermique imposée par ce détachement : une fois par tour, au début de la phase de Tir adverse, choisissez 1 unité de VÉHICULE ennemie visible du porteur. L'unité doit faire un test de Commandement. Jusqu'à la fin de la phase, à chaque attaque d'une figurine de l'unité, soustrayez 1 au jet de Touche et, si le test de Commandement avait été raté, soustrayez 1 au jet de Blessure également."]
 ],
 "Transcendent C'tan" : [
  ["Aptitudes de base","Destruction Néfaste D6, Frappe en Profondeur, Insensible à la Douleur 5+."],
  ["Sauvegarde invulnérable","4+."],
  ["Déplacement Transdimensionnel","À votre phase de Mouvement, quand cette unité est choisie pour faire un mouvement d'avance, vous pouvez utiliser cette aptitude. Dans ce cas : ▪ ce mouvement d'avance n'a pas de distance maximale ; ▪ cette unité peut se déplacer à travers tous types de figurines (y compris les figurines ennemies et celles de MONSTRE/VÉHICULE) ; ▪ après s'être déplacée, cette unité doit être à plus de 8\" à l'horizontale des unités ennemies. Texte remplacé par le pack de faction v1.1."],
  ["Nécroderme","À chaque attaque qui cible cette figurine, soustrayez 1 à la caractéristique de Dégâts de l'attaque."],
  ["Dieu Stellaire Asservi","Cette figurine ne peut pas être votre Seigneur de Guerre."],
  ["Écharde C'tan","Cette figurine ne peut pas recevoir d'Optimisations."],
  ["Longe Relativiste — Panthéon de Malheur","Entrave Nécrodermique imposée par ce détachement : à votre tour, quand cette unité fait un mouvement d'arrivée ou d'avance en utilisant son aptitude Déplacement Transdimensionnel, elle peut finir ce mouvement à plus de 6\" à l'horizontale des unités ennemies (et non à plus de 8\"). Quand elle finit ce mouvement à 8\" ou moins d'une unité ennemie, jusqu'à la fin du tour, elle n'est pas éligible pour déclarer une charge. Si votre armée inclut plus d'un C'tan Transcendant, chacun doit prendre cette aptitude."]
 ],
 "Imotekh the Stormlord" : [
  ["Grand Strategist","At the start of your Command phase, if this model is on the battlefield, you gain 1CP."],
  ["Lord of the Storm","Once per battle, at the end of your Command phase, this model can use this ability. If it does, roll one D6 for each enemy unit within 12\" of this model: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, that enemy unit suffers D3+3 mortal wounds."]
 ],
 "Trazyn the Infinite" : [
  ["Ancient Collector","While this model is leading a unit, at the end of your Command phase, if that unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at start or end of any turn."],
  ["Surrogate Hosts","At the start of your Command phase, if this model is on the battlefield, you can select one other friendly NECRONS INFANTRY CHARACTER model on the battlefield (excluding SKORPEKH LORD or EPIC HERO models). The selected model is destroyed (ignoring any rules that are triggered when a model is destroyed) and this model is put in its place, with all of its wounds remaining (if the selected model was leading a unit, this model now attaches to that unit as its Leader)."]
 ],
 "Orikan the Diviner" : [
  ["Master Chronomancer","While this model is leading a unit, models in that unit have a 4+ invulnerable save."],
  ["The Stars Are Right","Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, triple the Attacks and Strength characteristics of this model's Staff of Tomorrow and every successful Wound roll made for this model's attacks scores a Critical Wound."]
 ],
 "Illuminor Szeras" : [
  ["Illuminor","While this model is within 3\" of one or more other friendly NECRONS units, this model has the Lone Operative ability."],
  ["Mechanical Augmentation (Aura)","While a friendly NECRONS BATTLELINE unit is within 3\" of this model, each time a model in that unit makes an attack, improve the Armour Penetration characteristic of that attack by 1, and each time an attack targets that unit, worsen the Armour Penetration characteristic of that attack by 1."],
  ["Atomic Energy Manipulator","At the end of the Fight phase, if this model destroyed one or more models this phase, until the end of the battle, add 3\" to the range of its Mechanical Augmentation ability (to a maximum of 12\")."]
 ],
 "Nekrosor Ammentar" : [
  ["Aptitudes de base","Frappe en Profondeur, Combat en Premier."],
  ["Sauvegarde invulnérable","4+."],
  ["Disciples Protecteurs","Tant que cette figurine est à 3\" d'une ou plusieurs autres unités de CULTE DESTROYER amies, elle a l'aptitude Agent Solitaire."],
  ["Folie Meurtrière Infectieuse (Aura)","Tant qu'une unité de NÉCRONS amie (unités de MONSTRE et TITANESQUES exclues) est à 6\" de cette figurine, à chaque attaque d'une figurine de l'unité, si la figurine a le mot-clé CULTE DESTROYER ou si l'unité ennemie est la cible éligible la plus proche, l'attaque a l'aptitude [TOUCHES SOUTENUES 1]."],
  ["Prophète de la Destruction","Chaque fois que cette figurine détruit une unité ennemie, choisissez 1 autre unité de CULTE DESTROYER amie à 9\" de cette figurine. Jusqu'à la fin de la phase, à chaque attaque d'une figurine de l'unité amie choisie, relancez tout jet de Blessure de 1."],
  ["Générateur de Champ à Négalithe (Aura)","Tant qu'une unité de NÉCRONS amie est à 6\" du porteur, ses figurines ont l'aptitude Insensible à la Douleur 5+ contre les blessures mortelles et les Attaques Psychiques."]
 ],
 "Szarekh, The Silent King" : [
  ["Damaged: 1-6 wounds remaining","While this unit's Szarekh model has 1-6 wounds remaining, halve the Attacks characteristic of that model's weapons, and each time this unit makes an attack, subtract 1 from the Hit roll."],
  ["Voice of the Triarch","At the start of the battle round, select one Triarch ability. Until the start of the next battle round, this unit has that ability."],
  ["Marche Implacable (Aura)","Tant qu'une unité de NÉCRONS amie est à 6\" ou moins de la figurine de Szarekh de cette unité, ajoutez 2\" à la caractéristique de Mouvement des figurines de l'unité amie. Texte remplacé par le pack de faction v1.1, qui redéfinit aussi les mots-clés : toutes les figurines VÉHICULE, HÉROS ÉPIQUE, TRIARCAT ; figurine de Szarekh PERSONNAGE, LE ROI SILENCIEUX."],
  ["Triarchal Menhirs","If this unit's Szarekh model is destroyed, all of this unit's remaining Triarchal Menhir models are also destroyed."]
 ]
};

/* TRANSPORTS : capacite d'emport, texte du catalogue */
const TRANSPORTS = {
 "Ghost Ark" : "This model has a transport capacity of 10 NECRON WARRIOR models and 1 NECRONS INFANTRY CHARACTER model.",
 "Night Scythe" : "This model has a transport capacity of 1 NECRONS INFANTRY unit."
};

/* FACTION : la regle qui vaut pour toute l'armee */
const FACTION = [
 ["Protocoles de Réanimation","Si votre Faction d'Armée est NÉCRONS, à la fin de votre phase de Commandement, chaque unité amie avec cette aptitude qui est sur le champ de bataille active ses protocoles de réanimation. Quand les Protocoles de Réanimation d'une unité s'activent, elle soigne D3 points de vie. Texte remplacé par le Pack de Faction Nécrons v1.1 du 22 juillet 2026."]
];

/* ============================================================
   GLOSSAIRE : aptitudes d'arme et aptitudes de base du jeu.
   Texte officiel francais, Warhammer 40,000 Regles de Base,
   section 24 « Aptitudes de Base ». Les exemples et le texte
   d'ambiance sont omis, la regle est reprise mot pour mot.
   La cle est le libelle affiche dans les tableaux d'armes.
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
 "Discrétion" : "Si toutes les figurines d'une unité ont cette aptitude, à chaque attaque de tir qui cible l'unité, l'unité a le bénéfice du couvert contre l'attaque.",
 "Stationnaire" : "Chaque fois que cette unité décolle, ne soustrayez pas 2\" à la distance maximale.",
 "Marcheur Super-lourd" : "Chaque fois qu'une unité avec cette aptitude effectue un mouvement normal, d'avance ou de retraite, ses figurines peuvent se déplacer à travers les figurines (figurines TITANESQUES exclues) et à l'horizontale à travers des sections d'éléments de terrain de 4\" de hauteur ou moins. Avant de la déplacer, vous pouvez décider que toutes ses figurines aient le mot-clé MOBILE jusqu'à la fin du mouvement ; dans ce cas, à la fin du mouvement, jetez 1 D6 : sur 1, l'unité est ébranlée.",
 "Abattage" : "[ABATTAGE X] — Chaque fois que vous rassemblez les dés d'attaque pour une arme d'[ABATTAGE], si vous avez choisi une seule cible pour toutes les attaques de l'arme, ajoutez X dés d'attaque supplémentaires par tranche de 5 figurines qui étaient dans l'unité cible à l'étape Choisir les Cibles (arrondi à l'inférieur).",
 "Combat Rapproché" : "[COMBAT RAPPROCHÉ] — Les unités contenant une ou plusieurs figurines avec une arme de [COMBAT RAPPROCHÉ] peuvent tirer en utilisant le tir en combat rapproché. Quand vous utilisez un autre type de tir, pour chaque figurine de cette unité (sauf MONSTRE/VÉHICULE), vous pouvez choisir soit une ou plusieurs de ses armes de [COMBAT RAPPROCHÉ], soit une ou plusieurs de ses autres armes de tir."
};
