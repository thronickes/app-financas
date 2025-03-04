// Verifica se o Firebase foi carregado corretamente
if (typeof firebase === "undefined") {
    console.error("Erro: Firebase não foi carregado. Verifique se os scripts do Firebase estão incluídos corretamente no HTML.");
}

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDYWap5R63y0bCFZfHG1u2rMgUhZSt5xk4",
    authDomain: "app-financas-67485.firebaseapp.com",
    projectId: "app-financas-67485",
    storageBucket: "app-financas-67485.firebasestorage.app",
    messagingSenderId: "518460829487",
    appId: "518460829487:web:dc8c70939e31a35fbebbda",
    measurementId: "G-S48D0LHFKC"
};

// Espera o Firebase carregar antes de inicializar
document.addEventListener("DOMContentLoaded", function() {
    // Inicializa Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Função para adicionar uma transação ao Firestore
    function adicionarTransacao() {
        const descricao = document.getElementById("descricao").value;
        const valor = parseFloat(document.getElementById("valor").value);
        const tipo = document.getElementById("tipo").value;

        if (descricao.trim() === "" || isNaN(valor) || valor <= 0) {
            alert("Por favor, insira uma descrição válida e um valor maior que zero.");
            return;
        }

        db.collection("transacoes").add({
            descricao,
            valor,
            tipo,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("Transação adicionada!");
            carregarTransacoes(); // Atualiza a lista na tela
            document.getElementById("descricao").value = "";
            document.getElementById("valor").value = "";
        }).catch((error) => {
            console.error("Erro ao adicionar transação: ", error);
        });
    }

    // Função para carregar as transações do Firestore
    function carregarTransacoes() {
        db.collection("transacoes").orderBy("timestamp", "desc").onSnapshot((querySnapshot) => {
            const lista = document.getElementById("lista-transacoes");
            const saldoEl = document.getElementById("saldo");

            lista.innerHTML = ""; // Limpa a lista antes de carregar

            let saldo = 0;

            querySnapshot.forEach((doc) => {
                const transacao = doc.data();
                const item = document.createElement("li");
                item.classList.add(transacao.tipo);
                item.innerHTML = `
                    ${transacao.descricao} - R$ ${transacao.valor.toFixed(2)}
                    <button onclick="removerTransacao('${doc.id}')">X</button>
                `;

                lista.appendChild(item);
                saldo += transacao.tipo === "receita" ? transacao.valor : -transacao.valor;
            });

            saldoEl.textContent = `R$ ${saldo.toFixed(2)}`;
        });
    }

    // Função para remover uma transação do Firestore
    function removerTransacao(id) {
        db.collection("transacoes").doc(id).delete().then(() => {
            console.log("Transação removida!");
        }).catch((error) => {
            console.error("Erro ao remover transação: ", error);
        });
    }

    // Carregar as transações ao iniciar o app
    carregarTransacoes();

    // Adiciona evento de clique no botão para evitar erro de referência
    document.querySelector("button").addEventListener("click", adicionarTransacao);
});
