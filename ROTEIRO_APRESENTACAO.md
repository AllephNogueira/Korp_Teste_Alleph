# Roteiro para Apresentação em Vídeo

## 1. Introdução (30 segundos)
- Apresentar o projeto: Sistema de Emissão de Notas Fiscais
- Mencionar tecnologias: Angular + C# .NET com arquitetura de microsserviços
- Destacar que implementa todos os requisitos obrigatórios e opcionais

## 2. Demonstração das Telas (5 minutos)

### 2.1 Tela de Produtos
- Mostrar lista vazia inicial
- Criar um produto:
  - Código: "PROD001"
  - Descrição: "Produto Teste"
  - Saldo: 10
- Mostrar produto na lista
- Editar produto (alterar saldo)
- Mostrar validações (campos obrigatórios)

### 2.2 Tela de Notas Fiscais
- Mostrar lista vazia inicial
- Criar uma nota fiscal:
  - Número Sequencial: 1
  - Adicionar item: Produto PROD001, quantidade 2
  - Adicionar mais um item (se houver outro produto)
- Mostrar nota na lista com status "Aberta"
- Mostrar botão de impressão habilitado

### 2.3 Impressão de Nota Fiscal
- Clicar no botão "Imprimir"
- Mostrar indicador de processamento (spinner)
- Após conclusão:
  - Status mudou para "Fechada"
  - Verificar na tela de produtos que o saldo foi reduzido
  - Mostrar que o botão de impressão está desabilitado

## 3. Demonstração de Funcionalidades Técnicas (5 minutos)

### 3.1 Tratamento de Falhas
- Parar o serviço de Estoque (Ctrl+C no terminal)
- Tentar imprimir uma nota fiscal
- Mostrar mensagem de erro apropriada
- Reiniciar o serviço de Estoque
- Tentar imprimir novamente (deve funcionar)

### 3.2 Validações
- Tentar imprimir nota já fechada (mostrar erro)
- Tentar criar nota sem itens (mostrar erro)
- Tentar criar produto com código duplicado (mostrar erro)

### 3.3 Concorrência (Opcional - se houver tempo)
- Criar produto com saldo = 1
- Criar duas notas fiscais simultaneamente
- Tentar imprimir ambas
- Mostrar que apenas uma é impressa com sucesso

## 4. Detalhamento Técnico (3 minutos)

### 4.1 Ciclos de Vida do Angular
- Mencionar uso de:
  - `ngOnInit`: Carregamento de dados
  - `ngOnDestroy`: Limpeza de subscriptions
  - `ngAfterViewInit`: Manipulação do DOM

### 4.2 RxJS
- Mostrar código dos serviços
- Destacar uso de:
  - `retry(3)`: Tentativas automáticas
  - `catchError`: Tratamento de erros
  - `takeUntil`: Gerenciamento de subscriptions

### 4.3 Bibliotecas Utilizadas
- **Frontend**: Angular Material para componentes visuais
- **Backend**: Entity Framework Core, Polly para resiliência

### 4.4 Tratamento de Erros
- Mostrar middleware de tratamento de erros
- Explicar retry policies e circuit breaker
- Mostrar logging de erros

### 4.5 LINQ
- Mostrar exemplos de consultas LINQ no código:
  - `Where`, `OrderBy`, `Include`, `Select`

## 5. Arquitetura de Microsserviços (2 minutos)
- Mostrar estrutura de pastas
- Explicar separação:
  - Serviço de Estoque (porta 5001)
  - Serviço de Faturamento (porta 5002)
- Mostrar comunicação HTTP entre serviços
- Explicar tratamento de falhas na comunicação

## 6. Requisitos Opcionais Implementados (1 minuto)
- Tratamento de Concorrência
- Idempotência
- Mencionar que IA não foi implementada (opcional)

## 7. Conclusão (30 segundos)
- Resumir funcionalidades implementadas
- Destacar pontos técnicos principais
- Mencionar que o código está disponível no GitHub

## Dicas para a Gravação

1. **Preparação**:
   - Ter todos os serviços rodando antes de começar
   - Ter dados de exemplo prontos
   - Testar o fluxo completo antes de gravar

2. **Durante a Gravação**:
   - Fale pausadamente
   - Mostre o código quando relevante
   - Destaque os pontos técnicos importantes
   - Se cometer erro, mostre como o sistema trata

3. **Edição**:
   - Adicione legendas para pontos importantes
   - Destaque trechos de código relevantes
   - Mantenha o vídeo objetivo (máximo 15 minutos)

## Checklist Antes de Gravar

- [ ] Todos os serviços estão rodando
- [ ] Frontend está acessível
- [ ] Swagger das APIs está funcionando
- [ ] Dados de exemplo estão criados
- [ ] Fluxo completo foi testado
- [ ] Código está comentado e organizado
- [ ] Documentação está completa

