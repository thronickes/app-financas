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

function atualizarResumo() {
    const mes = document.getElementById("filtroMes").value;
    let saldo = 0, totalReceitas = 0, totalDespesas = 0;

    db.collection("transacoes").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            const { valor, tipo, data } = doc.data();
            if (data.split("-")[1] === mes) {
                saldo += valor;
                tipo === "receita" ? totalReceitas += valor : totalDespesas += valor;
            }
        });
        document.getElementById("saldoMes").innerText = `R$ ${saldo.toFixed(2)}`;
        document.getElementById("totalReceitas").innerText = `R$ ${totalReceitas.toFixed(2)}`;
        document.getElementById("totalDespesas").innerText = `R$ ${Math.abs(totalDespesas).toFixed(2)}`;
    });
}

atualizarResumo();
