using System.ComponentModel.DataAnnotations;

namespace FaturamentoService.Models;

public class CriarNotaFiscalDto
{
    [Required]
    public int NumeroSequencial { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "A nota fiscal deve ter pelo menos um item")]
    public List<CriarItemNotaFiscalDto> Itens { get; set; } = new();
}

public class CriarItemNotaFiscalDto
{
    [Required]
    public int ProdutoId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero")]
    public int Quantidade { get; set; }
}

