document.addEventListener('DOMContentLoaded', async () => {
try {
  const { ok } = await Api.auth.sessao();
  if (ok) { window.location.replace('index.html'); return; }
} catch (_) {} 

  document.querySelectorAll('.btn-aba').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('ativo'));
      document.querySelectorAll('.painel-aba').forEach(p => p.classList.remove('ativo'));
      btn.classList.add('ativo');
      document.getElementById('painel-' + btn.dataset.aba).classList.add('ativo');
    });
  });

  const elErrLogin  = document.getElementById('msg-login');
  const elErrCad    = document.getElementById('msg-cad');
  const elOkCad     = document.getElementById('msg-cad-ok');
  const btnEntrar   = document.getElementById('btn-entrar');
  const btnCadastrar = document.getElementById('btn-cadastrar');

async function doLogin() {
  elErrLogin.classList.remove('visivel');
  const nome  = document.getElementById('login-usuario').value;
  const senha = document.getElementById('login-senha').value;
  try {
    const { ok, data } = await Api.auth.entrar(nome, senha);
    if (ok) { window.location.href = 'index.html'; }
    else { elErrLogin.textContent = data.erro; elErrLogin.classList.add('visivel'); sacudir(btnEntrar); }
  } catch (_) {
    elErrLogin.textContent = 'Erro de conexão. Backend está rodando?';
    elErrLogin.classList.add('visivel');
    sacudir(btnEntrar);
  }
}

  async function doCadastro() {
    elErrCad.classList.remove('visivel');
    elOkCad.classList.remove('visivel');
    const nome   = document.getElementById('cad-usuario').value;
    const senha  = document.getElementById('cad-senha').value;
    const senha2 = document.getElementById('cad-senha2').value;
    if (senha !== senha2) {
      elErrCad.textContent = 'As senhas não coincidem.';
      elErrCad.classList.add('visivel');
      sacudir(btnCadastrar);
      return;
    }
    const { ok, data } = await Api.auth.cadastrar(nome, senha);
    if (ok) {
      elOkCad.textContent = 'Conta criada! Entrando...';
      elOkCad.classList.add('visivel');
      setTimeout(() => window.location.href = 'index.html', 1200);
    } else {
      elErrCad.textContent = data.erro;
      elErrCad.classList.add('visivel');
      sacudir(btnCadastrar);
    }
  }

  btnEntrar.addEventListener('click', doLogin);
  document.getElementById('login-senha').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-usuario').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-senha').focus(); });

  btnCadastrar.addEventListener('click', doCadastro);
  document.getElementById('cad-senha2').addEventListener('keydown', e => { if (e.key === 'Enter') doCadastro(); });
});
