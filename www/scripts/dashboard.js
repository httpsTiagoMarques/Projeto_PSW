window.addEventListener("DOMContentLoaded", function () {
  var tableBody = document.getElementById("sessoes-body");
  var addButton = document.getElementById("add-sessao-btn");
  var formBox = document.getElementById("form-box");
  var editBox = document.getElementById("edit-box");
  var createForm = document.getElementById("create-form");
  var editForm = document.getElementById("edit-form");
  var cancelBtn = document.getElementById("cancel-btn");
  var cancelEditBtn = document.getElementById("cancel-edit-btn");

  // Campos do form criar
  var desportoSelect = document.getElementById("desporto-select");
  var duracaoInput = document.getElementById("duracao");
  var localizacaoInput = document.getElementById("localizacao");
  var dataInput = document.getElementById("data");
  var horaInput = document.getElementById("hora");

  // Campos do form editar
  var editId = document.getElementById("edit-id");
  var editDesporto = document.getElementById("edit-desporto");
  var editDuracao = document.getElementById("edit-duracao");
  var editLocalizacao = document.getElementById("edit-localizacao");
  var editData = document.getElementById("edit-data");
  var editHora = document.getElementById("edit-hora");

  // ==========================
  // Carregar lista de sessões
  // ==========================
  function carregarSessoes() {
    fetch("/api/sessoes")
      .then((res) => res.json())
      .then((data) => {
        tableBody.innerHTML = "";

        if (data.ok && data.data.length > 0) {
          data.data.forEach(function (item) {
            var row = document.createElement("tr");
            row.innerHTML = `
              <td>${item.sessaoId}</td>
              <td>${item.desporto}</td>
              <td>${item.duracao} min</td>
              <td>${item.localizacao}</td>
              <td>${new Date(item.data).toLocaleDateString("pt-PT")}</td>
              <td>${item.hora.substring(0, 5)}</td>
              <td class="actions">
                <button class="edit-btn"
                        data-id="${item.sessaoId}"
                        data-desporto="${item.desporto}"
                        data-duracao="${item.duracao}"
                        data-localizacao="${item.localizacao}"
                        data-data="${item.data}"
                        data-hora="${item.hora.substring(0, 5)}">Editar</button>
                <button class="delete-btn" data-id="${
                  item.sessaoId
                }">Remover</button>
              </td>
            `;
            tableBody.appendChild(row);
          });

          // Botão editar
          document.querySelectorAll(".edit-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {

              // Preenche campos do formulário de edição
              editId.value = this.dataset.id;
              editDuracao.value = this.dataset.duracao;
              editLocalizacao.value = this.dataset.localizacao;
              editData.value = this.dataset.data;
              editHora.value = this.dataset.hora;

              // Carrega a lista de desportos e só depois mostra o formulário
              carregarDesportosEditar(this.dataset.desporto).then(() => {
                formBox.style.display = "none";
                editBox.style.display = "block";
              });
            });
          });

          // Botão remover
          document.querySelectorAll(".delete-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var id = this.dataset.id;
              if (confirm("Tens a certeza que queres remover esta sessão?")) {
                fetch("/api/sessoes/" + id, { method: "DELETE" })
                  .then((res) => res.json())
                  .then((response) => {
                    if (response.ok) carregarSessoes();
                    else alert("Erro: " + response.message);
                  })
                  .catch((err) => {
                    console.error("Erro ao remover sessão:", err);
                    alert("Erro de comunicação com o servidor.");
                  });
              }
            });
          });
        } else {
          tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sem sessões registadas</td></tr>`;
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar sessões:", err);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Erro ao obter dados</td></tr>`;
      });
  }

  // ==========================
  // Carregar desportos
  // ==========================
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then((res) => res.json())
      .then((data) => {
        desportoSelect.innerHTML = "";
        if (data.ok && data.data.length > 0) {
          data.data.forEach(function (item) {
            var opt = document.createElement("option");
            opt.value = item.desportoId;
            opt.textContent = item.nome;
            desportoSelect.appendChild(opt);
          });
        }
      });
  }

  function carregarDesportosEditar(selecionado) {
  return fetch("/api/getDesportos")
    .then((res) => res.json())
    .then((data) => {
      editDesporto.innerHTML = "";
      if (data.ok && data.data.length > 0) {
        data.data.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.desportoId;
          opt.textContent = item.nome;
          if (item.nome === selecionado) opt.selected = true;
          editDesporto.appendChild(opt);
        });
      }
    })
    .catch((err) => console.error("Erro ao carregar desportos para edição:", err));
}


  // ==========================
  // Mostrar formulário criar
  // ==========================
  addButton.addEventListener("click", function () {
    formBox.style.display = "block";
    editBox.style.display = "none";
    carregarDesportos();
  });

  cancelBtn.addEventListener("click", function () {
    formBox.style.display = "none";
    createForm.reset();
  });

  cancelEditBtn.addEventListener("click", function () {
    editBox.style.display = "none";
    editForm.reset();
  });

  // ==========================
  // Submeter criação
  // ==========================
  createForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var dados = {
      desportoId: desportoSelect.value,
      duracao: duracaoInput.value.trim(),
      localizacao: localizacaoInput.value.trim(),
      data: dataInput.value,
      hora: horaInput.value,
    };

    fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          formBox.style.display = "none";
          createForm.reset();
          carregarSessoes();
        } else alert("Erro: " + response.message);
      })
      .catch((err) => {
        console.error("Erro ao adicionar sessão:", err);
        alert("Erro de comunicação com o servidor.");
      });
  });

  // ==========================
  // Submeter edição
  // ==========================
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var id = editId.value;
    var dados = {
      desportoId: editDesporto.value,
      duracao: editDuracao.value.trim(),
      localizacao: editLocalizacao.value.trim(),
      data: editData.value,
      hora: editHora.value,
    };

    fetch("/api/sessoes/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          editBox.style.display = "none";
          editForm.reset();
          carregarSessoes();
        } else alert("Erro: " + response.message);
      })
      .catch((err) => {
        console.error("Erro ao atualizar sessão:", err);
        alert("Erro de comunicação com o servidor: " + err.message);
      });
  });

  // ==========================
  // Iniciar
  // ==========================
  carregarSessoes();
});
