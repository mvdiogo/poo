const fs = require('fs').promises;
const path = require('path');

class BenchmarkRunner {
    constructor() {
        this.results = [];
    }

    /**
     * Executa um benchmark para um tipo específico de código
     * @param {string} name - Nome do benchmark
     * @param {string} filePath - Caminho do arquivo para executar
     */
    async runBenchmark(name, filePath) {
        console.log(`\n=== ${name.toUpperCase()} ===`);
        
        try {
            // Verifica se o arquivo existe
            await fs.access(filePath);
            
            const startTime = process.hrtime.bigint();
            const startMemory = process.memoryUsage();
            
            // Executa o arquivo
            console.time(`Tempo ${name}`);
            
            // Limpa o cache do require para garantir execução fresh
            delete require.cache[require.resolve(path.resolve(filePath))];
            
            // Executa o arquivo
            require(path.resolve(filePath));
            
            console.timeEnd(`Tempo ${name}`);
            
            const endTime = process.hrtime.bigint();
            const endMemory = process.memoryUsage();
            
            // Calcula métricas
            const executionTime = Number(endTime - startTime) / 1000000; // converte para ms
            const memoryDiff = {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed
            };
            
            // Mostra uso de memória
            this.showMemoryUsage(endMemory, memoryDiff);
            
            // Analisa arquivo
            const fileStats = await this.analyzeFile(filePath);
            
            // Armazena resultado
            this.results.push({
                name,
                executionTime,
                memory: endMemory,
                memoryDiff,
                fileStats
            });
            
        } catch (error) {
            console.error(` Erro ao executar '${filePath}':`, error.message);
            console.error(` Certifique-se de que o arquivo existe e é válido.`);
        }
    }

    /**
     * Mostra o uso atual de memória
     * @param {Object} memoria - Objeto com dados de memória
     * @param {Object} diff - Diferença de memória desde o início
     */
    showMemoryUsage(memoria, diff = null) {
        console.log(` Memória RSS: ${this.formatBytes(memoria.rss)} ${diff ? `(${this.formatDiff(diff.rss)})` : ''}`);
        console.log(` Heap Total: ${this.formatBytes(memoria.heapTotal)} ${diff ? `(${this.formatDiff(diff.heapTotal)})` : ''}`);
        console.log(` Heap Usado: ${this.formatBytes(memoria.heapUsed)} ${diff ? `(${this.formatDiff(diff.heapUsed)})` : ''}`);
    }

    /**
     * Analisa um arquivo de código
     * @param {string} arquivo - Caminho do arquivo
     * @returns {Object} - Estatísticas do arquivo
     */
    async analyzeFile(arquivo) {
        try {
            // Usa fs síncrono pois é mais confiável para análise de arquivos
            const fsSync = require('fs');
            const conteudo = fsSync.readFileSync(arquivo, 'utf8');
            return this.processFileContent(conteudo, arquivo);
            
        } catch (error) {
            console.warn(`⚠️  Não foi possível analisar o arquivo '${arquivo}': ${error.message}`);
            return null;
        }
    }

    /**
     * Processa o conteúdo do arquivo e extrai estatísticas
     * @param {string} conteudo - Conteúdo do arquivo
     * @param {string} arquivo - Nome do arquivo
     * @returns {Object} - Estatísticas processadas
     */
    processFileContent(conteudo, arquivo) {
        const linhas = conteudo.split('\n');
        const linhasVazias = linhas.filter(linha => linha.trim() === '').length;
        const linhasCodigo = linhas.length - linhasVazias;
        
        const stats = {
            arquivo: path.basename(arquivo),
            totalLinhas: linhas.length,
            linhasCodigo,
            linhasVazias,
            caracteres: conteudo.length,
            tamanhoArquivo: Buffer.byteLength(conteudo, 'utf8')
        };

        console.log(` Arquivo: ${stats.arquivo}`);
        console.log(` Total de linhas: ${stats.totalLinhas}`);
        console.log(` Linhas de código: ${stats.linhasCodigo}`);
        console.log(` Linhas vazias: ${stats.linhasVazias}`);
        console.log(` Caracteres: ${stats.caracteres}`);
        console.log(` Tamanho: ${this.formatBytes(stats.tamanhoArquivo)}`);

        return stats;
    }

    /**
     * Formata bytes em unidades legíveis
     * @param {number} bytes - Número de bytes
     * @returns {string} - String formatada
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
        
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * Formata diferença de memória
     * @param {number} diff - Diferença em bytes
     * @returns {string} - String formatada com sinal
     */
    formatDiff(diff) {
        const sign = diff >= 0 ? '+' : '';
        return `${sign}${this.formatBytes(diff)}`;
    }

    /**
     * Exibe um resumo comparativo dos benchmarks
     */
    showSummary() {
        if (this.results.length === 0) {
            console.log('\n Nenhum benchmark foi executado.');
            return;
        }

        console.log('\n' + '='.repeat(50));
        console.log(' RESUMO COMPARATIVO');
        console.log('='.repeat(50));

        // Encontra o mais rápido
        const fastest = this.results.reduce((prev, curr) => 
            prev.executionTime < curr.executionTime ? prev : curr
        );

        // Encontra o que usa menos memória
        const mostMemoryEfficient = this.results.reduce((prev, curr) => 
            prev.memory.heapUsed < curr.memory.heapUsed ? prev : curr
        );

        this.results.forEach(result => {
            const speedRatio = (result.executionTime / fastest.executionTime).toFixed(2);
            const memoryRatio = (result.memory.heapUsed / mostMemoryEfficient.memory.heapUsed).toFixed(2);
            
            console.log(`\n  ${result.name}:`);
            console.log(` Tempo: ${result.executionTime.toFixed(2)}ms (${speedRatio}x)`);
            console.log(` Memória: ${this.formatBytes(result.memory.heapUsed)} (${memoryRatio}x)`);
            
            if (result.fileStats) {
                console.log(`  Complexidade: ${result.fileStats.linhasCodigo} linhas de código`);
            }
        });

        console.log(`\n Mais rápido: ${fastest.name}`);
        console.log(` Mais eficiente em memória: ${mostMemoryEfficient.name}`);
    }
}

// Exemplo de uso executando os arquivos reais:
async function exemploDeUso() {
    const benchmark = new BenchmarkRunner();

    console.log(' Iniciando comparação entre paradigmas de programação...\n');

    // Benchmark 1: Código Estruturado
    await benchmark.runBenchmark('Estruturado', './estruturado.js');

    // Pequena pausa para separar as execuções
    await new Promise(resolve => setTimeout(resolve, 100));

    // Benchmark 2: Código POO
    await benchmark.runBenchmark('POO', './poo.js');

    // Mostra resumo comparativo
    benchmark.showSummary();
    
    console.log('\n Análise concluída!');
}

// Executa o exemplo automaticamente se o arquivo for chamado diretamente
if (require.main === module) {
    exemploDeUso().catch(console.error);
}

module.exports = BenchmarkRunner;
