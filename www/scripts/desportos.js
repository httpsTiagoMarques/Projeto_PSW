// www/scripts/desportos.js

window.addEventListener("DOMContentLoaded", function () {
  var tableBody = document.getElementById("desportos-body");
  var addButton = document.getElementById("add-desporto-btn");
  var formBox = document.getElementById("form-box");
  var editBox = document.getElementById("edit-box");
  var createForm = document.getElementById("create-form");
  var editForm = document.getElementById("edit-form");
  var nomeInput = document.getElementById("nome-desporto");
  var editNome = document.getElementById("edit-nome");
  var editId = document.getElementById("edit-id");
  var cancelBtn = document.getElementById("cancel-btn");
  var cancelEditBtn = document.getElementById("cancel-edit-btn");

  // ==========================
  // Carregar lista de desportos
  // ==========================
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then(function (res) { return res.json(); })
      .then(function (data) {
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

          // Botão editar
          document.querySelectorAll(".edit-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              editId.value = this.getAttribute("data-id");
              editNome.value = this.getAttribute("data-nome");
              formBox.style.display = "none";
              editBox.style.display = "block";
            });
          });

          // Botão remover
          document.querySelectorAll(".delete-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var id = this.getAttribute("data-id");
              if (confirm("Tens a certeza que queres remover este desporto?")) {
                fetch("/api/desportos/" + id, { method: "DELETE" })
                  .then(function (res) { return res.json(); })
                  .then(function (response) {
                    if (response.ok) carregarDesportos();
                    else alert("Erro: " + response.message);
                  })
                  .catch(function (err) {
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

  // ==========================
  // Mostrar formulário de criar
  // ==========================
  addButton.addEventListener("click", function () {
    formBox.style.display = "block";
    editBox.style.display = "none";
  });

  cancelBtn.addEventListener("click", function () {
    formBox.style.display = "none";
    nomeInput.value = "";
  });

  // ==========================
  // Submeter formulário de criação
  // ==========================
  createForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var nome = nomeInput.value.trim();
    if (!nome) {
      alert("Preenche o nome do desporto.");
      return;
    }

    fetch("/api/desportos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome }),
    })
      .then(function (res) { return res.json(); })
      .then(function (response) {
        if (response.ok) {
          formBox.style.display = "none";
          nomeInput.value = "";
          carregarDesportos();
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch(function (err) {
        console.error("Erro ao adicionar desporto:", err);
        alert("Erro de comunicação com o servidor.");
      });
  });

  // ==========================
  // Submeter formulário de edição
  // ==========================
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var id = editId.value;
    var nome = editNome.value.trim();
    if (!nome) {
      alert("Preenche o nome do desporto.");
      return;
    }

    fetch("/api/desportos/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome }),
    })
      .then(function (res) { return res.json(); })
      .then(function (response) {
        if (response.ok) {
          editBox.style.display = "none";
          carregarDesportos();
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch(function (err) {
        console.error("Erro ao atualizar desporto:", err);
        alert("Erro de comunicação com o servidor: " + err.message);
      });
  });

  cancelEditBtn.addEventListener("click", function () {
    editBox.style.display = "none";
    editNome.value = "";
  });

  // ==========================
  // Iniciar
  // ==========================
  carregarDesportos();
});
