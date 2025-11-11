const formRegistro = document.getElementById('form-registro');

formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;
  
  if (senha !== confirmarSenha) {
    alert('As senhas não coincidem!');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Conta criada com sucesso!');
      window.location.href = 'login.html';
    } else {
      alert(data.mensagem || 'Erro ao criar conta');
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor');
  }
});
