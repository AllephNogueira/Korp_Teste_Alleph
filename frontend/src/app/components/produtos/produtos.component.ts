import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ProdutoService } from '../../services/produto.service';
import { Produto } from '../../models/produto.model';
import { ProdutoDialogComponent } from './produto-dialog/produto-dialog.component';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['codigo', 'descricao', 'saldo', 'acoes'];
  produtos: Produto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private produtoService: ProdutoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarProdutos(): void {
    this.loading = true;
    this.produtoService.listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (produtos) => {
          this.produtos = produtos;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.mostrarErro('Erro ao carregar produtos: ' + (error.error?.message || error.message));
        }
      });
  }

  abrirDialog(produto?: Produto): void {
    const dialogRef = this.dialog.open(ProdutoDialogComponent, {
      width: '400px',
      data: produto || { codigo: '', descricao: '', saldo: 0 }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.carregarProdutos();
        }
      });
  }

  excluir(produto: Produto): void {
    if (confirm(`Deseja realmente excluir o produto ${produto.descricao}?`)) {
      if (produto.id) {
        this.produtoService.excluir(produto.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.mostrarSucesso('Produto excluído com sucesso!');
              this.carregarProdutos();
            },
            error: (error) => {
              this.mostrarErro('Erro ao excluir produto: ' + (error.error?.message || error.message));
            }
          });
      }
    }
  }

  private mostrarSucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}

