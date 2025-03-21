// Função para alternar entre modo claro e escuro
function toggleDarkMode() {
    // Verifica se o modo escuro está ativado
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    
    // Alterna o atributo data-theme no body
    document.body.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
    
    // Salva a preferência no localStorage
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    
    // Atualiza o ícone do toggle
    updateToggleIcon();
}

// Função para atualizar o ícone do toggle baseado no tema atual
function updateToggleIcon() {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    const iconElement = document.querySelector('.slider-icon');
    
    // Atualiza o ícone baseado no tema
    iconElement.textContent = isDarkMode ? '🌙' : '☀️';
    
    // Atualiza o estado do checkbox
    document.getElementById('theme-toggle').checked = isDarkMode;
}

// Função para carregar o tema salvo
function loadSavedTheme() {
    // Verifica se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Se houver um tema salvo, aplica-o
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateToggleIcon();
    }
}

// Inicializa o tema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o tema salvo
    loadSavedTheme();
    
    // Adiciona o event listener para o toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', toggleDarkMode);
});