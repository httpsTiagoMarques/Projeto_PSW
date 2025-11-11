// ==========================================================
//  SCRIPT: Desportos
//  Descrição: controla o carregamento, criação, edição e remoção
//             de desportos (CRUD) utilizando a API REST.
// ==========================================================

window.addEventListener("DOMContentLoaded", function () {
  // Referências aos elementos do DOM
  const tableBody = document.getElementById("desportos-body");
  const addButton = document.getElementById("add-desporto-btn");
  const formBox = document.getElementById("form-box");
  const editBox = document.getElementById("edit-box");
  const createForm = document.getElementById("create-form");
  const editForm = document.getElementById("edit-form");
  const nomeInput = document.getElementById("nome-desporto");
  const editNome = document.getElementById("edit-nome");
  const editId = document.getElementById("edit-id");
  const cancelBtn = document.getElementById("cancel-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  // ======================================================
  // Função que obtém lista de desportos e atualiza tabela
  // ======================================================
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then((res) => res.json())
      .then((data) => {
        tableBody.innerHTML = ""; // limpa a tabela

        // Se existirem registos, preenche tabela
        if (data.ok && data.data.length > 0) {
          data.data.forEach((item) => {
            const row = document.createElement("tr");

            row.innerHTML = `
              <td>${item.desportoId}</td>
              <td>${item.nome}</td>
              <td>${item.criadoPor}</td>
              <td>${new Date(item.criadoEm).toLocaleDateString("pt-PT")}</td>
              <td class="actions">
                <button class="edit-btn" data-id="${
                  item.desportoId
                }" data-nome="${item.nome}">Editar</button>
                <button class="delete-btn" data-id="${
                  item.desportoId
                }">Remover</button>
              </td>
            `;

            tableBody.appendChild(row);
          });

          // ------- BOTÃO EDITAR -------
          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
              editId.value = this.getAttribute("data-id"); // guarda ID
              editNome.value = this.getAttribute("data-nome"); // preenche campo

              formBox.style.display = "none"; // esconde form criar
              editBox.style.display = "block"; // mostra form editar
            });
          });

          // ------- BOTÃO REMOVER -------
          document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
              const id = this.getAttribute("data-id");

              if (confirm("Tens a certeza que queres remover este desporto?")) {
                fetch(`/api/desportos/${id}`, { method: "DELETE" })
                  .then((res) => res.json())
                  .then((response) => {
                    if (response.ok) carregarDesportos(); // Atualiza tabela
                    else alert("Erro: " + response.message);
                  })
                  .catch((err) => {
                    console.error("Erro ao remover desporto:", err);
                  });
              }
            });
          });
        }

        // Se não existirem registos, mostra mensagem
        else {
          tableBody.innerHTML = `
            <tr><td colspan="5" style="text-align:center;">Sem dados disponíveis</td></tr>
          `;
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar desportos:", err);
        tableBody.innerHTML = `
          <tr><td colspan="5" style="text-align:center;">Erro ao obter dados</td></tr>`;
      });
  }

  // ======================================================
  // Mostrar o formulário de criação
  // ======================================================
  addButton.addEventListener("click", () => {
    formBox.style.display = "block";
    editBox.style.display = "none";
  });

  // Botão cancelar (criação)
  cancelBtn.addEventListener("click", () => {
    formBox.style.display = "none";
    nomeInput.value = ""; // limpa textbox
  });

  // ======================================================
  // Formulário SUBMIT → Criar novo desporto
  // ======================================================
  createForm.addEventListener("submit", (e) => {
    e.preventDefault(); // não recarrega página

    const nome = nomeInput.value.trim();
    if (!nome) {
      alert("Preenche o nome do desporto.");
      return;
    }

    fetch("/api/desportos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }), // envia JSON para API
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          formBox.style.display = "none"; // oculta form
          nomeInput.value = ""; // limpa campo

          carregarDesportos(); // Atualiza apenas tabela
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch((err) => {
        console.error("Erro ao adicionar desporto:", err);
      });
  });

  // ======================================================
  // Formulário SUBMIT → Editar desporto
  // ======================================================
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = editId.value;
    const nome = editNome.value.trim();

    if (!nome) {
      alert("Preenche o nome do desporto.");
      return;
    }

    fetch(`/api/desportos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          editBox.style.display = "none"; // oculta form de edição
          carregarDesportos(); // Atualiza tabela
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch((err) => {
        console.error("Erro ao atualizar desporto:", err);
      });
  });

  // Botão cancelar (edição)
  cancelEditBtn.addEventListener("click", () => {
    editBox.style.display = "none";
    editNome.value = "";
  });

  // ======================================================
  // Ao carregar a página → obtém todos os desportos
  // ======================================================
  carregarDesportos();
});
