// 📌 Função para carregar histórico de transações corretamente
window.carregarHistorico = function () {
    const mesSelect = document.getElementById("filtroMesTransacoes");
    const categoriaSelect = document.getElementById("filtroCategoria");

    if (!mesSelect || !categoriaSelect) {
        console.error("Elementos de filtro não encontrados.");
        return;
    }

    const mesSelecionado = mesSelect.value;
    const categoriaSelecionada = categoriaSelect.value;
    const historico = document.getElementById("historico");

    if (!historico) {
        console.error("Elemento 'historico' não encontrado.");
        return;
    }

    historico.innerHTML = "";

    db.collection("transacoes").orderBy("data").get().then(snapshot => {
        let transacoesPorDia = {};
        const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

        snapshot.docs.forEach(doc => {
            const { descricao, valor, tipo, data, categoria } = doc.data();
            if (typeof data !== "string") return;

            const partesData = data.split("-");
            if (partesData.length < 3) return;

            const ano = partesData[0];
            const mesTransacao = partesData[1];
            const diaTransacao = partesData[2];

            // Filtrar por categoria se não for "todas"
            if (categoriaSelecionada !== "todas" && categoria !== categoriaSelecionada) {
                return;
            }

            if (mesTransacao === mesSelecionado) {
                if (!transacoesPorDia[diaTransacao]) {
                    transacoesPorDia[diaTransacao] = [];
                }
                transacoesPorDia[diaTransacao].push({
                    descricao, valor, tipo, categoria, dataCompleta: `${ano}-${mesTransacao}-${diaTransacao}`
                });
            }
        });

        // Ordena os dias de forma DESCRESCENTE (últimos dias primeiro)
        Object.keys(transacoesPorDia)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .forEach(dia => {
                const dataObjeto = new Date(transacoesPorDia[dia][0].dataCompleta + "T00:00:00");
                const nomeDiaSemana = diasSemana[dataObjeto.getUTCDay()];

                // Adiciona título do dia
                const tituloDia = document.createElement("h3");
                tituloDia.innerText = `${nomeDiaSemana}, dia ${dia}`;
                historico.appendChild(tituloDia);

                // Lista transações desse dia
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
    }).catch(error => {
        console.error("Erro ao carregar histórico:", error);
    });
};

// 📌 Garantir que o histórico carregue ao abrir a aba de transações
document.addEventListener("DOMContentLoaded", () => {
    carregarHistorico();
});
