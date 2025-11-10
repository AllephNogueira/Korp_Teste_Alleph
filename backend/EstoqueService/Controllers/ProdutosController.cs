using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EstoqueService.Data;
using EstoqueService.Models;

namespace EstoqueService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProdutosController : ControllerBase
{
    private readonly EstoqueDbContext _context;
    private readonly ILogger<ProdutosController> _logger;

    public ProdutosController(EstoqueDbContext context, ILogger<ProdutosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produto>>> GetProdutos()
    {
        try
        {
            var produtos = await _context.Produtos
                .OrderBy(p => p.Codigo)
                .ToListAsync();
            return Ok(produtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar produtos");
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Produto>> GetProduto(int id)
    {
        try
        {
            var produto = await _context.Produtos.FindAsync(id);

            if (produto == null)
            {
                return NotFound(new { message = "Produto não encontrado" });
            }

            return Ok(produto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter produto {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<Produto>> PostProduto(Produto produto)
    {
        try
        {
            // Validar modelo
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Dados inválidos", errors = ModelState });
            }

            // Verificar se código já existe (idempotência)
            var produtoExistente = await _context.Produtos
                .FirstOrDefaultAsync(p => p.Codigo == produto.Codigo);

            if (produtoExistente != null)
            {
                return Conflict(new { message = "Já existe um produto com este código" });
            }

            // Garantir que o Id seja 0 para novo produto
            produto.Id = 0;

            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduto), new { id = produto.Id }, produto);
        }
        catch (DbUpdateException ex)
        {
            var errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += $" | Inner: {ex.InnerException.Message}";
                _logger.LogError(ex.InnerException, "Inner exception ao criar produto");
            }
            _logger.LogError(ex, "Erro ao criar produto: {Message}", errorMessage);
            return StatusCode(500, new { message = $"Erro ao criar produto: {errorMessage}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao criar produto: {Message} | StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
            return StatusCode(500, new { message = $"Erro inesperado: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutProduto(int id, Produto produto)
    {
        if (id != produto.Id)
        {
            return BadRequest(new { message = "ID do produto não corresponde" });
        }

        try
        {
            _context.Entry(produto).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProdutoExists(id))
            {
                return NotFound(new { message = "Produto não encontrado" });
            }
            else
            {
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar produto {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduto(int id)
    {
        try
        {
            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null)
            {
                return NotFound(new { message = "Produto não encontrado" });
            }

            _context.Produtos.Remove(produto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao excluir produto {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    [HttpPost("{id}/reduzir-saldo")]
    public async Task<ActionResult<Produto>> ReduzirSaldo(int id, [FromBody] int quantidade)
    {
        if (quantidade <= 0)
        {
            return BadRequest(new { message = "Quantidade deve ser maior que zero" });
        }

        try
        {
            var produto = await _context.Produtos.FindAsync(id);
            if (produto == null)
            {
                return NotFound(new { message = "Produto não encontrado" });
            }

            if (produto.Saldo < quantidade)
            {
                return Conflict(new { message = $"Saldo insuficiente. Saldo disponível: {produto.Saldo}" });
            }

            produto.Saldo -= quantidade;
            await _context.SaveChangesAsync();

            return Ok(produto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao reduzir saldo do produto {Id}", id);
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    private bool ProdutoExists(int id)
    {
        return _context.Produtos.Any(e => e.Id == id);
    }
}

