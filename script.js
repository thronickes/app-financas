// 📌 Garantindo que TODAS as funções sejam reconhecidas globalmente
window.mostrarAba = function (aba) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(aba).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="mostrarAba('${aba}')"]`).classList.add('active');

    // Se a aba "transacoes" for ativada, carregar histórico
    if (aba === "transacoes") {
        carregarHistorico();
    }
};

// 📌 Garantindo que abrirPopup e fecharPopup funcionam
window.abrirPopup = function () {
    document.getElementById("popup").style.display = "block";
};

window.fecharPopup = function () {
    document.getElementById("popup").style.display = "none";
};

// 📌 Garantindo que adicionar transação salva no Firebase e carrega os valores corretamente
window.adicionarTransacao = function () {
    const descricao = document.getElementById("descricao").value;
    let valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;
    const categoria = document.getElementById("categoria").value;

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
};

// 📌 Garantindo que atualizarResumo carrega os valores corretamente na aba principal
window.atualizarResumo = function () {
    const mes = document.getElementById("filtroMes").value;
    let saldo = 0, totalReceitas = 0, totalDespesas = 0;

    db.collection("transacoes").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            const { valor, tipo, data } = doc.data();
            if (typeof data !== "string") return;

            const partesData = data.split("-");
            if (partesData.length < 3) return;

            const mesTransacao = partesData[1];

            if (mesTransacao === mes) {
                saldo += valor;
                tipo === "receita" ? totalReceitas += valor : totalDespesas += valor;
            }
        });

        document.getElementById("saldoMes").innerText = `R$ ${saldo.toFixed(2)}`;
        document.getElementById("totalReceitas").innerText = `R$ ${totalReceitas.toFixed(2)}`;
        document.getElementById("totalDespesas").innerText = `R$ ${Math.abs(totalDespesas).toFixed(2)}`;
    });
};

// 📌 Garantindo que o histórico de transações aparece corretamente
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
    }).catch(error => {
        console.error("Erro ao carregar histórico:", error);
    });
};

// 📌 Garantindo que os valores dos meses e histórico carreguem corretamente
document.addEventListener("DOMContentLoaded", () => {
    atualizarResumo();
    carregarHistorico();
});
