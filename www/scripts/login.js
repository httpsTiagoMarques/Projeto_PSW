// sem async/await (requisito do projeto)
document.getElementById("loginForm").addEventListener("submit", function (ev) {
  ev.preventDefault(); // impede o envio normal do formulário

  // obter valores dos campos
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  var msg = document.getElementById("msg");
  msg.className = "msg";
  msg.textContent = "";

  // validação básica
  if (!email || !password) {
    msg.classList.add("err");
    msg.textContent = "Preenche todos os campos.";
    return;
  }

  // criar corpo do pedido (formato x-www-form-urlencoded)
  var body = new URLSearchParams();
  body.append("email", email);
  body.append("password", password);

  // enviar pedido POST ao servidor
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  })
    // converter resposta em JSON
    .then(function (res) { return res.json(); })
    // tratar resposta
    .then(function (data) {
      if (data && data.ok) {
        msg.classList.add("ok");
        msg.textContent = "Login com sucesso! A redirecionar...";

        // guardar dados básicos do utilizador
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("userName", data.nome);

        // redirecionar após 1 segundo
        setTimeout(function () {
          window.location.href = "/dashboard?nome=" + encodeURIComponent(data.nome) + "&userId=" + data.userId;
        }, 1000);
      } else {
        msg.classList.add("err");
        msg.textContent = (data && data.message) ? data.message : "Credenciais inválidas.";
      }
    })
    // tratar erro de comunicação
    .catch(function (err) {
      msg.classList.add("err");
      msg.textContent = "Erro de comunicação com o servidor.";
      console.error(err);
    });
});
