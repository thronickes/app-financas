// 🔥 Atualizar Resumo da Aba Principal
function atualizarResumo() {
    let mesSelecionado = document.getElementById("filtroMes").value;
    let totalReceitas = 0, totalDespesas = 0;

    db.collection("transacoes").get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let { valor, tipo, data } = doc.data();
            
            // 🔥 Corrigir conversão do Timestamp para String (YYYY-MM-DD)
            let dataFormatada = data.toDate().toISOString().split("T")[0]; 
            let mesTransacao = dataFormatada.split("-")[1]; // "03"

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

            // 🔥 Corrigir conversão do Timestamp para String (YYYY-MM-DD)
            let dataFormatada = data.toDate().toISOString().split("T")[0]; 
            let mesTransacao = dataFormatada.split("-")[1]; // "03"

            if (mesTransacao === mesSelecionado) {
                let cor = tipo === "receita" ? "green" : "red";
                historico.innerHTML += `<p style="color:${cor}">${descricao} - R$ ${valor.toFixed(2)}</p>`;
            }
        });
    });
}
