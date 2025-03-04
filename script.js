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

function atualizarSaldo() {
    document.getElementById("saldo").innerText = saldoAtual.toFixed(2);
}

function adicionarTransacao() {
    const descricao = document.getElementById("descricao").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.getElementById("tipo").value;

    if (!descricao || isNaN(valor)) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    const transacao = { descricao, valor, tipo, data: new Date() };

    db.collection("transacoes").add(transacao).then(() => {
        if (tipo === "receita") saldoAtual += valor;
        else saldoAtual -= valor;

        atualizarSaldo();
        carregarHistorico();
    });
}

function carregarHistorico() {
    document.getElementById("historico").innerHTML = "";
    db.collection("transacoes").orderBy("data", "desc").get().then((querySnapshot) => {
        saldoAtual = 0;
        querySnapshot.forEach((doc) => {
            const { descricao, valor, tipo } = doc.data();
            const item = document.createElement("div");
            item.classList.add("transacao");

            let valorClasse = tipo === "receita" ? "receita" : "despesa";

            item.innerHTML = `
                <div class="descricao">
                    <strong>${descricao}</strong>
                </div>
                <div class="valor ${valorClasse}">
                    R$ ${valor.toFixed(2)}
                </div>
            `;

            if (tipo === "receita") saldoAtual += valor;
            else saldoAtual -= valor;

            document.getElementById("historico").appendChild(item);
        });
        atualizarSaldo();
    });
}

carregarHistorico();
