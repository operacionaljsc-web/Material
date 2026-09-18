"""Atualiza a base do site a partir da pasta de trabalho .xlsb."""
import json
import sys
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
    records = {}
    seen = {}
    sites = {}
    with open_workbook(str(source)) as workbook:
        with workbook.get_sheet("TIM 5G-Reuso") as sheet:
            for row in sheet.rows(sparse=True):
                values = {cell.c: cell.v for cell in row if cell.c in (0, 15, 23, 38, 40)}
                oc = identifier(values.get(0))
                if not oc or oc == "OC":
                    continue
                site = identifier(values.get(15))
                if site and site not in sites.setdefault(oc, []):
                    sites[oc].append(site)
                pair = (identifier(values.get(38)), identifier(values.get(40)), identifier(values.get(23)))
                if pair[:2] == ("", "") or pair in seen.setdefault(oc, set()):
                    continue
                seen[oc].add(pair)
                records.setdefault(oc, []).append(pair)
    return records, {oc: sites.get(oc, []) for oc in records}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/update_data.py caminho/arquivo.xlsb")
    output = Path(__file__).resolve().parents[1] / "data" / "material.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    records, sites = extract(Path(sys.argv[1]))
    output.write_text(json.dumps({"updatedAt": date.today().isoformat(), "records": records, "sites": sites}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(records)} OCs e {sum(map(len, records.values()))} linhas únicas em {output}")
