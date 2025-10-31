// www/scripts/desportos.js

// Espera até que todo o conteúdo da página (HTML) esteja carregado
window.addEventListener("DOMContentLoaded", function () {
  var tableBody = document.getElementById("desportos-body");

  // Função para carregar a lista de desportos
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        tableBody.innerHTML = ""; // limpa a tabela antes de preencher

        if (data.ok && data.data.length > 0) {
          data.data.forEach(function (item) {
            var row = document.createElement("tr");

            row.innerHTML = `
              <td>${item.desportoId}</td>
              <td>${item.nome}</td>
              <td>${item.criadoPor}</td>
              <td>${new Date(item.criadoEm).toLocaleDateString("pt-PT")}</td>
              <td class="actions">
                <button class="edit-btn" data-id="${item.desportoId}">Editar</button>
                <button class="delete-btn" data-id="${item.desportoId}">Remover</button>
              </td>
            `;

            tableBody.appendChild(row);
          });

          // Botões de editar
          document.querySelectorAll(".edit-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              alert("Editar desporto ID: " + id);
              // TODO: abrir popup para editar
            });
          });

          // Botões de remover
          document.querySelectorAll(".delete-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              const confirmDelete = confirm("Tens a certeza que queres remover este desporto?");

              if (confirmDelete) {
                fetch(`/api/desportos/${id}`, { method: "DELETE" })
                  .then((res) => res.json())
                  .then((response) => {
                    if (response.ok) {
                      alert("Desporto removido com sucesso!");
                      carregarDesportos(); // recarrega tabela
                    } else {
                      alert("Erro: " + response.message);
                    }
                  })
                  .catch((err) => {
                    console.error("Erro ao remover desporto:", err);
                    alert("Erro de comunicação com o servidor.");
                  });
              }
            });
          });
        } else {
          tableBody.innerHTML = `
            <tr><td colspan="5" style="text-align:center;">Sem dados disponíveis</td></tr>
          `;
        }
      })
      .catch(function (err) {
        console.error("Erro ao carregar desportos:", err);
        tableBody.innerHTML = `
          <tr><td colspan="5" style="text-align:center;">Erro ao obter dados</td></tr>
        `;
      });
  }

  // Carregar desportos ao iniciar a página
  carregarDesportos();
});
