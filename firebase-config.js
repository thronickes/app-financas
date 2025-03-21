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

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Firestore
const db = firebase.firestore();

// Funções de manipulação de dados
async function getTransactions() {
    try {
        const snapshot = await db.collection('transactions').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
    }
}

async function addTransaction(transaction) {
    try {
        const docRef = await db.collection('transactions').add(transaction);
        return { id: docRef.id, ...transaction };
    } catch (error) {
        console.error('Erro ao adicionar transação:', error);
        return null;
    }
}

async function updateTransaction(id, transaction) {
    try {
        await db.collection('transactions').doc(id).update(transaction);
        return true;
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        return false;
    }
}

async function deleteTransaction(id) {
    try {
        await db.collection('transactions').doc(id).delete();
        return true;
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        return false;
    }
}

// Funções para gerenciar metas financeiras
async function getGoals() {
    try {
        const snapshot = await db.collection('goals').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Erro ao buscar metas:', error);
        return [];
    }
}

async function addGoal(goal) {
    try {
        const docRef = await db.collection('goals').add(goal);
        return { id: docRef.id, ...goal };
    } catch (error) {
        console.error('Erro ao adicionar meta:', error);
        return null;
    }
}

async function updateGoal(id, goal) {
    try {
        await db.collection('goals').doc(id).update(goal);
        return true;
    } catch (error) {
        console.error('Erro ao atualizar meta:', error);
        return false;
    }
}

async function deleteGoal(id) {
    try {
        await db.collection('goals').doc(id).delete();
        return true;
    } catch (error) {
        console.error('Erro ao deletar meta:', error);
        return false;
    }
}

// Exportando as funções
export {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getGoals,
    addGoal,
    updateGoal,
    deleteGoal
};