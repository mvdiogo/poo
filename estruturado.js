const fs = require('fs');

// Função 1 - Ler CSV
function lerCSV(caminho) {
    return fs.readFileSync(caminho, 'utf8').split('\n').slice(1);
}

let linhas = lerCSV('dados.csv');


// Função 2 - Converter para array de objetos
function converterParaObjetos(linhas) {
    return linhas.filter(l => l.trim() !== '').map(linha => {
        const [id, texto] = linha.split(',');
        return { id: Number(id), texto: texto.trim() };
    });
}

let dados = converterParaObjetos(linhas);


// Função 3 - Mostrar todos os textos
function mostrarTextos(dados) {
    dados.forEach(d => console.log(`${d.id}: ${d.texto}`));
}

mostrarTextos(dados);


// Função 4 - Filtrar por palavra
function filtrarPorPalavra(dados, palavra) {
    return dados.filter(d => d.texto.toLowerCase().includes(palavra.toLowerCase()));
}

console.log("Filtrando por 'JavaScript':", filtrarPorPalavra(dados, 'JavaScript'));

// Função 5 - Contar linhas
function contarLinhas(dados) {
    return dados.length;
}

console.log("Total de linhas:", contarLinhas(dados));


// Função 6 - Ordenar por ID
function ordenarPorId(dados) {
    return [...dados].sort((a, b) => a.id - b.id);
}



// Função 7 - Ordenar por texto
function ordenarPorTexto(dados) {
    return [...dados].sort((a, b) => a.texto.localeCompare(b.texto));
}

console.log("Ordenado por texto:", ordenarPorTexto(dados));


// Função 8 - Adicionar nova linha
function adicionarLinha(dados, id, texto) {
    dados.push({ id, texto });
}

adicionarLinha(dados, 6, "Aprender exige prática");
console.log("Após adicionar linha:");
mostrarTextos(dados);


// Função 9 - Remover por ID
function removerPorId(dados, id) {
    return dados.filter(d => d.id !== id);
}

dados = removerPorId(dados, 2);
console.log("Após remover ID 2:");
mostrarTextos(dados);


// Função 10 - Contar palavras totais
function contarPalavras(dados) {
    return dados.reduce((total, item) => total + item.texto.split(' ').length, 0);
}

// ==================== EXECUÇÃO ====================

console.log("=== Estruturado ===");
console.log("Total de palavras:", contarPalavras(dados));
