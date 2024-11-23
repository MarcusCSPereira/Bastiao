document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Verifica se ambos os campos possuem algum valor
  if (username && password) {
    window.location.href = "tela_mapa.html"; // Redireciona para a próxima página
  } else {
    alert("Please fill in all fields."); // Mensagem de erro caso não preencha
  }
});