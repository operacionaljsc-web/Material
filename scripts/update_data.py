"""Atualiza a base do site a partir da pasta de trabalho .xlsb."""
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path
from pyxlsb import open_workbook


def identifier(value):
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def extract(source):
    source_rows = []
    oc_by_site_sc = defaultdict(set)
    with open_workbook(str(source)) as workbook:
        with workbook.get_sheet("TIM 5G-Reuso") as sheet:
            for row in sheet.rows(sparse=True):
                values = {cell.c: identifier(cell.v) for cell in row if cell.c in (0, 15, 23, 38, 40, 42)}
                oc = values.get(0, "")
                site = values.get(15, "")
                sc = values.get(42, "")
                source_rows.append(values)
                if oc.isdigit() and site and sc:
                    oc_by_site_sc[(site, sc)].add(oc)

    records = {}
    seen = {}
    sites = {}
    recovered = 0
    for values in source_rows:
        oc = values.get(0, "")
        site = values.get(15, "")
        sc = values.get(42, "")
        if oc.upper() == "X":
            matches = oc_by_site_sc.get((site, sc), set()) if site and sc else set()
            if len(matches) != 1:
                continue
            oc = next(iter(matches))
            recovered += 1
        if not oc or oc == "OC":
            continue
        if site and site not in sites.setdefault(oc, []):
            sites[oc].append(site)
        result = (values.get(38, ""), values.get(40, ""), values.get(23, ""))
        if result[:2] == ("", "") or result in seen.setdefault(oc, set()):
            continue
        seen[oc].add(result)
        records.setdefault(oc, []).append(result)
    return records, {oc: sites.get(oc, []) for oc in records}, recovered


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/update_data.py caminho/arquivo.xlsb")
    output = Path(__file__).resolve().parents[1] / "data" / "material.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    records, sites, recovered = extract(Path(sys.argv[1]))
    output.write_text(json.dumps({"updatedAt": date.fromtimestamp(Path(sys.argv[1]).stat().st_mtime).isoformat(), "records": records, "sites": sites}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(records)} OCs, {sum(map(len, records.values()))} linhas únicas, {recovered} linhas com OC X associadas em {output}")

