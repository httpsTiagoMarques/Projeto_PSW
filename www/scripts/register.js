// sem async/await (requisito do projeto)
document.getElementById("regForm").addEventListener("submit", function (ev) {
  ev.preventDefault(); // impede o envio normal do formulário

  // obter valores dos campos
  var nome = document.getElementById("nome").value.trim();
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  var msg = document.getElementById("msg");
  msg.className = "msg";
  msg.textContent = "";

  // validação simples
  if (!nome || !email || !password) {
    msg.classList.add("err");
    msg.textContent = "Preenche todos os campos.";
    return;
  }

  // preparar corpo do pedido (formato compatível com express.urlencoded)
  var body = new URLSearchParams();
  body.append("nome", nome);
  body.append("email", email);
  body.append("password", password);

  // enviar pedido POST para o servidor
  fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  })
    // converter resposta para JSON
    .then(function (res) { return res.json(); })
    // tratar resposta
    .then(function (data) {
      if (data && data.ok) {
        msg.classList.add("ok");
        msg.textContent = "Registo concluído! A redirecionar...";
        // redirecionar após 1.2s
        setTimeout(function () {
          window.location.href = "./index.html";
        }, 1200);
      } else {
        msg.classList.add("err");
        msg.textContent = (data && data.message) ? data.message : "Erro no registo.";
      }
    })
    // tratar erro de ligação
    .catch(function (err) {
      msg.classList.add("err");
      msg.textContent = "Erro de comunicação com o servidor.";
      console.error(err);
    });
});
