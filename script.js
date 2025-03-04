// 📌 Configuração do Firebase (Não alterar a inicialização)
const firebaseConfig = {
    apiKey: "AIzaSyDYWap5R63y0bCFZfHG1u2rMgUhZSt5xk4",
    authDomain: "app-financas-67485.firebaseapp.com",
    projectId: "app-financas-67485",
    storageBucket: "app-financas-67485.firebasestorage.app",
    messagingSenderId: "518460829487",
    appId: "1:518460829487:web:dc8c70939e31a35fbebbda",
    measurementId: "G-S48D0LHFKC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // 🔥 Agora o Firebase está inicializado corretamente!

// 📌 Alternar entre abas (Corrigindo erro "mostrarAba is not defined")
window.mostrarAba = function (aba) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(aba).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="mostrarAba('${aba}')"]`).classList.add('active');

    // Se a aba "transacoes" for ativada, carregar histórico
    if (aba === "transacoes") {
        carregarHistorico();
    } else if (aba === "principal") {
        atualizarResumo();
    }
};

// 📌 Garantindo que abrirPopup e fecharPopup funcionam corretamente
window.abrirPopup = function () {
    document.getElementById("popup").style.display = "block";
};

window.fecharPopup = function () {
    document.getElementById("popup").style.display = "none";
};

// 📌 Atualizar Resumo Financeiro (Corrigindo erro "atualizarResumo is not defined")
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

// 📌 Carregar Histórico de Transações (Corrigido sem alterar a aba principal)
window.carregarHistorico = function () {
    const mesSelect = document.getElementById("filtroMesTransacoes");
    const categoriaSelect = document.getElementById("filtroCategoria");

    if (!mesSelect || !categoriaSelect) {
        console.error("Elementos de filtro não encontrados.");
        return;
    }

    const mesSelecionado = mesSelect.value; // 🔥 FILTRO POR MÊS VOLTOU!
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

            if (mesTransacao !== mesSelecionado) {
                return;
            }

            if (categoriaSelecionada !== "todas" && categoria !== categoriaSelecionada) {
                return;
            }

            if (!transacoesPorDia[diaTransacao]) {
                transacoesPorDia[diaTransacao] = [];
            }
            transacoesPorDia[diaTransacao].push({
                descricao, valor, tipo, categoria, dataCompleta: `${ano}-${mesTransacao}-${diaTransacao}`
            });
        });

        Object.keys(transacoesPorDia)
            .sort((a, b) => parseInt(b) - parseInt(a)) // 🔥 Ordena os dias de forma DESCRESCENTE
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
};

// 📌 Garantindo que os valores da aba principal e histórico de transações carreguem corretamente
document.addEventListener("DOMContentLoaded", () => {
    atualizarResumo();
    carregarHistorico();
});
