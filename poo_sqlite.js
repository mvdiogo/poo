const sqlite3 = require('sqlite3').verbose();

/**
 * =================================================================
 * PADRÃO SINGLETON - Uma única instância para toda a aplicação
 * =================================================================
 * 
 * O Singleton garante que só existe UMA conexão com o banco de dados
 * em toda a aplicação. Isso evita múltiplas conexões desnecessárias.
 */
class GerenciadorBanco {
  // Variáveis "privadas" (convenção: usar _ no início)
  static _instanciaUnica = null;  // Armazena a única instância permitida
  _conexao = null;                // A conexão real com o banco

  /**
   * CONSTRUTOR PRIVADO
   * Não deve ser chamado diretamente! Use getInstance()
   */
  constructor(caminhoArquivo) {
    console.log(' Conectando ao banco de dados...');
    
    this._conexao = new sqlite3.Database(caminhoArquivo, (erro) => {
      if (erro) {
        console.error(' Erro na conexão:', erro.message);
      } else {
        console.log(' Conectado com sucesso!');
        this._criarTabelas();
      }
    });
  }

  /**
   * MÉTODO SINGLETON
   * Este é o ÚNICO modo correto de obter uma instância desta classe
   */
  static obterInstancia(caminhoArquivo = 'pessoas.db') {
    // Se ainda não existe uma instância, cria uma nova
    if (!GerenciadorBanco._instanciaUnica) {
      GerenciadorBanco._instanciaUnica = new GerenciadorBanco(caminhoArquivo);
    }
    
    // Sempre retorna a mesma instância
    return GerenciadorBanco._instanciaUnica;
  }

  /**
   * ENCAPSULAMENTO
   * Método privado que só esta classe pode usar
   */
  _criarTabelas() {
    const sql = `
      CREATE TABLE IF NOT EXISTS pessoas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        idade INTEGER NOT NULL,
        corFavorita TEXT NOT NULL
      )
    `;
    
    this._conexao.run(sql, (erro) => {
      if (erro) {
        console.error(' Erro ao criar tabela:', erro.message);
      } else {
        console.log(' Tabela "pessoas" está pronta!');
      }
    });
  }

  /**
   * INTERFACE PÚBLICA
   * Método que outras classes podem usar para acessar o banco
   */
  obterConexao() {
    return this._conexao;
  }

  /**
   * Fecha a conexão com o banco
   */
  fecharConexao() {
    if (this._conexao) {
      this._conexao.close((erro) => {
        if (erro) {
          console.error(' Erro ao fechar:', erro.message);
        } else {
          console.log(' Conexão fechada com sucesso!');
        }
      });
    }
  }
}

/**
 * =================================================================
 * CLASSE ABSTRATA - Define um "contrato" para todas as entidades
 * =================================================================
 * 
 * Em POO, uma classe abstrata serve como um "modelo" que outras
 * classes devem seguir. Ela define QUAIS métodos devem existir,
 * mas não DIZ como implementá-los.
 */
class EntidadeAbstrata {
  constructor() {
    // ABSTRAÇÃO: Impede que esta classe seja usada diretamente
    if (this.constructor === EntidadeAbstrata) {
      throw new Error('  Esta é uma classe abstrata! Não pode ser instanciada diretamente.');
    }
  }

  /**
   * MÉTODO ABSTRATO
   * Toda classe filha DEVE implementar este método
   */
  salvar(gerenciadorBanco) {
    throw new Error('  Cada classe filha deve implementar seu próprio método salvar()');
  }
}

/**
 * =================================================================
 * HERANÇA E POLIMORFISMO - Classe concreta que herda da abstrata
 * =================================================================
 * 
 * A classe Pessoa "herda" tudo da EntidadeAbstrata e implementa
 * seus próprios detalhes específicos.
 */
class Pessoa extends EntidadeAbstrata {
  /**
   * CONSTRUTOR
   * Define as propriedades que toda pessoa deve ter
   */
  constructor(nome, idade, corFavorita) {
    super(); // Chama o construtor da classe pai (EntidadeAbstrata)
    
    // ENCAPSULAMENTO: Propriedades da pessoa
    this.nome = nome;
    this.idade = idade;
    this.corFavorita = corFavorita;
  }

  /**
   * POLIMORFISMO
   * Implementação específica do método salvar() para a classe Pessoa
   * Cada classe pode implementar este método de forma diferente!
   */
  salvar(gerenciadorBanco) {
    const conexao = gerenciadorBanco.obterConexao();
    const sql = 'INSERT INTO pessoas (nome, idade, corFavorita) VALUES (?, ?, ?)';
    
    conexao.run(sql, [this.nome, this.idade, this.corFavorita], (erro) => {
      if (erro) {
        console.error(' Erro ao salvar pessoa:', erro.message);
      } else {
        console.log(` ${this.nome} foi salvo(a) no banco!`);
      }
    });
  }

  /**
   * Método adicional para exibir informações da pessoa
   */
  mostrarInfo() {
    return ` ${this.nome}, ${this.idade} anos, gosta de ${this.corFavorita}`;
  }
}

/**
 * =================================================================
 * CLASSE UTILITÁRIA - Agrupa funções relacionadas
 * =================================================================
 * 
 * Esta classe demonstra ENCAPSULAMENTO ao agrupar dados e métodos
 * relacionados em um só lugar.
 */
class GeradorDados {
  // ENCAPSULAMENTO: Dados "privados" da classe (convenção _)
  static _nomes = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo'];
  static _cores = ['Azul', 'Verde', 'Vermelho', 'Amarelo', 'Roxo', 'Rosa', 'Laranja'];

  /**
   * Métodos estáticos para gerar dados aleatórios
   * Estático = não precisa criar uma instância da classe para usar
   */
  static obterNomeAleatorio() {
    const indice = Math.floor(Math.random() * this._nomes.length);
    return this._nomes[indice];
  }

  static obterCorAleatoria() {
    const indice = Math.floor(Math.random() * this._cores.length);
    return this._cores[indice];
  }

  static obterIdadeAleatoria() {
    // Idade entre 18 e 80 anos
    return Math.floor(Math.random() * 63) + 18;
  }
}

/**
 * =================================================================
 * FUNÇÃO PRINCIPAL - Orquestra todo o programa
 * =================================================================
 */
function executarPrograma() {
  console.log(' Iniciando programa de demonstração POO!\n');

  // 1. SINGLETON: Obtém a única instância do gerenciador
  const banco = GerenciadorBanco.obterInstancia('exemplo_poo.db');
  
  // 2. Aguarda um pouco para garantir que o banco está pronto
  setTimeout(() => {
    console.log(' Criando pessoas aleatórias...\n');
    
    // 3. HERANÇA e POLIMORFISMO: Cria objetos Pessoa
    const pessoas = [];
    
    for (let i = 0; i < 5; i++) {
      const pessoa = new Pessoa(
        GeradorDados.obterNomeAleatorio(),
        GeradorDados.obterIdadeAleatoria(),
        GeradorDados.obterCorAleatoria()
      );
      
      pessoas.push(pessoa);
      console.log(pessoa.mostrarInfo());
    }
    
    console.log('\n Salvando no banco de dados...\n');
    
    // 4. Salva cada pessoa usando POLIMORFISMO
    pessoas.forEach(pessoa => {
      pessoa.salvar(banco);
    });
    
    // 5. Fecha a conexão após um tempo
    setTimeout(() => {
      banco.fecharConexao();
      console.log('\n Programa finalizado com sucesso!');
    }, 1000);
    
  }, 500);
}

// Inicia o programa
executarPrograma();

/**
 * =================================================================
 * RESUMO DOS CONCEITOS POO DEMONSTRADOS:
 * =================================================================
 * 
 * 1. ENCAPSULAMENTO:
 *    - Dados "privados" com _ (convenção)
 *    - Métodos públicos e privados bem definidos
 *    - Agrupamento de dados e comportamentos relacionados
 * 
 * 2. HERANÇA:
 *    - Pessoa herda de EntidadeAbstrata
 *    - Reutilização de código da classe pai
 * 
 * 3. POLIMORFISMO:
 *    - Método salvar() implementado de forma específica em Pessoa
 *    - Diferentes classes podem implementar o mesmo método diferentemente
 * 
 * 4. ABSTRAÇÃO:
 *    - EntidadeAbstrata define um "contrato"
 *    - Esconde detalhes complexos do usuário
 * 
 * 5. PADRÃO SINGLETON:
 *    - GerenciadorBanco tem apenas uma instância
 *    - Controle rigoroso sobre recursos compartilhados
 * 
 * =================================================================
 */
