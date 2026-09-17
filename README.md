# Consulta de Material

Consulta a aba TIM 5G-Reuso por OC (coluna A) e mostra linhas únicas de Delivery (AM), NF (AO) e Code SAP (X).

O site usa uma cópia dos dados em `data/material.json`. Alterações no OneDrive não aparecem automaticamente. Para atualizar a base, baixe a pasta de trabalho `.xlsb` e execute `python scripts/update_data.py "caminho/arquivo.xlsb"` (requer `pyxlsb`). Publique o `material.json` atualizado.

Para testar localmente, execute `python -m http.server 8000` nesta pasta e abra `http://localhost:8000`.

O arquivo Excel completo não faz parte do projeto. A base publicada contém somente OC, Delivery, NF e Code SAP da aba escolhida.
