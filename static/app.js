const slides = [...document.querySelectorAll('.slide')];
const count = document.querySelector('#count');
const progress = document.querySelector('#progress-fill');
const notes = document.querySelector('#notes');
const notesText = document.querySelector('#notes-text');
let current = -1;
let signedIn = false;

function show(index) {
  const wasIntro = current === 0;
  current = Math.max(0, Math.min(slides.length - 1, index));
  if (wasIntro && current !== 0) window.MatrixIntro.stop();
  if (!wasIntro && current === 0) window.MatrixIntro.start();
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
    slide.setAttribute('aria-hidden', String(i !== current));
  });
  count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  notesText.textContent = slides[current].dataset.notes || '';
  document.querySelector('#prev').disabled = current === 0;
  document.querySelector('#next').disabled = current === slides.length - 1;
  history.replaceState(null, '', `#${current + 1}`);
}

document.querySelector('#prev').addEventListener('click', () => show(current - 1));
document.querySelector('#next').addEventListener('click', () => show(current + 1));

function resetInteraction() {
  if (current === 5) document.querySelector('#shift').value = 0, updateCipher();
  if (current === 10) {
    document.querySelector('#record-number').value = '104';
    resetDemo();
  }
  if (current === 12) {
    document.querySelector('#protected-number').value = '105';
    clearResult('protected', 'Aplica la corrección y consulta el expediente 105.');
  }
}

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const editing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (editing) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  else if (event.key.toLowerCase() === 'f') { document.fullscreenElement ? document.exitFullscreen() : document.querySelector('#deck').requestFullscreen?.(); }
  else if (event.key.toLowerCase() === 'n') { notes.hidden = !notes.hidden; }
  else if (event.key.toLowerCase() === 'r') { resetInteraction(); }
});

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const cipherText = 'PLUD OD GLUHFFLRQ';
function updateCipher() {
  const shift = Number(document.querySelector('#shift').value);
  document.querySelector('#shift-value').textContent = shift;
  document.querySelector('#decoded').textContent = [...cipherText].map(char => {
    const pos = alphabet.indexOf(char);
    return pos < 0 ? char : alphabet[(pos - shift + 26) % 26];
  }).join('');
  document.querySelector('.cipher-panel').classList.toggle('solved', shift === 3);
}
document.querySelector('#shift').addEventListener('input', updateCipher);
updateCipher();

function clearResult(mode, text) {
  document.querySelector(`#${mode}-code`).textContent = '—';
  document.querySelector(`#${mode}-code`).className = '';
  const target = document.querySelector(`#${mode}-result`);
  target.textContent = text;
  target.className = 'result-body muted';
}

function renderResult(mode, status, data) {
  const code = document.querySelector(`#${mode}-code`);
  const result = document.querySelector(`#${mode}-result`);
  code.textContent = `HTTP ${status}`;
  code.className = status === 200 ? 'code-ok' : 'code-denied';
  result.replaceChildren();
  result.className = 'result-body';
  if (status !== 200) {
    const message = document.createElement('strong');
    message.className = 'error-message';
    message.textContent = data.error || 'No se pudo consultar el expediente.';
    result.append(message);
    return;
  }
  const label = document.createElement('span');
  label.className = 'mini-label';
  label.textContent = 'EXPEDIENTE ENCONTRADO';
  const name = document.createElement('strong');
  name.className = 'result-name';
  name.textContent = data.name;
  const details = document.createElement('p');
  details.textContent = `Expediente ${data.id} · ${data.group} · ${data.document}`;
  result.append(label, name, details);
}

async function startSession() {
  try {
    const response = await fetch('/api/session', {cache: 'no-store'});
    if (!response.ok) throw new Error('No se pudo iniciar la sesión.');
    const session = await response.json();
    signedIn = true;
    document.querySelector('#session-label').textContent = `${session.display_name} · expediente ${session.record_id}`;
    document.querySelector('#start-session').textContent = 'Sesión activa ✓';
    document.querySelector('#protected-session').textContent = `${session.display_name} · expediente ${session.record_id}`;
    document.querySelector('#fix-status').textContent = session.fixed ? 'Corrección aplicada: también protege la URL antigua.' : 'La corrección aún no se ha aplicado.';
    return true;
  } catch (error) {
    document.querySelector('#session-label').textContent = error.message;
    return false;
  }
}

async function visit(mode) {
  const input = document.querySelector(mode === 'vulnerable' ? '#record-number' : '#protected-number');
  const recordId = input.value.trim();
  if (!/^\d{3}$/.test(recordId)) {
    clearResult(mode, 'Escribe un número de expediente de tres cifras.');
    return;
  }
  const path = `/api/${mode}/expedientes/${recordId}`;
  document.querySelector(`#${mode}-url`).textContent = path;
  if (!signedIn && !await startSession()) return;
  try {
    const response = await fetch(path, {cache: 'no-store'});
    renderResult(mode, response.status, await response.json());
  } catch {
    clearResult(mode, 'No hay respuesta del servidor local. Comprueba que python3 server.py siga abierto.');
  }
}

async function applyFixAndVisit() {
  if (!signedIn && !await startSession()) return;
  try {
    const response = await fetch('/api/demo/fix', {method: 'POST', cache: 'no-store'});
    if (!response.ok) throw new Error('No se pudo aplicar la corrección.');
    document.querySelector('#fix-status').textContent = 'Corrección aplicada: también protege la URL antigua.';
    await visit('protected');
  } catch (error) {
    clearResult('protected', error.message);
  }
}

async function resetDemo() {
  if (!signedIn && !await startSession()) return;
  try {
    const response = await fetch('/api/demo/reset', {method: 'POST', cache: 'no-store'});
    if (!response.ok) throw new Error('No se pudo reiniciar la simulación.');
    document.querySelector('#fix-status').textContent = 'La corrección aún no se ha aplicado.';
    clearResult('vulnerable', 'Simulación reiniciada. Consulta 104 y luego 105.');
    clearResult('protected', 'Aplica la corrección y consulta el expediente 105.');
  } catch (error) {
    clearResult('vulnerable', error.message);
  }
}

document.querySelector('#start-session').addEventListener('click', startSession);
document.querySelector('#visit-vulnerable').addEventListener('click', () => visit('vulnerable'));
document.querySelector('#visit-protected').addEventListener('click', applyFixAndVisit);
document.querySelector('#reset-demo').addEventListener('click', resetDemo);
for (const [selector, mode] of [['#record-number', 'vulnerable'], ['#protected-number', 'protected']]) {
  document.querySelector(selector).addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); mode === 'protected' ? applyFixAndVisit() : visit(mode); }
  });
}

const hashIndex = Number(location.hash.slice(1));
show(Number.isInteger(hashIndex) && hashIndex > 0 ? hashIndex - 1 : 0);
