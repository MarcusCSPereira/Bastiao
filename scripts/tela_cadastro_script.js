document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("As senhas não coincidem.");
    return;
  }

  // Simula o envio para o backend (substitua pelo código do backend real)
  alert(`Conta criada com username: ${fullName} e email: ${email}!`);
  window.location.href = "tela_login.html"; // Redireciona para a tela de login após cadastro
});