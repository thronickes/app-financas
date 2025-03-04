// 🔥 Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔥 Garantir que a função seja carregada corretamente
function inicializarApp() {
    atualizarResumo();
    carregarHistorico();
}

// 🔥 Alternar entre as abas Principal e Transações
function mostrarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(aba).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="mostrarAba('${aba}')"]`).classList.add('active');
}

// 🔥 Abrir e Fechar Popup
function abrirPopup() {
    document.getElementById("popup").style.display = "block";
}
function fecharPopup() {
    document.getElementById("popup").style.display = "none";
}

// 🔥 Atualizar Resumo da Aba Principal
function atualizarResumo() {
    let mesSelecionado = document.getElementById("filtroMes").value;
    let totalReceitas = 0, totalDespesas = 0;

    db.collection("transacoes").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let { valor, tipo, data } = doc.data();
            let mesTransacao = data.split("-")[1];

            if (mesTransacao === mesSelecionado) {
                if (tipo === "receita") totalReceitas += valor;
                else totalDespesas += valor;
            }
        });

        document.getElementById("totalReceitas").innerText = `R$ ${totalReceitas.toFixed(2)}`;
        document.getElementById("totalDespesas").innerText = `R$ ${totalDespesas.toFixed(2)}`;
        document.getElementById("saldoMes").innerText = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
    });
}

// 🔥 Carregar Histórico de Transações na Aba "Transações"
function carregarHistorico() {
    let mesSelecionado = document.getElementById("filtroMesTransacoes").value;
    let historico = document.getElementById("historico");
    historico.innerHTML = "";

    db.collection("transacoes").orderBy("data").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let { descricao, valor, tipo, data } = doc.data();
            let mesTransacao = data.split("-")[1];

            if (mesTransacao === mesSelecionado) {
                let cor = tipo === "receita" ? "green" : "red";
                historico.innerHTML += `<p style="color:${cor}">${descricao} - R$ ${valor.toFixed(2)}</p>`;
            }
        });
    });
}

// 🔥 Adicionar Transação
function adicionarTransacao() {
    let descricao = document.getElementById("descricao").value;
    let valor = parseFloat(document.getElementById("valor").value);
    let tipo = document.getElementById("tipo").value;
    let data = document.getElementById("data").value;

    db.collection("transacoes").add({ descricao, valor, tipo, data }).then(() => {
        fecharPopup();
        atualizarResumo();
        carregarHistorico();
    });
}
