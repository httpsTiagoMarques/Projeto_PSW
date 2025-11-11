// ==============================================
//  SCRIPT: Gestão de Sessões
//  Descrição: controla o carregamento, criação,
//             edição e remoção de sessões.
// ==============================================

window.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // Bloquear datas futuras
  // ==========================
  // Define a data máxima nos inputs como a data de hoje,
  // impedindo inserir sessões futuras
  function bloquearDatas() {
    const hoje = new Date().toISOString().split("T")[0];
    document.getElementById("data").setAttribute("max", hoje);
    document.getElementById("edit-data").setAttribute("max", hoje);
  }
  bloquearDatas();

  // Referências aos elementos HTML
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
  // Preenche a tabela com as sessões do utilizador autenticado
  function carregarSessoes() {
    fetch("/api/sessoes")
      .then((res) => res.json())
      .then((data) => {
        tableBody.innerHTML = ""; // limpa tabela

        if (data.ok && data.data.length > 0) {
          // Cria uma linha da tabela por cada sessão
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
                        data-data="${
                          new Date(item.data).toISOString().split("T")[0]
                        }"
                        data-hora="${item.hora.substring(0, 5)}">Editar</button>
                <button class="delete-btn" data-id="${
                  item.sessaoId
                }">Remover</button>
              </td>
            `;
            tableBody.appendChild(row);
          });

          // Evento Editar
          document.querySelectorAll(".edit-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              // Preenche campos do formulário de edição
              editId.value = this.dataset.id;
              editDuracao.value = this.dataset.duracao;
              editLocalizacao.value = this.dataset.localizacao;
              editData.value = this.dataset.data;
              editHora.value = this.dataset.hora;

              // Carrega desportos e seleciona o correto
              carregarDesportosEditar(this.dataset.desporto).then(() => {
                formBox.style.display = "none";
                editBox.style.display = "block";
              });
            });
          });

          // Evento Remover
          document.querySelectorAll(".delete-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
              if (!confirm("Tens a certeza que queres remover esta sessão?"))
                return;

              fetch("/api/sessoes/" + this.dataset.id, { method: "DELETE" })
                .then((res) => res.json())
                .then((response) => {
                  if (response.ok) carregarSessoes();
                  else alert("Erro: " + response.message);
                });
            });
          });
        } else {
          tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sem sessões registadas</td></tr>`;
        }
      });
  }

  // ==========================
  // Carregar desportos (para criar)
  // ==========================
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then((res) => res.json())
      .then((data) => {
        desportoSelect.innerHTML = "";
        data.data.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.desportoId;
          opt.textContent = item.nome;
          desportoSelect.appendChild(opt);
        });
      });
  }

  // ==========================
  // Carregar desportos (para editar)
  // ==========================
  function carregarDesportosEditar(selecionado) {
    return fetch("/api/getDesportos")
      .then((res) => res.json())
      .then((data) => {
        editDesporto.innerHTML = "";
        data.data.forEach((item) => {
          var opt = document.createElement("option");
          opt.value = item.desportoId;
          opt.textContent = item.nome;
          if (item.nome === selecionado) opt.selected = true;
          editDesporto.appendChild(opt);
        });
      });
  }

  // Mostrar Form Criar
  addButton.addEventListener("click", function () {
    carregarDesportos();
    formBox.style.display = "block";
    editBox.style.display = "none";
  });

  // Ocultar Form Criar
  cancelBtn.addEventListener("click", function () {
    createForm.reset();
    formBox.style.display = "none";
  });

  // Ocultar Form Editar
  cancelEditBtn.addEventListener("click", function () {
    editForm.reset();
    editBox.style.display = "none";
  });

  // Criar sessão (POST)
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
          carregarSessoes(); // atualiza tabela
        } else alert("Erro: " + response.message);
      });
  });

  // Editar sessão (PUT)
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var dados = {
      desportoId: editDesporto.value,
      duracao: editDuracao.value.trim(),
      localizacao: editLocalizacao.value.trim(),
      data: editData.value,
      hora: editHora.value,
    };

    fetch("/api/sessoes/" + editId.value, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          editBox.style.display = "none";
          editForm.reset();
          carregarSessoes(); // atualiza tabela
        } else alert("Erro: " + response.message);
      });
  });

  // Ao carregar a página → carrega automaticamente
  carregarSessoes();
});
