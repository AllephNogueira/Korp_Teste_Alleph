# Detalhamento Técnico - Sistema de Emissão de Notas Fiscais

## 1. Ciclos de Vida do Angular Utilizados

### ngOnInit
Utilizado em todos os componentes principais para:
- Carregar dados iniciais (produtos, notas fiscais)
- Inicializar formulários reativos
- Configurar subscriptions do RxJS

### ngOnDestroy
Implementado para:
- Cancelar subscriptions do RxJS e evitar memory leaks
- Limpar recursos e timers

### ngOnChanges
Utilizado em componentes filhos para reagir a mudanças de inputs

### ngAfterViewInit
Usado quando necessário manipular o DOM após a inicialização da view

## 2. Uso da Biblioteca RxJS

### Observables e Operators
- **HttpClient**: Retorna Observables para todas as requisições HTTP
- **map**: Transformação de dados recebidos das APIs
- **catchError**: Tratamento de erros em todas as chamadas HTTP
- **switchMap**: Cancelamento de requisições anteriores em operações sequenciais
- **debounceTime**: Otimização de buscas e validações
- **retry**: Tentativas automáticas em caso de falha de rede
- **BehaviorSubject**: Gerenciamento de estado compartilhado entre componentes

### Exemplo de Implementação
```typescript
this.produtos$ = this.produtoService.listar().pipe(
  retry(3),
  catchError(error => {
    this.handleError(error);
    return of([]);
  })
);
```

## 3. Bibliotecas Utilizadas e Finalidades

### Frontend
- **@angular/core**: Framework principal
- **@angular/common**: Funcionalidades comuns (HttpClient, etc.)
- **@angular/forms**: Formulários reativos
- **@angular/material**: Componentes visuais (tabelas, botões, dialogs)
- **@angular/router**: Navegação entre rotas
- **rxjs**: Programação reativa e gerenciamento de estado assíncrono
- **rxjs/operators**: Operadores para manipulação de Observables

### Backend (C# .NET)
- **Microsoft.AspNetCore.App**: Framework ASP.NET Core
- **Microsoft.EntityFrameworkCore**: ORM para acesso a dados
- **Microsoft.EntityFrameworkCore.Sqlite**: Provider SQLite
- **Swashbuckle.AspNetCore**: Geração de documentação Swagger/OpenAPI
- **Polly**: Biblioteca para tratamento de resiliência e retry policies

## 4. Componentes Visuais - Bibliotecas Utilizadas

### Angular Material
Utilizado para todos os componentes visuais:
- **MatTable**: Exibição de listas (produtos, notas fiscais)
- **MatDialog**: Modais para confirmações e formulários
- **MatButton**: Botões padronizados
- **MatFormField**: Campos de formulário com validação
- **MatInput**: Inputs de texto
- **MatSelect**: Seleção de opções
- **MatSnackBar**: Notificações de sucesso/erro
- **MatProgressSpinner**: Indicadores de carregamento
- **MatIcon**: Ícones Material Design

## 5. Gerenciamento de Dependências

### Frontend (Angular)
Gerenciado através do `package.json` e npm:
```json
{
  "dependencies": {
    "@angular/core": "^17.0.0",
    "@angular/material": "^17.0.0",
    "rxjs": "^7.8.0"
  }
}
```

### Backend (C# .NET)
Gerenciado através de arquivos `.csproj`:
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
</ItemGroup>
```

## 6. Frameworks Utilizados no Backend (C#)

### ASP.NET Core
- Framework web para criação de APIs REST
- Middleware pipeline para tratamento de requisições
- Dependency Injection nativo
- Configuração através de `appsettings.json`

### Entity Framework Core
- ORM para mapeamento objeto-relacional
- Migrations para versionamento de schema
- Code First approach
- LINQ to Entities para consultas

## 7. Tratamento de Erros e Exceções no Backend

### Estratégias Implementadas

#### 7.1 Middleware Global de Tratamento de Erros
```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandler = context.Features.Get<IExceptionHandlerFeature>();
        // Log e retorno de resposta padronizada
    });
});
```

#### 7.2 Try-Catch em Operações Críticas
- Validação de dados de entrada
- Operações de banco de dados
- Comunicação entre microsserviços

#### 7.3 Retry Policies com Polly
- Tentativas automáticas em falhas transitórias
- Circuit breaker para evitar sobrecarga em serviços indisponíveis

#### 7.4 Respostas HTTP Padronizadas
- 400 Bad Request: Dados inválidos
- 404 Not Found: Recurso não encontrado
- 409 Conflict: Conflito de estado (ex: saldo insuficiente)
- 500 Internal Server Error: Erros inesperados
- 503 Service Unavailable: Serviço temporariamente indisponível

#### 7.5 Tratamento de Falhas entre Microsserviços
- Timeout configurado para requisições HTTP
- Fallback quando serviço está indisponível
- Logging detalhado de erros para diagnóstico

## 8. Uso de LINQ

### Consultas LINQ Implementadas

#### 8.1 Consultas Simples
```csharp
var produtos = await _context.Produtos
    .Where(p => p.Saldo > 0)
    .OrderBy(p => p.Descricao)
    .ToListAsync();
```

#### 8.2 Agregações
```csharp
var saldoTotal = await _context.Produtos
    .SumAsync(p => p.Saldo);
```

#### 8.3 Joins e Relacionamentos
```csharp
var notaComProdutos = await _context.NotasFiscais
    .Include(n => n.Itens)
        .ThenInclude(i => i.Produto)
    .FirstOrDefaultAsync(n => n.Id == id);
```

#### 8.4 Projeções
```csharp
var produtosDto = await _context.Produtos
    .Select(p => new ProdutoDto
    {
        Codigo = p.Codigo,
        Descricao = p.Descricao,
        Saldo = p.Saldo
    })
    .ToListAsync();
```

#### 8.5 Filtros Complexos
```csharp
var notasAbertas = await _context.NotasFiscais
    .Where(n => n.Status == StatusNota.Aberta)
    .Where(n => n.DataCriacao >= DateTime.Now.AddDays(-30))
    .ToListAsync();
```

## 9. Tratamento de Concorrência

### Implementação com Entity Framework
- **Concurrency Tokens**: Timestamp ou versão para detecção de conflitos
- **Optimistic Concurrency**: Verificação de versão antes de atualizar
- **Retry Logic**: Tentativa automática em caso de conflito detectado

### Exemplo
```csharp
try
{
    produto.Saldo -= quantidade;
    await _context.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException)
{
    // Recarregar entidade e tentar novamente
    await _context.Entry(produto).ReloadAsync();
    if (produto.Saldo >= quantidade)
    {
        produto.Saldo -= quantidade;
        await _context.SaveChangesAsync();
    }
    else
    {
        throw new InvalidOperationException("Saldo insuficiente");
    }
}
```

## 10. Idempotência

### Implementação
- **Chaves únicas**: Prevenção de duplicação de registros
- **Idempotency Keys**: Tokens únicos para operações críticas
- **Verificação prévia**: Checagem de existência antes de criar

### Exemplo
```csharp
var notaExistente = await _context.NotasFiscais
    .FirstOrDefaultAsync(n => n.NumeroSequencial == numero);
    
if (notaExistente != null)
{
    return notaExistente; // Retorna existente sem criar duplicata
}
```

## 11. Comunicação entre Microsserviços

### HttpClient com Retry e Timeout
```csharp
var httpClient = _httpClientFactory.CreateClient();
httpClient.Timeout = TimeSpan.FromSeconds(30);

var response = await httpClient.GetAsync($"http://estoque-service/api/produtos/{produtoId}");
```

### Tratamento de Falhas
- Circuit Breaker pattern
- Fallback para valores padrão quando serviço indisponível
- Logging de todas as tentativas de comunicação

