// www/scripts/login.js

// Força refresh total ao voltar para esta página (evita cache após logout)
window.addEventListener("pageshow", function (event) {
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    window.location.reload(true);
  }
});

// Limpa os campos ao carregar a página
window.addEventListener("DOMContentLoaded", function () {
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  if (email) email.value = "";
  if (password) password.value = "";
});

// Evento de envio do formulário de login
document.getElementById("loginForm").addEventListener("submit", function (ev) {
  ev.preventDefault(); // Impede envio padrão

  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var msg = document.getElementById("msg");

  msg.className = "msg";
  msg.textContent = "";

  // Validação simples
  if (!email.value.trim() || !password.value) {
    msg.classList.add("err");
    msg.textContent = "Preenche todos os campos.";
    return;
  }

  // Cria corpo do pedido
  var body = new URLSearchParams();
  body.append("email", email.value.trim());
  body.append("password", password.value);

  // Envia pedido POST para login
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include", // Inclui cookies da sessão
    body: body.toString()
  })
    .then(res => res.json()) // Converte resposta em JSON
    .then(data => {
      if (data.ok) {
        msg.classList.add("ok");
        msg.textContent = "Login com sucesso! A redirecionar...";

        // Limpa os campos antes do redirecionamento
        setTimeout(() => {
          window.location.href = "/dashboard";
          email.value = "";
          password.value = "";
        }, 1000);
      } else {
        msg.classList.add("err");
        msg.textContent = data.message || "Credenciais inválidas.";
      }
    })
    .catch(err => {
      console.error(err);
      msg.classList.add("err");
      msg.textContent = "Erro de comunicação com o servidor.";
    });
});
