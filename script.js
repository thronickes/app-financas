// Lista de transações (não salva, apenas funciona enquanto o app está aberto)
let transacoes = [];

// Função para adicionar uma nova transação
function adicionarTransacao() {
    const descricao = document.getElementById("descricao").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;

    if (descricao.trim() === "" || isNaN(valor) || valor <= 0) {
        alert("Por favor, insira uma descrição válida e um valor maior que zero.");
        return;
    }

    // Adiciona a transação à lista (não salva ainda)
    transacoes.push({ descricao, valor, tipo });

    atualizarTela();

    // Limpa os campos após adicionar
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
}

// Função para atualizar a interface com as transações
function atualizarTela() {
    const lista = document.getElementById("lista-transacoes");
    const saldoEl = document.getElementById("saldo");

    lista.innerHTML = ""; // Limpa a lista para não duplicar

    let saldo = 0;

    transacoes.forEach((transacao, index) => {
        const item = document.createElement("li");
        item.classList.add(transacao.tipo);
        item.innerHTML = `
            ${transacao.descricao} - R$ ${transacao.valor.toFixed(2)}
            <button onclick="removerTransacao(${index})">X</button>
        `;

        lista.appendChild(item);

        saldo += transacao.tipo === "receita" ? transacao.valor : -transacao.valor;
    });

    saldoEl.textContent = `R$ ${saldo.toFixed(2)}`;
}

// Função para remover uma transação
function removerTransacao(index) {
    transacoes.splice(index, 1);
    atualizarTela();
}
