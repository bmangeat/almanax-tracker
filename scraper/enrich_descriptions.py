"""
Enrichit data/almanax.json avec les descriptions complètes et les vrais montants
de kamas depuis le calendrier Almanax de Guidactik (scraper/guidactik_raw.json,
snapshot du tableau complet des 366 jours) :
https://guidactik.com/dofus/calendrier-almanax-sur-dofus-quetes-kamas-dolmanax-offrandes-tout-savoir/

Corrige au passage un bug de scraper/parse.py qui multipliait les kamas par 1000
(le "k" du format "(+8993k)" de raw.md désigne le montant réel, pas des milliers).

Usage : python3 scraper/enrich_descriptions.py
"""
import json
import re

ALMANAX_PATH = "data/almanax.json"
GUIDACTIK_PATH = "scraper/guidactik_raw.json"

MONTHS_FR = {
    "Janvier": 1, "Février": 2, "Mars": 3, "Avril": 4, "Mai": 5, "Juin": 6,
    "Juillet": 7, "Août": 8, "Septembre": 9, "Octobre": 10, "Novembre": 11, "Décembre": 12,
}

# Même liste que scraper/parse.py (dupliquée pour garder ce script autonome).
METIERS = [
    "Bûcherons", "Bûcheron", "Alchimistes", "Alchimiste", "Paysans", "Paysan",
    "Mineurs", "Mineur", "Pêcheurs", "Pêcheur", "Chasseurs", "Chasseur",
    "Forgerons", "Forgeron", "Sculpteurs", "Sculpteur", "Sculptemages",
    "Façomages", "Façonneurs", "Façonneur", "Cordonniers", "Cordonnier",
    "Tailleurs", "Tailleur", "Bijoutiers", "Bijoutier", "Joaillomages",
    "Bricoleurs", "Bricoleur", "Costumages", "Forgemages", "Cordomages",
]


def normalize_metier(m):
    return m.rstrip("s") if m.endswith("s") and m not in ("Sculptemages",) else m


def extract_metiers(text):
    found = set()
    for m in METIERS:
        if re.search(r"\b" + re.escape(m) + r"\b", text):
            found.add(normalize_metier(m))
    return sorted(found)


# Les 3 jours où l'item de raw.md diverge de Guidactik (offrande visiblement
# mise à jour côté jeu depuis). On fait confiance à Guidactik (source datée,
# à jour pour Dofus 3 Unity) et on réassigne catégories/métiers à la main.
ITEM_OVERRIDES = {
    "03-04": {"bonusCategories": ["xp"]},
    "10-13": {"bonusCategories": ["xp"]},
    "12-31": {"bonusCategories": ["pvm", "xp", "drop"]},
}

# Coquille dans raw.md (apostrophe manquante) repérée en comparant à Guidactik.
NAME_FIXES = {
    "01-24": "Bourgeon d'Abraknyde Sombre Irascible",
}


def main():
    with open(GUIDACTIK_PATH, encoding="utf-8") as f:
        guidactik = json.load(f)["rows"]

    by_date = {}
    for day, month_name, item_qty, kamas, desc, _cat in guidactik:
        month = MONTHS_FR[month_name]
        date = f"{month:02d}-{int(day):02d}"
        m = re.match(r"(\d+)x\s*(.+)", item_qty)
        by_date[date] = {
            "qty": int(m.group(1)),
            "name": m.group(2).strip(),
            "kamas": int(kamas),
            "desc": desc,
        }

    with open(ALMANAX_PATH, encoding="utf-8") as f:
        offrandes = json.load(f)

    for o in offrandes:
        g = by_date.get(o["date"])
        if not g:
            continue

        o["kamas"] = g["kamas"]
        o["bonusDescription"] = g["desc"]
        o["metiersConcernes"] = extract_metiers(g["desc"])

        if o["date"] in NAME_FIXES:
            o["item"] = NAME_FIXES[o["date"]]

        if o["date"] in ITEM_OVERRIDES:
            o["item"] = g["name"]
            o["quantite"] = g["qty"]
            o["bonusCategories"] = ITEM_OVERRIDES[o["date"]]["bonusCategories"]
            o["imgUrl"] = None  # à ré-enrichir via enrich_images.py

    with open(ALMANAX_PATH, "w", encoding="utf-8") as f:
        json.dump(offrandes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{len(offrandes)} offrandes mises à jour (kamas + descriptions).")


if __name__ == "__main__":
    main()
