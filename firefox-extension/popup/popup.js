'use strict';

// ─── CPF GENERATOR ───────────────────────────────────────────────────────────

function gerarDigito(cpf) {
  const len = cpf.length + 1;
  const soma = cpf.reduce((acc, n, i) => acc + n * (len - i), 0);
  const resto = (soma * 10) % 11;
  return resto >= 10 ? 0 : resto;
}

function gerarCPF() {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const d1 = gerarDigito(base);
  const d2 = gerarDigito([...base, d1]);
  return [...base, d1, d2].join('');
}

function formatarCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function validarCPF(input) {
  const raw = input.replace(/\D/g, '');
  if (raw.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(raw)) return false;
  const nums = raw.split('').map(Number);
  const d1 = gerarDigito(nums.slice(0, 9));
  const d2 = gerarDigito(nums.slice(0, 10));
  return nums[9] === d1 && nums[10] === d2;
}

// ─── STATE ───────────────────────────────────────────────────────────────────

let cpfAtual = null;
let historico = []; // [{ id, cpf, pinned, addedAt }]

// ─── STORAGE ─────────────────────────────────────────────────────────────────

async function carregarHistorico() {
  const res = await browser.storage.local.get('historico');
  historico = res.historico || [];
  renderHistorico();
  atualizarBadge();
}

async function salvarHistorico() {
  await browser.storage.local.set({ historico });
  atualizarBadge();
}

// ─── UI HELPERS ──────────────────────────────────────────────────────────────

function atualizarBadge() {
  const badge = document.getElementById('hist-count');
  badge.textContent = historico.length > 0 ? historico.length : '';
}

function copiarTexto(texto, btn) {
  navigator.clipboard.writeText(texto).then(() => {
    btn.classList.add('copied');
    const original = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 1500);
  });
}

function iconeCopiar(size = 14) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
}

function iconePin() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8.5 8.5 2 9.27l5 4.87L5.82 21 12 17.77 18.18 21 17 14.14l5-4.87-6.5-.77L12 2z"/></svg>`;
}

function iconeLixo() {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
}

// ─── HISTORICO RENDER ─────────────────────────────────────────────────────────

function historicoOrdenado() {
  const pinned = historico.filter(i => i.pinned);
  const soltos = historico.filter(i => !i.pinned);
  return [...pinned, ...soltos];
}

function renderHistorico() {
  const lista = document.getElementById('hist-list');
  const empty = document.getElementById('hist-empty');
  const footer = document.getElementById('hist-footer');

  if (historico.length === 0) {
    lista.innerHTML = '';
    empty.style.display = 'flex';
    footer.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  footer.style.display = 'block';

  const ordered = historicoOrdenado();
  lista.innerHTML = ordered.map(item => {
    const fmt = formatarCPF(item.cpf);
    return `
      <div class="hist-item${item.pinned ? ' pinned' : ''}" data-id="${item.id}">
        <div class="hist-cpf">${fmt}</div>
        <div class="hist-actions">
          <button class="hist-btn copy-mask" title="Copiar com pontuação" data-cpf="${fmt}">${iconeCopiar(13)}</button>
          <button class="hist-btn copy-raw" title="Copiar sem pontuação" data-cpf="${item.cpf}">${iconeCopiar(13)}</button>
          <button class="hist-btn pin-btn${item.pinned ? ' pin-active' : ''}" title="${item.pinned ? 'Desafixar' : 'Fixar no topo'}" data-id="${item.id}">${iconePin()}</button>
          <button class="hist-btn del" title="Excluir" data-id="${item.id}">${iconeLixo()}</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind events
  lista.querySelectorAll('.copy-mask').forEach(btn => {
    btn.addEventListener('click', () => copiarTexto(btn.dataset.cpf, btn));
  });

  lista.querySelectorAll('.copy-raw').forEach(btn => {
    btn.addEventListener('click', () => copiarTexto(btn.dataset.cpf, btn));
  });

  lista.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', () => togglePin(btn.dataset.id));
  });

  lista.querySelectorAll('.del').forEach(btn => {
    btn.addEventListener('click', () => excluirItem(btn.dataset.id));
  });
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

function adicionarAoHistorico(cpf) {
  const jaExiste = historico.some(i => i.cpf === cpf);
  if (jaExiste) return false;
  historico.unshift({ id: Date.now().toString(), cpf, pinned: false, addedAt: Date.now() });
  salvarHistorico();
  renderHistorico();
  return true;
}

function togglePin(id) {
  const item = historico.find(i => i.id === id);
  if (item) { item.pinned = !item.pinned; }
  salvarHistorico();
  renderHistorico();
}

function excluirItem(id) {
  historico = historico.filter(i => i.id !== id);
  salvarHistorico();
  renderHistorico();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}-content`).classList.add('active');
  });
});

// ─── GERADOR EVENTS ───────────────────────────────────────────────────────────

document.getElementById('btn-gerar').addEventListener('click', () => {
  const cpf = gerarCPF();
  cpfAtual = cpf;

  const display = document.getElementById('cpf-display');
  display.textContent = formatarCPF(cpf);
  display.classList.remove('empty');

  document.getElementById('copy-row').style.display = 'flex';

  adicionarAoHistorico(cpf);
});

document.getElementById('btn-copy-mask').addEventListener('click', function () {
  if (cpfAtual) copiarTexto(formatarCPF(cpfAtual), this);
});

document.getElementById('btn-copy-raw').addEventListener('click', function () {
  if (cpfAtual) copiarTexto(cpfAtual, this);
});

// ─── HISTÓRICO: ADICIONAR MANUAL ─────────────────────────────────────────────

const inputManual = document.getElementById('input-cpf-manual');
const errMsg = document.getElementById('input-error');

function mostrarErro(msg) {
  errMsg.textContent = msg;
  errMsg.style.display = 'block';
  inputManual.classList.add('error');
  setTimeout(() => {
    errMsg.style.display = 'none';
    inputManual.classList.remove('error');
  }, 2500);
}

function adicionarManual() {
  const raw = inputManual.value.replace(/\D/g, '');
  if (!raw) return;

  if (!validarCPF(raw)) {
    mostrarErro('CPF inválido. Verifique os dígitos.');
    return;
  }

  const jaExiste = historico.some(i => i.cpf === raw);
  if (jaExiste) {
    mostrarErro('Este CPF já está no histórico.');
    return;
  }

  adicionarAoHistorico(raw);
  inputManual.value = '';
}

document.getElementById('btn-add-manual').addEventListener('click', adicionarManual);

inputManual.addEventListener('keydown', e => {
  if (e.key === 'Enter') adicionarManual();
});

// Formata enquanto digita (XXX.XXX.XXX-XX)
inputManual.addEventListener('input', () => {
  let v = inputManual.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9);
  else if (v.length > 6) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6);
  else if (v.length > 3) v = v.slice(0,3)+'.'+v.slice(3);
  inputManual.value = v;
});

// ─── LIMPAR HISTÓRICO ────────────────────────────────────────────────────────

document.getElementById('btn-clear-all').addEventListener('click', () => {
  if (historico.length === 0) return;
  historico = [];
  salvarHistorico();
  renderHistorico();
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.getElementById('cpf-display').classList.add('empty');
carregarHistorico();
