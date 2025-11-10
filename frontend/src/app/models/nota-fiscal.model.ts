export enum StatusNota {
  Aberta = 'Aberta',
  Fechada = 'Fechada'
}

export interface ItemNotaFiscal {
  produtoId: number;
  produtoCodigo?: string;
  produtoDescricao?: string;
  quantidade: number;
}

export interface NotaFiscal {
  id?: number;
  numeroSequencial: number;
  status: StatusNota;
  itens: ItemNotaFiscal[];
  dataCriacao?: Date;
}

