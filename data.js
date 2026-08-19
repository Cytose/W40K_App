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
["Doom Scythe",20,9,3,0,12,[1],{"1":200},0,"",0,"Aircraft. Dégradé à 1-4 PV : -1 pour toucher. Deadly Demise D3.",0,"7+"],
["Night Scythe",14,9,3,0,12,[1],{"1":125},0,"",0,"Refondu en 11e (Hover, FRAME). Transport 1 unité INFANTERIE.",0,"7+"],
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
["Szarekh, The Silent King",8,10,2,4,16,[3],{"3":420},0,"",0,"Epic Hero. Unité = Szarekh (16 PV) + 2 Menhirs (E10 Svg2+ Invu4+ 5 PV). Dégradé à 1-6 PV.",6,"6+"],
["Nemesor Zahndrekh",5,5,2,4,6,[1],{"1":85},0,"Leader",1,"Legends. Counter-tactics.",1,"7+"],
["Vargard Obyron",5,5,2,0,5,[1],{"1":85},0,"Leader",1,"Legends. Pas d'invu. Avec Zahndrekh : FNP 4+ aux personnages de l'unité.",1,"6+"],
["Lord",5,5,3,0,4,[1],{"1":65},0,"Leader",1,"Legends. Svg en conflit selon les sources (2+ sur le PDF, 3+ sur Wahapedia).",1,"6+"]
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
["Geomancer","Tremorglaive — faisceau","T","2",4,8,2,"2","melta:2","càc"],
["Geomancer","Tremorglaive — onde de choc","T","D6+2",4,4,0,"1","torrent ignorescover","càc"],
["Geomancer","Tremorglaive (càc)","C","2",4,8,2,"2","","càc"],
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
["Szarekh, The Silent King","Weapons of the Final Triarch","C","12",2,8,3,"2","lethal","càc"],
["Nemesor Zahndrekh","Staff of light (tir)","T","3",3,5,2,"1","","18\""],
["Nemesor Zahndrekh","Staff of light (càc)","C","4",3,5,2,"1","","18\""],
["Vargard Obyron","Warscythe","C","4",2,8,3,"2","dev precision","càc"],
["Lord","Staff of light (tir)","T","3",3,5,2,"1","","18\""],
["Lord","Lord's blade","C","3",3,8,3,"2","dev","càc"],
["Lord","Staff of light (càc)","C","3",3,5,2,"1","","18\""]
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
["Veil of Darkness",20,"Awakened Dynasty","NECRONS model only. Once per battle, at the end of your opponent's turn, if the bearer's unit is not within Engagement Range of one or more enemy units, the bearer can use this Enhancement. If it does, remove that unit from the battlefield. Then, in the Reinforcements step of your next Movement phase, set up that unit anywhere on the battlefield that is more than 9\" horizontally away from all enemy models."],
["Nether-realm Casket",20,"Awakened Dynasty","NECRONS model only. While the bearer is leading a unit, models in that unit have the Stealth ability."],
["Phasal Subjugator",35,"Awakened Dynasty","NECRONS model only. While a friendly NECRONS unit (excluding CHARACTER units) is within 6\" of the bearer, each time a model in that unit makes an attack, add 1 to the hit roll."],
["Dimensional Overseer",25,"Hypercrypt Legion","NECRONS model only. While the bearer is on the battlefield or in Strategic Reserves, add 1 to the number of units from your army that you can select for the Hyperphasing rule."],
["Eternal Madness",25,"Annihilation Legion","NECRONS model only. In the Fight phase, each time a model in the bearer's unit is destroyed, if that model had not fought this phase, roll one D6. On a 4+, do not remove the destroyed model from play; it can fight after the attacking model's unit has finished making its attacks, and is then removed from play."],
["Ingrained Superiority",10,"Annihilation Legion","NECRONS model only. Each time a model in the bearer's unit makes an attack, on a Critical Wound, improve the Armour Penetration characteristic of that attack by 1."],
["Soulless Reaper",20,"Annihilation Legion","DESTROYER CULT model only. Each time an enemy unit within Engagement Range of the bearer's unit is selected to Fall Back, roll one D6. On a 3+, that unit cannot Fall Back and must Remain Stationary."],
["Eldritch Nightmare",15,"Annihilation Legion","DESTROYER CULT model only. At the start of the Fight phase, each enemy unit within Engagement Range of the bearer must take a Battle-shock test."],
["Dimensional Sanctum",20,"Canoptek Court","CRYPTEK model only. Models in the bearer's unit have the Infiltrators ability."],
["Hyperphasic Fulcrum",15,"Canoptek Court","CRYPTEK model only. While the bearer is leading a unit, if that unit is wholly within your army's Power Matrix, each time a model in that unit makes an attack, re-roll a Wound roll of 1."],
["Autodivinator",15,"Canoptek Court","CRYPTEK model only. Each time your opponent gains a CP as a result of an ability, roll one D6: on a 2+, you also gain 1CP."],
["Metalodermal Tesla Weave",10,"Canoptek Court","CRYPTEK model only. Once per phase, when an enemy unit selects the bearer's unit as a target of a charge, roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds, on a 6, that enemy unit suffers 3 mortal wounds."],
["Honourable Combatant",10,"Obeisance Phalanx","OVERLORD model only. Each time the bearer's unit destroys an enemy CHARACTER unit, your opponent loses 1CP if they have any."],
["Unflinching Will",20,"Obeisance Phalanx","OVERLORD model only. The bearer's melee weapons have the [PRECISION] and [ANTI-INFANTRY 5+] abilities."],
["Warrior Noble",15,"Obeisance Phalanx","OVERLORD model only. Each time a melee attack targets the bearer's unit, subtract 1 from the Hit roll."],
["Eternal Conqueror",25,"Obeisance Phalanx","OVERLORD model only. Each time a model in the bearer's unit makes an attack that targets an enemy unit within range of an objective marker, you can re-roll the Hit roll."],
["Enaegic Dermal Bond",30,"Awakened Dynasty","NECRONS model only. The bearer has the Feel No Pain 4+ ability."],
["Arisen Tyrant",25,"Hypercrypt Legion","NECRONS model only. Each time a model in the bearer's unit makes an attack, re-roll a Hit roll of 1. If the bearer's unit was set up on the battlefield this turn, you can re-roll the Hit roll instead."],
["Hyperspatial Transfer Node",15,"Hypercrypt Legion","NECRONS model only. Each time the bearer's unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6\" to the Move characteristic of models in the bearer's unit."],
["Osteoclave Fulcrum",20,"Hypercrypt Legion","NECRONS model only. Models in the bearer's unit have the Deep Strike ability."],
["Dread Majesty",30,"Starshatter Arsenal","While a friendly ^^**Necrons**^^ unit (excluding ^^**Monster^^** and ^^**Titianic^^** units) is within 6\" of the bearer, each time a model in that unit makes an attack, re‑roll a Hit roll of 1 and re‑roll a Wound roll of 1."],
["Miniaturised Nebuloscope",15,"Starshatter Arsenal","Ranged weapons equipped by models in the bearer's unit have the [IGNORES COVER] ability."],
["Demanding Leader",10,"Starshatter Arsenal","In your Command phase, select one friendly NECRONS VEHICLE or NECRONS MOUNTED unit (excluding TITANIC units) within 6\" of the bearer. Until the start of your next Command phase, that unit is eligible to shoot in a turn in which it Fell Back."],
["Chrono-impedance Fields",25,"Starshatter Arsenal","In your Command phase, select one friendly **^^Necrons Vehicle^^** or **^^Necrons Mounted^^** unit (excluding Titanic units) within 6\" of the bearer. Until the start of your next Command phase, each time an attack is allocated to a model in that unit, subtract 1 from the Damage characteristic of that attack."],
["Gauntlet of Compression",20,"Cryptek Conclave","Add 6\" to the Range characteristic of ranged weapons equipped by models in the bearer's unit."],
["Atomic Disintegrators",10,"Cryptek Conclave","In your Shooting phase, each time the bearer's unit is selected to shoot, when selecting an ability for the Technosorcerous Augmentations Detachment rule, you can also select from the following abilities: [ANTI‑MONSTER 5+], [ANTI‑VEHICLE 5+]."],
["Quantum Abacus",15,"Cryptek Conclave","Each time you select the bearer's unit as the target of a Stratagem, roll one D6, adding 1 if it is within range of one or more objectives: on a 4+, you gain 1CP."],
["Gravitic Bolas",15,"Skyshroud Spearhead","In your Shooting phase, after the bearer has shot, select one enemy unit hit by one or more of those attacks (excluding ^^**Titanic^^** units); until the start of your next turn, that enemy unit is pinned. While a unit is pinned, subtract 2 from that unit's Move characteristic and subtract 2 from Charge rolls made for that unit."],
["Destroyer Ankh",20,"Cursed Legion","The bearer has the ^^**Destroyer Cult^^** keyword. Add 2\" to the Move characteristic of models in the bearer's unit and add 2 to the Attacks characteristic of melee weapons equipped by the bearer."],
["Murdermind",15,"Cursed Legion","The bearer has the Destroyer Cult keyword and during the Declare Battle Formations step, the bearer can be attached to a Destroyer Cult unit (excluding Character units). If you do, the bearer's unit cannot contain any models without the Destroyer Cult keyword. Add 3\" to the Move characteristic of the bearer."],
["Mark of the Nekrosor",20,"Cursed Legion","Each time a model in the bearer's unit makes an attack, add 1 to the Hit roll."],
["Cursed Circlet",25,"Cursed Legion","Each time an enemy unit is selected to shoot, after that unit has shot, if any models from the bearer's unit were destroyed as a result of those attacks, the bearer's unit can make a Surge move. To do so, roll one D6: the bearer's unit can be moved a number of inches up to the result, but the bearer's unit must finish that move as close as possible to the closest enemy unit (excluding ^^**Aircraft^^**). When doing so, those models can be moved within Engagement Range of that enemy unit. A unit cannot make a Surge move while it is Battle‑shocked."],
["Recursive Reanimation",,"Skyshroud Spearhead","Absente du catalogue BattleScribe : relevee sur WarOrgan, cout a confirmer."],
["Deepening Madness",20,"Skyshroud Spearhead","Absente du catalogue BattleScribe : relevee sur WarOrgan (20 pts)."]
];

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

/* ============================================================
   STRATAGEMES
   [nom, detachement ou "Core", type, cout PC, quand, cible, effet]
   Aucune source verifiable n'existe pour la 11e : le catalogue
   BattleScribe ne contient aucun stratageme de detachement. Ne
   figure donc ici que ce qui est lisible sur les captures
   WarOrgan — nom, detachement, type, cout — et le seul texte
   qui y apparaissait deplie. Les champs vides s'affichent comme
   « texte non renseigné » : les completer ne demande que de
   remplir les trois dernieres colonnes.
   ============================================================ */
const STRATS = [
["Molecular Targeting","Cryptek Conclave","Battle Tactic",1,
 "Ta phase de Tir ou de Combat.",
 "Une unité NECRONS de ton armée qui n'a pas encore été choisie pour tirer ou combattre cette phase.",
 "Jusqu'à la fin de la phase, chaque fois qu'une figurine de l'unité attaque, tu peux ignorer tout ou partie des modificateurs à sa Capacité de Tir ou de Combat et au jet de touche. Si l'unité a le mot-clé CRYPTEK, tu peux aussi ignorer les modificateurs au jet de blessure."],
["Microscarab Swarm","Cryptek Conclave","Wargear",1,"","",""],
["Animus Curse","Cryptek Conclave","Wargear",1,"","",""],
["Synergistic Empowerment","Cryptek Conclave","Strategic Ploy",1,"","",""],
["Untapped Power","Cryptek Conclave","Battle Tactic",1,"","",""],
["Potentiality Syphon","Cryptek Conclave","Strategic Ploy",1,"","",""],
["Omnilocked Strafing","Skyshroud Spearhead","",1,"","",""],
["Swift as Death","Skyshroud Spearhead","",1,"","",""],
["Evasive Protocols","Skyshroud Spearhead","",1,"","",""],
["Command Re-Roll","Core","Core",1,"","",""],
["Epic Challenge","Core","Core",1,"","",""],
["Insane Bravery","Core","Core",1,"","",""],
["Explosives","Core","Core",1,"","",""],
["Crushing Impact","Core","Core",1,"","",""],
["Rapid Ingress","Core","Core",1,"","",""],
["Fire Overwatch","Core","Core",1,"","",""],
["Smokescreen","Core","Core",1,"","",""]
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
["Nemesor Zahndrekh","Epic Hero"],
["Vargard Obyron","Epic Hero"],
["Lord","Personnage"],
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
  ["Their Number is Legion","Each time this unit's Reanimation Protocols activate, you can re-roll the dice to see how many wounds are regenerated."]
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
  ["Tunnelling Horrors","At the end of your opponent's turn, if this unit is not within Engagement Range of one or more enemy units, you can remove this unit from the battlefield. In the Reinforcements step of your next Movement phase, set it up anywhere on the battlefield that is more than 9\" horizontally away from all enemy models."]
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
  ["Nanoscarab Reanimation Beam (Aura)","While a friendly NECRONS unit is within 3\" of this model, each time that unit's Reanimation Protocols activate, that unit reanimates an additional D3 wounds."]
 ],
 "Canoptek Doomstalker" : [
  ["Damaged: 1-4 wounds remaining","While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll."],
  ["Sentinel Construct","Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+."]
 ],
 "Canoptek Macrocytes" : [
  ["Harassment Swarm (Aura)","While an enemy unit (excluding ^^**Monsters^^** and ^^**Vehicles^^**) is within 3\" of this unit, each time a model in that unit makes an attack, subtract 1 from the Hit roll."],
  ["Nanoscarab Projector","Once per battle round, when a friendly ^^**Necrons^^** unit within 3\" of the bearer activates its Reanimation Protocols, the bearer can use this ability. If it does, that unit reanimates 1 additional wound."],
  ["Accelerator Mandible","At the start of the Fight phase, select one friendly ^^**Canoptek^^** unit within 3\" of the bearer's unit. Until the end of the phase, improve the Weapon Skill characteristic of weapons equipped by models in that unit by 1."]
 ],
 "Canoptek Tomb Crawlers" : [
  ["Weapon Sentinels","Each time a model in this unit makes a ranged attack that targets a unit within 12\", you can ignore any or all modifiers to the following: that attack's Ballistic Skill characteristic; the Hit roll; the Wound roll."],
  ["Canoptek Retinue","At the start of the Declare Battle Formations step, this unit can join one other unit from your army that is being led by a ^^**Cryptek^^** model (a unit cannot have more than one ^^**Tomb Crawlers^^** unit joined to it and cannot have both a ^^**Tomb Crawlers^^** and a ^^**Cryptothralls^^** unit joined to it). If it does, until the end of the battle, every model in this unit counts as being part of that Bodyguard unit, and that Bodyguard unit's Starting Strength is increased accordingly."]
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
  ["Eternity Gate","In the Reinforcements step of your Movement phase, you can select one NECRONS INFANTRY unit from your army that is either in Reserves or on the battlefield (if you select the latter, remove that unit from the battlefield and place it into Reserves). That unit is then set up anywhere on the battlefield that is wholly within 6\" of this model and not within Engagement Range of any enemy models. That unit cannot declare a charge this turn."]
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
  ["Nanoscarab amulet","The bearer has the Feel No Pain 5+ ability."]
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
  ["Living Lightning","In your Shooting phase, select one enemy unit within 18\" of and visible to this model (excluding units with the Lone Operative ability that are not part of an Attached unit and are not within 12\" of this model) and roll four D6: for each 4+, that enemy unit suffers 1 mortal wound."]
 ],
 "Chronomancer" : [
  ["Timesplinter Mantle","While this model is leading a unit, each time an attack targets that unit, subtract 1 from the Hit roll."],
  ["Chronometron","In your Shooting phase, after this model's unit has shot, if it is not within Engagement Range of any enemy units, that unit can make a Normal move of up to 5\". If it does, until the end of the turn, that unit is not eligible to declare a charge."]
 ],
 "Psychomancer" : [
  ["Nightmare Shroud (Aura)","In the Battle-shock step of your opponent's Command phase, if an enemy unit that is below its Starting Strength is within 6\" of this model, that enemy unit must take a Battle-shock test, subtracting 1 from the roll when it does so."],
  ["Harbinger of Despair","Once per turn, at the start of your Command, Movement, Shooting, Charge or Fight phase, you can select one enemy unit within 18\" of this model. That unit must take a Battle-shock test, subtracting 1 from the roll when it does so."]
 ],
 "Geomancer" : [
  ["Tectonic Reverberations","In your Movement phase, you can select one enemy unit within 18\" of and visible to this model. Until the start of your next Movement phase that enemy unit is pinned. While a unit is pinned, subtract 2 from that unit's Move characteristic and subtract 2 from Charge rolls made for it."],
  ["Obelisk Node Control","While this model is within range of an objective marker you control, enemy units that are set up on the battlefield from Reserves cannot be set up within 12\" of this model."]
 ],
 "Catacomb Command Barge" : [
  ["Carrier Wave (Aura)","While a friendly NECRONS unit is within 6\" of this model, add 1 to the Objective Control characteristic of models in that unit."],
  ["Advanced Quantum Shielding","Each time an attack targets this model, if the Strength characteristic of that attack is greater than this model's Toughness characteristic, subtract 1 from the Wound roll."],
  ["Resurrection orb","Once per battle, at the end of any phase, select one friendly NECRONS INFANTRY or NECRONS MOUNTED unit within 6\" of the bearer and resurrect that unit. When you do, that unit's Reanimation Protocols are activated reanimating D6 wounds instead of D3 when doing so. You cannot resurrect more than one unit per turn."]
 ],
 "C'tan Shard of the Nightbringer" : [
  ["Drain Life","At the end of the Fight phase, roll one D6 for each enemy unit within 6\" of this model: on a 4+, that enemy unit suffers D3 mortal wounds."],
  ["Quantum Goad","This model is eligible to declare a charge in a turn in which it Advanced."]
 ],
 "C'tan Shard of the Deceiver" : [
  ["Grand Illusion","If your army includes this model, after both players have deployed their armies, select up to three ^^**NECRONS^^** units from your army and redeploy them. When doing so, any of those units can be placed in Strategic Reserves, regardless of how many units are already in Strategic Reserves."],
  ["Lord of Deceit (Aura)","Each time your opponent targets a unit from their army with a Stratagem, if that unit is within 12\" of this model, increase the cost of that use of that Stratagem by 1CP."]
 ],
 "C'tan Shard of the Void Dragon" : [
  ["Matter Absorption","At the start of your Shooting phase, select one enemy ^^**VEHICLE^^** unit within 12\" of this model and roll one D6: on a 2+, that enemy unit suffers D3 mortal wounds and this model regains up to that many lost wounds."],
  ["Animus Damper","Once per turn, at the start of your opponent's Shooting phase, select one enemy ^^**Vehicle^^** unit visible to the bearer. That unit must take a Leadership test. Until the end of the phase, each time a model in that unit makes an attack, subtract 1 from the Hit roll and, if that Leadership test was failed, subtract 1 from the Wound roll as well."]
 ],
 "Transcendent C'tan" : [
  ["Invulnerable Save (4+)","This model has a 4+ invulnerable save."],
  ["Transdimensional Displacement","Each time this model is selected to Advance, you can remove it from the battlefield and set it up again anywhere on the battlefield that is more than 9\" horizontally away from all enemy models."],
  ["C'tan Shard","This model cannot be given Enhancements."],
  ["Relatavistic Tether","In your turn, each time this model is set up on the battlefield using the Deep Strike or Transdimensional Displacement abilities, it can be set up anywhere on the battlefield that is more than 6\" horizontally away from all enemy units. When doing so, if this model is set up within 9\" of one or more enemy units, until the end of the turn, it is not eligible to declare a charge."]
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
  ["Invulnerable Save (4+)","This model has a 4+ invulnerable save."],
  ["Protective Disciples","While this model is within 3\" of one or more other friendly ^^**Destroyer Cult^^** units, this model has the Lone Operative ability."],
  ["Infectious Murder‑madness (Aura)","While a friendly ^^**Necrons^^** unit (excluding ^^**Monster**^^ and ^^**Titanic^^** units) is within 6\" of this model, each time a model in that unit makes an attack, if that model has the ^^**Destroyer Cult^^** keyword or that enemy unit is the closest eligible target, that attack has the [SUSTAINED HITS 1] ability."],
  ["Prophet of Destruction","Each time this model destroys an enemy unit, select one other friendly ^^**Destroyer Cult^^** unit within 9\" of it. Until the end of the phase, each time a model in that unit makes an attack, re‑roll a Wound roll of 1."],
  ["Nullstone Field Generator (Aura)","While a friendly ^^**Necrons^^** unit is within 6\" of the bearer, models in that unit have the Feel No Pain 5+ ability against mortal wounds and Psychic Attacks."]
 ],
 "Szarekh, The Silent King" : [
  ["Damaged: 1-6 wounds remaining","While this unit's Szarekh model has 1-6 wounds remaining, halve the Attacks characteristic of that model's weapons, and each time this unit makes an attack, subtract 1 from the Hit roll."],
  ["Voice of the Triarch","At the start of the battle round, select one Triarch ability. Until the start of the next battle round, this unit has that ability."],
  ["The Silent King (Aura)","While a friendly NECRONS unit is within 6\" of this unit's Szarekh model, improve that unit's Leadership characteristic by 1."],
  ["Triarchal Menhirs","If this unit's Szarekh model is destroyed, all of this unit's remaining Triarchal Menhir models are also destroyed."]
 ],
 "Nemesor Zahndrekh" : [
  ["Transient Madness","While this model is leading a unit, at the start of your Command phase, roll one D6: until the start of your next Command phase, weapons equipped by models in that unit gain the ability below that corresponds with that roll: ■ 1-2: [SUSTAINED HITS 1] ■ 3-4: [LETHAL HITS] ■ 5-6: [DEVASTATING WOUNDS]"],
  ["Counter-tactics","Once per battle, after your opponent uses a Stratagem, if this model is on the battlefield, it can use this ability. If it does, until the end of the battle, the CP cost your opponent must pay to use that Stratagem again is increased by 1CP."]
 ],
 "Vargard Obyron" : [
  ["Ghostwalk Mantle","While this model is leading a unit, models in that unit have the Fights First ability."],
  ["The Vargard's Duty","While this model is in the same unit as NEMESOR ZAHNDREKH, CHARACTER models in that unit have the Feel No Pain 4+ ability."]
 ],
 "Lord" : [
  ["Relentless March","While this model is leading a unit, add 1\" to the Move characteristic of models in that unit."],
  ["The Lord's Will","While this model is leading a unit, you can target that unit with Stratagems even when it is Battle-shocked."]
 ]
};

/* TRANSPORTS : capacite d'emport, texte du catalogue */
const TRANSPORTS = {
 "Ghost Ark" : "This model has a transport capacity of 10 NECRON WARRIOR models and 1 NECRONS INFANTRY CHARACTER model.",
 "Night Scythe" : "This model has a transport capacity of 1 NECRONS INFANTRY unit."
};

/* FACTION : la regle qui vaut pour toute l'armee */
const FACTION = [
 ["Reanimation Protocols","If your Army Faction is NECRONS, at the end of your Command phase, each unit from your army with this ability that is on the battlefield activates its Reanimation Protocols and reanimates D3 wounds. Each time such a unit reanimates a wound: ■ If that unit contains one or more models with fewer than their starting number of wounds remaining, select one of those models; that model regains one lost wound. ■ If all models in that unit have their starting number of wounds, but that unit is not at its Starting Strength, one destroyed model is returned to that unit with one wound remaining. Once such a unit is at its Starting Strength and all of its models have their starting number of wounds, nothing further happens."]
];

/* ============================================================
   GLOSSAIRE : mots-cles d'arme et aptitudes de base du jeu.
   Texte officiel repris du fichier de systeme BattleScribe.
   ============================================================ */
const GLOSSAIRE = {
 "Anti-" : "Weapons with [ANTI-KEYWORD X+] in their profile are known as Anti weapons. Each time an attack is made with such a weapon against a target with the keyword after the word ‘Anti-', an unmodified Wound roll of ‘x+' scores a Critical Wound.",
 "Assault" : "Weapons with [ASSAULT] in their profile are known as Assault weapons. If a unit that Advanced this turn contains any models equipped with Assault weapons, it is still eligible to shoot in this turn's Shooting phase. When such a unit is selected to shoot, you can only resolve attacks using Assault weapons its models are equipped with.",
 "Blast" : "Weapons with [BLAST] in their profile are known as Blast weapons, and they make a random number of attacks. Each time you determine how many attacks are made with a Blast weapon, add 1 to the result for every five models that were in the target unit when you selected it as the target (rounding down). Blast weapons can never be used to make attacks against a unit that is within Engagement Range of one or more units from the attacking model's army (including its own unit).",
 "Devastating Wounds" : "Weapons with [DEVASTATING WOUNDS] in their profile are known as Devastating Wounds weapons. Each time an attack is made with such a weapon, if that attack scores a Critical Wound, no saving throw of any kind can be made against that attack (including invulnerable saving throws). Such attacks are only allocated to models after all other attacks made by the attacking unit have been allocated and resolved. After that attack is allocated and after any modifiers are applied, it inflicts a number of mortal wounds on the target equal to the Damage characteristic of that attack, instead of inflicting damage normally.",
 "Extra Attacks" : "Weapons with [EXTRA ATTACKS] in their profile are known as Extra Attacks weapons. Each time the bearer of one or more Extra Attacks weapons fights, it makes attacks with each of the Extra Attacks melee weapons it is equipped with and it makes attacks with one of the melee weapons it is equipped with that does not have the [EXTRA ATTACKS] ability (if any). The number of attacks made with an Extra Attacks weapon cannot be modified by other rules, unless that weapon's name is explicitly specified in that rule.",
 "Hazardous" : "Weapons with [HAZARDOUS] in their profile are known as Hazardous weapons. Each time a unit is selected to shoot or fight, after that unit has resolved all of its attacks, for each Hazardous weapon that targets were selected for when resolving those attacks, that unit must take one Hazardous test. To do so, roll one D6: on a 1, that test is failed. For each failed test you must resolve the following sequence (resolve each failed test one at a time): ■ If possible, select one model in that unit that has lost one or more wounds and is equipped with one or more Hazardous weapons. ■ Otherwise, if possible, select one model in that unit (excluding ^^Character^^ models) equipped with one or more Hazardous weapons. ■ Otherwise, select one ^^Character^^ model in that unit equipped with one or more Hazardous weapons. If a model was selected, that unit suffers 3 mortal wounds and when allocating those mortal wounds, they must be allocated to the selected model. If a unit from a player's army is selected as the target of the Fire Overwatch Stratagem in their opponent's Charge phase, any mortal wounds inflicted by Hazardous tests are allocated after the charging unit has ended its Charge move.",
 "Heavy" : "Weapons with [HEAVY] in their profile are known as Heavy weapons. Each time an attack is made with such a weapon, if the attacking model's unit Remained Stationary this turn, add 1 to that attack's Hit roll.",
 "Ignores Cover" : "Weapons with [IGNORES COVER] in their profile are known as Ignores Cover weapons. Each time an attack is made with such a weapon, the target cannot have the Benefit of Cover against that attack.",
 "Indirect Fire" : "Weapons with [INDIRECT FIRE] in their profile are known as Indirect Fire weapons, and attacks can be made with them even if the target is not visible to the attacking model. These attacks can destroy enemy models in a target unit even though none may have been visible to the attacking unit when you selected that target. If no models in a target unit are visible to the attacking unit when you select that target, then each time a model in the attacking unit makes an attack against that target using an Indirect Fire weapon, subtract 1 from that attack's Hit roll, an unmodified Hit roll of 1-3 always fails, and the target has the Benefit of Cover against that attack. Weapons with the [TORRENT] ability cannot be fired using the [INDIRECT FIRE] ability.",
 "Lance" : "Weapons with [LANCE] in their profile are known as Lance weapons. Each time an attack is made with such a weapon, if the bearer made a Charge move this turn, add 1 to that attack's Wound roll.",
 "Lethal Hits" : "Weapons with [LETHAL HITS] in their profile are known as Lethal Hits weapons. Each time an attack is made with such a weapon, a Critical Hit automatically wounds the target.",
 "Melta" : "Weapons with [MELTA X] in their profile are known as Melta weapons. Each time an attack made with such a weapon targets a unit within half that weapon's range, that attack's Damage characteristic is increased by the amount denoted by ‘x'.",
 "One Shot" : "The bearer can only shoot with this weapon once per battle.",
 "Pistol" : "Weapons with [PISTOL] in their profile are known as Pistols. If a unit contains any models equipped with Pistols, that unit is eligible to shoot in its controlling player's Shooting phase even while it is within Engagement Range of one or more enemy units. When such a unit is selected to shoot, it can only resolve attacks using its Pistols and can only target one of the enemy units it is within Engagement Range of. In such circumstances, a Pistol can target an enemy unit even if other friendly units are within Engagement Range of the same enemy unit. If a model is equipped with one or more Pistols, unless it is a ^^Monster^^ or ^^Vehicle^^ model, it can either shoot with its Pistols or with all of its other ranged weapons. Declare whether such a model will shoot with its Pistols or its other ranged weapons before selecting targets.",
 "Precision" : "Weapons with [PRECISION] in their profile are known as Precision weapons. Each time an attack made with such a weapon successfully wounds an Attached unit, if a Character model in that unit is visible to the attacking model, the attacking model's player can choose to have that attack allocated to that Character model instead of following the normal attack sequence.",
 "Rapid Fire" : "Weapons with [RAPID FIRE X] in their profile are known as Rapid Fire weapons. Each time such a weapon targets a unit within half that weapon's range, the Attacks characteristic of that weapon is increased by the amount denoted by ‘x'.",
 "Sustained Hits" : "Weapons with [SUSTAINED HITS X] in their profile are known as Sustained Hits weapons. Each time an attack is made with such a weapon, if a Critical Hit is rolled, that attack scores a number of additional hits on the target as denoted by ‘x'",
 "Torrent" : "Weapons with [TORRENT] in their profile are known as Torrent weapons. Each time an attack is made with such a weapon, that attack automatically hits the target.",
 "Twin-linked" : "Weapons with [TWIN-LINKED] in their profile are known as Twin-linked weapons. Each time an attack is made with such a weapon, you can re-roll that attack's Wound roll.",
 "Deep Strike" : "During the Declare Battle Formations step, if every model in a unit has this ability, you can set it up in Reserves instead of setting it up on the battlefield. If you do, in the Reinforcements step of one of your Movement phases you can set up this unit anywhere on the battlefield that is more than 9\" horizontally away from all enemy models. If a unit with the Deep Strike ability arrives from Strategic Reserves, the controlling player can choose for that unit to be set up either using the rules for Strategic Reserves or using the Deep Strike ability.",
 "Deadly Demise" : "Some models have 'Deadly Demise x' listed in their abilities. When such a model is destroyed, roll one D6 before removing it from play (if such a model is a TRANSPORT, roll before any embarked models disembark). On a 6, each unit within 6\" of that model suffers a number of mortal wounds denoted by 'x' (if this is a random number, roll separately for each unit within 6\").",
 "Feel No Pain" : "Some models have 'Feel No Pain x+' listed in their abilities. Each time a model with this ability suffers damage and so would lose a wound (including wounds lost due to mortal wounds), roll one D6: if the result is greater than or equal to the number denoted by 'x: that wound is ignored and is not lost. If a model has more than one Feel No Pain ability, you can only use one of those abilities each time that model suffers damage and so would lose a wound.",
 "Fights First" : "Units with this ability that are eligible to fight do so in the Fights First step, provided every model in the unit has this ability.",
 "Firing Deck" : "Some ^^Transport^^ models have ‘Firing Deck x' listed in their abilities. Each time such a model is selected to shoot in the Shooting phase, you can select up to ‘x' models embarked within it whose units have not already shot this phase. Then, for each of those embarked models, you can select one ranged weapon that embarked model is equipped with (excluding weapons with the [ONE SHOT] ability). Until that ^^Transport^^ model has resolved all of its attacks, it counts as being equipped with all of the weapons you selected in this way, in addition to its other weapons. Until the end of the phase, those selected models' units are not eligible to shoot.",
 "Infiltrators" : "During deployment, if every model in a unit has this ability, then when you set it up, it can be set up anywhere on the battlefield that is more than 9\" horizontally away from the enemy deployment zone and all enemy models.",
 "Leader" : "While a Bodyguard unit contains a Leader, it is known as an Attached unit and, with the exception of rules that are triggered when units are destroyed (pg 12), it is treated as a single unit for all rules purposes. Each time an attack targets an Attached unit, until the attacking unit has resolved all of its attacks, you must use the Toughness characteristic of the Bodyguard models in that unit, even if a Leader in that unit has a different Toughness characteristic. Each time an attack successfully wounds an Attached unit, that attack cannot be allocated to a Character model in that unit, even if that Character model has lost one or more wounds or has already had attacks allocated to it this phase. As soon as the last Bodyguard model in an Attached unit has been destroyed, any attacks made against that unit that have yet to be allocated can then be allocated to Character models in that unit. Each time the last model in a Bodyguard unit is destroyed, each CHARACTER unit that is part of that Attached unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. Each time the last model in a CHARACTER unit that is attached to a Bodyguard unit is destroyed and there is not another CHARACTER unit attached, that Attached unit's Bodyguard unit becomes a separate unit, with its original Starting Strength. If this happens as the result of an attack, they become separate units after the attacking unit has resolved all of its attacks. Each time a unit that is part of an Attached unit is destroyed, it does not have the keywords of any other units that make up that Attached unit (unless it has those keywords on its own datasheet) for the purposes of any rules that would be triggered when that unit is destroyed.",
 "Lone Operative" : "Unless part of an Attached unit, this unit can only be selected as the target of a ranged attack if the attacking model is within 12\".",
 "Scouts" : "Some units have ‘Scouts x\"' listed in their abilities. If every model in a unit has this ability, then at the start of the first battle round, before the first turn begins, it can make a Normal move of up to x\", with the exception that, while making that move, the distance moved by each model in that unit can be greater than that model's Move characteristic, as long as it is not greater than x\". DEDICATED TRANSPORT models can make use of any Scouts x\" ability listed in their abilities, or a Scouts x\" ability that a unit that starts the battle embarked within that DEDICATED TRANSPORT model has (provided only models with this ability are embarked within that Dedicated Transport model), regardless of how that embarked unit gained this ability (e.g. listed in their abilities, conferred by an Enhancement or by an attached Character, etc.). A unit that moves using this ability must end that move more than 9\" horizontally away from all enemy models. If both players have units that can do this, the player who is taking the first turn moves their units first.",
 "Stealth" : "If every model in a unit has this ability, then each time a ranged attack is made against it, subtract 1 from that attack's Hit roll.",
 "Hover" : "Some ^^Aircraft^^ models have 'Hover' listed in their abilities. When you are instructed to Declare Battle Formations, before doing anything else, you must first declare which models from your army with this ability will be in Hover mode. If a model is in Hover mode, then until the end of the battle, its Move characteristic is changed to 20\", it loses the ^^Aircraft^^ keyword and it loses all associated rules for being an ^^Aircraft^^ model. Models in Hover mode do not start the battle in Reserves, but you can choose to place them into Strategic Reserves following the normal rules if you wish.",
 "Psychic" : "Some weapons and abilities can only be used by ^^Psykers^^. Such weapons and abilities are tagged with the word 'Psychic'. If a Psychic weapon or ability causes any unit to suffer one or more wounds, each of those wounds is considered to have been inflicted by a Psychic Attack."
};
