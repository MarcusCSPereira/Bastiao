document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Evita o reload da página ao submeter o formulário

  // Obter os valores do formulário
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageElement = document.getElementById('message');

  // Limpar mensagem anterior
  messageElement.textContent = '';
  messageElement.className = 'message';

  // Validação simples
  if (!email || !password) {
    messageElement.textContent = 'Preencha todos os campos!';
    return;
  }

  try {
    // Fazer a requisição para o JSON Server
    const response = await fetch(`https://json-serve-bice.vercel.app/users?email=${email}&password=${password}`);
    const users = await response.json();

    if (users.length > 0) {
      // Login bem-sucedido
      messageElement.textContent = 'Login realizado com sucesso!';
      messageElement.classList.add('success');

      // Redirecionar para outra página após 2 segundos
      setTimeout(() => {
        window.location.href = '/tela_mapa.html';
      }, 2000);
    } else {
      // Login falhou
      messageElement.textContent = 'Usuário ou senha inválidos!';
    }
  } catch (error) {
    console.error('Erro ao conectar ao servidor:', error);
    messageElement.textContent = 'Erro ao conectar ao servidor. Tente novamente mais tarde.';
  }
});
