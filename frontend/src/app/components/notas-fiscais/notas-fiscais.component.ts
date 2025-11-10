import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NotaFiscalService } from '../../services/nota-fiscal.service';
import { NotaFiscal, StatusNota } from '../../models/nota-fiscal.model';
import { NotaFiscalDialogComponent } from './nota-fiscal-dialog/nota-fiscal-dialog.component';

@Component({
  selector: 'app-notas-fiscais',
  templateUrl: './notas-fiscais.component.html',
  styleUrls: ['./notas-fiscais.component.scss']
})
export class NotasFiscaisComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['numeroSequencial', 'status', 'itens', 'dataCriacao', 'acoes'];
  notasFiscais: NotaFiscal[] = [];
  loading = false;
  imprimindo: { [key: number]: boolean } = {};
  StatusNota = StatusNota;
  private destroy$ = new Subject<void>();

  constructor(
    private notaFiscalService: NotaFiscalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregarNotasFiscais();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarNotasFiscais(): void {
    this.loading = true;
    this.notaFiscalService.listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notas) => {
          // Garantir que o status seja mapeado corretamente
          this.notasFiscais = notas.map(nota => ({
            ...nota,
            status: this.mapearStatus(nota.status)
          }));
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.mostrarErro('Erro ao carregar notas fiscais: ' + (error.error?.message || error.message));
        }
      });
  }

  private mapearStatus(status: any): StatusNota {
    if (status === StatusNota.Aberta || status === 'Aberta' || status === 0) {
      return StatusNota.Aberta;
    }
    if (status === StatusNota.Fechada || status === 'Fechada' || status === 1) {
      return StatusNota.Fechada;
    }
    return StatusNota.Aberta; // Default
  }

  abrirDialog(nota?: NotaFiscal): void {
    const dialogRef = this.dialog.open(NotaFiscalDialogComponent, {
      width: '600px',
      data: nota
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.carregarNotasFiscais();
        }
      });
  }

  imprimir(nota: NotaFiscal): void {
    // Verificar status como string para compatibilidade
    const statusStr = String(nota.status);
    if (statusStr !== 'Aberta' && nota.status !== StatusNota.Aberta) {
      this.mostrarErro('Apenas notas fiscais com status "Aberta" podem ser impressas.');
      return;
    }

    if (!nota.id) {
      this.mostrarErro('Nota fiscal sem ID. Recarregue a página e tente novamente.');
      return;
    }

    const notaId = nota.id; // Armazenar em variável local para garantir tipo

    if (confirm(`Deseja realmente imprimir a nota fiscal ${nota.numeroSequencial}?`)) {
      this.imprimindo[notaId] = true;
      this.notaFiscalService.imprimir(notaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.imprimindo[notaId] = false;
            this.mostrarSucesso('Nota fiscal impressa com sucesso!');
            this.carregarNotasFiscais();
          },
          error: (error) => {
            this.imprimindo[notaId] = false;
            const errorMessage = error.error?.message || error.error?.erros?.join(', ') || error.message || 'Erro desconhecido';
            this.mostrarErro('Erro ao imprimir nota fiscal: ' + errorMessage);
            console.error('Erro completo:', error);
          }
        });
    }
  }

  podeImprimir(nota: NotaFiscal): boolean {
    // Comparar como string para garantir compatibilidade com dados do backend
    const statusStr = String(nota.status);
    return statusStr === 'Aberta' || nota.status === StatusNota.Aberta;
  }

  getTotalItens(nota: NotaFiscal): number {
    return nota.itens?.length || 0;
  }

  private mostrarSucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}

