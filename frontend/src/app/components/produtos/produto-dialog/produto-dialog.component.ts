import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProdutoService } from '../../../services/produto.service';
import { Produto } from '../../../models/produto.model';

@Component({
  selector: 'app-produto-dialog',
  templateUrl: './produto-dialog.component.html',
  styleUrls: ['./produto-dialog.component.scss']
})
export class ProdutoDialogComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProdutoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Produto,
    private produtoService: ProdutoService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = !!data.id;
    this.form = this.fb.group({
      codigo: [data.codigo, [Validators.required]],
      descricao: [data.descricao, [Validators.required]],
      saldo: [data.saldo, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
  }

  salvar(): void {
    if (this.form.valid) {
      this.loading = true;
      const produto: Produto = this.form.value;

      const operacao = this.isEdit
        ? this.produtoService.atualizar(this.data.id!, produto)
        : this.produtoService.criar(produto);

      operacao.subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open(
            `Produto ${this.isEdit ? 'atualizado' : 'criado'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            `Erro ao ${this.isEdit ? 'atualizar' : 'criar'} produto: ${error.error?.message || error.message}`,
            'Fechar',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}

