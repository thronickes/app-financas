function adicionarTransacao() {
    const descricao = document.getElementById("descricao").value;
    let valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;
    const categoria = document.getElementById("categoria").value; // Obtendo categoria

    if (!descricao || isNaN(valor) || !data || !categoria) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    if (tipo === "despesa") {
        valor = -Math.abs(valor);
    }

    const transacao = { descricao, valor, tipo, data, categoria };

    db.collection("transacoes").add(transacao).then(() => {
        atualizarResumo();
        carregarHistorico();
        fecharPopup();
    });
}

function carregarHistorico() {
    const mesSelecionado = document.getElementById("filtroMesTransacoes").value;
    const categoriaSelecionada = document.getElementById("filtroCategoria").value;
    const historico = document.getElementById("historico");
    historico.innerHTML = "";

    db.collection("transacoes").orderBy("data").get().then(snapshot => {
        let transacoesPorDia = {};
        const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

        snapshot.docs.forEach(doc => {
            const { descricao, valor, tipo, data, categoria } = doc.data();
            if (typeof data !== "string") return; // Evita erro se data não for string

            const partesData = data.split("-");
            if (partesData.length < 3) return; // Evita erro se a data não estiver no formato esperado

            const ano = partesData[0];
            const mesTransacao = partesData[1];
            const diaTransacao = partesData[2];

            // Se um filtro de categoria foi selecionado, só exibir essa categoria
            if (categoriaSelecionada !== "todas" && categoria !== categoriaSelecionada) {
                return;
            }

            if (mesTransacao === mesSelecionado) {
                if (!transacoesPorDia[diaTransacao]) {
                    transacoesPorDia[diaTransacao] = [];
                }
                transacoesPorDia[diaTransacao].push({ descricao, valor, tipo, categoria, dataCompleta: `${ano}-${mesTransacao}-${diaTransacao}` });
            }
        });

        // Ordena os dias de forma DESCRESCENTE (últimos dias primeiro)
        Object.keys(transacoesPorDia)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .forEach(dia => {
                const dataObjeto = new Date(transacoesPorDia[dia][0].dataCompleta + "T00:00:00"); 
                const nomeDiaSemana = diasSemana[dataObjeto.getUTCDay()]; 
                
                const tituloDia = document.createElement("h3");
                tituloDia.innerText = `${nomeDiaSemana}, dia ${dia}`;
                historico.appendChild(tituloDia);

                transacoesPorDia[dia].forEach(transacao => {
                    const item = document.createElement("div");
                    item.classList.add("transacao");

                    let valorClasse = transacao.tipo === "receita" ? "receita" : "despesa";
                    let valorFormatado = transacao.tipo === "receita" ? 
                        `+ R$ ${transacao.valor.toFixed(2)}` : 
                        `- R$ ${Math.abs(transacao.valor).toFixed(2)}`;

                    item.innerHTML = `
                        <div class="descricao"><strong>${transacao.descricao}</strong></div>
                        <div class="categoria"><small>${transacao.categoria}</small></div>
                        <div class="valor ${valorClasse}">${valorFormatado}</div>
                    `;

                    historico.appendChild(item);
                });
            });
    });
}
