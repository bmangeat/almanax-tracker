"""
Enrichit data/almanax.json avec une image (imgUrl) par offrande, en croisant les
noms d'objets avec l'encyclopédie Dofus du projet Crawlit/Dofapi :
https://github.com/dofapi/crawlit-dofus-encyclopedia-parser

Usage : python3 scraper/enrich_images.py
"""
import json
import urllib.request

BASE_URL = "https://raw.githubusercontent.com/dofapi/crawlit-dofus-encyclopedia-parser/master/data/dofus"

# Ordre de priorité en cas de nom en doublon entre catégories.
CATEGORIES = ["resource", "allequipments", "allweapons", "consumable", "set", "pet", "mount"]

ALMANAX_PATH = "data/almanax.json"
UNMATCHED_PATH = "scraper/unmatched_images.txt"


def fetch_json(category):
    url = f"{BASE_URL}/{category}.json"
    with urllib.request.urlopen(url) as resp:
        return json.load(resp)


DEAD_PREFIX = "https://s.ankama.com/www/static.ankama.com/"
LIVE_PREFIX = "https://static.ankama.com/"


def fix_img_url(img_url):
    # Le crawler dofapi référence un sous-domaine mort (s.ankama.com, NXDOMAIN) ;
    # le CDN CloudFront actuel sert les mêmes assets sous static.ankama.com.
    if img_url and img_url.startswith(DEAD_PREFIX):
        return LIVE_PREFIX + img_url[len(DEAD_PREFIX):]
    return img_url


def build_name_index():
    index = {}
    for category in CATEGORIES:
        print(f"Téléchargement {category}.json…")
        items = fetch_json(category)
        for item in items:
            if not item:
                continue
            name = (item.get("name") or "").strip().lower()
            img_url = fix_img_url(item.get("imgUrl"))
            if name and img_url and name not in index:
                index[name] = img_url
    return index


def main():
    with open(ALMANAX_PATH, encoding="utf-8") as f:
        offrandes = json.load(f)

    index = build_name_index()

    unmatched = []
    matched = 0
    for offrande in offrandes:
        key = offrande["item"].strip().lower()
        img_url = index.get(key)
        offrande["imgUrl"] = img_url
        if img_url:
            matched += 1
        else:
            unmatched.append(offrande["item"])

    with open(ALMANAX_PATH, "w", encoding="utf-8") as f:
        json.dump(offrandes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    with open(UNMATCHED_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(sorted(set(unmatched))) + "\n")

    print(f"\n{matched}/{len(offrandes)} offrandes enrichies avec une image.")
    print(f"{len(unmatched)} sans correspondance -> voir {UNMATCHED_PATH}")


if __name__ == "__main__":
    main()
