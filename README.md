# Consulta de Material

Consulta a aba TIM 5G-Reuso por OC (coluna A) e mostra linhas únicas de Delivery (AM), NF (AO) e Code SAP (X).

Ao clicar no Code SAP, mostra os materiais da aba **PACOTES EXPLODIDOS-HW** da pasta de trabalho **Pacotes TIM 5G E REUSO ATUAL**. A correspondência é exata na coluna B. O pop-up mostra Pacote (B), VersionItem (D) e Qty (E). Linhas sem VersionItem e Qty são omitidas.

O site usa cópias dos dados em `data/material.json` e `data/pacotes.json`. Alterações no OneDrive não aparecem automaticamente. Para atualizar a base, baixe as duas pastas de trabalho `.xlsb` e execute `python scripts/update_data.py "caminho/primeiro-arquivo.xlsb"` e `python scripts/update_packages.py "caminho/segundo-arquivo.xlsb"` (requer `pyxlsb`). Publique os dois arquivos JSON atualizados.

Para testar localmente, execute `python -m http.server 8000` nesta pasta e abra `http://localhost:8000`.

Os arquivos Excel completos não fazem parte do projeto. As bases publicadas contêm somente as colunas necessárias para a consulta.
