# Resumo do Projeto - Sistema de Emissão de Notas Fiscais

## Visão Geral

Sistema completo desenvolvido com **Angular** no frontend e arquitetura de **microsserviços** em **C# .NET** no backend, implementando todas as funcionalidades solicitadas e requisitos obrigatórios.

## Funcionalidades Implementadas

### ✅ Cadastro de Produtos
- Código (obrigatório, único)
- Descrição (obrigatória)
- Saldo (obrigatório, >= 0)
- CRUD completo com validações

### ✅ Cadastro de Notas Fiscais
- Numeração sequencial (obrigatória, única)
- Status: Aberta ou Fechada
- Múltiplos produtos com quantidades
- Validações de integridade

### ✅ Impressão de Notas Fiscais
- Botão de impressão intuitivo
- Indicador de processamento durante impressão
- Validação: apenas notas "Aberta" podem ser impressas
- Atualização automática de status para "Fechada"
- Redução automática do saldo dos produtos

## Requisitos Obrigatórios

### ✅ Arquitetura de Microsserviços
- **Serviço de Estoque** (porta 5001): Gerencia produtos e saldos
- **Serviço de Faturamento** (porta 5002): Gerencia notas fiscais
- Comunicação HTTP entre serviços com retry e circuit breaker

### ✅ Tratamento de Falhas
- Middleware global de tratamento de erros
- Retry policies com Polly
- Circuit breaker para serviços indisponíveis
- Feedback apropriado ao usuário
- Logging detalhado de erros

## Requisitos Opcionais Implementados

### ✅ Tratamento de Concorrência
- Concurrency tokens no Entity Framework
- Retry logic com verificação de versão
- Prevenção de race conditions em redução de saldo

### ✅ Idempotência
- Chaves únicas (código de produto, número sequencial de nota)
- Verificação prévia antes de criar registros
- Retorno de registro existente em caso de duplicação

## Tecnologias e Bibliotecas

### Frontend (Angular)
- **Angular 17**: Framework principal
- **RxJS**: Observables, operators (retry, catchError, switchMap, debounceTime)
- **Angular Material**: Componentes visuais (tabelas, dialogs, formulários, botões)
- **Reactive Forms**: Formulários reativos com validação
- **HttpClient**: Comunicação com APIs

### Backend (C# .NET)
- **ASP.NET Core 8.0**: Framework web
- **Entity Framework Core**: ORM com SQLite
- **Polly**: Resiliência (retry, circuit breaker)
- **Swagger/OpenAPI**: Documentação de APIs
- **LINQ**: Consultas e transformações de dados

## Ciclos de Vida do Angular Utilizados

1. **ngOnInit**: Carregamento inicial de dados, inicialização de formulários
2. **ngOnDestroy**: Limpeza de subscriptions (prevenção de memory leaks)
3. **ngOnChanges**: Reação a mudanças de inputs (componentes filhos)
4. **ngAfterViewInit**: Manipulação do DOM após inicialização

## Uso do RxJS

- **Observables**: Todas as requisições HTTP retornam Observables
- **Operators**:
  - `retry(3)`: Tentativas automáticas em falhas
  - `catchError`: Tratamento centralizado de erros
  - `switchMap`: Cancelamento de requisições anteriores
  - `debounceTime`: Otimização de buscas
  - `takeUntil`: Gerenciamento de subscriptions
- **BehaviorSubject**: Estado compartilhado (quando necessário)

## Tratamento de Erros

### Frontend
- Interceptação de erros HTTP
- Exibição de mensagens amigáveis ao usuário
- Retry automático em falhas de rede
- Logging de erros no console

### Backend
- Middleware global de tratamento de exceções
- Try-catch em operações críticas
- Respostas HTTP padronizadas (400, 404, 409, 500, 503)
- Logging estruturado com ILogger
- Tratamento específico para comunicação entre microsserviços

## Uso de LINQ

Consultas LINQ implementadas:
- Filtros com `Where`
- Ordenação com `OrderBy`/`OrderByDescending`
- Agregações com `Sum`, `Count`
- Joins com `Include`/`ThenInclude`
- Projeções com `Select`
- Verificações de existência com `Any`, `FirstOrDefault`

## Estrutura do Projeto

```
Korp_Teste/
├── frontend/                    # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Componentes de produtos e notas fiscais
│   │   │   ├── models/         # Interfaces TypeScript
│   │   │   ├── services/       # Serviços HTTP
│   │   │   └── app.module.ts
│   │   └── ...
│   └── package.json
├── backend/
│   ├── EstoqueService/          # Microsserviço de Estoque
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── Models/
│   │   └── Middleware/
│   └── FaturamentoService/      # Microsserviço de Faturamento
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       └── Middleware/
└── README.md
```

## Como Executar

1. **Serviço de Estoque**: `cd backend/EstoqueService && dotnet run`
2. **Serviço de Faturamento**: `cd backend/FaturamentoService && dotnet run`
3. **Frontend**: `cd frontend && npm install && ng serve`

Consulte `INSTRUCOES_EXECUCAO.md` para detalhes completos.

## Destaques Técnicos

1. **Arquitetura de Microsserviços**: Separação clara de responsabilidades
2. **Resiliência**: Retry policies e circuit breaker para comunicação entre serviços
3. **Concorrência**: Tratamento de race conditions em operações críticas
4. **Idempotência**: Prevenção de duplicação de dados
5. **UX**: Feedback visual durante operações (spinners, mensagens)
6. **Validações**: Validações tanto no frontend quanto no backend
7. **Documentação**: Swagger para APIs, código comentado

## Pontos de Atenção para Apresentação

1. Demonstrar criação de produto e verificação de saldo
2. Criar nota fiscal com múltiplos produtos
3. Imprimir nota fiscal e verificar:
   - Atualização de status para "Fechada"
   - Redução do saldo dos produtos
4. Testar tratamento de falhas:
   - Parar serviço de Estoque
   - Tentar imprimir nota
   - Verificar mensagem de erro
   - Reiniciar serviço e tentar novamente
5. Testar concorrência:
   - Produto com saldo 1
   - Duas notas simultâneas
   - Apenas uma deve ser impressa

