import re
import json

MONTHS = {
    "janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
    "juillet": 7, "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12,
}

EMOJI_CATEGORY = {
    "🎓": ["xp"],
    "🍀": ["drop"],
    "⚔️": ["pvm"],
    "🎯": ["pvm"],
    "🛠️": ["craft"],
    "🌳": ["metier"],
    "🌿": ["metier"],
    "🌾": ["metier"],
    "⛏️": ["metier"],
    "🎣": ["metier"],
    "🥩": ["metier"],
    "🐣": ["elevage"],
    "🐎": ["elevage", "xp"],
    "🔮": ["craft"],
    "🏗️": ["craft"],
    "⭐": ["quete"],
    "🏅": ["quete"],
    "💰": ["kamas_bonus"],
    "🎁": ["drop"],
    "🎒": ["drop"],
    "🏥": ["autre"],
    "👹": ["pvm"],
    "🔎": ["autre"],
    "🔑": ["autre"],
    "💤": ["autre"],
    "🎭": ["autre"],
    "🔨": ["craft"],
    "🎶": ["drop"],
    "🧪": ["craft"],
    "🧑‍🍳": ["craft"],
    "🏆": ["autre"],
    "🐾": ["xp"],
    "🎆": ["craft"],
}

METIERS = [
    "Bûcherons", "Bûcheron", "Alchimistes", "Alchimiste", "Paysans", "Paysan",
    "Mineurs", "Mineur", "Pêcheurs", "Pêcheur", "Chasseurs", "Chasseur",
    "Forgerons", "Forgeron", "Sculpteurs", "Sculpteur", "Sculptemages",
    "Façomages", "Cordonniers", "Cordonnier", "Tailleurs", "Tailleur",
    "Bijoutiers", "Bijoutier", "Joaillomages", "Bricoleurs", "Bricoleur",
    "Costumages", "Forgemages", "Cordomages",
]

def normalize_metier(m):
    m = m.rstrip("s") if m.endswith("s") and m not in ("Sculptemages",) else m
    return m

def extract_metiers(text):
    found = set()
    for m in METIERS:
        if re.search(r'\b' + re.escape(m) + r'\b', text):
            found.add(normalize_metier(m))
    return sorted(found)

LINE_RE = re.compile(
    r'^- \*\*(?P<date>.+?)\s*:\*\*\s+(?P<qty>\d+)\s+(?P<item>.+?)\s+\(\+(?P<kamas>\d+)k\)(?P<rest>.*)$'
)
SEGMENT_RE = re.compile(r'([^\s\*]+)\s+\*\*(.+?)\*\*')

def parse_date(raw_date):
    parts = raw_date.replace("1er", "1").split()
    day = int(parts[0])
    month_name = parts[1].lower()
    month = MONTHS[month_name]
    return f"{month:02d}-{day:02d}"

def parse_file(path):
    entries = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            m = LINE_RE.match(line)
            if not m:
                continue
            date = parse_date(m.group("date"))
            qty = int(m.group("qty"))
            item = m.group("item").strip()
            kamas = int(m.group("kamas")) * 1000
            rest = m.group("rest")

            categories = set()
            bonus_texts = []
            metiers = set()

            for emoji, bonus_text in SEGMENT_RE.findall(rest):
                bonus_texts.append(bonus_text.strip())
                for cat in EMOJI_CATEGORY.get(emoji, ["autre"]):
                    categories.add(cat)
                for mt in extract_metiers(bonus_text):
                    metiers.add(mt)

            if not categories:
                categories.add("aucun")

            entries.append({
                "date": date,
                "item": item,
                "quantite": qty,
                "kamas": kamas,
                "bonusDescription": " | ".join(bonus_texts) if bonus_texts else None,
                "bonusCategories": sorted(categories),
                "metiersConcernes": sorted(metiers),
            })

    return entries

if __name__ == "__main__":
    entries = parse_file("raw.md")
    print(f"Parsed {len(entries)} entries")
    with open("almanax.json", "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
