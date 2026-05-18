let _timerNot;

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  let el = document.getElementById('notificacao');
  if (!el) {
    el = document.createElement('div');
    el.id = 'notificacao';
    el.className = 'notificacao';
    document.body.appendChild(el);
  }
  clearTimeout(_timerNot);
  el.textContent = mensagem;
  el.className = `notificacao ${tipo}`;
  requestAnimationFrame(() => el.classList.add('visivel'));
  _timerNot = setTimeout(() => el.classList.remove('visivel'), 3200);
}

function sacudir(el) {
  const passos = ['-6px', '6px', '-4px', '4px', '0'];
  let i = 0;
  el.style.transition = 'transform .07s';
  const run = () => {
    if (i >= passos.length) { el.style.transition = ''; return; }
    el.style.transform = `translateX(${passos[i++]})`;
    setTimeout(run, 70);
  };
  run();
}

function animarContador(el, fim, durMs, sepMilhar = false) {
  if (!el) return;
  const t0 = performance.now();
  const run = (now) => {
    const p = Math.min((now - t0) / durMs, 1);
    const v = Math.round((1 - (1 - p) ** 3) * fim);
    el.textContent = sepMilhar ? v.toLocaleString('pt-BR') : v;
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

async function exigirSessao() {
  const { ok, data } = await Api.auth.sessao();
  if (!ok) { window.location.replace('login.html'); return null; }
  return data;
}

function montarCabecalho(nomeUsuario) {
  const el = document.getElementById('nome-cabecalho');
  if (el) el.textContent = nomeUsuario;

  const btnSair = document.getElementById('btn-sair');
  if (btnSair) btnSair.addEventListener('click', async () => {
    await Api.auth.sair();
    window.location.href = 'login.html';
  });
}
