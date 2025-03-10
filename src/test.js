// Exemplo 1: Teste básico com console.log
console.log("Olá, mundo!");

// Exemplo 2: Teste com diferentes tipos de dados
const pessoa = {
  nome: "João",
  idade: 25
};
console.log("Dados da pessoa:", pessoa);

// Exemplo 3: Teste com loops e arrays
const numeros = [1, 2, 3, 4, 5];
numeros.forEach(num => {
  console.log(`Número: ${num}`);
});

// Exemplo 4: Teste com tratamento de erros
try {
  const x = y; // Isso vai gerar um erro
} catch (error) {
  console.error("Ops, algo deu errado:", error);
}

// Exemplo 5: Teste com elementos visuais
const div = document.createElement('div');
div.innerHTML = '<h1>Teste de DOM</h1>';
document.body.appendChild(div);

// Exemplo 6: Teste com temporizadores
setTimeout(() => {
  console.log("Mensagem após 2 segundos");
}, 2000);