const fs = require('fs');

class ManipuladorCSV {
    constructor(caminho) {
        this.dados = this.lerCSV(caminho);
    }

    // Método 1 - Ler CSV
    lerCSV(caminho) {
        const linhas = fs.readFileSync(caminho, 'utf8').split('\n').slice(1);
        return linhas.filter(l => l.trim() !== '').map(linha => {
            const [id, texto] = linha.split(',');
            return { id: Number(id), texto: texto.trim() };
        });
    }

    // Método 2 - Mostrar textos
    mostrarTextos() {
        this.dados.forEach(d => console.log(`${d.id}: ${d.texto}`));
    }

    // Método 3 - Filtrar por palavra
    filtrarPorPalavra(palavra) {
        return this.dados.filter(d => d.texto.toLowerCase().includes(palavra.toLowerCase()));
    }

    // Método 4 - Contar linhas
    contarLinhas() {
        return this.dados.length;
    }

    // Método 5 - Ordenar por ID
    ordenarPorId() {
        this.dados.sort((a, b) => a.id - b.id);
    }

    // Método 6 - Ordenar por texto
    ordenarPorTexto() {
        this.dados.sort((a, b) => a.texto.localeCompare(b.texto));
    }

    // Método 7 - Adicionar linha
    adicionarLinha(id, texto) {
        this.dados.push({ id, texto });
    }

    // Método 8 - Remover por ID
    removerPorId(id) {
        this.dados = this.dados.filter(d => d.id !== id);
    }

    // Método 9 - Contar palavras
    contarPalavras() {
        return this.dados.reduce((total, item) => total + item.texto.split(' ').length, 0);
    }

    // Método 10 - Salvar no CSV
    salvarCSV(caminho) {
        const conteudo = "id,texto\n" + this.dados.map(d => `${d.id},${d.texto}`).join('\n');
        fs.writeFileSync(caminho, conteudo, 'utf8');
    }
}

// ==================== EXECUÇÃO ====================

const csv = new ManipuladorCSV('dados.csv');

console.log("=== POO ===");
csv.mostrarTextos();
console.log("Filtrando por 'JavaScript':", csv.filtrarPorPalavra('JavaScript'));
console.log("Total de linhas:", csv.contarLinhas());
csv.ordenarPorTexto();
console.log("Após ordenar por texto:");
csv.mostrarTextos();
csv.adicionarLinha(6, "Aprender exige prática");
csv.mostrarTextos();
csv.removerPorId(2);
console.log("Após remover ID 2:");
csv.mostrarTextos();
console.log("Total de palavras:", csv.contarPalavras());
csv.salvarCSV('dados_novo.csv');
