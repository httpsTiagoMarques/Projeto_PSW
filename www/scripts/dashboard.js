// www/scripts/dashboard.js

window.addEventListener("DOMContentLoaded", function () {
  var tableBody = document.getElementById("sessoes-body");
  var addButton = document.getElementById("add-sessao-btn");
  var formBox = document.getElementById("form-box");
  var cancelBtn = document.getElementById("cancel-btn");
  var createBtn = document.getElementById("create-btn");

  var desportoSelect = document.getElementById("desporto-select");
  var duracaoInput = document.getElementById("duracao");
  var localizacaoInput = document.getElementById("localizacao");
  var dataInput = document.getElementById("data");
  var horaInput = document.getElementById("hora");

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
              <td>${item.hora.substring(0,5)}</td>
            `;

            tableBody.appendChild(row);
          });
        } else {
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Sem sessões registadas</td></tr>`;
        }
      })
      .catch(function (err) {
        console.error("Erro ao carregar sessões:", err);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Erro ao obter dados</td></tr>`;
      });
  }

  // ==========================
  // Carregar lista de desportos (para o <select>)
  // ==========================
  function carregarDesportos() {
    fetch("/api/getDesportos")
      .then((res) => res.json())
      .then((data) => {
        desportoSelect.innerHTML = "";
        if (data.ok && data.data.length > 0) {
          data.data.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item.desportoId;
            option.textContent = item.nome;
            desportoSelect.appendChild(option);
          });
        } else {
          var option = document.createElement("option");
          option.textContent = "Nenhum desporto disponível";
          desportoSelect.appendChild(option);
        }
      })
      .catch(function (err) {
        console.error("Erro ao carregar desportos:", err);
      });
  }

  // ==========================
  // Mostrar formulário de criar sessão
  // ==========================
  addButton.addEventListener("click", function () {
    formBox.style.display = "block";
    carregarDesportos();
  });

  // Cancelar criar
  cancelBtn.addEventListener("click", function () {
    formBox.style.display = "none";
    duracaoInput.value = "";
    localizacaoInput.value = "";
    dataInput.value = "";
    horaInput.value = "";
  });

  // ==========================
  // Criar nova sessão
  // ==========================
  createBtn.addEventListener("click", function () {
    const desportoId = desportoSelect.value;
    const duracao = duracaoInput.value.trim();
    const localizacao = localizacaoInput.value.trim();
    const data = dataInput.value;
    const hora = horaInput.value;

    if (!desportoId || !duracao || !localizacao || !data || !hora) {
      alert("Preenche todos os campos do formulário.");
      return;
    }

    fetch("/api/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desportoId, duracao, localizacao, data, hora }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.ok) {
          alert("Sessão adicionada com sucesso!");
          formBox.style.display = "none";
          duracaoInput.value = "";
          localizacaoInput.value = "";
          dataInput.value = "";
          horaInput.value = "";
          carregarSessoes();
        } else {
          alert("Erro: " + response.message);
        }
      })
      .catch((err) => {
        console.error("Erro ao adicionar sessão:", err);
        alert("Erro de comunicação com o servidor.");
      });
  });

  // ==========================
  // Iniciar
  // ==========================
  carregarSessoes();
});
