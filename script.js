// Importando funções do Firebase
const { getTransactions, addTransaction, updateTransaction, deleteTransaction, getGoals, addGoal, updateGoal, deleteGoal } = await import('./firebase-config.js');
const { getCategoryColor } = await import('./chart-config.js');

// Gerenciamento de estado
let transactions = [];
let goals = [];
let currentMonth = new Date().getMonth();

// Carrega as transações iniciais
async function loadTransactions() {
    transactions = await getTransactions();
    goals = await getGoals();
    updateUI();
    updateAllCharts();
    updateGoalsList();
}

// Elementos do DOM
const monthSelect = document.getElementById('month-select');
const totalBalance = document.getElementById('total-balance');
const totalIncome = document.getElementById('total-income');
const totalExpenses = document.getElementById('total-expenses');
const totalInvestments = document.getElementById('total-investments');
const totalAssetsValue = document.getElementById('total-assets-value');
const addTransactionBtn = document.getElementById('add-transaction');
const modal = document.getElementById('transaction-modal');
const form = document.getElementById('transaction-form');
const transactionsContainer = document.getElementById('transactions-container');
const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page');
const expensesChartCanvas = document.getElementById('expenses-chart');
const expensesLegend = document.getElementById('expenses-legend');
const investmentsChartCanvas = document.getElementById('investments-chart');
const investmentsLegend = document.getElementById('investments-legend');
const annualSummaryChartCanvas = document.getElementById('annual-summary-chart');
const investmentsLineChartCanvas = document.getElementById('investments-line-chart');
const annualExpensesCategoryChartCanvas = document.getElementById('annual-expenses-category-chart');
const totalExpensesCategoryChartCanvas = document.getElementById('total-expenses-category-chart');
const totalExpensesLegend = document.getElementById('total-expenses-legend');
const accumulatedBalanceChartCanvas = document.getElementById('accumulated-balance-chart');
const netWorthEvolutionChartCanvas = document.getElementById('net-worth-evolution-chart');
const modalTitle = document.getElementById('modal-title');
const transactionIdInput = document.getElementById('transaction-id');
const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
const deleteTransactionIdInput = document.getElementById('delete-transaction-id');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// Elementos DOM para metas financeiras
const addGoalBtn = document.getElementById('add-goal');
const goalModal = document.getElementById('goal-modal');
const goalForm = document.getElementById('goal-form');
const goalModalTitle = document.getElementById('goal-modal-title');
const goalIdInput = document.getElementById('goal-id');
const goalsContainer = document.getElementById('goals-container');
const cancelGoalBtn = document.getElementById('cancel-goal');

// Variáveis para os gráficos
let expensesChart = null;
let investmentsChart = null;
let annualSummaryChart = null;
let investmentsLineChart = null;
let annualExpensesCategoryChart = null;
let totalExpensesCategoryChart = null;
let accumulatedBalanceChart = null;
let netWorthEvolutionChart = null;

// Inicialização
monthSelect.value = currentMonth;
loadTransactions();

// Função para atualizar todos os gráficos
function updateAllCharts() {
    try {
        // Verificar se os elementos existem antes de atualizar os gráficos
        if (annualSummaryChartCanvas) {
            updateAnnualSummaryChart();
        }
        
        if (investmentsLineChartCanvas) {
            updateInvestmentsLineChart([
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ], transactions
                .filter(t => t.type === 'Investimento')
                .reduce((acc, t) => {
                    const month = new Date(t.date).getMonth();
                    acc[month] += t.amount;
                    return acc;
                }, Array(12).fill(0)));
        }
        
        if (annualExpensesCategoryChartCanvas) {
            updateAnnualExpensesCategoryChart();
        }
        
        if (totalExpensesCategoryChartCanvas) {
            updateTotalExpensesCategoryChart();
        }
        
        if (accumulatedBalanceChartCanvas) {
            updateAccumulatedBalanceChart();
        }
        
        if (netWorthEvolutionChartCanvas) {
            updateNetWorthEvolutionChart();
        }
        
        // Garantir que os gráficos da aba principal também sejam atualizados
        if (expensesChartCanvas) {
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                const transactionMonth = transactionDate.getMonth();
                return transactionMonth === parseInt(currentMonth);
            });
            updateExpensesChart(monthTransactions);
        }
        
        if (investmentsChartCanvas) {
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                const transactionMonth = transactionDate.getMonth();
                return transactionMonth === parseInt(currentMonth);
            });
            updateInvestmentsChart(monthTransactions);
        }
    } catch (error) {
        console.error('Erro ao atualizar gráficos:', error);
    }
}

// Event Listeners
const transactionMonthSelect = document.getElementById('transaction-month-select');

monthSelect.addEventListener('change', (e) => {
    currentMonth = parseInt(e.target.value);
    transactionMonthSelect.value = currentMonth;
    updateUI();
});

transactionMonthSelect.addEventListener('change', (e) => {
    currentMonth = parseInt(e.target.value);
    monthSelect.value = currentMonth;
    updateUI();
});

addTransactionBtn.addEventListener('click', () => {
    // Resetar o formulário e limpar o ID da transação
    form.reset();
    document.getElementById('transaction-id').value = '';
    
    // Atualizar o título do modal
    modalTitle.textContent = 'Adicionar Transação';
    
    // Abrir o modal
    modal.classList.add('active');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const transaction = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value
    };

    const transactionId = document.getElementById('transaction-id').value;
    
    if (transactionId) {
        // Editar transação existente
        const success = await updateTransaction(transactionId, transaction);
        if (success) {
            // Atualizar a transação na lista local
            const index = transactions.findIndex(t => t.id === transactionId);
            if (index !== -1) {
                transactions[index] = { id: transactionId, ...transaction };
            }
            form.reset();
            modal.classList.remove('active');
            updateUI();
        }
    } else {
        // Adicionar nova transação
        const newTransaction = await addTransaction(transaction);
        if (newTransaction) {
            transactions.push(newTransaction);
            form.reset();
            modal.classList.remove('active');
            updateUI();
        }
    }
});

document.querySelector('.cancel-button').addEventListener('click', () => {
    form.reset();
    modal.classList.remove('active');
});

// Função para lidar com o clique no botão de edição
function handleEditTransaction(e) {
    const transactionId = e.currentTarget.dataset.id;
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
        // Preencher o formulário com os dados da transação
        document.getElementById('transaction-id').value = transactionId;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('type').value = transaction.type;
        document.getElementById('date').value = transaction.date;
        document.getElementById('category').value = transaction.category;
        
        // Atualizar o título do modal
        modalTitle.textContent = 'Editar Transação';
        
        // Abrir o modal
        modal.classList.add('active');
    }
}

// Função para lidar com o clique no botão de exclusão
function handleDeleteTransaction(e) {
    const transactionId = e.currentTarget.dataset.id;
    deleteTransactionIdInput.value = transactionId;
    deleteConfirmationModal.classList.add('active');
}

// Event listeners para o modal de confirmação de exclusão
confirmDeleteBtn.addEventListener('click', async () => {
    const transactionId = deleteTransactionIdInput.value;
    
    if (transactionId) {
        const success = await deleteTransaction(transactionId);
        if (success) {
            // Remover a transação da lista local
            transactions = transactions.filter(t => t.id !== transactionId);
            deleteConfirmationModal.classList.remove('active');
            updateUI();
        }
    }
});

cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmationModal.classList.remove('active');
});

// Event listeners para metas financeiras
addGoalBtn.addEventListener('click', () => {
    // Resetar o formulário e limpar o ID da meta
    goalForm.reset();
    goalIdInput.value = '';
    
    // Atualizar o título do modal
    goalModalTitle.textContent = 'Adicionar Meta';
    
    // Abrir o modal
    goalModal.classList.add('active');
});

goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const goal = {
        description: document.getElementById('goal-description').value,
        target: parseFloat(document.getElementById('goal-target').value),
        type: document.getElementById('goal-type').value,
        date: document.getElementById('goal-date').value || null
    };

    const goalId = goalIdInput.value;
    
    if (goalId) {
        // Editar meta existente
        const success = await updateGoal(goalId, goal);
        if (success) {
            // Atualizar a meta na lista local
            const index = goals.findIndex(g => g.id === goalId);
            if (index !== -1) {
                goals[index] = { id: goalId, ...goal };
            }
            goalForm.reset();
            goalModal.classList.remove('active');
            updateGoalsList();
        }
    } else {
        // Adicionar nova meta
        const newGoal = await addGoal(goal);
        if (newGoal) {
            goals.push(newGoal);
            goalForm.reset();
            goalModal.classList.remove('active');
            updateGoalsList();
        }
    }
});

cancelGoalBtn.addEventListener('click', () => {
    goalForm.reset();
    goalModal.classList.remove('active');
});

// Função para lidar com o clique no botão de edição de meta
function handleEditGoal(e) {
    const goalId = e.currentTarget.dataset.id;
    const goal = goals.find(g => g.id === goalId);
    
    if (goal) {
        // Preencher o formulário com os dados da meta
        goalIdInput.value = goalId;
        document.getElementById('goal-description').value = goal.description;
        document.getElementById('goal-target').value = goal.target;
        document.getElementById('goal-type').value = goal.type;
        if (goal.date) {
            document.getElementById('goal-date').value = goal.date;
        }
        
        // Atualizar o título do modal
        goalModalTitle.textContent = 'Editar Meta';
        
        // Abrir o modal
        goalModal.classList.add('active');
    }
}

// Função para lidar com o clique no botão de exclusão de meta
function handleDeleteGoal(e) {
    const goalId = e.currentTarget.dataset.id;
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
        deleteGoal(goalId).then(success => {
            if (success) {
                // Remover a meta da lista local
                goals = goals.filter(g => g.id !== goalId);
                updateGoalsList();
            }
        });
    }
}

// Adiciona event listeners para os botões de navegação
function setupTabNavigation() {
    // Obter novamente os elementos para garantir que estão disponíveis
    const tabs = document.querySelectorAll('.tab');
    const pages = document.querySelectorAll('.page');
    
    if (!tabs || !pages) {
        console.error('Elementos de navegação não encontrados');
        return;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            try {
                const targetId = tab.dataset.tab;
                
                if (!targetId) {
                    console.error('Tab sem ID de destino');
                    return;
                }
                
                const targetPage = document.getElementById(targetId);
                
                if (!targetPage) {
                    console.error(`Página de destino não encontrada: ${targetId}`);
                    return;
                }
                
                // Remove a classe active de todas as tabs e páginas
                tabs.forEach(t => t.classList.remove('active'));
                pages.forEach(p => p.classList.remove('active'));
                
                // Adiciona a classe active na tab e página selecionada
                tab.classList.add('active');
                targetPage.classList.add('active');
                
                // Atualiza a UI e os gráficos quando necessário
                updateUI();
                if (targetId === 'dashboards') {
                    updateAllCharts();
                }
                if (targetId === 'metas') {
                    updateGoalsList();
                }
                
                console.log(`Navegado para a aba: ${targetId}`);
            } catch (error) {
                console.error('Erro ao navegar entre abas:', error);
            }
        });
    });
}

// Chamar a função de configuração da navegação
setupTabNavigation();

// Adicionar um event listener para garantir que a navegação seja configurada após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
});

// Função para atualizar a lista de metas financeiras
function updateGoalsList() {
    if (!goalsContainer) {
        console.error('Elemento de metas não encontrado');
        return;
    }
    
    goalsContainer.innerHTML = '';
    
    if (goals.length === 0) {
        const noGoalsMessage = document.createElement('div');
        noGoalsMessage.classList.add('no-goals-message');
        noGoalsMessage.textContent = 'Nenhuma meta financeira cadastrada. Clique no botão + para adicionar uma nova meta.';
        goalsContainer.appendChild(noGoalsMessage);
        return;
    }
    
    goals.forEach(goal => {
        // Calcular o progresso atual da meta
        let currentValue = 0;
        
        if (goal.type === 'patrimonio') {
            // Para metas de patrimônio, usar o patrimônio total atual
            const income = transactions
                .filter(t => t.type === 'Receita')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const expenses = transactions
                .filter(t => t.type === 'Despesa')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const investments = transactions
                .filter(t => t.type === 'Investimento')
                .reduce((sum, t) => sum + t.amount, 0);
                
            // Patrimônio total = saldo líquido + investimentos
            const liquidBalance = income - expenses - investments;
            currentValue = liquidBalance + investments;
        } else if (goal.type === 'economia') {
            // Para metas de economia, usar o saldo líquido acumulado
            const income = transactions
                .filter(t => t.type === 'Receita')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const expenses = transactions
                .filter(t => t.type === 'Despesa')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const investments = transactions
                .filter(t => t.type === 'Investimento')
                .reduce((sum, t) => sum + t.amount, 0);
                
            currentValue = income - expenses - investments;
        } else if (goal.type === 'investimento') {
            // Para metas de investimento, usar o total de investimentos
            currentValue = transactions
                .filter(t => t.type === 'Investimento')
                .reduce((sum, t) => sum + t.amount, 0);
        }
        
        // Calcular a porcentagem de progresso
        const targetValue = goal.target;
        const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));
        const remaining = Math.max(0, targetValue - currentValue);
        
        // Criar o elemento da meta
        const element = document.createElement('div');
        element.classList.add('goal-item', `goal-type-${goal.type}`);
        
        // Formatar a data se existir
        let dateText = '';
        if (goal.date) {
            const goalDate = new Date(goal.date);
            dateText = `<div class="goal-date">Data limite: ${formatDate(goal.date)}</div>`;
        }
        
        element.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.description}</div>
                <div class="goal-actions">
                    <button class="edit-goal-button" data-id="${goal.id}">✏️</button>
                    <button class="delete-goal-button" data-id="${goal.id}">🗑️</button>
                </div>
            </div>
            <div class="goal-info">
                <div class="goal-target">
                    <span class="goal-label">Meta:</span>
                    <span class="goal-value">${formatCurrency(targetValue)}</span>
                </div>
                <div class="goal-current">
                    <span class="goal-label">Progresso atual:</span>
                    <span class="goal-value">${formatCurrency(currentValue)}</span>
                </div>
                <div class="goal-remaining">
                    <span class="goal-label">Falta:</span>
                    <span class="goal-value">${formatCurrency(remaining)}</span>
                </div>
            </div>
            <div class="goal-progress-container">
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="goal-progress-text">${progress}% concluído</div>
            </div>
            ${dateText}
        `;
        
        goalsContainer.appendChild(element);
        
        // Adicionar event listeners para os botões de edição e exclusão
        element.querySelector('.edit-goal-button').addEventListener('click', handleEditGoal);
        element.querySelector('.delete-goal-button').addEventListener('click', handleDeleteGoal);
    });
}

// Inicializa a primeira tab como ativa
document.querySelector('.tab[data-tab="principal"]').click();



// Funções auxiliares
function updateUI() {
    try {
        if (!totalBalance || !totalIncome || !totalExpenses || !totalInvestments || !totalAssetsValue) {
            console.error('Elementos da interface não encontrados');
            // Tentar obter os elementos novamente
            const totalBalance = document.getElementById('total-balance');
            const totalIncome = document.getElementById('total-income');
            const totalExpenses = document.getElementById('total-expenses');
            const totalInvestments = document.getElementById('total-investments');
            const totalAssetsValue = document.getElementById('total-assets-value');
            
            if (!totalBalance || !totalIncome || !totalExpenses || !totalInvestments || !totalAssetsValue) {
                return;
            }
        }

        // Garantir que currentMonth seja um número
        const selectedMonth = parseInt(currentMonth);
        
        const monthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const transactionMonth = transactionDate.getMonth();
            return transactionMonth === selectedMonth;
        });

        const income = monthTransactions
            .filter(t => t.type === 'Receita')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = monthTransactions
            .filter(t => t.type === 'Despesa')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const investments = monthTransactions
            .filter(t => t.type === 'Investimento')
            .reduce((sum, t) => sum + t.amount, 0);

        // Saldo líquido (disponível) = receitas - despesas - investimentos
        const liquidBalance = income - expenses - investments;
        
        // Patrimônio total = saldo líquido + investimentos
        const totalAssets = liquidBalance + investments;

        // Atualizar os elementos de texto com os valores calculados
        if (totalBalance) totalBalance.textContent = formatCurrency(liquidBalance);
        if (totalIncome) totalIncome.textContent = formatCurrency(income);
        if (totalExpenses) totalExpenses.textContent = formatCurrency(expenses);
        if (totalInvestments) totalInvestments.textContent = formatCurrency(investments);
        if (totalAssetsValue) totalAssetsValue.textContent = formatCurrency(totalAssets);

        // Atualizar a lista de transações se o container existir
        if (transactionsContainer) {
            updateTransactionsList(monthTransactions);
        }
        
        // Atualizar os gráficos se os elementos existirem
        if (expensesChartCanvas) {
            updateExpensesChart(monthTransactions);
        }
        
        if (investmentsChartCanvas) {
            updateInvestmentsChart(monthTransactions);
        }
        
        // Sempre atualizar a lista de metas para manter o progresso atualizado
        // independentemente da aba atual
        if (goalsContainer) {
            updateGoalsList();
        }
    } catch (error) {
        console.error('Erro ao atualizar a interface:', error);
    }
}

function updateTransactionsList(transactions) {
    transactionsContainer.innerHTML = '';
    
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    let currentDate = '';
    let currentGroup = null;

    transactions.forEach(transaction => {
        const transactionDate = formatDate(transaction.date);
        
        if (transactionDate !== currentDate) {
            currentDate = transactionDate;
            currentGroup = document.createElement('div');
            currentGroup.classList.add('transaction-date-group');
            
            const dateHeader = document.createElement('div');
            dateHeader.classList.add('transaction-date');
            const [day, month, year] = transactionDate.split('/');
            dateHeader.textContent = `${getDayName(new Date(transaction.date))}, dia ${parseInt(day)}`;
            
            currentGroup.appendChild(dateHeader);
            transactionsContainer.appendChild(currentGroup);
        }

        const element = document.createElement('div');
        element.classList.add('transaction-item');
        
        // Converter a categoria para um formato adequado para classe CSS
        const categoryClass = transaction.category
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9]/g, '-'); // Substitui caracteres especiais por hífen
        
        element.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-category category-${categoryClass}">${transaction.category}</div>
            </div>
            <div class="transaction-amount ${transaction.type === 'Despesa' ? 'expense' : transaction.type === 'Investimento' ? 'investment' : 'income'}">
                ${transaction.type === 'Despesa' || transaction.type === 'Investimento' ? '-' : '+'} ${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="edit-button" data-id="${transaction.id}">✏️</button>
                <button class="delete-button" data-id="${transaction.id}">🗑️</button>
            </div>
        `;

        currentGroup.appendChild(element);
    });

    // Adicionar event listeners para os botões de edição e exclusão
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', handleEditTransaction);
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDeleteTransaction);
    });
}

function getDayName(date) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
}

function formatCurrency(value) {
    const sign = value < 0 ? '-' : '';
    return `${sign}R$ ${Math.abs(value).toFixed(2)}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para atualizar o gráfico de investimentos por categoria
function updateInvestmentsChart(transactions) {
    // Filtrar apenas os investimentos
    const investments = transactions.filter(t => t.type === 'Investimento');
    
    // Agrupar investimentos por categoria
    const investmentsByCategory = {};
    
    investments.forEach(investment => {
        if (!investmentsByCategory[investment.category]) {
            investmentsByCategory[investment.category] = 0;
        }
        investmentsByCategory[investment.category] += investment.amount;
    });
    
    // Preparar dados para o gráfico
    const categories = Object.keys(investmentsByCategory);
    const values = Object.values(investmentsByCategory);
    const colors = categories.map(category => getCategoryColor(category));
    
    // Limpar a legenda existente
    investmentsLegend.innerHTML = '';
    
    // Se não houver investimentos, mostrar mensagem
    if (categories.length === 0) {
        investmentsChartCanvas.style.display = 'none';
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'Nenhum investimento registrado neste mês.';
        noDataMessage.style.textAlign = 'center';
        investmentsLegend.appendChild(noDataMessage);
        return;
    }
    
    investmentsChartCanvas.style.display = 'block';
    
    // Destruir gráfico existente se houver
    if (investmentsChart) {
        investmentsChart.destroy();
    }
    
    // Criar novo gráfico
    investmentsChart = new Chart(investmentsChartCanvas, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    // Criar legenda personalizada
    categories.forEach((category, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        
        const colorBox = document.createElement('div');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index];
        
        const label = document.createElement('span');
        label.textContent = `${category} ${formatCurrency(values[index])}`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        investmentsLegend.appendChild(legendItem);
    });
}

// Função para atualizar o gráfico de despesas por categoria
function updateExpensesChart(transactions) {
    // Filtrar apenas as despesas
    const expenses = transactions.filter(t => t.type === 'Despesa');
    
    // Agrupar despesas por categoria
    const expensesByCategory = {};
    
    expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
            expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
    });
    
    // Preparar dados para o gráfico
    const categories = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);
    const colors = categories.map(category => getCategoryColor(category));
    
    // Limpar a legenda existente
    expensesLegend.innerHTML = '';
    
    // Se não houver despesas, mostrar mensagem
    if (categories.length === 0) {
        expensesChartCanvas.style.display = 'none';
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'Nenhuma despesa registrada neste mês.';
        noDataMessage.style.textAlign = 'center';
        expensesLegend.appendChild(noDataMessage);
        return;
    }
    
    expensesChartCanvas.style.display = 'block';
    
    // Destruir gráfico existente se houver
    if (expensesChart) {
        expensesChart.destroy();
    }
    
    // Criar novo gráfico
    expensesChart = new Chart(expensesChartCanvas, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    // Criar legenda personalizada
    categories.forEach((category, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        
        const colorBox = document.createElement('div');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index];
        
        const label = document.createElement('span');
        label.textContent = `${category} ${formatCurrency(values[index])}`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        expensesLegend.appendChild(legendItem);
    });
}

// Função para atualizar o gráfico de resumo anual
function updateInvestmentsLineChart(monthNames, investmentsData) {
    // Destruir gráfico existente se houver
    if (investmentsLineChart) {
        investmentsLineChart.destroy();
    }
    
    // Criar o gráfico de linha para investimentos
    investmentsLineChart = new Chart(investmentsLineChartCanvas, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Investimentos',
                    data: investmentsData,
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    borderColor: '#2196F3',
                    borderWidth: 2,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Função para atualizar o gráfico de despesas por categoria anual
function updateAnnualExpensesCategoryChart() {
    // Destruir gráfico existente se houver
    if (annualExpensesCategoryChart) {
        annualExpensesCategoryChart.destroy();
    }
    
    // Preparar dados para todos os meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Obter todas as categorias de despesas
    const allExpenseCategories = new Set();
    transactions.forEach(transaction => {
        if (transaction.type === 'Despesa') {
            allExpenseCategories.add(transaction.category);
        }
    });
    
    const categories = Array.from(allExpenseCategories);
    
    // Se não houver categorias, não criar o gráfico
    if (categories.length === 0) {
        return;
    }
    
    // Preparar dados para o gráfico
    const datasets = [];
    const colors = categories.map(category => getCategoryColor(category));
    
    // Para cada categoria, calcular o total de despesas por mês
    categories.forEach((category, index) => {
        const monthlyData = Array(12).fill(0);
        
        transactions.forEach(transaction => {
            if (transaction.type === 'Despesa' && transaction.category === category) {
                const date = new Date(transaction.date);
                const month = date.getMonth();
                monthlyData[month] += transaction.amount;
            }
        });
        
        datasets.push({
            label: category,
            data: monthlyData,
            backgroundColor: colors[index],
            borderColor: colors[index],
            borderWidth: 1
        });
    });
    
    // Criar o gráfico de barras empilhadas
    annualExpensesCategoryChart = new Chart(annualExpensesCategoryChartCanvas, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Função para atualizar o gráfico de pizza de despesas totais por categoria
function updateTotalExpensesCategoryChart() {
    // Destruir gráfico existente se houver
    if (totalExpensesCategoryChart) {
        totalExpensesCategoryChart.destroy();
    }
    
    // Filtrar apenas as despesas
    const expenses = transactions.filter(t => t.type === 'Despesa');
    
    // Agrupar despesas por categoria
    const expensesByCategory = {};
    
    expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
            expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
    });
    
    // Preparar dados para o gráfico
    const categories = Object.keys(expensesByCategory);
    const values = Object.values(expensesByCategory);
    const colors = categories.map(category => getCategoryColor(category));
    
    // Limpar a legenda existente
    totalExpensesLegend.innerHTML = '';
    
    // Se não houver despesas, mostrar mensagem
    if (categories.length === 0) {
        totalExpensesCategoryChartCanvas.style.display = 'none';
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'Nenhuma despesa registrada.';
        noDataMessage.style.textAlign = 'center';
        totalExpensesLegend.appendChild(noDataMessage);
        return;
    }
    
    totalExpensesCategoryChartCanvas.style.display = 'block';
    
    // Criar novo gráfico
    totalExpensesCategoryChart = new Chart(totalExpensesCategoryChartCanvas, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    
    // Criar legenda personalizada
    categories.forEach((category, index) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        
        const colorBox = document.createElement('div');
        colorBox.classList.add('legend-color');
        colorBox.style.backgroundColor = colors[index];
        
        const label = document.createElement('span');
        label.textContent = `${category} ${formatCurrency(values[index])}`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        totalExpensesLegend.appendChild(legendItem);
    });
}

function updateAnnualSummaryChart() {
    // Destruir gráfico existente se houver
    if (annualSummaryChart) {
        annualSummaryChart.destroy();
    }
    
    // Preparar dados para todos os meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Arrays para armazenar os valores de cada mês
    const incomeData = Array(12).fill(0);
    const expensesData = Array(12).fill(0);
    const investmentsData = Array(12).fill(0);
    const liquidBalanceData = Array(12).fill(0);
    
    // Processar transações para cada mês
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth();
        const amount = transaction.amount;
        
        if (transaction.type === 'Receita') {
            incomeData[month] += amount;
        } else if (transaction.type === 'Despesa') {
            expensesData[month] += amount;
        } else if (transaction.type === 'Investimento') {
            investmentsData[month] += amount;
        }
    });
    
    // Calcular saldo líquido para cada mês
    for (let i = 0; i < 12; i++) {
        liquidBalanceData[i] = incomeData[i] - expensesData[i] - investmentsData[i];
    }
    
    // Atualizar o gráfico de linha de investimentos
    updateInvestmentsLineChart(monthNames, investmentsData);
    
    // Atualizar o gráfico de comparação de despesas por categoria
    updateAnnualExpensesCategoryChart();
    
    // Criar o gráfico de barras
    annualSummaryChart = new Chart(annualSummaryChartCanvas, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: expensesData,
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    borderWidth: 1
                },
                {
                    label: 'Saldo Líquido',
                    data: liquidBalanceData.map(value => Math.abs(value)), // Usar valor absoluto para mostrar barras positivas
                    backgroundColor: '#9C27B0',
                    borderColor: '#9C27B0',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Para o Saldo Líquido, mostrar o valor real (pode ser negativo) no tooltip
                            if (context.dataset.label === 'Saldo Líquido') {
                                const realValue = liquidBalanceData[context.dataIndex];
                                return context.dataset.label + ': ' + formatCurrency(realValue);
                            }
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Função para atualizar o gráfico de Saldo Acumulado ao Longo do Ano
function updateAccumulatedBalanceChart() {
    // Destruir gráfico existente se houver
    if (accumulatedBalanceChart) {
        accumulatedBalanceChart.destroy();
    }
    
    // Preparar dados para todos os meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Arrays para armazenar os valores de cada mês
    const incomeData = Array(12).fill(0);
    const expensesData = Array(12).fill(0);
    const investmentsData = Array(12).fill(0);
    const monthlyBalanceData = Array(12).fill(0);
    const accumulatedBalanceData = Array(12).fill(0);
    
    // Processar transações para cada mês
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth();
        const amount = transaction.amount;
        
        if (transaction.type === 'Receita') {
            incomeData[month] += amount;
        } else if (transaction.type === 'Despesa') {
            expensesData[month] += amount;
        } else if (transaction.type === 'Investimento') {
            investmentsData[month] += amount;
        }
    });
    
    // Calcular saldo mensal (receitas - despesas)
    for (let i = 0; i < 12; i++) {
        monthlyBalanceData[i] = incomeData[i] - expensesData[i];
    }
    
    // Calcular saldo acumulado
    let accumulated = 0;
    for (let i = 0; i < 12; i++) {
        accumulated += monthlyBalanceData[i];
        accumulatedBalanceData[i] = accumulated;
    }
    
    // Criar o gráfico de linha
    accumulatedBalanceChart = new Chart(accumulatedBalanceChartCanvas, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Saldo Acumulado',
                    data: accumulatedBalanceData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: '#4BC0C0',
                    borderWidth: 2,
                    pointBackgroundColor: '#4BC0C0',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Função para atualizar o gráfico de Evolução do Patrimônio Líquido
function updateNetWorthEvolutionChart() {
    // Destruir gráfico existente se houver
    if (netWorthEvolutionChart) {
        netWorthEvolutionChart.destroy();
    }
    
    // Preparar dados para todos os meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Arrays para armazenar os valores de cada mês
    const incomeData = Array(12).fill(0);
    const expensesData = Array(12).fill(0);
    const investmentsData = Array(12).fill(0);
    const liquidBalanceData = Array(12).fill(0);
    const netWorthData = Array(12).fill(0);
    const accumulatedInvestmentsData = Array(12).fill(0);
    
    // Processar transações para cada mês
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth();
        const amount = transaction.amount;
        
        if (transaction.type === 'Receita') {
            incomeData[month] += amount;
        } else if (transaction.type === 'Despesa') {
            expensesData[month] += amount;
        } else if (transaction.type === 'Investimento') {
            investmentsData[month] += amount;
        }
    });
    
    // Calcular saldo líquido para cada mês
    for (let i = 0; i < 12; i++) {
        liquidBalanceData[i] = incomeData[i] - expensesData[i] - investmentsData[i];
    }
    
    // Calcular investimentos acumulados
    let accumulatedInvestments = 0;
    for (let i = 0; i < 12; i++) {
        accumulatedInvestments += investmentsData[i];
        accumulatedInvestmentsData[i] = accumulatedInvestments;
    }
    
    // Calcular patrimônio líquido (saldo líquido acumulado + investimentos acumulados)
    let accumulatedLiquidBalance = 0;
    for (let i = 0; i < 12; i++) {
        accumulatedLiquidBalance += liquidBalanceData[i];
        // Patrimônio líquido = saldo líquido acumulado + investimentos acumulados
        netWorthData[i] = accumulatedLiquidBalance + accumulatedInvestmentsData[i];
    }
    
    // Criar o gráfico de linha
    netWorthEvolutionChart = new Chart(netWorthEvolutionChartCanvas, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Patrimônio Líquido',
                    data: netWorthData,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: '#9966FF',
                    borderWidth: 2,
                    pointBackgroundColor: '#9966FF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Investimentos Acumulados',
                    data: accumulatedInvestmentsData,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: '#FF9F40',
                    borderWidth: 2,
                    pointBackgroundColor: '#FF9F40',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 1,
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}
