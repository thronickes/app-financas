function carregarHistorico() {
    const mesSelecionado = document.getElementById("filtroMesTransacoes").value;
    const historico = document.getElementById("historico");
    historico.innerHTML = "";

    db.collection("transacoes").orderBy("data").get().then(snapshot => {
        let transacoesPorData = {};

        snapshot.docs.forEach(doc => {
            const { descricao, valor, tipo, data } = doc.data();
            const mesTransacao = data.split("-")[1];

            if (mesTransacao === mesSelecionado) {
                if (!transacoesPorData[data]) {
                    transacoesPorData[data] = [];
                }
                transacoesPorData[data].push({ descricao, valor, tipo });
            }
        });

        Object.keys(transacoesPorData).sort().forEach(data => {
            const tituloData = document.createElement("h3");
            tituloData.innerText = formatarData(data);
            historico.appendChild(tituloData);

            transacoesPorData[data].forEach(transacao => {
                const item = document.createElement("div");
                item.classList.add("transacao");

                let valorClasse = transacao.tipo === "receita" ? "receita" : "despesa";
                let valorFormatado = transacao.tipo === "receita" ? 
                    `+ R$ ${transacao.valor.toFixed(2)}` : 
                    `- R$ ${Math.abs(transacao.valor).toFixed(2)}`;

                item.innerHTML = `
                    <div class="descricao"><strong>${transacao.descricao}</strong></div>
                    <div class="valor ${valorClasse}">${valorFormatado}</div>
                `;

                historico.appendChild(item);
            });
        });
    });
}

function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
