// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDYWap5R63y0bCFZfHG1u2rMgUhZSt5xk4",
    authDomain: "app-financas-67485.firebaseapp.com",
    projectId: "app-financas-67485",
    storageBucket: "app-financas-67485.firebasestorage.app",
    messagingSenderId: "518460829487",
    appId: "1:518460829487:web:dc8c70939e31a35fbebbda",
    measurementId: "G-S48D0LHFKC"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let saldoAtual = 0;

// Define a data de hoje como padrão no input
document.getElementById("data").valueAsDate = new Date();

function atualizarSaldo() {
    document.getElementById("saldo").innerText = saldoAtual.toFixed(2);
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
        valor = -Math.abs(valor); // Garante que o valor da despesa seja negativo
    }

    const transacao = { descricao, valor, tipo, data };

    db.collection("transacoes").add(transacao).then(() => {
        saldoAtual += valor;
        atualizarSaldo();
        carregarHistorico();
    });
}

function carregarHistorico() {
    document.getElementById("historico").innerHTML = "";
    db.collection("transacoes").orderBy("data", "desc").get().then((querySnapshot) => {
        saldoAtual = 0;
        querySnapshot.forEach((doc) => {
            const { descricao, valor, tipo, data } = doc.data();
            const item = document.createElement("div");
            item.classList.add("transacao");

            let valorClasse = tipo === "receita" ? "receita" : "despesa";
            let valorFormatado = tipo === "receita" ? `R$ ${valor.toFixed(2)}` : `-R$ ${Math.abs(valor).toFixed(2)}`;

            item.innerHTML = `
                <div class="descricao">
                    <strong>${descricao}</strong>
                </div>
                <div class="data">
                    ${formatarData(data)}
                </div>
                <div class="valor ${valorClasse}">
                    ${valorFormatado}
                </div>
            `;

            saldoAtual += valor;
            document.getElementById("historico").appendChild(item);
        });
        atualizarSaldo();
    });
}

function formatarData(data) {
    const partes = data.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // Formato: DD/MM/YYYY
}

carregarHistorico();
