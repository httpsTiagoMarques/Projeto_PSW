// www/scripts/estatisticas.js

// Aguarda o carregamento completo do DOM
window.addEventListener("DOMContentLoaded", function () {

  // ==============================
  // Estatísticas gerais do utilizador
  // ==============================
  fetch("/api/estatisticas")
    .then(res => res.json()) // Converte resposta para JSON
    .then(data => {
      // Verifica se o pedido foi bem-sucedido
      if (!data.ok) {
        alert("Erro ao carregar estatísticas.");
        return;
      }

      // ===== 1. Número total de sessões =====
      document.getElementById("total-sessoes").textContent = data.totalSessoes || 0;

      // ===== 2. Tempo total formatado =====
      const tempoMin = data.tempoTotal || 0; // Tempo total em minutos
      let tempoFormatado = "";

      // Se for igual ou superior a 60 minutos, converte para horas e minutos
      if (tempoMin >= 60) {
        const horas = Math.floor(tempoMin / 60); // Parte inteira das horas
        const minutos = tempoMin % 60;           // Resto dos minutos
        tempoFormatado = `${horas}h${minutos > 0 ? " " + minutos + "m" : ""}`;
      } else {
        // Caso contrário, mostra apenas em minutos
        tempoFormatado = `${tempoMin} min`;
      }

      // Atualiza o valor no ecrã
      document.getElementById("tempo-total").textContent = tempoFormatado;

      // ===== 3. Desporto favorito =====
      document.getElementById("desporto-fav").textContent = data.desportoFavorito || "—";
    })
    // Trata erros de ligação ou resposta inválida
    .catch(err => {
      console.error("Erro ao obter estatísticas:", err);
      alert("Erro de comunicação com o servidor.");
    });


  // ==============================
  // Estatísticas por desporto
  // ==============================
  fetch("/api/estatisticasPorDesporto")
    .then(res => res.json()) // Converte resposta em JSON
    .then(data => {
      if (!data.ok) {
        console.error("Erro ao carregar estatísticas por desporto.");
        return;
      }

      const tbody = document.getElementById("estatisticas-body");
      tbody.innerHTML = "";

      // Se não houver dados, mostra mensagem
      if (data.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Sem dados disponíveis</td></tr>`;
        return;
      }

      // Preenche tabela com estatísticas por desporto
      data.data.forEach(item => {
        // Formata tempo (ex: 1h 30m ou 45 min)
        const tempo = item.tempoTotal >= 60
          ? `${Math.floor(item.tempoTotal / 60)}h ${item.tempoTotal % 60}m`
          : `${item.tempoTotal} min`;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.desporto}</td>
          <td>${item.totalSessoes}</td>
          <td>${tempo}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar estatísticas por desporto:", err);
    });
});
``
