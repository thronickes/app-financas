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
const db = firebase.firestore();

function mostrarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(aba).style.display = 'block';

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="mostrarAba('${aba}')"]`).classList.add('active');
}

function abrirPopup() {
    document.getElementById("popup").style.display = "block";
}

function fecharPopup() {
    document.getElementById("popup").style.display = "none";
}

function adicionarTransacao() {
    const descricao = document.getElementById("descricao").value;
    let valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;

    if (!descricao || isNaN(valor) || !data) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    if (tipo === "despesa") {
        valor = -Math.abs(valor);
    }

    const transacao = {
        descricao,
        valor,
        tipo,
        data: firebase.firestore.Timestamp.fromDate(new Date(data))
    };

    db.collection("transacoes").add(transacao).then(() => {
        atualizarResumo();
        carregarHistorico();
        fecharPopup();
    });
}

function carregarHistorico() {
    const mesSelecionado = document.getElementById("filtroMesTransacoes").value;
    const historico = document.getElementById("historico");
    historico.innerHTML = "";

    db.collection("transacoes").orderBy("data").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            const { descricao, valor, tipo, data } = doc.data();
            const dataFormatada = data.toDate().toISOString().split("T")[0]; 
            const mesTransacao = dataFormatada.split("-")[1];

            if (mesTransacao === mesSelecionado) {
                const item = document.createElement("div");
                item.classList.add("transacao");
                let valorClasse = tipo === "receita" ? "receita" : "despesa";
                let valorFormatado = tipo === "receita" ? `+ R$ ${valor.toFixed(2)}` : `- R$ ${Math.abs(valor).toFixed(2)}`;
                item.innerHTML = `<strong>${descricao}</strong> - <span class="${valorClasse}">${valorFormatado}</span>`;
                historico.appendChild(item);
            }
        });
    });
}

function atualizarResumo() {
    carregarHistorico();
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarResumo();
});
