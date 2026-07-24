"""
Télécharge en local (public/items/) les icônes des offrandes référencées dans
data/almanax.json, pour ne plus dépendre du CDN Ankama (qui applique une
protection anti-hotlink par Referer, cf. referrerPolicy="no-referrer" ajouté
en attendant ce script) ni de sa disponibilité.

Réécrit ensuite les imgUrl de data/almanax.json en chemins locaux (/items/*.png).

Usage : python3 scraper/download_images.py
"""
import json
import urllib.request
from pathlib import Path

ALMANAX_PATH = "data/almanax.json"
IMAGES_DIR = Path("public/items")


def main():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    with open(ALMANAX_PATH, encoding="utf-8") as f:
        offrandes = json.load(f)

    downloaded = 0
    failed = []

    for o in offrandes:
        url = o.get("imgUrl")
        if not url:
            continue

        filename = url.rsplit("/", 1)[-1]
        local_path = IMAGES_DIR / filename

        if not local_path.exists():
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    local_path.write_bytes(resp.read())
                downloaded += 1
            except Exception as e:
                failed.append((o["item"], url, str(e)))
                o["imgUrl"] = None
                continue

        o["imgUrl"] = f"/items/{filename}"

    with open(ALMANAX_PATH, "w", encoding="utf-8") as f:
        json.dump(offrandes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    total_size = sum(p.stat().st_size for p in IMAGES_DIR.glob("*.png"))
    print(f"{downloaded} images téléchargées dans {IMAGES_DIR}/ ({total_size / 1024:.0f} Ko)")
    if failed:
        print(f"{len(failed)} échecs :")
        for item, url, err in failed:
            print(f"  - {item} ({url}): {err}")


if __name__ == "__main__":
    main()
