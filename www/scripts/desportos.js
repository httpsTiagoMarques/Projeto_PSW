// www/scripts/desportos.js

window.addEventListener("DOMContentLoaded", function () {
  var tableBody = document.getElementById("desportos-body");
  var addButton = document.getElementById("add-desporto-btn");
  var formBox = document.getElementById("form-box");
  var editBox = document.getElementById("edit-box");
  var createBtn = document.getElementById("create-btn");
  var cancelBtn = document.getElementById("cancel-btn");
  var nomeInput = document.getElementById("nome-desporto");
  var editNome = document.getElementById("edit-nome");
  var editId = document.getElementById("edit-id");
  var saveEditBtn = document.getElementById("save-edit-btn");
  var cancelEditBtn = document.getElementById("cancel-edit-btn");

  // Carregar lista de desportos
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then((res) => res.json())
      .then((data) => {
        tableBody.innerHTML = "";

        if (data.ok && data.data.length > 0) {
          data.data.forEach(function (item) {
            var row = document.createElement("tr");

            row.innerHTML = `
              <td>${item.desportoId}</td>
              <td>${item.nome}</td>
              <td>${item.criadoPor}</td>
              <td>${new Date(item.criadoEm).toLocaleDateString("pt-PT")}</td>
              <td class="actions">
                <button class="edit-btn" data-id="${item.desportoId}" data-nome="${item.nome}">Editar</button>
                <button class="delete-btn" data-id="${item.desportoId}">Remover</button>
              </td>
            `;

            tableBody.appendChild(row);
          });

          // Botão de editar
          document.querySelectorAll(".edit-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              const nome = this.getAttribute("data-nome");

              // Preenche o formulário de edição
              editId.value = id;
              editNome.value = nome;

              // Mostra o formulário de edição e esconde o de criação
              formBox.style.display = "none";
              editBox.style.display = "block";
            });
          });

          // Botão de remover
          document.querySelectorAll(".delete-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              const id = this.getAttribute("data-id");
              const confirmDelete = confirm("Tens a certeza que queres remover este desporto?");

              if (confirmDelete) {
                fetch(`/api/desportos/${id}`, { method: "DELETE" })
                  .then((res) => res.json())
                  .then((response) => {
                    if (response.ok) {
                      //alert("Desporto removido com sucesso!");
                      carregarDesportos();
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
          tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Sem dados disponíveis</td></tr>`;
        }
      })
      .catch(function (err) {
        console.error("Erro ao carregar desportos:", err);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Erro ao obter dados</td></tr>`;
      });
  }

  // Mostrar o formulário de criar
  addButton.addEventListener("click", function () {
    formBox.style.display = "block";
    editBox.style.display = "none";
  });

  // Cancelar criar
  cancelBtn.addEventListener("click", function () {
    formBox.style.display = "none";
    nomeInput.value = "";
  });

  // Criar desporto
  createBtn.addEventListener("click", function () {
    const nome = nomeInput.value.trim();
    const createdBy = sessionStorage.getItem("userId");

    if (!nome) {
      alert("Preenche o nome do desporto.");
      return;
    }

    fetch("/api/desportos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, createdBy }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          //alert("Desporto criado com sucesso!");
          formBox.style.display = "none";
          nomeInput.value = "";
          carregarDesportos();
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch((err) => {
        console.error("Erro ao adicionar desporto:", err);
        alert("Erro de comunicação com o servidor.");
      });
  });

  // Guardar edição
  saveEditBtn.addEventListener("click", function () {
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
          //alert("Desporto atualizado com sucesso!");
          editBox.style.display = "none";
          carregarDesportos();
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch((err) => {
  console.error("Erro ao atualizar desporto:", err);
  alert("Erro de comunicação com o servidor: " + err.message);
});
  });

  // Cancelar edição
  cancelEditBtn.addEventListener("click", function () {
    editBox.style.display = "none";
    editNome.value = "";
  });

  // Iniciar
  carregarDesportos();
});
