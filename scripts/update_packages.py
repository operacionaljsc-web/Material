"""Atualiza os materiais da aba PACOTES EXPLODIDOS-HW."""
import json
import sys
from datetime import date
from pathlib import Path
from pyxlsb import open_workbook


def text(value):
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def extract(source, codes):
    records = {}
    with open_workbook(str(source)) as workbook:
        with workbook.get_sheet("PACOTES EXPLODIDOS-HW") as sheet:
            for row in sheet.rows(sparse=True):
                values = {cell.c: cell.v for cell in row if cell.c in (1, 3, 4)}
                code = text(values.get(1))
                if code not in codes:
                    continue
                item = text(values.get(3))
                qty = text(values.get(4))
                if not item and not qty:
                    continue
                records.setdefault(code, []).append([code, item, qty])
    return records


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/update_packages.py caminho/arquivo.xlsb")
    root = Path(__file__).resolve().parents[1]
    material = json.loads((root / "data" / "material.json").read_text(encoding="utf-8"))
    codes = {row[2] for rows in material["records"].values() for row in rows if row[2]}
    records = extract(Path(sys.argv[1]), codes)
    output = root / "data" / "pacotes.json"
    output.write_text(json.dumps({"updatedAt": date.today().isoformat(), "records": records}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(records)} códigos encontrados, {sum(map(len, records.values()))} linhas de material em {output}")
