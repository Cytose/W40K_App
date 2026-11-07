#!/usr/bin/env python3
"""LES PV DU SOLDAT, PAS CEUX DU SERGENT

extraction.py prend le PREMIER profil de figurine que BSData donne pour
une fiche. Quand le sergent vient en tête, toute l'unité hérite de ses
PV : les Boyz avaient 3 PV par figurine (ceux du Nob) au lieu de 1, et
le simulateur les croyait trois fois plus solides qu'ils ne sont.

Ce script repose dans UNITS les PV de la figurine la plus nombreuse,
d'après l'export Wahapedia (build/wahapedia/, dézippé depuis
/mnt/project-files/wahapedia/) : la ligne de composition qui compte le
plus de figurines (« 9-18 Boy models »), rapprochée de son profil.

Il ne touche pas :
  · aux unités d'une seule figurine ;
  · aux PERSONNAGES (Aun'va et ses gardes, Celestine et ses Geminae) :
    le simulateur ne sait pas mêler deux profils, et le héros reste
    la figurine qui compte ;
  · aux Nécrons, dont la table est tenue à la main.

  python3 outils/pv.py            toutes les factions livrées
  python3 outils/pv.py --essai    affiche sans rien écrire
"""
import csv, glob, html, json, os, re, sys
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TENUES_A_LA_MAIN = {'data-necrons.js'}

def norm(s):
    s = html.unescape(re.sub(r'<[^>]+>', '', s or '')).lower()
    s = s.replace('’', "'").replace('–', '-')
    return re.sub(r'\s+', ' ', s).strip()

def singulier(s):
    s = re.sub(r'\b(models?|figurines?)\b', '', norm(s)).strip()
    return ' '.join(re.sub(r'(?<=[a-z]{3})s$', '', m) for m in s.split())

def lis(nom):
    c = glob.glob(os.path.join(RACINE, 'build', 'wahapedia', '**', nom), recursive=True)
    if not c: sys.exit("export Wahapedia introuvable dans build/wahapedia/ : " + nom)
    return list(csv.DictReader(open(c[0], encoding='utf-8-sig'), delimiter='|'))

def pvSoldat():
    """nom de fiche normalisé → PV de sa figurine la plus nombreuse,
       pour les seules fiches dont les figurines n'ont pas toutes les
       mêmes PV."""
    noms = {r['id']: r['name'] for r in lis('Datasheets.csv')}
    mots, modeles, compo = {}, {}, {}
    for r in lis('Datasheets_keywords.csv'):
        mots.setdefault(r['datasheet_id'], set()).add(norm(r['keyword']))
    for r in lis('Datasheets_models.csv'):
        modeles.setdefault(r['datasheet_id'], []).append((r['name'], r['W']))
    for r in lis('Datasheets_unit_composition.csv'):
        compo.setdefault(r['datasheet_id'], []).append(r['description'])
    out = {}
    for i, ms in modeles.items():
        pvs = {w for _, w in ms if w.strip().isdigit()}
        if len(pvs) < 2: continue
        if mots.get(i, set()) & {'character', 'epic hero'}: continue
        # la ligne de composition qui compte le plus de figurines
        meilleure, compte = None, -1
        for d in compo.get(i, []):
            m = re.match(r'\s*(\d+)(?:\s*-\s*(\d+))?\s+(.*)', norm(d))
            if not m: continue
            n = int(m.group(2) or m.group(1))
            if n > compte: meilleure, compte = m.group(3), n
        w = None
        if meilleure is not None:
            cible = singulier(meilleure)
            for nm, pv in ms:
                s = singulier(nm)
                if s and (cible.startswith(s) or s.startswith(cible)): w = pv; break
            if w is None:
                autres = [pv for nm, pv in ms if norm(nm) == 'other models']
                if autres: w = autres[0]
        if w is None: w = min(pvs, key=int)     # à défaut : le plus fragile
        out[norm(noms[i])] = int(w)
    return out

def traite(chemin, table, essai):
    src = open(chemin, encoding='utf-8').read()
    m = re.search(r'^const UNITS = \[\n(.*?)^\];$', src, re.S | re.M)
    if not m: return []
    lignes, faits = m.group(1).split('\n'), []
    for k, l in enumerate(lignes):
        mm = re.match(r'^(\s*)(\[.*\])(,?)$', l)
        if not mm: continue
        u = json.loads(mm.group(2))
        w = table.get(norm(u[0]))
        if w is None or u[5] == w or max(u[6]) < 2: continue
        faits.append((u[0], u[5], w))
        # on ne change QUE le PV, sans réécrire la ligne
        tete = json.dumps(u[:5], ensure_ascii=False, separators=(',', ':'))[:-1]
        assert l.strip().startswith(tete + ',' + str(u[5]) + ','), u[0]
        lignes[k] = l.replace(tete + ',' + str(u[5]) + ',', tete + ',' + str(w) + ',', 1)
    if faits and not essai:
        src = src[:m.start(1)] + '\n'.join(lignes) + src[m.end(1):]
        open(chemin, 'w', encoding='utf-8').write(src)
    return faits

if __name__ == '__main__':
    essai = '--essai' in sys.argv
    table = pvSoldat()
    total = 0
    for f in sorted(glob.glob(os.path.join(RACINE, 'data-*.js'))):
        b = os.path.basename(f)
        faits = traite(f, table, essai or b in TENUES_A_LA_MAIN)
        for nom, avant, apres in faits:
            print('%-24s %-40s %d → %d PV%s' % (b, nom, avant, apres,
                  '  (tenue à la main : non écrit)' if b in TENUES_A_LA_MAIN else ''))
        total += 0 if b in TENUES_A_LA_MAIN else len(faits)
    print('%d fiche(s) %s' % (total, 'à corriger' if essai else 'corrigée(s)'))
