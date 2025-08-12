const fs = require('fs');

function gerarCSV(caminho, linhas) {
    let conteudo = "id,texto\n";
    for (let i = 1; i <= linhas; i++) {
        conteudo += `${i},Linha de teste número ${i}\n`;
    }
    fs.writeFileSync(caminho, conteudo);
    console.log(`Arquivo CSV gerado com ${linhas} linhas.`);
}

gerarCSV("dados.csv", 10000);
