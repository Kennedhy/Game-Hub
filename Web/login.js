document.addEventListener('DOMContentLoaded', () => {
  if (Auth.obterSessao()) {
    window.location.replace('index.html');
    return;
  }

  popularDadosFicticios();

  const btnAbas    = document.querySelectorAll('.btn-aba');
  const paineis    = document.querySelectorAll('.painel-aba');

  btnAbas.forEach(btn => {
    btn.addEventListener('click', () => {
      btnAbas.forEach(b => b.classList.remove('ativo'));
      paineis.forEach(p => p.classList.remove('ativo'));
      btn.classList.add('ativo');
      document.getElementById('painel-' + btn.dataset.aba).classList.add('ativo');
    });
  });

  const campLoginUsuario = document.getElementById('login-usuario');
  const campLoginSenha   = document.getElementById('login-senha');
  const erroLogin        = document.getElementById('erro-login');
  const btnEntrar        = document.getElementById('btn-entrar');

  function executarLogin() {
    erroLogin.classList.remove('visivel');
    const resultado = Auth.entrar(campLoginUsuario.value, campLoginSenha.value);
    if (resultado.ok) {
      window.location.href = 'index.html';
    } else {
      erroLogin.textContent = resultado.erro;
      erroLogin.classList.add('visivel');
      sacudir(btnEntrar);
    }
  }

  btnEntrar.addEventListener('click', executarLogin);
  campLoginSenha.addEventListener('keydown', e => { if (e.key === 'Enter') executarLogin(); });
  campLoginUsuario.addEventListener('keydown', e => { if (e.key === 'Enter') campLoginSenha.focus(); });

  const campCadUsuario = document.getElementById('cad-usuario');
  const campCadSenha   = document.getElementById('cad-senha');
  const campCadSenha2  = document.getElementById('cad-senha2');
  const erroCad        = document.getElementById('erro-cad');
  const sucessoCad     = document.getElementById('sucesso-cad');
  const btnCadastrar   = document.getElementById('btn-cadastrar');

  function executarCadastro() {
    erroCad.classList.remove('visivel');
    sucessoCad.classList.remove('visivel');

    if (campCadSenha.value !== campCadSenha2.value) {
      erroCad.textContent = 'As senhas não coincidem.';
      erroCad.classList.add('visivel');
      sacudir(btnCadastrar);
      return;
    }

    const resultado = Auth.cadastrar(campCadUsuario.value, campCadSenha.value);
    if (resultado.ok) {
      sucessoCad.textContent = 'Conta criada! Entrando...';
      sucessoCad.classList.add('visivel');
      setTimeout(() => window.location.href = 'index.html', 1200);
    } else {
      erroCad.textContent = resultado.erro;
      erroCad.classList.add('visivel');
      sacudir(btnCadastrar);
    }
  }

  btnCadastrar.addEventListener('click', executarCadastro);
  campCadSenha2.addEventListener('keydown', e => { if (e.key === 'Enter') executarCadastro(); });
});
