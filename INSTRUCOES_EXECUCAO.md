# Instruções de Execução

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/

2. **.NET SDK 8.0** (ou superior)
   - Download: https://dotnet.microsoft.com/download

3. **Angular CLI**
   - Instalar globalmente: `npm install -g @angular/cli`

## Passo a Passo

### 1. Executar o Serviço de Estoque

```bash
cd backend/EstoqueService
dotnet restore
dotnet run
```

O serviço estará disponível em: `http://localhost:5001`
Swagger UI: `http://localhost:5001/swagger`

### 2. Executar o Serviço de Faturamento

Em um novo terminal:

```bash
cd backend/FaturamentoService
dotnet restore
dotnet run
```

O serviço estará disponível em: `http://localhost:5002`
Swagger UI: `http://localhost:5002/swagger`

### 3. Executar o Frontend Angular

Em um novo terminal:

```bash
cd frontend
npm install
ng serve
```

A aplicação estará disponível em: `http://localhost:4200`

## Testando o Sistema

### 1. Cadastrar Produtos
- Acesse a aba "Produtos"
- Clique em "Novo Produto"
- Preencha: Código, Descrição e Saldo
- Salve

### 2. Criar Nota Fiscal
- Acesse a aba "Notas Fiscais"
- Clique em "Nova Nota Fiscal"
- Informe o número sequencial
- Adicione itens (produtos e quantidades)
- Salve

### 3. Imprimir Nota Fiscal
- Na lista de notas fiscais, clique no botão "Imprimir"
- O sistema irá:
  - Validar que a nota está com status "Aberta"
  - Reduzir o saldo dos produtos no serviço de Estoque
  - Atualizar o status da nota para "Fechada"

## Testando Tratamento de Falhas

### Cenário 1: Serviço de Estoque Indisponível
1. Pare o serviço de Estoque (Ctrl+C)
2. Tente imprimir uma nota fiscal
3. O sistema deve exibir mensagem de erro apropriada
4. Reinicie o serviço de Estoque
5. Tente novamente (o sistema deve se recuperar)

### Cenário 2: Concorrência
1. Crie um produto com saldo = 1
2. Crie duas notas fiscais simultaneamente usando o mesmo produto
3. Tente imprimir ambas
4. Apenas uma deve ser impressa com sucesso
5. A outra deve retornar erro de saldo insuficiente

## Observações

- Os bancos de dados SQLite são criados automaticamente na primeira execução
- Os arquivos `.db` são criados na pasta de cada serviço
- Para resetar os dados, basta deletar os arquivos `.db` e reiniciar os serviços

