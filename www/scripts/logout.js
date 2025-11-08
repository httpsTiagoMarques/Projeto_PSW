// ==============================================
//  SCRIPT: Logout
//  Descrição: Termina e elimina os dados de sessão
// ==============================================


// Espera o carregamento completo da página
document.addEventListener("DOMContentLoaded", function () {
  // Obtém o botão de logout
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return; // Sai se não existir botão

  // Evento ao clicar no botão de logout
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault(); // Evita comportamento padrão do link

    // Envia pedido GET para encerrar sessão (Passport usa GET)
    fetch("/authentication/logout", {
      method: "GET",
      credentials: "include" // Inclui cookies da sessão
    })
      .then(res => res.json()) // Converte resposta em JSON
      .then(data => {
        if (data.message && data.message.includes("sucesso")) {
          // Redireciona e remove histórico (impede voltar atrás)
          window.location.replace("/index.html");
        } else {
          alert("Erro ao terminar sessão.");
        }
      })
      .catch(err => {
        console.error("Erro de logout:", err);
        alert("Erro ao comunicar com o servidor.");
      });
  });
});
