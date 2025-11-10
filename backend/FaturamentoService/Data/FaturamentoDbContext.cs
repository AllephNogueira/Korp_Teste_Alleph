using Microsoft.EntityFrameworkCore;
using FaturamentoService.Models;

namespace FaturamentoService.Data;

public class FaturamentoDbContext : DbContext
{
    public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options)
        : base(options)
    {
    }

    public DbSet<NotaFiscal> NotasFiscais { get; set; }
    public DbSet<ItemNotaFiscal> ItensNotaFiscal { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<NotaFiscal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NumeroSequencial).IsRequired();
            entity.Property(e => e.Status)
                .HasConversion<string>() // Converter enum para string no banco
                .IsRequired();
            entity.Property(e => e.DataCriacao).IsRequired();
            
            // Unique constraint on NumeroSequencial (idempotência)
            entity.HasIndex(e => e.NumeroSequencial).IsUnique();
            
            entity.HasMany(e => e.Itens)
                .WithOne()
                .HasForeignKey(i => i.NotaFiscalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ItemNotaFiscal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProdutoId).IsRequired();
            entity.Property(e => e.Quantidade).IsRequired();
        });
    }
}

