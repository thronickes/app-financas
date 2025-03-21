// Configuração de cores para o gráfico de categorias
const categoryColors = {
    'Alimentação': '#FF6384',
    'Casa': '#36A2EB',
    'Educação': '#9966FF',
    'Transporte': '#FFCE56',
    'Saúde': '#4BC0C0',
    'Lazer': '#FF9F40',
    'Outros': '#C9CBCF',
    'Assinaturas': '#7ED321',
    'Beleza': '#F8E71C',
    'Combustível': '#BD10E0',
    'Conta pessoal': '#50E3C2',
    'Doações': '#B8E986',
    'Eletrônicos': '#8B572A',
    'Empresa': '#417505',
    'Entretenimento': '#9013FE',
    'Férias': '#D0021B',
    'Hobbies': '#F5A623',
    'Impostos e taxas': '#8B572A',
    'Manutenção': '#9013FE',
    'Pets': '#D0021B',
    'Presentes': '#F5A623',
    'Roupas': '#4A90E2',
    'Seguros': '#50E3C2',
    // Categorias de investimentos
    'Renda Fixa': '#2ECC71',
    'Ações': '#3498DB',
    'Fundos Imobiliários': '#9B59B6',
    'Criptomoedas': '#F1C40F',
    'Tesouro Direto': '#E67E22',
    'Poupança': '#1ABC9C',
    'Outros Investimentos': '#34495E'
};

// Função para obter cor da categoria
function getCategoryColor(category) {
    return categoryColors[category] || '#C9CBCF'; // Cor padrão para categorias não mapeadas
}

// Exportando funções
export {
    getCategoryColor
};