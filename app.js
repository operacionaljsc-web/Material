const form = document.querySelector('#search-form');
const input = document.querySelector('#oc');
const message = document.querySelector('#message');
const results = document.querySelector('#results');
const resultOc = document.querySelector('#result-oc');
const resultCount = document.querySelector('#result-count');
const resultBody = document.querySelector('#result-body');
const dataDate = document.querySelector('#data-date');
let records = null;

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
      for (const value of [delivery, nf, codeSap]) {
        const td = document.createElement('td');
        td.textContent = value || '—';
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
