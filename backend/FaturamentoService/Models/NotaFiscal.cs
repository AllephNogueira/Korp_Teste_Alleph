using System.ComponentModel.DataAnnotations;

namespace FaturamentoService.Models;

public enum StatusNota
{
    Aberta,
    Fechada
}

public class NotaFiscal
{
    public int Id { get; set; }

    [Required]
    public int NumeroSequencial { get; set; }

    [Required]
    public StatusNota Status { get; set; } = StatusNota.Aberta;

    [Required]
    public DateTime DataCriacao { get; set; } = DateTime.Now;

    public List<ItemNotaFiscal> Itens { get; set; } = new();
}

public class ItemNotaFiscal
{
    public int Id { get; set; }

    public int NotaFiscalId { get; set; } // Será definido automaticamente pelo EF Core

    [Required]
    public int ProdutoId { get; set; }

    [Required]
    public int Quantidade { get; set; }
}

