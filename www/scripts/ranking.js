// www/scripts/ranking.js

// Espera até que todo o conteúdo da página (HTML) esteja carregado
window.addEventListener("DOMContentLoaded", function () {

  // Obtém a referência ao corpo da tabela (onde as linhas serão inseridas)
  var tableBody = document.getElementById("stats-body");

  // Faz um pedido ao servidor (rota /api/ranking) para obter os dados de login por utilizador
  fetch("/api/ranking")
    // Converte a resposta em JSON
    .then(function (res) { 
      return res.json(); 
    })
    // Quando os dados forem recebidos com sucesso...
    .then(function (data) {

      // Verifica se a resposta é válida e se existem registos
      if (data.ok && data.data.length > 0) {

        // Percorre cada utilizador recebido e adiciona uma linha à tabela
        data.data.forEach(function (item, index) {

          // Cria uma nova linha (<tr>)
          var row = document.createElement("tr");

          // Calcula a posição (index começa em 0 → adiciona +1)
          var posicao = index + 1;

          // Cria o conteúdo da linha com posição, ID, nome e total de logins
          row.innerHTML = `
            <td>${posicao}º</td>
            <td>${item.userId}</td>
            <td>${item.nome}</td>
            <td>${item.totalLogins}</td>
          `;

          // Adiciona a linha criada ao corpo da tabela
          tableBody.appendChild(row);
        });
      } 
      else {
        // Caso não haja dados disponíveis, mostra uma mensagem informativa
        tableBody.innerHTML = `
          <tr><td colspan="4" style="text-align:center;">Sem dados disponíveis</td></tr>
        `;
      }
    })
    // Caso ocorra algum erro na comunicação com o servidor
    .catch(function (err) {
      console.error("Erro ao carregar ranking:", err);

      // Mostra uma mensagem de erro na tabela
      tableBody.innerHTML = `
        <tr><td colspan="4" style="text-align:center;">Erro ao obter dados</td></tr>
      `;
    });
});
