window.addEventListener("DOMContentLoaded", function () {
  // Elementos HTML do formulário
  const form = document.getElementById("perfil-form");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ==========================
  // Função: carregar os dados do utilizador
  // ==========================
  function carregarPerfil() {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        // Se a resposta não tiver sucesso -> avisa o utilizador
        if (!data.ok) {
          alert("Erro a carregar perfil.");
          return;
        }

        // Preenche automaticamente os inputs com os dados do user
        nomeInput.value = data.data.nome;
        emailInput.value = data.data.email;
        passwordInput.value = ""; // nunca preenchemos password por segurança
      })
      .catch((err) => {
        console.error("Erro ao carregar perfil:", err);
      });
  }

  // ==========================
  // Função: atualizar dados do perfil (PUT)
  // ==========================
  function atualizarPerfil(e) {
    e.preventDefault(); // impede refresh da página

    const dados = {
      nome: nomeInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(), // pode ser vazio
    };

    fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((res) => res.json())
      .catch((err) => {
        console.error("Erro ao atualizar perfil:", err);
      });
  }

  // Vincula evento ao formulário
  form.addEventListener("submit", atualizarPerfil);

  // Inicializa carregamento quando a página abre
  carregarPerfil();
});
