document.getElementById('registerForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Impede o envio do formulário e recarregamento da página

  // Obter os valores dos campos
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const messageElement = document.getElementById('message');

  // Limpar mensagem anterior
  messageElement.textContent = '';
  messageElement.className = 'message';

  // Verifica se as senhas são iguais
  if (password !== confirmPassword) {
    messageElement.textContent = 'As senhas não coincidem!';
    return;
  }


  setTimeout( async () => {

  try {
    // Verificar se o email já está cadastrado
    const checkResponse = await fetch(`http://localhost:3000/users?email=${email}`);
    const existingUsers = await checkResponse.json();

    if (existingUsers.length > 0) {
      // Email já cadastrado
      messageElement.textContent = 'Este e-mail já está cadastrado!';
      return;
    }

    // Se o email não existir, prosseguir com o cadastro
    const newUser = {
      fullName,
      email,
      password,
    };

    // Requisição POST para adicionar o usuário no JSON Server
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });

      messageElement.classList.add('success');

      messageElement.textContent = 'Cadastro realizado com sucesso!';
      const result = await response.json();

      window.location.href = 'tela_login.html';

      alert("Funcionou")

  } catch (error) {
    console.error('Erro ao conectar ao servidor:', error);
    messageElement.textContent = 'Erro ao conectar ao servidor. Tente novamente mais tarde.';
    
  }
  }, 0);

}); 
