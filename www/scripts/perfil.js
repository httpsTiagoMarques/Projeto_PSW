// ======================================================
//  SCRIPT: Perfil do Utilizador
//  Descrição: controla o carregamento e atualização dos
//             dados do utilizador autenticado.
// ======================================================

window.addEventListener("DOMContentLoaded", function () {
  // Elementos HTML do formulário
  const form = document.getElementById("perfil-form");
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // ==========================
  // Carregar dados do perfil
  // ==========================
  // Obtém os dados do utilizador autenticado e preenche o formulário
  function carregarPerfil() {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        // Se a API responder com erro → mostra aviso
        if (!data.ok) {
          alert("Erro ao carregar o perfil.");
          return;
        }

        // Preenche os campos do formulário com os dados recebidos
        nomeInput.value = data.data.nome;
        emailInput.value = data.data.email;

        // Nunca preenche password por segurança
        passwordInput.value = "";
      })
      .catch((err) => console.error("Erro ao carregar perfil:", err));
  }

  // ============================================
  // Atualizar dados do perfil (PUT)
  // ============================================
  // Envia os dados alterados para o servidor
  function atualizarPerfil(e) {
    e.preventDefault(); // Impede refresh de página

    const dados = {
      nome: nomeInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value.trim(), // pode vir vazio
    };

    fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((res) => res.json())
      .then((response) => {
        // Mostra a mensagem devolvida pela API
        alert(response.message);

        // Recarrega os dados no formulário
        carregarPerfil();
      })
      .catch((err) => {
        console.error("Erro ao atualizar perfil:", err);
        alert("Erro ao atualizar perfil.");
      });
  }

  // Evento para submeter o formulário
  form.addEventListener("submit", atualizarPerfil);

  // Quando a página carregar → obtém os dados do utilizador
  carregarPerfil();
});
