import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { NotaFiscalService } from '../../../services/nota-fiscal.service';
import { ProdutoService } from '../../../services/produto.service';
import { NotaFiscal, StatusNota, ItemNotaFiscal } from '../../../models/nota-fiscal.model';
import { Produto } from '../../../models/produto.model';

@Component({
  selector: 'app-nota-fiscal-dialog',
  templateUrl: './nota-fiscal-dialog.component.html',
  styleUrls: ['./nota-fiscal-dialog.component.scss']
})
export class NotaFiscalDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  produtos: Produto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  get itensFormArray(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NotaFiscalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotaFiscal | null,
    private notaFiscalService: NotaFiscalService,
    private produtoService: ProdutoService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      numeroSequencial: [data?.numeroSequencial || null, [Validators.required]],
      status: [data?.status || StatusNota.Aberta],
      itens: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.carregarProdutos();
    if (this.data?.itens) {
      this.data.itens.forEach(item => {
        this.adicionarItem(item);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarProdutos(): void {
    this.produtoService.listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (produtos) => {
          this.produtos = produtos;
        },
        error: (error) => {
          this.mostrarErro('Erro ao carregar produtos: ' + (error.error?.message || error.message));
        }
      });
  }

  criarItemFormGroup(item?: ItemNotaFiscal): FormGroup {
    return this.fb.group({
      produtoId: [item?.produtoId || null, [Validators.required]],
      quantidade: [item?.quantidade || 1, [Validators.required, Validators.min(1)]]
    });
  }

  adicionarItem(item?: ItemNotaFiscal): void {
    this.itensFormArray.push(this.criarItemFormGroup(item));
  }

  removerItem(index: number): void {
    this.itensFormArray.removeAt(index);
  }

  salvar(): void {
    if (this.form.valid && this.itensFormArray.length > 0) {
      this.loading = true;
      // Criar objeto sem status - será definido pelo backend
      const notaData: any = {
        numeroSequencial: this.form.value.numeroSequencial,
        itens: this.form.value.itens.map((item: any) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade
        }))
      };

      console.log('Enviando nota fiscal:', notaData); // Debug

      this.notaFiscalService.criar(notaData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.mostrarSucesso('Nota fiscal criada com sucesso!');
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.loading = false;
            this.mostrarErro('Erro ao criar nota fiscal: ' + (error.error?.message || error.message));
          }
        });
    } else {
      if (this.itensFormArray.length === 0) {
        this.mostrarErro('Adicione pelo menos um item à nota fiscal.');
      }
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  getProdutoDescricao(produtoId: number): string {
    const produto = this.produtos.find(p => p.id === produtoId);
    return produto ? `${produto.codigo} - ${produto.descricao}` : '';
  }

  private mostrarSucesso(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
  }

  private mostrarErro(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}

