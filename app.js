const form = document.querySelector('#search-form');
const input = document.querySelector('#oc');
const message = document.querySelector('#message');
const results = document.querySelector('#results');
const resultOc = document.querySelector('#result-oc');
const resultCount = document.querySelector('#result-count');
const resultBody = document.querySelector('#result-body');
const dataDate = document.querySelector('#data-date');
const packageDialog = document.querySelector('#package-dialog');
const packageCode = document.querySelector('#package-code');
const packageMessage = document.querySelector('#package-message');
const packageTableWrap = document.querySelector('#package-table-wrap');
const packageBody = document.querySelector('#package-body');
const closeDialog = document.querySelector('#close-dialog');
let records = null;
let packages = null;

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

async function loadData() {
  const response = await fetch('data/material.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Não foi possível carregar os dados.');
  const data = await response.json();
  records = data.records;
  dataDate.textContent = `· base de ${new Date(`${data.updatedAt}T12:00:00`).toLocaleDateString('pt-BR')}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  results.hidden = true;
  const oc = input.value.trim();
  if (!oc) {
    showMessage('Digite uma OC para fazer a consulta.', true);
    input.focus();
    return;
  }
  showMessage('Consultando…');
  try {
    if (!records) await loadData();
    const rows = records[oc] || [];
    if (!rows.length) {
      showMessage(`Nenhum resultado encontrado para a OC ${oc}.`);
      return;
    }
    resultOc.textContent = oc;
    resultCount.textContent = `${rows.length} ${rows.length === 1 ? 'linha' : 'linhas'}`;
    resultBody.replaceChildren(...rows.map(([delivery, nf, codeSap]) => {
      const tr = document.createElement('tr');
      for (const [columnIndex, value] of [delivery, nf, codeSap].entries()) {
        const td = document.createElement('td');
        if (columnIndex === 2 && codeSap) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'sap-button';
          button.dataset.sap = codeSap;
          button.setAttribute('aria-label', `Ver materiais do Code SAP ${codeSap}`);
          button.textContent = codeSap;
          td.append(button);
        } else {
          td.textContent = value || '—';
        }
        tr.append(td);
      }
      return tr;
    }));
    results.hidden = false;
    showMessage('Consulta concluída.');
  } catch {
    showMessage('Não foi possível carregar a base. Tente novamente mais tarde.', true);
  }
});

resultBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-sap]');
  if (!button) return;
  const code = button.dataset.sap;
  packageCode.textContent = code;
  packageMessage.textContent = 'Carregando materiais…';
  packageTableWrap.hidden = true;
  packageBody.replaceChildren();
  packageDialog.showModal();
  try {
    if (!packages) {
      const response = await fetch('data/pacotes.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Falha ao carregar materiais');
      packages = (await response.json()).records;
    }
    if (!packageDialog.open || packageCode.textContent !== code) return;
    const rows = packages[code] || [];
    if (!rows.length) {
      packageMessage.textContent = `Nenhum material encontrado para o Code SAP ${code}.`;
      return;
    }
    packageBody.replaceChildren(...rows.map((values) => {
      const tr = document.createElement('tr');
      for (const value of values) {
        const td = document.createElement('td');
        td.textContent = value || '—';
        tr.append(td);
      }
      return tr;
    }));
    packageMessage.textContent = `${rows.length} ${rows.length === 1 ? 'material' : 'materiais'}`;
    packageTableWrap.hidden = false;
  } catch {
    packageMessage.textContent = 'Não foi possível carregar os materiais. Tente novamente mais tarde.';
  }
});

closeDialog.addEventListener('click', () => packageDialog.close());
packageDialog.addEventListener('click', (event) => {
  if (event.target === packageDialog) packageDialog.close();
});
