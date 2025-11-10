using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FaturamentoService.Data;
using FaturamentoService.Models;
using System.Text.Json;

namespace FaturamentoService.Controllers;

[ApiController]
[Route("api/notas-fiscais")]
public class NotasFiscaisController : ControllerBase
{
    private readonly FaturamentoDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<NotasFiscaisController> _logger;

    public NotasFiscaisController(
        FaturamentoDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<NotasFiscaisController> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotaFiscal>>> GetNotasFiscais()
    {
        try
        {
            var notas = await _context.NotasFiscais
                .Include(n => n.Itens)
                .OrderByDescending(n => n.DataCriacao)
                .ToListAsync();
            return Ok(notas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar notas fiscais");
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<NotaFiscal>> GetNotaFiscal(int id)
    {
        try
        {
            var nota = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (nota == null)
            {
                return NotFound(new { message = "Nota fiscal não encontrada" });
            }

            return Ok(nota);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter nota fiscal {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<NotaFiscal>> PostNotaFiscal([FromBody] CriarNotaFiscalDto dto)
    {
        try
        {
            _logger.LogInformation("Recebendo nota fiscal: NumeroSequencial={NumeroSequencial}, Itens={ItensCount}", 
                dto?.NumeroSequencial, dto?.Itens?.Count ?? 0);

            // Validar modelo
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value?.Errors.Select(e => e.ErrorMessage) })
                    .ToList();
                var errorsJson = System.Text.Json.JsonSerializer.Serialize(errors);
                _logger.LogWarning("Dados inválidos ao criar nota fiscal: {Errors}", errorsJson);
                return BadRequest(new { message = "Dados inválidos", errors = errors });
            }

            // Idempotência: verificar se já existe nota com mesmo número sequencial
            var notaExistente = await _context.NotasFiscais
                .FirstOrDefaultAsync(n => n.NumeroSequencial == dto.NumeroSequencial);

            if (notaExistente != null)
            {
                return Ok(notaExistente); // Retorna existente sem criar duplicata
            }

            if (dto.Itens == null || dto.Itens.Count == 0)
            {
                return BadRequest(new { message = "A nota fiscal deve ter pelo menos um item" });
            }

            // Criar objeto NotaFiscal a partir do DTO
            var nota = new NotaFiscal
            {
                NumeroSequencial = dto.NumeroSequencial,
                Status = StatusNota.Aberta,
                DataCriacao = DateTime.Now,
                Itens = dto.Itens.Select(item => new ItemNotaFiscal
                {
                    ProdutoId = item.ProdutoId,
                    Quantidade = item.Quantidade
                }).ToList()
            };

            _context.NotasFiscais.Add(nota);
            await _context.SaveChangesAsync();

            // Recarregar com relacionamentos
            var notaCriada = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == nota.Id);

            return CreatedAtAction(nameof(GetNotaFiscal), new { id = nota.Id }, notaCriada);
        }
        catch (DbUpdateException ex)
        {
            var errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
                _logger.LogError(ex.InnerException, "Inner exception ao criar nota fiscal");
            }
            _logger.LogError(ex, "Erro ao criar nota fiscal: {Message}", errorMessage);
            return StatusCode(500, new { message = $"Erro ao criar nota fiscal: {errorMessage}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao criar nota fiscal: {Message}", ex.Message);
            return StatusCode(500, new { message = $"Erro inesperado: {ex.Message}" });
        }
    }

    [HttpPost("{id}/imprimir")]
    public async Task<ActionResult<NotaFiscal>> ImprimirNotaFiscal(int id)
    {
        try
        {
            var nota = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (nota == null)
            {
                return NotFound(new { message = "Nota fiscal não encontrada" });
            }

            if (nota.Status != StatusNota.Aberta)
            {
                return BadRequest(new { message = "Apenas notas fiscais com status 'Aberta' podem ser impressas" });
            }

            // Reduzir saldo dos produtos no serviço de Estoque
            var httpClient = _httpClientFactory.CreateClient("EstoqueService");
            var erros = new List<string>();

            foreach (var item in nota.Itens)
            {
                try
                {
                    var response = await httpClient.PostAsJsonAsync(
                        $"api/produtos/{item.ProdutoId}/reduzir-saldo",
                        item.Quantidade);

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        var errorObj = JsonSerializer.Deserialize<JsonElement>(errorContent);
                        var errorMessage = errorObj.TryGetProperty("message", out var msg) 
                            ? msg.GetString() 
                            : "Erro desconhecido";
                        erros.Add($"Produto {item.ProdutoId}: {errorMessage}");
                    }
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogError(ex, "Erro ao comunicar com EstoqueService para produto {ProdutoId}", item.ProdutoId);
                    erros.Add($"Produto {item.ProdutoId}: Serviço de Estoque indisponível");
                }
                catch (TaskCanceledException)
                {
                    _logger.LogError("Timeout ao comunicar com EstoqueService para produto {ProdutoId}", item.ProdutoId);
                    erros.Add($"Produto {item.ProdutoId}: Timeout na comunicação com serviço de Estoque");
                }
            }

            if (erros.Any())
            {
                return StatusCode(503, new { 
                    message = "Erro ao processar impressão", 
                    erros = erros 
                });
            }

            // Atualizar status da nota para Fechada
            nota.Status = StatusNota.Fechada;
            await _context.SaveChangesAsync();

            // Recarregar com relacionamentos para retornar dados completos
            var notaAtualizada = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);

            return Ok(notaAtualizada);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao imprimir nota fiscal {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }
}

